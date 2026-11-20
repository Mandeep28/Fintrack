"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  ArrowLeft,
  RotateCw,
} from "lucide-react";
import FinTrackLogo from "@/components/ui/FinTrackLogo";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  // Step 1: Form, Step 2: Verification
  const [step, setStep] = useState<"register" | "verify">("register");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Step 2: 6-Digit Code State
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  // Countdown timer for resending code
  useEffect(() => {
    if (step !== "verify" || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Handle Google OAuth Sign Up
  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error(err);
      setError("Failed to initialize Google Sign In. Please try again.");
      setGoogleLoading(false);
    }
  };

  // Step 1: Submit Registration Form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to register.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      setStep("verify");
      setResendCooldown(60);
      setSuccessMessage(data.message || "Verification code sent to your email!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Code Input Handling
  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = char;
    setCodeDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...codeDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setCodeDigits(newDigits);
    const nextIdx = Math.min(pasted.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  // Step 2: Submit Verification Code
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = codeDigits.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid verification code");
      }

      router.push("/login?verified=true");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      setResendCooldown(60);
      setSuccessMessage("A fresh verification code has been dispatched to your email!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend code. Please try again later.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* LEFT COLUMN: Modern SaaS Showcase with Theme-Responsive Full-Bleed Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 select-none border-r border-border/40">
        {/* Full-bleed Theme-Responsive Images */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/auth-light.jpg"
          alt="FinTrack Financial Abstract Art"
          className="absolute inset-0 w-full h-full object-cover block dark:hidden pointer-events-none"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/auth-dark.jpg"
          alt="FinTrack Financial Abstract Art"
          className="absolute inset-0 w-full h-full object-cover hidden dark:block pointer-events-none"
        />

        {/* Subtle Ambient Vignette Overlay for Crisp Legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/60 dark:from-[#090D16]/90 dark:via-[#090D16]/30 dark:to-[#090D16]/65 pointer-events-none"
        />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <FinTrackLogo variant="full" size="md" />
          </Link>

          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 dark:bg-black/30 backdrop-blur-md text-white border border-white/20 shadow-xs">
            Privacy First
          </span>
        </div>

        {/* Bottom Headline & Brand Pillars */}
        <div className="relative z-10 space-y-4 max-w-lg mt-auto pb-4">
          <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            Start building wealth with modern clarity.
          </h2>
          <p className="text-sm text-slate-200 dark:text-slate-300 leading-relaxed max-w-md drop-shadow-xs">
            Create your account in 30 seconds. Experience zero-clutter expense logging, smart budgets, and strict financial privacy.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/15 text-[11px] text-white font-medium flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Smart Budget Allocations</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/15 text-[11px] text-white font-medium shadow-xs">
              <span>Zero-Access Privacy</span>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Links */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 dark:text-slate-400 border-t border-white/15 pt-4">
          <p>&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center justify-center mb-2">
            <Link href="/">
              <FinTrackLogo variant="full" size="lg" />
            </Link>
          </div>

          {step === "register" ? (
            <>
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Create an account
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Start tracking your expenses and budgeting with ease.
                </p>
              </div>

              {/* Google Sign Up */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                className="w-full bg-secondary/80 hover:bg-secondary border border-border text-foreground font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-border w-full"></div>
                <span className="bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0">
                  or register with email
                </span>
                <div className="border-t border-border w-full"></div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-3.5 py-2.5 rounded-xl text-xs text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-secondary/60 border border-border text-foreground rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs sm:text-sm placeholder:text-muted-foreground"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-secondary/60 border border-border text-foreground rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs sm:text-sm placeholder:text-muted-foreground"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      className="w-full bg-secondary/60 border border-border text-foreground rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs sm:text-sm placeholder:text-muted-foreground"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      className="w-full bg-secondary/60 border border-border text-foreground rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs sm:text-sm placeholder:text-muted-foreground"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Terms of Service & Privacy Policy Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-border cursor-pointer shrink-0 accent-cyan-500"
                  />
                  <label
                    htmlFor="agreeTerms"
                    className="text-xs text-muted-foreground leading-snug cursor-pointer select-none"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-primary hover:underline font-semibold"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-primary hover:underline font-semibold"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 sm:py-3 rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                </button>
              </form>

              <p className="text-center text-muted-foreground text-xs">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            /* STEP 2: CODE VERIFICATION */
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep("register")}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to edit details</span>
              </button>

              <div className="text-center lg:text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  Verify your email
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  We sent a 6-digit confirmation code to{" "}
                  <strong className="text-foreground">{formData.email}</strong>.
                </p>
              </div>

              {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-2.5 rounded-xl text-xs text-center font-medium">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-3.5 py-2.5 rounded-xl text-xs text-center font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="space-y-6">
                {/* 6 Digit Inputs */}
                <div className="flex justify-between gap-2">
                  {codeDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className="w-11 sm:w-12 h-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl bg-secondary/60 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || codeDigits.some((d) => !d)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 sm:py-3 rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Activate Account"}
                </button>
              </form>

              {/* Resend Code */}
              <div className="text-center text-xs text-muted-foreground pt-2">
                {resendCooldown > 0 ? (
                  <span>Resend code in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending}
                    className="text-primary hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {resending && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Resend verification code</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
