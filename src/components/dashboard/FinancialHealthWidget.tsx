"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Sparkles,
  RefreshCw,
  TrendingDown,
  CheckCircle2,
  ShieldCheck,
  Target,
  Bot,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthData {
  score: number;
  tier: "Excellent" | "Good" | "Needs Attention" | "High Risk";
  pillars: {
    budgetDiscipline: number;
    savingsVelocity: number;
    spendingStability: number;
  };
  summary: string;
  insights: string[];
  isAI: boolean;
  currentMonthTotal: number;
  previousMonthTotal: number;
}

export default function FinancialHealthWidget() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await axios.get("/api/insights/health");
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load financial health insights:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading && !data) {
    return (
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-secondary rounded-lg" />
          <div className="h-4 w-20 bg-secondary rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="h-28 bg-secondary/60 rounded-2xl" />
          <div className="h-28 bg-secondary/60 rounded-2xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { score, tier, pillars, summary, insights, isAI } = data;

  const tierColors = {
    Excellent: {
      text: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      ring: "#10B981",
    },
    Good: {
      text: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      ring: "#06B6D4",
    },
    "Needs Attention": {
      text: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      ring: "#F59E0B",
    },
    "High Risk": {
      text: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      ring: "#F43F5E",
    },
  }[tier] || {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    ring: "#06B6D4",
  };

  return (
    <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-sm space-y-5 transition-all hover:border-border/90">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-foreground tracking-tight">
                Financial Health & Intelligence
              </h2>
              {isAI ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/25">
                  <Bot className="w-3 h-3" />
                  AI Summary
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground border border-border">
                  <Zap className="w-3 h-3" />
                  Algorithmic
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live algorithmic diagnosis evaluated against your monthly budget caps and savings velocity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary/80 hover:bg-secondary text-foreground border border-border transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
          title="Refresh Financial Health Insights"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin text-primary")} />
          <span>{refreshing ? "Evaluating..." : "Refresh"}</span>
        </button>
      </div>

      {/* Main Grid: Score Gauge vs 3 Pillars & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Radial Score Gauge & Summary (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3.5 sm:border-r border-border/60 sm:pr-6">
          <div className="flex items-center gap-4">
            {/* Score circle badge */}
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-secondary/50 border-2 border-border/80 flex flex-col items-center justify-center shadow-xs shrink-0">
              <span className={cn("text-2xl sm:text-3xl font-black tracking-tight", tierColors.text)}>
                {score}
              </span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground -mt-1">
                / 100
              </span>
            </div>

            <div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                  tierColors.bg,
                  tierColors.text,
                  tierColors.border
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {tier}
              </span>
              <p className="text-xs font-bold text-foreground mt-1">Overall Health Score</p>
              <p className="text-[11px] text-muted-foreground">Updated in real-time</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {summary}
          </p>
        </div>

        {/* Right Column: 3 Pillars & Actionable Insights (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 3 Pillars Progress Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-secondary/40 border border-border/60">
            {/* Pillar 1: Budget Discipline (max 40) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-muted-foreground">Budget Discipline</span>
                <span className="font-mono font-bold text-foreground">
                  {pillars.budgetDiscipline}/40
                </span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (pillars.budgetDiscipline / 40) * 100)}%` }}
                />
              </div>
            </div>

            {/* Pillar 2: Savings Velocity (max 30) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-muted-foreground">Savings Velocity</span>
                <span className="font-mono font-bold text-foreground">
                  {pillars.savingsVelocity}/30
                </span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (pillars.savingsVelocity / 30) * 100)}%` }}
                />
              </div>
            </div>

            {/* Pillar 3: Spending Stability (max 30) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-muted-foreground">Spending Stability</span>
                <span className="font-mono font-bold text-foreground">
                  {pillars.spendingStability}/30
                </span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (pillars.spendingStability / 30) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actionable Bullet Insights */}
          <div className="space-y-2 pt-1">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed"
              >
                <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  {idx === 0 ? (
                    <TrendingDown className="w-2.5 h-2.5" />
                  ) : idx === 1 ? (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  ) : (
                    <Target className="w-2.5 h-2.5" />
                  )}
                </div>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
