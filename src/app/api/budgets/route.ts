import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, parseISO, format } from "date-fns";
import * as z from "zod";
import { BROAD_CATEGORIES } from "@/lib/categorizer";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().nonnegative("Budget must be a non-negative number"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format").optional().nullable(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month") || format(new Date(), "yyyy-MM");

    const date = parseISO(`${monthParam}-01`);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    // 1. Fetch user's budgets for this month (or global/null month)
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { month: monthParam },
          { month: null }
        ],
      },
    });

    // Create a map of category -> budget amount (month-specific takes precedence)
    const budgetMap = new Map<string, number>();
    for (const b of budgets) {
      if (!budgetMap.has(b.category) || b.month === monthParam) {
        budgetMap.set(b.category, Number(b.amount));
      }
    }

    // 2. Fetch all user's custom categories
    const userCustomCategories = await prisma.category.findMany({
      where: { userId: session.user.id },
      select: { name: true },
    });

    // 3. Fetch all personal expenses for this user in this month
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        roomId: null, // Personal expenses
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Calculate spent per category
    const spentMap = new Map<string, number>();
    for (const exp of expenses) {
      const current = spentMap.get(exp.category) || 0;
      spentMap.set(exp.category, current + Number(exp.amount));
    }

    // Combine for all broad categories + user custom categories + categories in budgets or expenses
    const allCategories = Array.from(
      new Set([
        ...BROAD_CATEGORIES,
        ...userCustomCategories.map((c) => c.name),
        ...Array.from(budgetMap.keys()),
        ...Array.from(spentMap.keys()),
      ])
    );

    const result = allCategories.map((category) => {
      const budgetAmount = budgetMap.get(category) ?? null;
      const spent = spentMap.get(category) || 0;
      const percentage = budgetAmount && budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      let status: "normal" | "warning" | "exceeded" | "no_budget" = "no_budget";
      if (budgetAmount !== null && budgetAmount > 0) {
        if (percentage >= 100) status = "exceeded";
        else if (percentage >= 80) status = "warning";
        else status = "normal";
      }

      return {
        category,
        budget: budgetAmount,
        spent: Number(spent.toFixed(2)),
        remaining: budgetAmount !== null ? Number((budgetAmount - spent).toFixed(2)) : null,
        percentage: Number(percentage.toFixed(1)),
        status,
      };
    });

    // Also calculate month total summary
    const totalBudget = Array.from(budgetMap.values()).reduce((sum, b) => sum + b, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return NextResponse.json({
      month: monthParam,
      totalBudget: Number(totalBudget.toFixed(2)),
      totalSpent: Number(totalSpent.toFixed(2)),
      categories: result,
    });
  } catch (error) {
    console.error("Fetch budgets error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, amount, month } = budgetSchema.parse(body);
    const targetMonth = month || format(new Date(), "yyyy-MM");

    // Upsert budget for this user, category, and month
    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month: {
          userId: session.user.id,
          category,
          month: targetMonth,
        },
      },
      update: {
        amount,
      },
      create: {
        userId: session.user.id,
        category,
        amount,
        month: targetMonth,
      },
    });

    return NextResponse.json(budget, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Save budget error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
