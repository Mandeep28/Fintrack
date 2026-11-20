"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SuperheroDoctorSVGProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function SuperheroDoctorSVG({
  className,
  width = "100%",
  height = "100%",
}: SuperheroDoctorSVGProps) {
  return (
    <div className={cn("relative inline-block select-none", className)}>
      <svg
        viewBox="0 0 380 440"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl animate-hero-float"
        aria-label="FinTrack Superhero Finance Doctor Mascot"
        role="img"
      >
        <defs>
          {/* Cape Gradient */}
          <linearGradient id="capeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891B2" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Suit Base Gradient */}
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Doctor Coat White Gradient */}
          <linearGradient id="coatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Tablet Hologram Gradient */}
          <linearGradient id="tabletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#0F172A" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.35" />
          </linearGradient>

          {/* Shield Glow Filter */}
          <filter id="heroShieldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Ambient Stethoscope Glow */}
          <radialGradient id="sensorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
            <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. BILLOWING SUPERHERO CAPE (Attached at shoulders, fluttering to left & bottom) */}
        <g className="animate-cape-flutter">
          {/* Main Cape Body */}
          <path
            d="M 130,140 C 100,160 55,230 45,310 C 40,350 70,365 105,340 C 130,320 150,280 155,240 Z"
            fill="url(#capeGrad)"
            opacity="0.95"
          />
          {/* Secondary Wing Wave (Behind Right Arm) */}
          <path
            d="M 235,145 C 265,160 300,210 305,270 C 310,310 285,325 260,300 C 240,280 235,240 230,200 Z"
            fill="url(#capeGrad)"
            opacity="0.65"
          />
          {/* Cape Interior Shadow Fold */}
          <path
            d="M 128,142 C 105,170 70,240 62,310 C 78,318 105,305 125,275 Z"
            fill="#0369A1"
            opacity="0.5"
          />
        </g>

        {/* 2. LEGS & HIGH-TECH HERO BOOTS */}
        <g id="hero-legs">
          {/* Left Leg (Viewer's Left) */}
          <path d="M 152,300 L 146,380 L 168,380 L 174,300 Z" fill="url(#suitGrad)" />
          {/* Right Leg (Viewer's Right) */}
          <path d="M 206,300 L 212,380 L 234,380 L 228,300 Z" fill="url(#suitGrad)" />

          {/* Left Boot */}
          <path
            d="M 142,370 C 142,365 146,360 152,360 L 170,360 C 176,360 178,365 178,370 L 178,395 C 178,400 174,405 168,405 L 138,405 C 132,405 130,398 134,392 Z"
            fill="#0F172A"
            stroke="#06B6D4"
            strokeWidth="1.5"
          />
          {/* Left Boot Sole Cyan Light Stripe */}
          <path d="M 134,402 L 176,402" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Right Boot */}
          <path
            d="M 202,370 C 202,365 204,360 210,360 L 228,360 C 234,360 238,365 238,370 L 246,392 C 250,398 248,405 242,405 L 212,405 C 206,405 202,400 202,395 Z"
            fill="#0F172A"
            stroke="#06B6D4"
            strokeWidth="1.5"
          />
          {/* Right Boot Sole Cyan Light Stripe */}
          <path d="M 204,402 L 246,402" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Knee Armor Guards with Cyan Core */}
          <rect x="146" y="325" width="26" height="16" rx="4" fill="#1E293B" stroke="#06B6D4" strokeWidth="1" />
          <circle cx="159" cy="333" r="3" fill="#38BDF8" />

          <rect x="208" y="325" width="26" height="16" rx="4" fill="#1E293B" stroke="#06B6D4" strokeWidth="1" />
          <circle cx="221" cy="333" r="3" fill="#38BDF8" />
        </g>

        {/* 3. HERO TORSO & DOCTOR'S COAT */}
        <g id="hero-torso">
          {/* Dark Hero Suit Under-layer */}
          <path
            d="M 138,145 L 242,145 L 232,305 L 148,305 Z"
            fill="url(#suitGrad)"
            stroke="#334155"
            strokeWidth="1.2"
          />

          {/* White Doctor Coat Cut (Open Hero Jacket Styling) */}
          {/* Left Lapel (Viewer's Left) */}
          <path
            d="M 134,142 C 130,170 125,230 132,305 L 165,305 C 160,250 160,200 170,165 Z"
            fill="url(#coatGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          {/* Right Lapel (Viewer's Right) */}
          <path
            d="M 246,142 C 250,170 255,230 248,305 L 215,305 C 220,250 220,200 210,165 Z"
            fill="url(#coatGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />

          {/* Futuristic Belt with Luminous Buckle */}
          <rect x="144" y="295" width="92" height="14" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="1" />
          <circle cx="190" cy="302" r="8" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />
          <circle cx="190" cy="302" r="4" fill="#38BDF8" className="animate-pulse" />
        </g>

        {/* 4. FINTRACK CHEST SHIELD EMBLEM (Indian Rupee '₹' inside Health Cross) */}
        <g id="chest-shield" transform="translate(190, 205) scale(0.65)">
          {/* Pulsing Energy Aura behind Shield */}
          <circle
            cx="0"
            cy="0"
            r="42"
            fill="#06B6D4"
            opacity="0.25"
            filter="url(#heroShieldGlow)"
            className="animate-pulse-glow"
          />

          {/* Aerodynamic Shield Contour */}
          <path
            d="M -30,-30 C -30,-40 -15,-48 0,-54 C 15,-48 30,-40 30,-30 C 30,12 15,38 0,48 C -15,38 -30,12 -30,-30 Z"
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth="3"
          />

          {/* Health-Plus Cross Background (Pure White) */}
          <path
            d="M -9,-34 C -9,-37 -7,-39 -4,-39 L 4,-39 C 7,-39 9,-37 9,-34 L 9,-25 L 18,-25 C 21,-25 23,-23 23,-20 L 23,-12 C 23,-9 21,-7 18,-7 L 9,-7 L 9,4 C 9,7 7,9 4,9 L -4,9 C -7,9 -9,7 -9,4 L -9,-7 L -18,-7 C -21,-7 -23,-9 -23,-12 L -23,-20 C -23,-23 -21,-25 -18,-25 L -9,-25 Z"
            fill="#FFFFFF"
          />

          {/* Rupee Symbol Vector ('₹') */}
          <g stroke="#0F172A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1="-5" y1="-23" x2="6" y2="-23" />
            <line x1="-5" y1="-18.5" x2="3.5" y2="-18.5" />
            <path d="M -1,-23 L -1,-15 C 2.5,-15 4.5,-16 4.5,-18.5 C 4.5,-21 2.5,-22 -1,-22" />
            <path d="M -1,-15 L 6,-6" />
          </g>

          {/* Green Ascending Arrow Curve across bottom */}
          <path
            d="M -26,18 C -14,28 8,26 26,4"
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <polygon points="30,0 18,3 24,11" fill="#10B981" />
        </g>

        {/* 5. HIGH-TECH HOLOGRAPHIC STETHOSCOPE */}
        <g id="stethoscope">
          {/* Tubing around Neck & down to chest */}
          <path
            d="M 162,125 C 145,135 142,165 152,195 C 160,220 172,238 185,250"
            fill="none"
            stroke="#0284C7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 218,125 C 235,135 238,165 228,195 C 220,220 208,238 195,250"
            fill="none"
            stroke="#0284C7"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Sensor Chest Piece (Rests on chest with cyan glow) */}
          <circle cx="190" cy="255" r="9" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
          <circle cx="190" cy="255" r="5" fill="#38BDF8" className="animate-pulse" />
        </g>

        {/* 6. RIGHT ARM (Viewer's Left): Confident Superhero Stance on Hip */}
        <g id="right-arm">
          {/* Upper Arm & Forearm in Doctor White Sleeve */}
          <path
            d="M 134,146 C 110,165 95,200 92,235 C 90,250 102,258 116,252 C 128,245 138,225 144,200"
            fill="url(#coatGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          {/* Tech Hero Glove on Hip */}
          <path
            d="M 116,248 C 114,242 120,235 128,235 L 138,240 C 144,245 145,252 142,258 L 132,268 C 126,272 118,270 114,262 Z"
            fill="#0F172A"
            stroke="#06B6D4"
            strokeWidth="1.5"
          />
        </g>

        {/* 7. LEFT ARM & DIGITAL FINANCIAL DIAGNOSIS TABLET */}
        <g id="left-arm-and-tablet">
          {/* Left Upper Arm & Forearm angled forward */}
          <path
            d="M 246,146 C 265,165 285,195 292,230 L 272,250 C 260,225 245,195 235,170"
            fill="url(#coatGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />

          {/* Left Hero Glove holding tablet */}
          <path
            d="M 285,230 C 290,225 298,228 302,235 L 308,245 C 312,252 308,260 300,260 L 290,255 Z"
            fill="#0F172A"
            stroke="#06B6D4"
            strokeWidth="1.5"
          />

          {/* Floating Futuristic Digital Tablet */}
          <g transform="translate(280, 180) rotate(-6)">
            {/* Tablet Chassis */}
            <rect
              x="0"
              y="0"
              width="85"
              height="115"
              rx="12"
              fill="url(#tabletGrad)"
              stroke="#38BDF8"
              strokeWidth="2"
              className="drop-shadow-lg"
            />
            {/* Inner Screen Bezel */}
            <rect x="5" y="5" width="75" height="105" rx="8" fill="#0B132B" opacity="0.9" />

            {/* Screen Header */}
            <text x="10" y="18" fill="#38BDF8" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
              FINTRACK RX
            </text>
            <circle cx="70" cy="15" r="3" fill="#10B981" />

            {/* Green Upward Financial Trend Wave */}
            <path
              d="M 12,58 L 26,52 L 40,56 L 54,38 L 68,42 L 74,30"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Trend Fill Area */}
            <path
              d="M 12,58 L 26,52 L 40,56 L 54,38 L 68,42 L 74,30 L 74,70 L 12,70 Z"
              fill="#10B981"
              opacity="0.15"
            />

            {/* Health Score Pill */}
            <rect x="10" y="76" width="38" height="14" rx="4" fill="#06B6D4" opacity="0.25" />
            <text x="14" y="86" fill="#38BDF8" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
              SCORE: 88
            </text>

            {/* Status Pill */}
            <rect x="52" y="76" width="23" height="14" rx="4" fill="#10B981" opacity="0.25" />
            <text x="56" y="86" fill="#10B981" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
              VITAL
            </text>

            {/* Checkmark Line */}
            <text x="10" y="102" fill="#94A3B8" fontSize="6" fontFamily="sans-serif">
              ✓ 0% Budget Deficit
            </text>
          </g>
        </g>

        {/* 8. HERO HEAD, FACE & EXPRESSION */}
        <g id="hero-head">
          {/* Neck */}
          <path d="M 175,110 L 205,110 L 202,135 L 178,135 Z" fill="#FDBA74" />

          {/* Chin & Jaw (Friendly Heroic Cartoon Cut) */}
          <path
            d="M 166,75 C 166,110 178,122 190,122 C 202,122 214,110 214,75 C 214,50 166,50 166,75 Z"
            fill="#FDBA74"
          />

          {/* High-Tech Cyan Visor / Diagnostic Comm on Left Ear */}
          <rect x="210" y="74" width="7" height="12" rx="2" fill="#0F172A" stroke="#06B6D4" strokeWidth="1" />
          <circle cx="213" cy="80" r="2" fill="#38BDF8" />

          {/* Confident, Friendly Eyes */}
          {/* Left Eye (Viewer's Left) */}
          <ellipse cx="178" cy="78" rx="4" ry="4.5" fill="#0F172A" />
          <circle cx="177" cy="76.5" r="1.5" fill="#FFFFFF" />
          {/* Left Eyebrow (Heroic Lift) */}
          <path d="M 172,70 C 176,67 182,68 185,71" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

          {/* Right Eye (Viewer's Right) */}
          <ellipse cx="202" cy="78" rx="4" ry="4.5" fill="#0F172A" />
          <circle cx="201" cy="76.5" r="1.5" fill="#FFFFFF" />
          {/* Right Eyebrow */}
          <path d="M 195,71 C 198,68 204,67 208,70" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 190,78 L 192,86 L 188,86" stroke="#EA580C" strokeWidth="1.2" strokeLinecap="round" />

          {/* Friendly Heroic Smile */}
          <path
            d="M 182,93 C 186,100 194,100 198,93"
            fill="none"
            stroke="#0F172A"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Subtle Smile Cheek Highlight */}
          <circle cx="174" cy="91" r="3" fill="#FB923C" opacity="0.4" />
          <circle cx="206" cy="91" r="3" fill="#FB923C" opacity="0.4" />

          {/* Stylish Modern Dark Hair with Blue Sheen */}
          <path
            d="M 164,70 C 160,50 170,35 190,32 C 210,30 220,44 218,65 C 224,56 220,40 205,35 C 195,30 178,32 168,44 C 162,52 162,64 164,70 Z"
            fill="#0F172A"
          />
          <path
            d="M 172,42 C 182,36 198,36 210,45 C 202,38 188,38 178,44 Z"
            fill="#38BDF8"
            opacity="0.6"
          />
        </g>

        {/* 9. FLOATING FINANCIAL VITAL SPARKLES */}
        <g id="sparkles">
          {/* Sparkle 1 */}
          <g transform="translate(65, 120) scale(0.8)">
            <path d="M 10,0 L 13,7 L 20,10 L 13,13 L 10,20 L 7,13 L 0,10 L 7,7 Z" fill="#38BDF8" />
          </g>
          {/* Sparkle 2 */}
          <g transform="translate(320, 110) scale(0.9)">
            <path d="M 10,0 L 13,7 L 20,10 L 13,13 L 10,20 L 7,13 L 0,10 L 7,7 Z" fill="#10B981" />
          </g>
          {/* Sparkle 3 */}
          <g transform="translate(70, 260) scale(0.6)">
            <path d="M 10,0 L 13,7 L 20,10 L 13,13 L 10,20 L 7,13 L 0,10 L 7,7 Z" fill="#06B6D4" />
          </g>
        </g>
      </svg>
    </div>
  );
}
