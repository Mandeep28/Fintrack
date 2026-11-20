"use client";

import React from "react";
import { ShieldCheck, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuperheroDoctorHeroProps {
  className?: string;
}

export default function SuperheroDoctorHero({ className }: SuperheroDoctorHeroProps) {
  return (
    <div className={cn("relative w-full max-w-lg lg:max-w-xl mx-auto select-none flex items-center justify-center min-h-[400px] sm:min-h-[460px] lg:min-h-[500px]", className)}>
      {/* 1. Ambient Background Glow Aura & Wind Currents */}
      <div 
        aria-hidden="true" 
        className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-500/20 via-teal-500/15 to-emerald-500/20 blur-3xl opacity-70 pointer-events-none" 
      />

      {/* Futuristic Radial Energy Ring */}
      <div 
        aria-hidden="true" 
        className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-cyan-500/20 dark:border-cyan-400/15 pointer-events-none animate-pulse-glow" 
      />
      <div 
        aria-hidden="true" 
        className="absolute w-80 sm:w-[440px] h-80 sm:h-[440px] rounded-full border border-dashed border-teal-500/15 pointer-events-none" 
      />

      {/* Subtle Wind Wave Lines streaming behind the cape */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-50 overflow-visible"
        viewBox="0 0 500 500"
        fill="none"
      >
        <path
          d="M 50,220 C 120,200 220,230 350,180 C 420,150 480,180 520,160"
          stroke="url(#windGrad1)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="8 6"
        />
        <path
          d="M 30,320 C 140,300 240,340 380,280 C 440,260 500,290 540,270"
          stroke="url(#windGrad2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="12 8"
        />
        <defs>
          <linearGradient id="windGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="windGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 2. MAIN SUPERHERO FINANCE DOCTOR CHARACTER (With Wave-Animated Gown & Floating Levitation) */}
      <div className="relative z-10 w-full flex items-center justify-center animate-hero-float">
        <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg transition-transform duration-500 hover:scale-[1.02]">
          {/* Billowing Gown Wave-Animated Wrapper */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/superhero-finance-doctor.png"
            alt="FinTrack Superhero Finance Doctor in Dynamic Side Profile Stance"
            className="w-full h-auto object-contain animate-gown-wave pointer-events-none drop-shadow-2xl"
          />
        </div>
      </div>

      {/* 3. FLOATING DIAGNOSTIC TELEMETRY BADGES */}
      {/* Floating Badge 1: Top Left - 88/100 Health Score Ring */}
      <div className="absolute top-4 sm:top-8 -left-2 sm:left-2 z-20 p-2.5 sm:p-3.5 rounded-2xl bg-card/90 dark:bg-card/75 backdrop-blur-xl border border-cyan-500/30 dark:border-cyan-400/25 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-left duration-700">
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              className="text-secondary dark:text-secondary/60"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="100.5"
              strokeDashoffset="12"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-black text-foreground">88</span>
          </div>
        </div>
        <div className="min-w-0 pr-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Health Check
          </p>
          <p className="text-xs sm:text-sm font-black text-foreground flex items-center gap-1.5 whitespace-nowrap">
            <span>Optimal</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              GRADE A
            </span>
          </p>
        </div>
      </div>

      {/* Floating Badge 2: Bottom Right - Money Rhythm ECG */}
      <div className="absolute bottom-4 sm:bottom-8 -right-2 sm:right-2 z-20 p-3 sm:p-3.5 rounded-2xl bg-card/90 dark:bg-card/75 backdrop-blur-xl border border-emerald-500/30 dark:border-emerald-400/25 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-right duration-700 delay-200">
        <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
          <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Money Rhythm
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          {/* Animated Mini ECG Line */}
          <div className="w-28 sm:w-32 h-6 my-0.5 relative overflow-hidden flex items-center">
            <svg viewBox="0 0 160 30" fill="none" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 0,15 L 30,15 L 40,15 L 48,3 L 56,27 L 64,8 L 72,20 L 80,15 L 120,15 L 128,15 L 136,5 L 144,25 L 152,10 L 160,15"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-ecg-pulse"
              />
            </svg>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 whitespace-nowrap">
            72 BPM • Low Volatility
          </p>
        </div>
      </div>

      {/* Floating Badge 3: Top Right - Dr. FinTrack Money Guardian Pill */}
      <div className="absolute top-2 sm:top-4 right-0 sm:right-4 z-20 px-3 py-1.5 rounded-full bg-secondary/90 dark:bg-card/90 backdrop-blur-md border border-cyan-500/30 shadow-md flex items-center gap-1.5 animate-in fade-in duration-700 delay-300">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] sm:text-[11px] font-extrabold text-foreground tracking-tight whitespace-nowrap">
          Dr. FinTrack • Money Guardian
        </span>
      </div>
    </div>
  );
}
