"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Clock, 
  Zap, 
  ChevronDown, 
  BarChart3, 
  Calendar 
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
  { id: "loan", name: "Personal / Education Loan", type: "DEBT", target: 120000, icon: CreditCard, defaultMonthly: 15000 },
  { id: "trip", name: "Dream Vacation", type: "SAVINGS", target: 50000, icon: Calendar, defaultMonthly: 8000 },
  { id: "laptop", name: "New Workstation / Laptop", type: "SAVINGS", target: 100000, icon: LaptopIcon, defaultMonthly: 12000 },
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
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
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/15 via-indigo-500/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[800px] -left-[200px] w-[600px] h-[600px] bg-purple-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-[1600px] -right-[200px] w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-foreground flex items-center gap-1.5">
                FinTrack
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  v2.0
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#goals" className="hover:text-foreground transition-colors">Visual Goals</a>
            <a href="#calculator" className="hover:text-foreground transition-colors">Simulator</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-bold text-foreground hover:text-primary px-4 py-2.5 rounded-xl transition-colors hidden sm:inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 group overflow-hidden"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border text-xs font-bold text-foreground mb-8 backdrop-blur-md shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-primary font-black uppercase tracking-wider text-[11px]">Introducing Goals 2.0</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Savings Targets & Debt Payoffs</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]"
        >
          Master your money. <br />
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">
            Crush every financial goal.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Stop wondering where your paycheck vanished. Track daily expenses with lightning speed, 
          set visual targets for dream purchases like a smartphone, and eliminate loans step-by-step with real-time percentage progress.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-primary-foreground bg-primary hover:bg-primary/95 transition-all shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:scale-95 group"
          >
            <span>Start Tracking Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-bold text-foreground bg-secondary hover:bg-secondary/80 border border-border transition-all active:scale-95"
          >
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>View Dashboard</span>
          </Link>
        </motion.div>

        {/* Hero Social Proof / Micro-Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs font-semibold text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero spreadsheets needed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Visual savings & debt completion %</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>100% Free for individuals</span>
          </div>
        </motion.div>

        {/* Live Visual Showcase Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45 }}
          className="mt-16 sm:mt-20 relative max-w-5xl mx-auto"
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 blur-xl opacity-70 group-hover:opacity-100 transition duration-1000" />

          {/* Mockup Container */}
          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-card border border-border shadow-2xl p-4 sm:p-8 overflow-hidden text-left">
            {/* Top Bar of the Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-bold text-muted-foreground ml-2">fintrack.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  ● Real-time Sync
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                  October 2026
                </span>
              </div>
            </div>

            {/* Mockup Body: 3 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-5 rounded-2xl bg-secondary/40 border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Spent This Month</p>
                <p className="text-2xl font-black text-foreground">₹38,450</p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>14.2% less than budget limit</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/40 border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Daily Average</p>
                <p className="text-2xl font-black text-foreground">₹1,240</p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mt-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Day 18 of 31 days</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">Financial Targets</p>
                <p className="text-2xl font-black text-foreground">4 Active</p>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 mt-2">
                  <Target className="w-3.5 h-3.5" />
                  <span>2 Goals near completion</span>
                </div>
              </div>
            </div>

            {/* Mockup Body: Showcase of Purchase Goal & Loan Payoff */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Smartphone Purchase Goal */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/80 hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">New Smartphone (iPhone 16)</h4>
                      <p className="text-[11px] text-muted-foreground font-medium">Gadgets & Tech • Savings Goal</p>
                    </div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    65% Saved
                  </span>
                </div>

                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden my-3">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[65%]" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Saved: </span>
                    <span className="font-bold text-foreground">₹78,000</span>
                    <span className="text-muted-foreground"> / ₹1,20,000</span>
                  </div>
                  <div className="text-right font-bold text-blue-500">
                    ₹42,000 left
                  </div>
                </div>
              </div>

              {/* Debt / Loan Payoff Goal */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/80 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Student Loan Repayment</h4>
                      <p className="text-[11px] text-muted-foreground font-medium">Debt Free Tracker • Loan EMI</p>
                    </div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    75% Paid Off
                  </span>
                </div>

                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden my-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-[75%]" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Paid: </span>
                    <span className="font-bold text-foreground">₹1,50,000</span>
                    <span className="text-muted-foreground"> / ₹2,00,000</span>
                  </div>
                  <div className="text-right font-bold text-purple-500">
                    ₹50,000 remaining
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Section 1: The Core Goals Philosophy */}
      <section id="goals" className="py-24 border-t border-border/60 bg-secondary/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">
              Clear Visual Targets
            </h2>
            <p className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              Turn abstract dreams and stressful loans into simple progress bars.
            </p>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Most people fail their financial goals because they don&apos;t remember how much they&apos;ve saved or how much debt is left. FinTrack gives you total visual certainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Purchase Goal Card */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-xl hover:shadow-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Savings Target</span>
              <h3 className="text-2xl font-bold text-foreground mt-2 mb-3">Save for Purchases Without Guilt</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Planning to purchase a new smartphone, laptop, or booking a vacation trip? Create a goal, set your target price, and deposit funds whenever you save. Watch the completion percentage jump every single time.
              </p>
              <ul className="space-y-3 text-sm text-foreground font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Exact amount left updated automatically</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Quick-deposit presets (+₹1,000, +₹5,000)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Celebration badge once 100% achieved</span>
                </li>
              </ul>
            </div>

            {/* Debt Payoff Card */}
            <div className="p-8 rounded-[2.5rem] bg-card border border-border shadow-xl hover:shadow-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-500">Debt & Loan Elimination</span>
              <h3 className="text-2xl font-bold text-foreground mt-2 mb-3">Conquer Loans Step by Step</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Carrying a personal loan, credit card balance, or vehicle EMI? Record payments as debt payoffs. Instead of feeling trapped, you&apos;ll see the exact percent paid out and the dwindling balance left to complete freedom.
              </p>
              <ul className="space-y-3 text-sm text-foreground font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Clear countdown to 100% debt-free status</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Complete history log with notes for every payment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Visual separation between savings assets and liabilities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Six Pillar Features Grid */}
      <section id="features" className="py-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">
            Built For Real Life
          </h2>
          <p className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            Everything you need. Nothing you don&apos;t.
          </p>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            No complicated banking integrations that break every week. Just swift, effortless tracking that actually sticks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/40 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Natural Language Quick-Add</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Type or paste freeform lines like &apos;450 swiggy lunch&apos; or &apos;1200 uber airport&apos;. Our smart parser extracts amount, category, and notes instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/40 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Category Spending Budgets</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Set realistic monthly limits for Food, Shopping, Bills, and Transit. Get proactive alerts before an impulse purchase blows your budget.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/40 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Dual Savings & Debt Goals</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track smartphones, gadgets, and emergency funds side-by-side with loan EMIs and credit card payoff milestones in one unified dashboard.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/40 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Visual Spending Velocity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Interactive 7-day spending curves and daily average spend rate keep you grounded throughout the entire month.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/40 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Proactive Overspending Alarms</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Whenever a category hits 80% or exceeds its allocated threshold, FinTrack shows a clear breakdown of the overrun so you can correct course.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:border-primary/40 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">100% Private & Ad-Free</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We never sell your transaction history or show annoying credit card ads. Your financial data stays yours, protected by authenticated sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Feature Section 3: Goal & Savings Simulator */}
      <section id="calculator" className="py-24 border-t border-border/60 bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">
              Interactive Simulator
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              See how fast you can hit your next target.
            </p>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Pick a goal and slide your monthly allocation to calculate the timeline in real time.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-card border border-border rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
            {/* Goal Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 font-bold"
                        : "bg-secondary/50 text-foreground border-border hover:bg-secondary font-medium"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                    <p className="text-xs font-bold leading-tight line-clamp-1">{goal.name}</p>
                    <p className={`text-[11px] mt-1 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      ₹{goal.target.toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Slider & Dynamic Calculation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-secondary/30 p-6 sm:p-8 rounded-3xl border border-border">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="monthly-saving-slider" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Monthly Contribution
                  </label>
                  <span className="text-lg font-black text-foreground">
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

                <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
                  {selectedGoal.type === "SAVINGS" ? (
                    <>By setting aside <strong className="text-foreground">₹{monthlyContribution.toLocaleString()}</strong> every month, you will be holding your <strong className="text-foreground">{selectedGoal.name}</strong> completely debt-free.</>
                  ) : (
                    <>Paying <strong className="text-foreground">₹{monthlyContribution.toLocaleString()}</strong> each month will totally wipe out this loan balance, saving substantial interest costs.</>
                  )}
                </p>
              </div>

              {/* Result Showcase */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  Estimated Timeline
                </span>
                <div className="text-5xl font-black text-foreground my-2">
                  {monthsNeeded} <span className="text-2xl font-bold text-muted-foreground">months</span>
                </div>
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden mt-4 mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, (1 / monthsNeeded) * 100))}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-emerald-500 mt-2">
                  {selectedGoal.type === "SAVINGS" ? "Target reached by " : "Debt-free by "}
                  {estimatedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 4: Comparison Table */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">
            Why Switch
          </h2>
          <p className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            Built for clarity, not complexity.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Way */}
          <div className="p-8 rounded-[2rem] bg-secondary/30 border border-border text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm">
                ✕
              </div>
              <h3 className="text-xl font-bold text-foreground">Spreadsheets & Mental Math</h3>
            </div>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Forgetting how much you saved toward a smartphone or gadget</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Uncertainty about how much loan or EMI is still outstanding</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Tedious manual formula errors and messy mobile editing</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>Zero real-time warnings before blowing your monthly budget</span>
              </li>
            </ul>
          </div>

          {/* FinTrack Way */}
          <div className="p-8 rounded-[2rem] bg-gradient-to-b from-primary/10 via-card to-card border border-primary/30 text-left shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="text-xl font-bold text-foreground">The FinTrack Way</h3>
            </div>
            <ul className="space-y-4 text-sm text-foreground font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Live % progress & exact remaining balance for every single goal</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Single-click contributions and payoff logs with historical timeline</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Smart categorization & natural language bulk input</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Visual velocity graphs & automated budget alarms</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-border/60 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">
              Common Questions
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is the Goals feature in FinTrack?",
                a: "FinTrack Goals lets you track both savings targets (like buying a new smartphone, laptop, or booking a trip) and debt payoffs (like personal loans, student debt, or credit card balances). It visually displays your completion percentage and calculates how much money is left."
              },
              {
                q: "How does the loan / debt payoff tracker work?",
                a: "When you create a goal with purpose 'Debt Payoff', each payment you log counts as a step toward becoming debt-free. FinTrack shows the exact remaining balance and percent paid off, giving you clear motivation to eliminate debts."
              },
              {
                q: "Is FinTrack free to use?",
                a: "Yes! FinTrack is 100% free for personal finance management, budgeting, and goal tracking with zero hidden fees or locked features."
              },
              {
                q: "Is my financial data secure?",
                a: "Absolutely. FinTrack uses encrypted database storage, secure password hashing with bcrypt, and protected NextAuth sessions. We do not sell your data or connect to third-party ad networks."
              }
            ].map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className="rounded-2xl border border-border bg-card overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between font-bold text-foreground cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Conversion CTA Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[3rem] bg-gradient-to-br from-primary via-indigo-600 to-purple-700 p-10 sm:p-16 text-center text-primary-foreground shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
              Ready to take complete control of your finances?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-primary-foreground/80 max-w-xl mx-auto">
              Join FinTrack today. Set your first goal, track your monthly burn rate, and reach financial freedom faster.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold text-base shadow-xl hover:bg-slate-100 transition-all hover:-translate-y-0.5 active:scale-95 inline-flex items-center justify-center gap-2 group"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5 text-slate-900 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-primary-foreground/10 hover:bg-primary-foreground/20 text-white font-bold text-base border border-white/20 transition-all"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="font-bold text-foreground text-sm">FinTrack</span>
            <span>• Smart Personal Finance & Goals</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/goals" className="hover:text-foreground transition-colors">Goals</Link>
            <Link href="/categories" className="hover:text-foreground transition-colors">Budgets</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>

          <p>© 2026 FinTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
