import React from "react";
import { cn } from "@/lib/utils";

interface FinTrackLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showMotto?: boolean;
}

const sizeConfig = {
  sm: {
    iconSize: 26,
    height: 26,
    textSize: "text-lg",
    mottoSize: "text-[8px]",
    dotSize: "w-1 h-1",
  },
  md: {
    iconSize: 34,
    height: 34,
    textSize: "text-xl",
    mottoSize: "text-[9px]",
    dotSize: "w-1.5 h-1.5",
  },
  lg: {
    iconSize: 44,
    height: 44,
    textSize: "text-2xl",
    mottoSize: "text-[10px]",
    dotSize: "w-2 h-2",
  },
  xl: {
    iconSize: 56,
    height: 56,
    textSize: "text-3xl",
    mottoSize: "text-xs",
    dotSize: "w-2.5 h-2.5",
  },
};

export default function FinTrackLogo({
  variant = "full",
  size = "md",
  className,
  showMotto = false,
}: FinTrackLogoProps) {
  const currentSize = sizeConfig[size] || sizeConfig.md;

  // Standalone Vector Emblem
  const Emblem = (
    <svg
      viewBox="0 0 100 100"
      width={currentSize.iconSize}
      height={currentSize.iconSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="shieldGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="50%" stopColor="#0F1D38" />
          <stop offset="100%" stopColor="#082F49" />
        </linearGradient>
        <linearGradient id="shieldStrokeGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="arrowGradComp" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="40%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="barGrad1Comp" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="barGrad2Comp" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id="barGrad3Comp" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <filter id="glowComp" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06B6D4" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Aerodynamic Shield Contour */}
      <path
        d="M 18,22 C 18,17 26,14 48,11 C 70,14 78,17 78,22 C 78,54 66,74 48,86 C 30,74 18,54 18,22 Z"
        fill="url(#shieldGradComp)"
        stroke="url(#shieldStrokeGradComp)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Shield Beveled Inner Contour */}
      <path
        d="M 22,25 C 22,21 29,18 48,15.5 C 67,18 74,21 74,25 C 74,51 63,69 48,79.5 C 33,69 22,51 22,25 Z"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="0.8"
        strokeOpacity="0.35"
      />

      {/* Health-Plus Cross Background (Pure White Rounded Cross) */}
      <path
        d="M 41,22 C 41,20.5 42.5,19 44,19 L 52,19 C 53.5,19 55,20.5 55,22 L 55,29.5 L 62.5,29.5 C 64,29.5 65.5,31 65.5,32.5 L 65.5,40.5 C 65.5,42 64,43.5 62.5,43.5 L 55,43.5 L 55,51 C 55,52.5 53.5,54 52,54 L 44,54 C 42.5,54 41,52.5 41,51 L 41,43.5 L 33.5,43.5 C 32,43.5 30.5,42 30.5,40.5 L 30.5,32.5 C 30.5,31 32,29.5 33.5,29.5 L 41,29.5 Z"
        fill="#FFFFFF"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
      />

      {/* Indian Rupee Vector Symbol ('₹') Centered Inside Health Cross */}
      <g stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="43" y1="30" x2="53" y2="30" />
        <line x1="43" y1="33.5" x2="50.5" y2="33.5" />
        <path d="M 46.2,30 L 46.2,36.5 C 49.5,36.5 51.5,35.5 51.5,33.5 C 51.5,31.5 49.5,30.5 46.2,30.5" />
        <path d="M 46.2,36.5 L 52.5,43.5" />
      </g>

      {/* Growth Bar Chart Inside Shield Base */}
      <rect x="33" y="64" width="6" height="12" rx="2" fill="url(#barGrad1Comp)" />
      <rect x="43" y="57" width="6" height="19" rx="2" fill="url(#barGrad2Comp)" />
      <rect x="53" y="49" width="6" height="27" rx="2" fill="url(#barGrad3Comp)" />

      {/* Sweeping Ascending Velocity Arc */}
      <path
        d="M 15,67 C 23,78 40,76 58,61 C 69,51 78,36 84,21"
        fill="none"
        stroke="url(#arrowGradComp)"
        strokeWidth="4.5"
        strokeLinecap="round"
        filter="url(#glowComp)"
      />

      {/* Arrow Head */}
      <polygon points="88,14 74,19 82,27" fill="#10B981" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center justify-center shrink-0", className)}>
        {Emblem}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {Emblem}
      <div className="flex flex-col leading-none">
        <div className={cn("font-black tracking-tight flex items-baseline", currentSize.textSize)}>
          {/* 'Fin' with Cyan Dot on 'i' */}
          <span className="text-foreground tracking-tight flex items-baseline">
            <span>F</span>
            <span className="relative inline-block">
              {/* Dotless 'ı' with radiant cyan dot indicator */}
              <span>ı</span>
              <span
                aria-hidden="true"
                className="absolute -top-[0.25em] left-1/2 -translate-x-1/2 w-[0.24em] h-[0.24em] rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />
            </span>
            <span>n</span>
          </span>
          {/* 'Track' in brand cyan / teal gradient */}
          <span className="bg-gradient-to-r from-cyan-600 to-teal-500 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent ml-0.5 font-black">
            Track
          </span>
        </div>
        {showMotto && (
          <span
            className={cn(
              "font-semibold uppercase tracking-wider text-muted-foreground mt-1",
              currentSize.mottoSize
            )}
          >
            Health &amp; Finance
          </span>
        )}
      </div>
    </div>
  );
}
