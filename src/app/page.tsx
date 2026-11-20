"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HeartPulse, 
  Target, 
  PieChart, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  ChevronDown, 
  BarChart3, 
  Calendar,
  Layers
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import FinTrackLogo from "@/components/ui/FinTrackLogo";
import FinanceDoctorCard from "@/components/landing/FinanceDoctorCard";
import SuperheroDoctorHero from "@/components/landing/SuperheroDoctorHero";

interface SampleGoal {
  id: string;
  name: string;
  type: "SAVINGS" | "DEBT";
  target: number;
  icon: any;
  defaultMonthly: number;
}

const SAMPLE_GOALS: SampleGoal[] = [
  { id: "phone", name: "Flagship Smartphone", type: "SAVINGS", target: 80000, icon: Smartphone, defaultMonthly: 10000 },
  { id: "loan", name: "Personal Loan Payoff", type: "DEBT", target: 120000, icon: CreditCard, defaultMonthly: 15000 },
  { id: "trip", name: "Dream Vacation", type: "SAVINGS", target: 50000, icon: Calendar, defaultMonthly: 8000 },
  { id: "laptop", name: "Workstation Setup", type: "SAVINGS", target: 100000, icon: LaptopIcon, defaultMonthly: 12000 },
];

function LaptopIcon(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

export default function LandingPage() {
  const [selectedGoal, setSelectedGoal] = useState<SampleGoal>(SAMPLE_GOALS[0]);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(selectedGoal.defaultMonthly);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [estimatedDate, setEstimatedDate] = useState("");

  const monthsNeeded = Math.max(1, Math.ceil(selectedGoal.target / (monthlyContribution || 1)));

  useEffect(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsNeeded);
    setEstimatedDate(d.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
  }, [monthsNeeded]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      {/* Background Ambience & Lighting */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[800px] -left-[200px] w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full" />
        <div className="absolute top-[1600px] -right-[200px] w-[600px] h-[600px] bg-primary/5 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <FinTrackLogo variant="full" size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-muted-foreground">
            <a href="#vitals" className="hover:text-primary transition-colors whitespace-nowrap">Health Vitals</a>
            <a href="#features" className="hover:text-primary transition-colors whitespace-nowrap">Core Features</a>
            <a href="#simulator" className="hover:text-primary transition-colors whitespace-nowrap">What-If Simulator</a>
            <a href="#faq" className="hover:text-primary transition-colors whitespace-nowrap">FAQ</a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-semibold text-foreground hover:text-primary px-3 sm:px-4 py-2 rounded-xl transition-colors hidden sm:inline-block whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/25 hover:shadow-primary/40 active:scale-95 whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION: Split Layout with Finance Doctor Diagnostic Card */}
      <section className="pt-12 sm:pt-16 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Finance Doctor Proposition & CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Finance Doctor Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-cyan-500/30 text-xs font-bold text-foreground mb-6 backdrop-blur-md shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-primary font-black uppercase tracking-wider text-[11px] whitespace-nowrap">
                FinTrack • Your Finance Doctor
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground hidden sm:inline whitespace-nowrap">
                Your Money&apos;s Health Check
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.12] animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100 fill-mode-both">
              Your money’s health check. <br />
              <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 dark:from-cyan-400 dark:via-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Diagnose, track, and crush financial goals.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200 fill-mode-both">
              Stop guessing where your paycheck goes. FinTrack audits your financial vitals in real time, warns you before budgets break, and keeps savings targets on track without spreadsheets.
            </p>

            {/* Compact, Non-wrapping Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300 fill-mode-both">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/95 shadow-md shadow-primary/30 hover:shadow-primary/45 hover:-translate-y-0.5 active:scale-95 transition-all whitespace-nowrap"
              >
                <span>Start Free Health Check</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/40 active:scale-95 transition-all whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4 text-primary" />
                <span>Sign In to Account</span>
              </Link>
            </div>

            {/* Micro-Proofs: Single line, no wrapping */}
            <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs font-semibold text-muted-foreground animate-in fade-in duration-700 delay-500 fill-mode-both">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>0–100 Health Score</span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Instant AI Quick-Add</span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>100% Private &amp; Ad-Free</span>
              </div>
            </div>
          </div>

          {/* Right Column: Full-Height Superhero Doctor Showcase with Wave-Animated Gown */}
          <div className="lg:col-span-6 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300 fill-mode-both flex items-center justify-center">
            <SuperheroDoctorHero />
          </div>
        </div>
      </section>

      {/* SECTION 1: Health Vitals & Diagnostic Philosophy */}
      <section id="vitals" className="py-20 border-t border-border/60 bg-secondary/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2.5">
              Financial Diagnosis
            </h2>
            <p className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              A comprehensive health check for your monthly cash flow.
            </p>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Just like a regular medical checkup, FinTrack evaluates your financial habits across four vital indicators and provides actionable advice to improve your financial score.
            </p>
          </div>

          {/* Detailed Diagnostic Card Showcase */}
          <div className="max-w-xl mx-auto mb-12">
            <FinanceDoctorCard />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {/* Vital 1 */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-1">Savings Rate Vital</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Measures the percentage of net income you retain each month rather than spend on impulsive purchases.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted-foreground">Target: 20%+</span>
                <span className="text-emerald-500">Essential Vitals</span>
              </div>
            </div>

            {/* Vital 2 */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-1">Budget Discipline</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Monitors adherence to category spending limits, alerting you well before an overrun occurs.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted-foreground">Safe Buffer: 15%</span>
                <span className="text-cyan-500">Zero Overrun</span>
              </div>
            </div>

            {/* Vital 3 */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-1">Debt Burden Index</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tracks loans and credit balances, computing the exact pace required to reach 100% debt-free status.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted-foreground">Ratio: &lt; 25%</span>
                <span className="text-emerald-500">Low Exposure</span>
              </div>
            </div>

            {/* Vital 4 */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-1">Expense Stability</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Analyzes day-to-day burn rate volatility to ensure your lifestyle spending remains predictable and stress-free.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted-foreground">Variance: Low</span>
                <span className="text-primary">Controlled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Verified USP Features Grid (100% Truthful, No Shared Rooms) */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2.5">
            Core Capabilities
          </h2>
          <p className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            Built for financial clarity. No assumptions, no fluff.
          </p>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Every feature described below is fully operational in your FinTrack dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1: Health Score & Diagnosis */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-lg transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">Financial Health Diagnostic</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Calculates a live 0–100 financial health score based on real transaction history, accompanied by clear action points to boost your financial resilience.
            </p>
          </div>

          {/* Feature 2: Dual Savings & Debt Goals */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-lg transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">Visual Savings &amp; Debt Goals</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Track dream purchases side-by-side with loan payoff milestones. Real-time percentage rings show your exact distance to completion.
            </p>
          </div>

          {/* Feature 3: AI Quick-Add & Keyword Auto-Learning */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-lg transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">AI-Powered Natural Quick-Add</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Type natural lines like &apos;12 nov 250 sagar ratna&apos;. FinTrack checks your database keywords and uses AI for new terms, learning keywords automatically for instant future matches.
            </p>
          </div>

          {/* Feature 4: Category Budgets */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-lg transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">Category Budgets &amp; Warnings</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Set monthly spending caps for Food, Shopping, Bills, and Transit. Receive clear visual warnings when spending approaches or exceeds your limit.
            </p>
          </div>

          {/* Feature 5: Activity Log & CSV Export */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-lg transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">Activity Ledger &amp; CSV Export</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              View your entire financial timeline with search, category filters, and single-click CSV data export so you always maintain complete data ownership.
            </p>
          </div>

          {/* Feature 6: Strict Privacy */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-lg transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1.5">Bank-Grade Privacy &amp; Zero Ads</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Protected by bcrypt password encryption, 6-digit email verification codes, and strict user isolation. We never sell your data or serve third-party ads.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Interactive What-If Goal Simulator */}
      <section id="simulator" className="py-20 border-t border-border/60 bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2.5">
              Interactive Forecast
            </h2>
            <p className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              Test your financial pace with the What-If Simulator.
            </p>
            <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground">
              Select a goal and adjust your monthly allocation to forecast the exact completion date in real time.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-xl">
            {/* Goal Selector Buttons (Non-wrapping whitespace-nowrap) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {SAMPLE_GOALS.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoal.id === goal.id;
                return (
                  <button
                    key={goal.id}
                    onClick={() => {
                      setSelectedGoal(goal);
                      setMonthlyContribution(goal.defaultMonthly);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 font-bold"
                        : "bg-secondary/60 text-foreground border-border hover:bg-secondary font-medium"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                    <p className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">{goal.name}</p>
                    <p className={`text-[11px] mt-0.5 whitespace-nowrap ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      ₹{goal.target.toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Slider & Dynamic Calculation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-secondary/40 p-5 sm:p-6 rounded-2xl border border-border">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label htmlFor="monthly-saving-slider" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Monthly Contribution
                  </label>
                  <span className="text-base font-black text-foreground whitespace-nowrap">
                    ₹{monthlyContribution.toLocaleString()} / mo
                  </span>
                </div>

                <input
                  id="monthly-saving-slider"
                  aria-label="Monthly Contribution"
                  type="range"
                  min={2000}
                  max={selectedGoal.target / 2}
                  step={1000}
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-muted-foreground mt-2 font-medium">
                  <span>Min: ₹2,000</span>
                  <span>Target: ₹{selectedGoal.target.toLocaleString()}</span>
                </div>

                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  {selectedGoal.type === "SAVINGS" ? (
                    <>Allocating <strong className="text-foreground">₹{monthlyContribution.toLocaleString()}</strong> every month enables you to reach your <strong className="text-foreground">{selectedGoal.name}</strong> target without taking on costly debt.</>
                  ) : (
                    <>A monthly payment of <strong className="text-foreground">₹{monthlyContribution.toLocaleString()}</strong> will clear this loan principal quickly, reducing your overall interest expense.</>
                  )}
                </p>
              </div>

              {/* Result Showcase */}
              <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-card border border-border text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                  Projected Timeline
                </span>
                <div className="text-4xl font-black text-foreground my-1.5 whitespace-nowrap">
                  {monthsNeeded} <span className="text-lg font-bold text-muted-foreground">months</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden mt-3 mb-1.5">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, (1 / monthsNeeded) * 100))}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-primary mt-1.5 whitespace-nowrap">
                  {selectedGoal.type === "SAVINGS" ? "Target reached by " : "Debt-free by "}
                  {estimatedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Comparison ("Spreadsheets vs FinTrack") */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2.5">
            The Difference
          </h2>
          <p className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            Built for clarity, not spreadsheet headaches.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Traditional Way */}
          <div className="p-6 sm:p-7 rounded-2xl bg-secondary/30 border border-border text-left">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
                ✕
              </div>
              <h3 className="text-lg font-bold text-foreground">Spreadsheets &amp; Mental Math</h3>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-bold">•</span>
                <span>Uncertainty about actual savings rate and debt burden</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-bold">•</span>
                <span>No automated warnings before exceeding category allowances</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-bold">•</span>
                <span>Manual formula errors and clunky mobile editing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-bold">•</span>
                <span>No diagnosis or actionable recommendations to improve health</span>
              </li>
            </ul>
          </div>

          {/* FinTrack Way */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-primary/10 via-card to-card border border-primary/30 text-left shadow-lg">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <h3 className="text-lg font-bold text-foreground">The FinTrack Way</h3>
            </div>
            <ul className="space-y-3.5 text-xs sm:text-sm text-foreground font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Instant 0–100 Financial Health Score with prescriptive advice</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Automated overspending alarms before budget thresholds break</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Natural language AI quick-add with automatic keyword learning</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Visual goal milestones with interactive What-If pace simulation</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 5: Overhauled FAQ (100% Truthful, No Shared Rooms) */}
      <section id="faq" className="py-20 border-t border-border/60 bg-secondary/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">
              Common Questions
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does the Financial Health Score work?",
                a: "FinTrack evaluates your financial habits across four core vitals: your savings rate, budget discipline, debt burden index, and expense stability. It computes a composite score from 0 to 100, providing an instant diagnosis and specific recommendations to improve your financial score."
              },
              {
                q: "How does Natural Language Quick-Add work with AI?",
                a: "Simply type quick one-liners like '12 nov 250 sagar ratna'. FinTrack matches your input against custom and global database keywords. If a keyword is unrecognized, AI classifies the category behind the scenes and automatically saves the keyword to your account for future instant matching."
              },
              {
                q: "Can I track both savings goals and debt payoff targets?",
                a: "Yes. You can create Savings Goals (for smartphones, electronics, emergency reserves, or vacations) and Debt Payoff Goals (for personal loans, credit card debt, or vehicle EMIs). Both display real-time percentage progress and remaining balance."
              },
              {
                q: "How do category budgets and overspending alarms protect me?",
                a: "You can allocate monthly spending budgets for categories like Food, Utilities, or Shopping. FinTrack visually tracks your spend rate and alerts you whenever a category approaches or exceeds its allocated threshold so you can adjust before running a deficit."
              },
              {
                q: "Is FinTrack free to use?",
                a: "Yes. FinTrack is 100% free for individual personal finance management, budgeting, and goal tracking with zero hidden fees or locked paywalls."
              },
              {
                q: "How is my personal financial data protected?",
                a: "FinTrack enforces strict per-user database isolation, bcrypt password hashing, 6-digit email authentication codes, and protected NextAuth sessions. We do not sell your financial data or integrate third-party ad networks."
              }
            ].map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className="rounded-xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-foreground cursor-pointer hover:text-primary transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: Bottom Call to Action Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-card border border-primary/30 p-8 sm:p-12 text-center text-foreground shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_60%)] pointer-events-none" />

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight max-w-xl mx-auto leading-tight">
              Ready for your money’s health check?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Join FinTrack today. Diagnose your spending, set visual goals, and build financial health with total confidence.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 relative z-10">
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm border border-border transition-all whitespace-nowrap"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <FinTrackLogo variant="full" size="sm" />
            <span>• Your Money&apos;s Health Check</span>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <Link href="/dashboard" className="hover:text-primary transition-colors whitespace-nowrap">Dashboard</Link>
            <Link href="/goals" className="hover:text-primary transition-colors whitespace-nowrap">Goals</Link>
            <Link href="/categories" className="hover:text-primary transition-colors whitespace-nowrap">Budgets</Link>
            <Link href="/login" className="hover:text-primary transition-colors whitespace-nowrap">Sign In</Link>
            <Link href="/register" className="hover:text-primary transition-colors whitespace-nowrap">Sign Up</Link>
          </div>

          <p className="whitespace-nowrap">&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
