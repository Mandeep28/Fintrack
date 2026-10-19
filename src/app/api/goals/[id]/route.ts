import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const updateGoalSchema = z.object({
  title: z.string().trim().min(1, "Goal title is required").optional(),
  targetAmount: z.number().positive("Target amount must be positive").optional(),
  category: z.string().trim().min(1, "Category is required").optional(),
  type: z.enum(["SAVINGS", "DEBT"]).optional(),
  deadline: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "PAUSED"]).optional(),
});

export async function GET(
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
      include: {
        contributions: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);
    const remaining = Math.max(0, target - current);
    const rawPercentage = target > 0 ? (current / target) * 100 : 0;

    return NextResponse.json({
      id: goal.id,
      title: goal.title,
      targetAmount: target,
      currentAmount: current,
      remainingAmount: remaining,
      percentage: Number(rawPercentage.toFixed(1)),
      category: goal.category,
      type: goal.type,
      deadline: goal.deadline ? goal.deadline.toISOString() : null,
      status: current >= target ? "COMPLETED" : goal.status,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
      contributions: goal.contributions.map((c) => ({
        id: c.id,
        amount: Number(c.amount),
        note: c.note,
        date: c.date.toISOString(),
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get goal error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.goal.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = updateGoalSchema.parse(body);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.targetAmount !== undefined) updateData.targetAmount = data.targetAmount;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.status !== undefined) updateData.status = data.status;

    // Check completion status if target amount changed
    const effectiveTarget = data.targetAmount !== undefined ? data.targetAmount : Number(existing.targetAmount);
    const effectiveCurrent = Number(existing.currentAmount);
    if (effectiveCurrent >= effectiveTarget && updateData.status === undefined) {
      updateData.status = "COMPLETED";
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        contributions: {
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Update goal error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.goal.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
