import nodemailer from "nodemailer";

interface SendCodeParams {
  email: string;
  code: string;
  name?: string | null;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

export async function sendVerificationCodeEmail({ email, code, name }: SendCodeParams) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || '"FinTrack" <noreply@fintrack.app>';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #090d16; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #06b6d4; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">FinTrack</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Smart Financial Tracking & Analytics</p>
      </div>

      <div style="background: #101623; border: 1px solid #1e293b; border-radius: 12px; padding: 28px; text-align: center;">
        <h2 style="color: #f8fafc; font-size: 20px; font-weight: 600; margin-top: 0;">Verify your email address</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          ${name ? `Hi <strong>${name}</strong>, ` : "Hello, "}
          welcome to FinTrack! Use the 6-digit verification code below to verify your account and get started.
        </p>

        <div style="display: inline-block; background: #0b1d28; border: 1px solid #06b6d4; border-radius: 8px; padding: 16px 36px; margin: 8px 0 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #06b6d4; font-family: monospace;">
            ${code}
          </span>
        </div>

        <p style="color: #64748b; font-size: 13px; margin: 0;">
          This code expires in <strong>15 minutes</strong>. If you didn't request this code, you can safely ignore this email.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} FinTrack. All rights reserved.</p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: `Your FinTrack Verification Code: ${code}`,
        text: `Your FinTrack verification code is: ${code}. It expires in 15 minutes.`,
        html: htmlContent,
      });

      console.log(`[Email Service] Verification email dispatched to ${email}`);
      return { success: true, mode: "smtp" };
    } catch (error) {
      console.error("[Email Service] Failed to send via SMTP:", error);
      console.log(`\n======================================================`);
      console.log(`[DEV EMAIL FALLBACK] Verification Code for ${email}: ${code}`);
      console.log(`======================================================\n`);
      return { success: true, mode: "fallback", error: String(error) };
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[DEV EMAIL FALLBACK] Verification Code for ${email}: ${code}`);
    console.log(`(Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env to send real emails)`);
    console.log(`======================================================\n`);
    return { success: true, mode: "console" };
  }
}

export async function sendPasswordResetEmail({ email, code, name }: SendCodeParams) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || '"FinTrack" <noreply@fintrack.app>';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #090d16; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #06b6d4; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">FinTrack</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Smart Financial Tracking & Analytics</p>
      </div>

      <div style="background: #101623; border: 1px solid #1e293b; border-radius: 12px; padding: 28px; text-align: center;">
        <h2 style="color: #f8fafc; font-size: 20px; font-weight: 600; margin-top: 0;">Reset your password</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          ${name ? `Hi <strong>${name}</strong>, ` : "Hello, "}
          we received a request to reset your FinTrack account password. Use the 6-digit code below to verify your identity and set a new password.
        </p>

        <div style="display: inline-block; background: #0b1d28; border: 1px solid #06b6d4; border-radius: 8px; padding: 16px 36px; margin: 8px 0 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #06b6d4; font-family: monospace;">
            ${code}
          </span>
        </div>

        <p style="color: #64748b; font-size: 13px; margin: 0;">
          This code expires in <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>

      <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} FinTrack. All rights reserved.</p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: `Your FinTrack Password Reset Code: ${code}`,
        text: `Your FinTrack password reset code is: ${code}. It expires in 15 minutes.`,
        html: htmlContent,
      });

      console.log(`[Email Service] Password reset email dispatched to ${email}`);
      return { success: true, mode: "smtp" };
    } catch (error) {
      console.error("[Email Service] Failed to send via SMTP:", error);
      console.log(`\n======================================================`);
      console.log(`[DEV EMAIL FALLBACK] Password Reset Code for ${email}: ${code}`);
      console.log(`======================================================\n`);
      return { success: true, mode: "fallback", error: String(error) };
    }
  } else {
    console.log(`\n======================================================`);
    console.log(`[DEV EMAIL FALLBACK] Password Reset Code for ${email}: ${code}`);
    console.log(`(Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env to send real emails)`);
    console.log(`======================================================\n`);
    return { success: true, mode: "console" };
  }
}
