"use client";

import { Sparkles, HeartPulse, CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";

export default function MinimalHeroPreview() {
  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Ambient background glow behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-emerald-500/20 rounded-[2.5rem] blur-2xl opacity-60 pointer-events-none -z-10" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative rounded-[2rem] border border-border/80 bg-card/80 backdrop-blur-xl shadow-2xl p-6 sm:p-7 space-y-6 overflow-hidden">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Top Control Bar */}
        <div className="relative flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-2 text-[11px] font-mono text-muted-foreground/80 font-medium">fintrack.app/diagnostic</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Diagnostic
          </div>
        </div>

        {/* Financial Vitals Hero Block */}
        <div className="relative grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-secondary/30 rounded-2xl p-4 sm:p-5 border border-border/50">
          {/* Radial / Circle Score */}
          <div className="sm:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-primary" />
              Health Score
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">88</span>
              <span className="text-sm font-semibold text-muted-foreground">/100</span>
            </div>
            <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              Optimal Health
            </span>
          </div>

          {/* ECG Rhythm Wave */}
          <div className="sm:col-span-7 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-medium text-[11px]">Money Rhythm (ECG)</span>
              <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Stable Trend
              </span>
            </div>
            {/* SVG ECG Waveform */}
            <div className="w-full h-11 flex items-center overflow-hidden">
              <svg className="w-full h-9 stroke-primary overflow-visible" viewBox="0 0 240 40" fill="none">
                <path
                  d="M 0 20 L 40 20 L 50 18 L 60 22 L 75 20 L 85 4 L 95 36 L 105 14 L 115 24 L 125 20 L 170 20 L 180 8 L 190 32 L 200 20 L 240 20"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Feature Demonstration: One-Line Natural Language AI Dump */}
        <div className="relative space-y-2 bg-background/60 rounded-2xl p-4 border border-border/60">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1.5 text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Instant Natural Language Parsing
            </span>
            <span className="text-primary font-mono text-[10px]">0.02s</span>
          </div>

          {/* Simulated Input */}
          <div className="bg-secondary/50 rounded-xl px-3.5 py-2 font-mono text-xs text-muted-foreground border border-border/40 flex items-center justify-between">
            <span>&gt; today 250 swiggy dinner</span>
            <span className="text-[10px] text-primary/80 uppercase font-sans font-bold">Raw Input</span>
          </div>

          {/* Simulated Output Chip */}
          <div className="flex items-center justify-between bg-primary/10 border border-primary/25 rounded-xl px-3.5 py-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-bold text-foreground">Food & Dining</span>
              <span className="text-xs text-muted-foreground">• ₹250.00</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Categorized</span>
            </div>
          </div>
        </div>

        {/* Bottom Key Vitals Pill Grid */}
        <div className="relative grid grid-cols-2 gap-3 pt-1">
          <div className="bg-secondary/40 rounded-xl p-3 border border-border/40">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Savings Vital</p>
            <p className="text-base font-black text-foreground mt-0.5">34% <span className="text-xs font-semibold text-emerald-500 font-sans">Strong</span></p>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">₹24,500 banked this month</p>
          </div>

          <div className="bg-secondary/40 rounded-xl p-3 border border-border/40">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Privacy Rating</p>
            <p className="text-base font-black text-foreground mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-primary" /> 100%
            </p>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">Zero bank credential scraping</p>
          </div>
        </div>
      </div>
    </div>
  );
}
