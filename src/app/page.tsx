"use client";

import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  HeartPulse, 
  Zap, 
  FileSpreadsheet, 
  MousePointerClick, 
  Lock, 
  CheckCircle2
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import FinTrackLogo from "@/components/ui/FinTrackLogo";
import SuperheroDoctorHero from "@/components/landing/SuperheroDoctorHero";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      {/* Background Ambience & Lighting */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[800px] -left-[200px] w-[500px] h-[500px] bg-primary/5 blur-[140px] rounded-full" />
        <div className="absolute top-[1600px] -right-[200px] w-[500px] h-[500px] bg-primary/5 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <FinTrackLogo variant="full" size="md" />
          </Link>

          {/* Right CTAs */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="space-y-24 sm:space-y-32 lg:space-y-40 pb-20">
        {/* =========================================================================
            ACT 1: WHO WE ARE (HERO SECTION)
            ========================================================================= */}
        <section className="relative pt-12 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: Who We Are & Value Prop */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Subtle Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Zero Manual Categorization</span>
              </div>

              {/* Punchy Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Track money at the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-400 to-emerald-400">
                  speed of thought.
                </span>
              </h1>

              {/* Ultra-Concise Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Type plain English. No bank logins, no tedious forms, zero spreadsheets.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-full shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start Tracking Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold bg-secondary/80 hover:bg-secondary text-foreground px-7 py-3.5 rounded-full border border-border/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Sign In</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  60-second setup
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  100% private
                </span>
              </div>
            </div>

            {/* Right: Superhero Character */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <SuperheroDoctorHero />
            </div>
          </div>
        </section>

        {/* =========================================================================
            ACT 2: WHY US (THE 3 CORE DIFFERENTIATORS)
            ========================================================================= */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">
              The FinTrack Difference
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Engineered for speed, privacy, and true clarity.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-normal">
              Everything you need to stay in control, built around three uncompromising pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 1 */}
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/5 via-card/80 to-card p-7 sm:p-8 space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Pillar 1: Speed</span>
                <h3 className="text-xl font-bold text-foreground">One-Line Natural Language Dump</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Type <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">150 uber</code>, <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">yesterday 1200 groceries</code>, or paste 2,000 lines from a bank SMS statement. FinTrack automatically extracts dates, amounts, and vendor categories in milliseconds.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/5 via-card/80 to-card p-7 sm:p-8 space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Pillar 2: Privacy</span>
                <h3 className="text-xl font-bold text-foreground">Zero Bank Logins. 100% Private</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We never ask for your bank passwords, account numbers, or OTPs. Your data is strictly tenant-isolated, encrypted at rest, and never sold to advertisers or third-party lenders.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/5 via-card/80 to-card p-7 sm:p-8 space-y-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Pillar 3: Clarity</span>
                <h3 className="text-xl font-bold text-foreground">Live Financial Health Score</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Like an ECG for your money. Instantly audit your wallet with a comprehensive 0–100 score across Budget Discipline, Savings Velocity, and Spending Stability. Know where you stand before month-end.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            ACT 3: WHAT PROBLEM WE SOLVE
            ========================================================================= */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">
              The Reality
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              Managing money shouldn't feel like a second job.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-normal">
              Most budgeting systems fail within weeks because the friction is simply too high.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Problem 1 */}
            <div className="rounded-3xl border border-border/70 bg-card/60 backdrop-blur-sm p-7 sm:p-8 space-y-4 hover:border-border transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Spreadsheet Burnout</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Endless columns, broken formulas, and hours wasted entering receipts manually every Sunday night — only to abandon the sheet after two weeks.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="rounded-3xl border border-border/70 bg-card/60 backdrop-blur-sm p-7 sm:p-8 space-y-4 hover:border-border transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MousePointerClick className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Click-Heavy Expense Apps</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tapping through eight nested dropdown menus just to record a $3 cup of coffee creates instant cognitive fatigue. You shouldn't need a manual to log a sandwich.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="rounded-3xl border border-border/70 bg-card/60 backdrop-blur-sm p-7 sm:p-8 space-y-4 hover:border-border transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Bank-Scraping Security Risks</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automated budgeting apps demand your sensitive net-banking credentials and account passwords, only for screen scrapers to break every time your bank updates its portal.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            ACT 4: MINIMAL CTA BANNER
            ========================================================================= */}
        <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] border border-primary/30 bg-gradient-to-b from-primary/10 via-card to-card p-8 sm:p-12 lg:p-16 text-center space-y-6 overflow-hidden shadow-2xl">
            {/* Subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/20 blur-3xl pointer-events-none -z-10" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready in 60 seconds</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground max-w-2xl mx-auto">
              Start tracking your money the smart way.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Join FinTrack today. Set up in under 60 seconds. No credit card required.
            </p>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          MINIMALIST FOOTER
          ========================================================================= */}
      <footer className="border-t border-border/60 bg-background/50 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <FinTrackLogo variant="full" size="sm" />
            <span className="text-xs text-muted-foreground/80">
              © {new Date().getFullYear()} FinTrack. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
