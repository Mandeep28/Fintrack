import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { sendVerificationCodeEmail } from "@/lib/email";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
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

    // Rate limit: max 10 registrations per hour per IP
    const rateCheck = checkRateLimit(`register:${clientIp}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateCheck.success) {
      return rateLimitResponse(rateCheck.reset);
    }

    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && (existingUser.provider === "google" || !existingUser.password)) {
      return NextResponse.json(
        { message: "This account is registered with Google. Please use 'Sign in with Google' to continue." },
        { status: 400 }
      );
    }

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { message: "An account with this email already exists. Please log in." },
        { status: 400 }
      );
    }

    // Generate random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser && !existingUser.isVerified) {
      // User registered previously but hadn't verified yet: update credentials & refresh code
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          password: hashedPassword,
          provider: "credentials",
          verificationCode,
          verificationExpires,
        },
      });
    } else {
      // Create new unverified user
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          provider: "credentials",
          isVerified: false,
          verificationCode,
          verificationExpires,
        },
      });
    }

    // Dispatch verification email
    await sendVerificationCodeEmail({
      email,
      code: verificationCode,
      name,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV ONLY] Registration verification code for ${email}: ${verificationCode}`);
    }

    // Never leak devCode in HTTP response body
    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent to your email",
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
