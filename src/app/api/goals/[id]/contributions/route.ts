import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const contributionSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  note: z.string().optional(),
  date: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = contributionSchema.parse(body);

    const contributionDate = data.date ? new Date(data.date) : new Date();
    const newCurrent = Number(goal.currentAmount) + data.amount;
    const target = Number(goal.targetAmount);
    const isCompleted = newCurrent >= target;

    const result = await prisma.$transaction(async (tx) => {
      const contribution = await tx.goalContribution.create({
        data: {
          goalId: id,
          amount: data.amount,
          note: data.note || (goal.type === "DEBT" ? "Loan payment" : "Savings contribution"),
          date: contributionDate,
        },
      });

      const updatedGoal = await tx.goal.update({
        where: { id },
        data: {
          currentAmount: { increment: data.amount },
          ...(isCompleted ? { status: "COMPLETED" } : {}),
        },
        include: {
          contributions: {
            orderBy: { date: "desc" },
          },
        },
      });

      return { contribution, goal: updatedGoal };
    });

    const targetNum = Number(result.goal.targetAmount);
    const currentNum = Number(result.goal.currentAmount);

    return NextResponse.json({
      contribution: {
        id: result.contribution.id,
        amount: Number(result.contribution.amount),
        note: result.contribution.note,
        date: result.contribution.date.toISOString(),
      },
      goal: {
        id: result.goal.id,
        title: result.goal.title,
        targetAmount: targetNum,
        currentAmount: currentNum,
        remainingAmount: Math.max(0, targetNum - currentNum),
        percentage: Number((targetNum > 0 ? (currentNum / targetNum) * 100 : 0).toFixed(1)),
        status: currentNum >= targetNum ? "COMPLETED" : result.goal.status,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Add goal contribution error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
