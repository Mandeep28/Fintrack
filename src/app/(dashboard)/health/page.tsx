"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Sparkles,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  CheckCircle2,
  Target,
  Bot,
  Zap,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

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
  cached?: boolean;
  calculatedAt?: string;
  provider?: string;
}

export default function FinancialHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const url = forceRefresh ? "/api/insights/health?refresh=true" : "/api/insights/health";
      const res = await axios.get(url);

      if (res.data?.success) {
        setData(res.data);
        if (forceRefresh) {
          toast.success("Financial health score updated with latest data!");
        }
      }
    } catch (err: any) {
      console.error("Failed to load financial health:", err);
      toast.error(err.response?.data?.message || "Failed to calculate health score");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthData(false);
  }, [fetchHealthData]);

  const tierColors = {
    Excellent: {
      text: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      ring: "#10B981",
      description: "Exceptional fiscal discipline and strong savings velocity.",
    },
    Good: {
      text: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      ring: "#06B6D4",
      description: "Healthy habits with minor discretionary optimization opportunities.",
    },
    "Needs Attention": {
      text: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      ring: "#F59E0B",
      description: "Spending surges or budget limit overruns detected.",
    },
    "High Risk": {
      text: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      ring: "#F43F5E",
      description: "Multiple budgets exceeded with negative monthly savings velocity.",
    },
  }[data?.tier || "Good"] || {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    ring: "#06B6D4",
    description: "Healthy habits with minor discretionary optimization opportunities.",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Financial Health" },
        ]}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span>Financial Health & Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Algorithmic score and AI recommendations across your budget discipline, savings velocity, and stability.
          </p>
        </div>

        {/* Action Button: Recalculate with Latest Data */}
        <div className="flex items-center gap-3">
          {data?.calculatedAt && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 border border-border px-3 py-2 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Calculated {formatDate(data.calculatedAt)}</span>
            </div>
          )}

          <button
            onClick={() => fetchHealthData(true)}
            disabled={refreshing || loading}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all text-xs sm:text-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            <span>{refreshing ? "Re-evaluating..." : "Fetch Latest Score"}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-secondary/40 rounded-3xl border border-border" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-36 bg-secondary/40 rounded-2xl border border-border" />
            <div className="h-36 bg-secondary/40 rounded-2xl border border-border" />
            <div className="h-36 bg-secondary/40 rounded-2xl border border-border" />
          </div>
        </div>
      )}

      {/* Active Content */}
      {data && (
        <div className="space-y-6">
          {/* Main Hero Card: Score + AI Summary */}
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm relative overflow-hidden space-y-6">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
              {/* Left: Radial Score Gauge & Tier */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-4 shrink-0">
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-secondary/60 border-2 border-border/80 flex flex-col items-center justify-center shadow-inner">
                    <span className={cn("text-4xl sm:text-5xl font-black tracking-tight", tierColors.text)}>
                      {data.score}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground -mt-1">
                      out of 100
                    </span>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                        tierColors.bg,
                        tierColors.text,
                        tierColors.border
                      )}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {data.tier}
                    </span>
                    <h3 className="text-base font-bold text-foreground">Health Rating</h3>
                    <p className="text-xs text-muted-foreground max-w-[220px]">
                      {tierColors.description}
                    </p>
                  </div>
                </div>

                {data.calculatedAt && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span>Stored calculation from {formatDate(data.calculatedAt)}</span>
                  </p>
                )}
              </div>

              {/* Right: AI Executive Summary */}
              <div className="flex-1 w-full space-y-3 p-5 rounded-2xl bg-secondary/30 border border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Executive Financial Diagnosis
                    </h4>
                  </div>
                  {data.isAI ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/25">
                      <Bot className="w-3 h-3" />
                      AI Analysis
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground border border-border">
                      <Zap className="w-3 h-3" />
                      Rule Engine
                    </span>
                  )}
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed">
                  {data.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Three Pillar Breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Score Pillars Breakdown
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pillar 1: Budget Discipline */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Budget Discipline
                  </span>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    {data.pillars.budgetDiscipline} / 40 pts
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (data.pillars.budgetDiscipline / 40) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Adherence to monthly category spending thresholds and spending cap discipline.
                </p>
              </div>

              {/* Pillar 2: Savings Velocity */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Savings Velocity
                  </span>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    {data.pillars.savingsVelocity} / 30 pts
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (data.pillars.savingsVelocity / 30) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Momentum toward achieving your active savings goals and loan debt repayments.
                </p>
              </div>

              {/* Pillar 3: Spending Stability */}
              <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Spending Stability
                  </span>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {data.pillars.spendingStability} / 30 pts
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (data.pillars.spendingStability / 30) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Month-over-month expense variance and control over unexpected outflow surges.
                </p>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Actionable Recommendations
              </h3>
            </div>

            <div className="space-y-3">
              {data.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-secondary/30 border border-border/70 flex items-start gap-3 text-xs sm:text-sm text-foreground/90 leading-relaxed"
                >
                  <div className="w-6 h-6 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    {idx === 0 ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : idx === 1 ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="flex-1">{insight}</span>
                </div>
              ))}
            </div>

            {/* Quick Navigation Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-border/50 text-xs font-semibold">
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-primary hover:underline cursor-pointer"
              >
                <span>Adjust Budget Caps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-border">•</span>
              <Link
                href="/goals"
                className="inline-flex items-center gap-1.5 text-primary hover:underline cursor-pointer"
              >
                <span>View Savings Goals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !data && (
        <div className="text-center py-16 px-4 bg-card border border-dashed border-border rounded-3xl space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-foreground">No Health Score Calculated Yet</h3>
            <p className="text-xs text-muted-foreground">
              Click the button below to analyze your current month's expenses, budgets, and savings velocity.
            </p>
          </div>
          <button
            onClick={() => fetchHealthData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-2xl shadow-md shadow-primary/20 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Calculate Health Score</span>
          </button>
        </div>
      )}
    </div>
  );
}