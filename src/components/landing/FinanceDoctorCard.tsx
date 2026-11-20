"use client";

import React from "react";
import { ShieldCheck, HeartPulse, Sparkles } from "lucide-react";

export default function FinanceDoctorCard() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none select-none">
      {/* Ambient background glow ring */}
      <div 
        aria-hidden="true" 
        className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-tr from-cyan-500/25 via-emerald-500/20 to-teal-500/25 blur-xl opacity-75"
      />

      {/* Main Glassmorphic Diagnostic Card */}
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-card/90 dark:bg-card/70 backdrop-blur-xl border border-cyan-500/30 dark:border-cyan-400/20 p-5 sm:p-7 shadow-2xl text-left overflow-hidden">
        {/* Subtle inner grid pattern */}
        <div 
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" 
        />

        {/* Diagnostic Top Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400">
              <HeartPulse className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                Financial Health Diagnostic
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold">
                FinTrack Engine • Live Vital Vitals
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Diagnosis
          </span>
        </div>

        {/* Center: ECG Heartbeat Waveform + Health Score Ring */}
        <div className="relative z-10 my-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Health Score Circular Dial */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-secondary/50 dark:bg-secondary/30 border border-border">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-secondary dark:text-secondary/60"
                />
                {/* Foreground Animated Progress Ring (88%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#scoreRingGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="251.3"
                  strokeDashoffset="30.1"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-foreground tracking-tight leading-none">
                  88
                </span>
                <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            <span className="mt-2 text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              Optimal Health
            </span>
          </div>

          {/* ECG Pulse Waveform Graph */}
          <div className="sm:col-span-7 flex flex-col justify-center p-3 sm:p-4 rounded-2xl bg-secondary/40 dark:bg-secondary/20 border border-border">
            <div className="flex items-center justify-between text-[11px] font-bold mb-2">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                Money Rhythm (ECG)
              </span>
              <span className="text-primary font-black text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 72 BPM Flow
              </span>
            </div>

            <div className="w-full h-16 relative overflow-hidden flex items-center">
              <svg
                viewBox="0 0 400 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284C7" />
                    <stop offset="50%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#06B6D4" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Animated ECG Pulse Line */}
                <path
                  d="M 0,30 L 40,30 L 50,30 L 58,10 L 66,50 L 74,18 L 82,38 L 90,30 L 170,30 L 178,30 L 186,8 L 194,52 L 202,15 L 210,40 L 218,30 L 300,30 L 308,30 L 316,10 L 324,50 L 332,16 L 340,38 L 348,30 L 400,30"
                  stroke="url(#ecgGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#ecgGlow)"
                  className="animate-ecg-pulse"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold mt-1">
              <span>Low Volatility</span>
              <span className="text-emerald-500 font-bold">Stable Trend</span>
            </div>
          </div>
        </div>

        {/* 4 Financial Vitals Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5 sm:gap-3 my-4">
          <div className="p-3 rounded-xl bg-card border border-border shadow-xs">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              Savings Vital
            </p>
            <p className="text-base sm:text-lg font-black text-foreground mt-0.5">
              34% <span className="text-[11px] font-bold text-emerald-500">Strong</span>
            </p>
            <p className="text-[10px] text-muted-foreground truncate">₹24,500 banked this month</p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border shadow-xs">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              Budget Rhythm
            </p>
            <p className="text-base sm:text-lg font-black text-foreground mt-0.5">
              18% <span className="text-[11px] font-bold text-cyan-500">Buffer</span>
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Under monthly limit</p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border shadow-xs">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              Debt Burden
            </p>
            <p className="text-base sm:text-lg font-black text-foreground mt-0.5">
              Low <span className="text-[11px] font-bold text-emerald-500">Managed</span>
            </p>
            <p className="text-[10px] text-muted-foreground truncate">EMI ratio below 15%</p>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border shadow-xs">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
              Expense Stability
            </p>
            <p className="text-base sm:text-lg font-black text-foreground mt-0.5">
              Steady <span className="text-[11px] font-bold text-emerald-500">Optimal</span>
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Predictable burn rate</p>
          </div>
        </div>

        {/* Doctor's Prescription Banner */}
        <div className="relative z-10 p-3 sm:p-3.5 rounded-2xl bg-primary/10 border border-primary/25 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shrink-0 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-foreground">
              Finance Doctor Recommendation
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
              Allocating an additional <strong className="text-foreground">₹2,000/mo</strong> toward your Emergency Goal will raise your Health Score to <strong className="text-primary">94/100</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
