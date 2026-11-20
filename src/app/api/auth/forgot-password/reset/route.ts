import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as z from "zod";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const resetSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    resetToken: z.string().min(10, "Invalid reset token"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit: max 10 reset attempts per 15 minutes per IP
    const ipRate = checkRateLimit(`reset_ip:${clientIp}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipRate.success) {
      return rateLimitResponse(ipRate.reset);
    }

    const body = await req.json();
    const { email, resetToken, password } = resetSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.verificationCode) {
      return NextResponse.json(
        { message: "Invalid or already used reset session. Please start over." },
        { status: 400 }
      );
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return NextResponse.json(
        { message: "Reset session has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Verify token: compute SHA-256 hash of provided token and compare using timing-safe check
    const computedHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const storedHash = user.verificationCode;

    let isMatch = false;
    if (storedHash.length === computedHash.length) {
      isMatch = crypto.timingSafeEqual(
        Buffer.from(storedHash),
        Buffer.from(computedHash)
      );
    } else if (storedHash.length === resetToken.length) {
      // Legacy unhashed token compatibility
      isMatch = crypto.timingSafeEqual(
        Buffer.from(storedHash),
        Buffer.from(resetToken)
      );
    }

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid or already used reset session. Please start over." },
        { status: 400 }
      );
    }

    // Hash new password using 10 rounds of bcrypt and clear reset token
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully! You can now sign in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Forgot password reset error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
