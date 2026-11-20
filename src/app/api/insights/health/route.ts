import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFinancialInsights, FinancialAggregateData } from "@/lib/ai";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    // 1. If not forcing refresh, check for cached financial health record
    if (!forceRefresh) {
      const cached = await prisma.financialHealth.findUnique({
        where: { userId },
      });

      if (cached) {
        return NextResponse.json({
          success: true,
          cached: true,
          calculatedAt: cached.calculatedAt,
          score: cached.score,
          tier: cached.tier,
          pillars: cached.pillars,
          summary: cached.summary,
          insights: cached.insights,
          provider: "database",
        });
      }
    }

    // 2. Compute fresh financial health score and insights
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth();

    const currentMonthStart = new Date(currentYear, currentMonthNum, 1);
    const currentMonthEnd = new Date(currentYear, currentMonthNum + 1, 0, 23, 59, 59, 999);

    const prevMonthStart = new Date(currentYear, currentMonthNum - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonthNum, 0, 23, 59, 59, 999);

    const currentMonthString = `${currentYear}-${String(currentMonthNum + 1).padStart(2, "0")}`;

    // Parallel queries for all relevant financial data
    const [
      currentExpenses,
      prevExpenses,
      budgets,
      categories,
      activeGoals,
      monthlyContributions,
    ] = await Promise.all([
      // Current month expenses
      prisma.expense.findMany({
        where: {
          userId,
          date: { gte: currentMonthStart, lte: currentMonthEnd },
        },
        select: { amount: true, category: true, date: true },
      }),
      // Previous month expenses
      prisma.expense.findMany({
        where: {
          userId,
          date: { gte: prevMonthStart, lte: prevMonthEnd },
        },
        select: { amount: true, category: true },
      }),
      // Budgets set for current month
      prisma.budget.findMany({
        where: { userId, month: currentMonthString },
        select: { category: true, amount: true },
      }),
      // User custom categories
      prisma.category.findMany({
        where: { userId },
        select: { name: true },
      }),
      // Active savings goals
      prisma.goal.findMany({
        where: { userId, status: "ACTIVE" },
        select: { id: true, title: true, targetAmount: true, currentAmount: true },
      }),
      // Contributions made this month
      prisma.goalContribution.findMany({
        where: {
          goal: { userId },
          date: { gte: currentMonthStart, lte: currentMonthEnd },
        },
        select: { amount: true },
      }),
    ]);

    // Calculate totals
    const currentMonthTotal = currentExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const previousMonthTotal = prevExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const goalsFundedThisMonth = monthlyContributions.reduce((sum, c) => sum + Number(c.amount), 0);

    // Map spending by category for current month
    const categorySpentMap: Record<string, number> = {};
    for (const exp of currentExpenses) {
      categorySpentMap[exp.category] = (categorySpentMap[exp.category] || 0) + Number(exp.amount);
    }

    const budgetMap: Record<string, number> = {};
    for (const b of budgets) {
      budgetMap[b.category] = Number(b.amount);
    }

    // Determine category statuses
    const allCategoryNames = Array.from(
      new Set([
        ...Object.keys(categorySpentMap),
        ...Object.keys(budgetMap),
        ...categories.map((c) => c.name),
      ])
    );

    const topCategories = allCategoryNames
      .map((catName) => {
        const spent = categorySpentMap[catName] || 0;
        const budget = budgetMap[catName] !== undefined ? budgetMap[catName] : null;

        let status: "normal" | "warning" | "exceeded" | "no_budget" = "no_budget";
        if (budget !== null && budget > 0) {
          const ratio = spent / budget;
          if (ratio >= 1) {
            status = "exceeded";
          } else if (ratio >= 0.8) {
            status = "warning";
          } else {
            status = "normal";
          }
        }

        return {
          name: catName,
          spent,
          budget,
          status,
        };
      })
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 6);

    // 1. Pillar 1: Budget Discipline (max 40 pts)
    const budgetedCategories = topCategories.filter((c) => c.budget !== null);
    const exceededCount = budgetedCategories.filter((c) => c.status === "exceeded").length;
    let budgetDisciplineScore = 40;
    if (budgetedCategories.length > 0) {
      budgetDisciplineScore = Math.max(0, 40 - exceededCount * 12);
    } else {
      // Baseline when no custom budgets configured yet
      budgetDisciplineScore = 32;
    }

    // 2. Pillar 2: Savings Velocity (max 30 pts)
    let savingsVelocityScore = 15;
    if (goalsFundedThisMonth > 0) {
      savingsVelocityScore = 30;
    } else if (activeGoals.length > 0) {
      savingsVelocityScore = 20;
    } else if (currentMonthTotal < previousMonthTotal && previousMonthTotal > 0) {
      savingsVelocityScore = 25;
    }

    // 3. Pillar 3: Spending Stability (max 30 pts)
    let spendingStabilityScore = 28;
    if (previousMonthTotal > 0) {
      const variance = (currentMonthTotal - previousMonthTotal) / previousMonthTotal;
      if (variance <= 0) {
        spendingStabilityScore = 30; // Reduced spending
      } else if (variance <= 0.15) {
        spendingStabilityScore = 26; // Normal variance
      } else if (variance <= 0.35) {
        spendingStabilityScore = 18; // Moderate surge
      } else {
        spendingStabilityScore = 10; // High spike
      }
    }

    const baseScore = Math.min(100, Math.max(10, budgetDisciplineScore + savingsVelocityScore + spendingStabilityScore));

    const aggregatePayload: FinancialAggregateData = {
      currentMonthTotal,
      previousMonthTotal,
      topCategories,
      goalsFundedThisMonth,
      activeGoalsCount: activeGoals.length,
      budgetDisciplineScore,
      savingsVelocityScore,
      spendingStabilityScore,
      baseScore,
    };

    // Run AI or Algorithmic Insight Generation
    const result = await generateFinancialInsights(aggregatePayload);

    // Persist to database so historical score is preserved
    const saved = await prisma.financialHealth.upsert({
      where: { userId },
      create: {
        userId,
        score: result.score,
        tier: result.tier,
        pillars: result.pillars,
        summary: result.summary,
        insights: result.insights,
        calculatedAt: new Date(),
      },
      update: {
        score: result.score,
        tier: result.tier,
        pillars: result.pillars,
        summary: result.summary,
        insights: result.insights,
        calculatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      cached: false,
      calculatedAt: saved.calculatedAt,
      score: saved.score,
      tier: saved.tier,
      pillars: saved.pillars,
      summary: saved.summary,
      insights: saved.insights,
      isAI: result.isAI,
    });
  } catch (error) {
    console.error("GET /api/insights/health error:", error);
    return NextResponse.json({ message: "Failed to generate health insights" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Shortcut to force recomputation via POST
  const fakeUrl = new URL(request.url);
  fakeUrl.searchParams.set("refresh", "true");
  return GET(new NextRequest(fakeUrl, { headers: request.headers }));
}
