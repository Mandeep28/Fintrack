import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Rate limit: max 15 verification attempts per 10 minutes per IP
    const rateCheck = checkRateLimit(`verify_code_ip:${clientIp}`, {
      limit: 15,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateCheck.success) {
      return rateLimitResponse(rateCheck.reset);
    }

    const body = await req.json();
    const { email, code } = verifySchema.parse(body);

    // Check account lockout
    const lockoutKey = `verify_code_user:${email}`;
    const lockoutStatus = isLockedOut(lockoutKey);
    if (lockoutStatus.locked) {
      const waitSeconds = Math.max(1, Math.ceil((lockoutStatus.lockedUntil - Date.now()) / 1000));
      return NextResponse.json(
        {
          message: `Too many failed attempts. Account verification is temporarily locked. Please try again in ${waitSeconds} seconds.`,
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
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      clearFailedAttempts(lockoutKey);
      return NextResponse.json(
        { success: true, message: "Account is already verified", alreadyVerified: true },
        { status: 200 }
      );
    }

    // Check expiration
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json(
        { message: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Constant-time check or strict verification
    if (!user.verificationCode || user.verificationCode !== code) {
      const attemptResult = recordFailedAttempt(lockoutKey, 5, 15 * 60 * 1000);

      if (attemptResult.locked) {
        // Invalidate active code to prevent any further brute force attempts
        await prisma.user.update({
          where: { id: user.id },
          data: { verificationCode: null, verificationExpires: null },
        });

        return NextResponse.json(
          {
            message: "Too many failed attempts. For your security, this verification code has been invalidated. Please request a new code after 15 minutes.",
            locked: true,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          message: `Invalid verification code. ${attemptResult.attemptsLeft} attempt(s) remaining before temporary lockout.`,
        },
        { status: 400 }
      );
    }

    // Success: clear lockout counters
    clearFailedAttempts(lockoutKey);

    // Mark as verified and clear verification code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return NextResponse.json(
      { success: true, message: "Account verified successfully!" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Verification error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
