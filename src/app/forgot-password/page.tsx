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
  KeyRound,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import FinTrackLogo from "@/components/ui/FinTrackLogo";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // 3 Steps: "request" -> "verify" -> "reset"
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Step 2: 6-Digit Code State
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  // Resend countdown timer
  useEffect(() => {
    if (step !== "verify" || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Step 1: Request 6-digit Code
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsGoogleAccount(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.googleAccount) {
          setIsGoogleAccount(true);
        }
        throw new Error(data.message || "Failed to process request");
      }

      setStep("verify");
      setResendCooldown(60);
      setSuccessMessage(data.message || "Verification code sent to your email!");

      if (data.devCode) {
        console.log(`[FinTrack Dev Code]: ${data.devCode}`);
      }
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

  // Step 2: Code Digit Input Handling
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
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...codeDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || "";
    }
    setCodeDigits(newDigits);

    const nextIdx = Math.min(pasteData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  // Step 2: Verify 6-digit Code
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeDigits.join("");

    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid verification code");
      }

      setResetToken(data.resetToken);
      setSuccessMessage("Code verified! Please set your new password.");
      setStep("reset");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid verification code. Please check and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      setSuccessMessage("A fresh verification code has been dispatched!");
      setResendCooldown(60);
      setCodeDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend code");
      }
    } finally {
      setResending(false);
    }
  };

  // Step 3: Set New Password & Auto-Sign In
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetToken,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccessMessage("Password updated! Signing you in...");

      // Automatically authenticate user with new password
      const loginRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login?reset=success");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update password. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-2xl transition-all">
        {/* STEP 1: REQUEST EMAIL */}
        {step === "request" && (
          <>
            <div className="flex flex-col items-center mb-5 sm:mb-6">
              <Link href="/" className="mb-3 sm:mb-4">
                <FinTrackLogo variant="full" size="lg" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 text-center">
                Forgot Password
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm text-center">
                Enter your registered email to receive a 6-digit recovery code.
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3.5 py-2.5 rounded-2xl mb-4 sm:mb-5 text-xs sm:text-sm text-center font-medium">
                {error}
                {isGoogleAccount && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                      className="inline-flex items-center justify-center w-full bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold py-2 px-3 rounded-xl transition-all cursor-pointer"
                    >
                      Sign in with Google instead
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm placeholder:text-muted-foreground"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 sm:py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  "Send Recovery Code"
                )}
              </button>
            </form>

            <div className="mt-5 sm:mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          </>
        )}

        {/* STEP 2: VERIFY 6-DIGIT CODE */}
        {step === "verify" && (
          <>
            <div className="flex flex-col items-center mb-5 sm:mb-6">
              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setError("");
                }}
                className="self-start -ml-2 mb-2 p-1.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary/50 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change email
              </button>

              <div className="p-2.5 sm:p-3.5 bg-primary/10 rounded-2xl mb-3 text-primary">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 text-center">
                Verify Identity
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm text-center">
                We sent a 6-digit verification code to
              </p>
              <p className="font-semibold text-foreground text-xs sm:text-sm mt-0.5">{email}</p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3.5 py-2.5 rounded-2xl mb-4 sm:mb-5 text-xs sm:text-sm text-center font-medium">
                {error}
              </div>
            )}

            {successMessage && !error && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-2.5 rounded-2xl mb-4 sm:mb-5 text-xs sm:text-sm text-center font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-5 sm:space-y-6">
              <div className="flex justify-center items-center gap-1.5 sm:gap-2 max-w-xs mx-auto">
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
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-2xl font-bold rounded-xl sm:rounded-2xl border border-border bg-secondary/50 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-inner"
                    aria-label={`Digit ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || codeDigits.some((d) => !d)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 sm:py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm">
              <p className="text-muted-foreground mb-1.5">Didn&apos;t receive the code?</p>
              {resendCooldown > 0 ? (
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full inline-block">
                  Resend code in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold cursor-pointer text-xs sm:text-sm"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                  Resend verification code
                </button>
              )}
            </div>
          </>
        )}

        {/* STEP 3: SET NEW PASSWORD */}
        {step === "reset" && (
          <>
            <div className="flex flex-col items-center mb-5 sm:mb-6">
              <div className="p-2.5 sm:p-3.5 bg-primary/10 rounded-2xl mb-3 text-primary">
                <KeyRound className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 text-center">
                Set New Password
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm text-center">
                Choose a strong new password for your account.
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3.5 py-2.5 rounded-2xl mb-4 sm:mb-5 text-xs sm:text-sm text-center font-medium">
                {error}
              </div>
            )}

            {successMessage && !error && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-2.5 rounded-2xl mb-4 sm:mb-5 text-xs sm:text-sm text-center font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-3.5 sm:space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl pl-3.5 sm:pl-4 pr-11 sm:pr-12 py-2.5 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm placeholder:text-muted-foreground"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl pl-3.5 sm:pl-4 pr-11 sm:pr-12 py-2.5 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm placeholder:text-muted-foreground"
                    placeholder="Repeat your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 sm:py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  "Save Password & Sign In"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
