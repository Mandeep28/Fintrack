import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const createGoalSchema = z.object({
  title: z.string().trim().min(1, "Goal title is required"),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  initialAmount: z.number().nonnegative().optional().default(0),
  category: z.string().trim().min(1, "Category is required"),
  type: z.enum(["SAVINGS", "DEBT"]).default("SAVINGS"),
  deadline: z.string().nullable().optional(),
  note: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type"); // "SAVINGS" | "DEBT" | null
    const statusFilter = searchParams.get("status"); // "ACTIVE" | "COMPLETED" | null

    const where: any = {
      userId: session.user.id,
    };

    if (typeFilter && (typeFilter === "SAVINGS" || typeFilter === "DEBT")) {
      where.type = typeFilter;
    }

    if (statusFilter && (statusFilter === "ACTIVE" || statusFilter === "COMPLETED")) {
      where.status = statusFilter;
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        contributions: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format goals with computed fields
    const formattedGoals = goals.map((goal) => {
      const target = Number(goal.targetAmount);
      const current = Number(goal.currentAmount);
      const remaining = Math.max(0, target - current);
      const rawPercentage = target > 0 ? (current / target) * 100 : 0;
      const percentage = Number(rawPercentage.toFixed(1));
      const isCompleted = current >= target || goal.status === "COMPLETED";

      return {
        id: goal.id,
        title: goal.title,
        targetAmount: target,
        currentAmount: current,
        remainingAmount: remaining,
        percentage,
        category: goal.category,
        type: goal.type as "SAVINGS" | "DEBT",
        deadline: goal.deadline ? goal.deadline.toISOString() : null,
        status: isCompleted ? "COMPLETED" : goal.status,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
        contributionsCount: goal.contributions.length,
        contributions: goal.contributions.map((c) => ({
          id: c.id,
          amount: Number(c.amount),
          note: c.note,
          date: c.date.toISOString(),
          createdAt: c.createdAt.toISOString(),
        })),
      };
    });

    // Compute overall summary statistics for all user goals (reuse goals when unfiltered)
    const hasFilter = Boolean(typeFilter || statusFilter);
    const allUserGoals = hasFilter
      ? await prisma.goal.findMany({ where: { userId: session.user.id } })
      : goals;

    let totalTarget = 0;
    let totalCurrent = 0;
    let savingsTarget = 0;
    let savingsSaved = 0;
    let debtTarget = 0;
    let debtPaid = 0;
    let completedCount = 0;
    let activeCount = 0;

    for (const g of allUserGoals) {
      const target = Number(g.targetAmount);
      const current = Number(g.currentAmount);
      totalTarget += target;
      totalCurrent += current;

      if (g.type === "DEBT") {
        debtTarget += target;
        debtPaid += current;
      } else {
        savingsTarget += target;
        savingsSaved += current;
      }

      if (current >= target || g.status === "COMPLETED") {
        completedCount++;
      } else {
        activeCount++;
      }
    }

    const overallPercentage = totalTarget > 0 ? Number(((totalCurrent / totalTarget) * 100).toFixed(1)) : 0;
    const savingsPercentage = savingsTarget > 0 ? Number(((savingsSaved / savingsTarget) * 100).toFixed(1)) : 0;
    const debtPercentage = debtTarget > 0 ? Number(((debtPaid / debtTarget) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      goals: formattedGoals,
      summary: {
        totalGoals: allUserGoals.length,
        activeGoals: activeCount,
        completedGoals: completedCount,
        totalTarget,
        totalCurrent,
        totalRemaining: Math.max(0, totalTarget - totalCurrent),
        overallPercentage,
        savings: {
          target: savingsTarget,
          saved: savingsSaved,
          remaining: Math.max(0, savingsTarget - savingsSaved),
          percentage: savingsPercentage,
        },
        debt: {
          target: debtTarget,
          paid: debtPaid,
          remaining: Math.max(0, debtTarget - debtPaid),
          percentage: debtPercentage,
        },
      },
    });
  } catch (error) {
    console.error("Fetch goals error:", error);
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
    const data = createGoalSchema.parse(body);

    const initialAmount = data.initialAmount || 0;
    const isCompleted = initialAmount >= data.targetAmount;

    // Create goal and initial contribution if any
    const goal = await prisma.$transaction(async (tx) => {
      const createdGoal = await tx.goal.create({
        data: {
          userId: session.user.id,
          title: data.title,
          targetAmount: data.targetAmount,
          currentAmount: initialAmount,
          category: data.category,
          type: data.type,
          deadline: data.deadline ? new Date(data.deadline) : null,
          status: isCompleted ? "COMPLETED" : "ACTIVE",
        },
      });

      if (initialAmount > 0) {
        await tx.goalContribution.create({
          data: {
            goalId: createdGoal.id,
            amount: initialAmount,
            note: data.note || (data.type === "DEBT" ? "Initial payment" : "Initial savings deposit"),
            date: new Date(),
          },
        });
      }

      return createdGoal;
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Create goal error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
