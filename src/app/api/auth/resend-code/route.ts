import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { sendVerificationCodeEmail } from "@/lib/email";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const resendSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit per IP: max 5 resend requests per 15 minutes
    const ipRate = checkRateLimit(`resend_ip:${clientIp}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipRate.success) {
      return rateLimitResponse(ipRate.reset);
    }

    const body = await req.json();
    const { email } = resendSchema.parse(body);

    // Rate limit per email: max 3 resend requests per 15 minutes
    const emailRate = checkRateLimit(`resend_email:${email}`, {
      limit: 3,
      windowMs: 15 * 60 * 1000,
    });
    if (!emailRate.success) {
      return rateLimitResponse(emailRate.reset);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "Account is already verified. You can sign in directly." },
        { status: 400 }
      );
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpires,
      },
    });

    await sendVerificationCodeEmail({
      email,
      code: verificationCode,
      name: user.name,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV ONLY] Resent verification code for ${email}: ${verificationCode}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: "A new verification code has been sent to your email",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Resend code error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
