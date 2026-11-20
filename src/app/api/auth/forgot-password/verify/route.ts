import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import * as z from "zod";
import {
  getClientIp,
  checkRateLimit,
  rateLimitResponse,
  recordFailedAttempt,
  isLockedOut,
  clearFailedAttempts,
} from "@/lib/rate-limit";

const verifySchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  code: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain digits only"),
});

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit: max 15 verify attempts per 10 minutes per IP
    const ipRate = checkRateLimit(`forgot_verify_ip:${clientIp}`, {
      limit: 15,
      windowMs: 10 * 60 * 1000,
    });
    if (!ipRate.success) {
      return rateLimitResponse(ipRate.reset);
    }

    const body = await req.json();
    const { email, code } = verifySchema.parse(body);

    // Check account lockout
    const lockoutKey = `forgot_verify_user:${email}`;
    const lockoutStatus = isLockedOut(lockoutKey);
    if (lockoutStatus.locked) {
      const waitSeconds = Math.max(1, Math.ceil((lockoutStatus.lockedUntil - Date.now()) / 1000));
      return NextResponse.json(
        {
          message: `Too many failed attempts. Verification is temporarily locked. Please try again in ${waitSeconds} seconds.`,
          locked: true,
          retryAfter: waitSeconds,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid verification code or email" }, { status: 400 });
    }

    // Verify expiration
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json(
        { message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check code correctness
    if (!user.verificationCode || user.verificationCode !== code) {
      const attemptResult = recordFailedAttempt(lockoutKey, 5, 15 * 60 * 1000);

      if (attemptResult.locked) {
        // Invalidate active code to prevent further brute forcing
        await prisma.user.update({
          where: { id: user.id },
          data: { verificationCode: null, verificationExpires: null },
        });

        return NextResponse.json(
          {
            message: "Too many failed attempts. This code has been invalidated for security. Please request a new code.",
            locked: true,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          message: `Invalid verification code. ${attemptResult.attemptsLeft} attempt(s) remaining.`,
        },
        { status: 400 }
      );
    }

    // Success: clear lockout
    clearFailedAttempts(lockoutKey);

    // Generate cryptographically secure one-time reset token (valid for 15 minutes)
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Store only the SHA-256 hash in the database to prevent token leakage from DB snapshots
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: hashedToken,
        verificationExpires: tokenExpires,
      },
    });

    // Return the unhashed token to the user for one-time redemption
    return NextResponse.json(
      {
        success: true,
        resetToken,
        message: "Code verified successfully! You can now set your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Forgot password verify error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
