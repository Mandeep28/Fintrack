import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit per IP: max 5 requests per 15 minutes
    const ipRate = checkRateLimit(`forgot_ip:${clientIp}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipRate.success) {
      return rateLimitResponse(ipRate.reset);
    }

    const body = await req.json();
    const { email } = requestSchema.parse(body);

    // Rate limit per email: max 3 requests per 15 minutes
    const emailRate = checkRateLimit(`forgot_email:${email}`, {
      limit: 3,
      windowMs: 15 * 60 * 1000,
    });
    if (!emailRate.success) {
      return rateLimitResponse(emailRate.reset);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Standard uniform response message to prevent email and auth provider enumeration
    const genericResponse = {
      success: true,
      message: "If an account exists with this email, a verification code has been sent.",
    };

    // If user does not exist, return generic response immediately
    if (!user) {
      return NextResponse.json(genericResponse, { status: 200 });
    }

    // If user signs in via Google OAuth, do not expose provider info in the HTTP response;
    // return generic message.
    if (user.provider === "google" || !user.password) {
      return NextResponse.json(genericResponse, { status: 200 });
    }

    // Generate 6-digit OTP code with 15-minute expiration
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpires,
      },
    });

    await sendPasswordResetEmail({
      email,
      code: verificationCode,
      name: user.name,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV ONLY] Password reset code for ${email}: ${verificationCode}`);
    }

    return NextResponse.json(genericResponse, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Forgot password request error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
