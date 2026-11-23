"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerifiedFromUrl = searchParams.get("verified") === "true";

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleSignIn = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      ...formData,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Mobile-only logo */}
      <div className="lg:hidden flex items-center justify-center mb-2">
        <Link href="/">
          <FinTrackLogo variant="full" size="lg" />
        </Link>
      </div>

      <div className="text-center lg:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Enter your credentials or continue with Google to access your dashboard.
        </p>
      </div>

      {isVerifiedFromUrl && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-2.5 rounded-xl text-xs text-center font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Email verified! You can now sign in.</span>
        </div>
      )}

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full bg-secondary/80 hover:bg-secondary border border-border text-foreground font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm cursor-pointer active:scale-[0.99] disabled:opacity-50"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <>
            <GoogleIcon />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-border w-full"></div>
        <span className="bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold shrink-0">
          or with email
        </span>
        <div className="border-t border-border w-full"></div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-3.5 py-2.5 rounded-xl text-xs text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
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

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 sm:py-3 rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </button>
      </form>

      <p className="text-center text-muted-foreground text-xs">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-semibold transition-colors"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
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
        </div>

        {/* Bottom Headline & Brand Pillars */}
        <div className="relative z-10 space-y-4 max-w-lg mt-auto pb-4">
          <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            Master your money with intelligent clarity.
          </h2>
          <p className="text-sm text-slate-200 dark:text-slate-300 leading-relaxed max-w-md drop-shadow-xs">
            Log transactions, plan budgets, monitor savings goals, and experience strict zero-visibility financial privacy.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/15 text-[11px] text-white font-medium flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Real-Time Expense Analytics</span>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <Suspense
          fallback={
            <div className="w-full max-w-md p-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
