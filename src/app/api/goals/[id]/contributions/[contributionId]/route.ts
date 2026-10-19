import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; contributionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, contributionId } = await params;

    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal || goal.userId !== session.user.id) {
      return NextResponse.json({ message: "Goal not found" }, { status: 404 });
    }

    const contribution = await prisma.goalContribution.findUnique({
      where: { id: contributionId },
    });

    if (!contribution || contribution.goalId !== id) {
      return NextResponse.json({ message: "Contribution not found" }, { status: 404 });
    }

    const amountToDeduct = Number(contribution.amount);
    const updatedCurrent = Math.max(0, Number(goal.currentAmount) - amountToDeduct);
    const target = Number(goal.targetAmount);

    await prisma.$transaction(async (tx) => {
      await tx.goalContribution.delete({
        where: { id: contributionId },
      });

      await tx.goal.update({
        where: { id },
        data: {
          currentAmount: updatedCurrent,
          status: updatedCurrent < target ? "ACTIVE" : goal.status,
        },
      });
    });

    return NextResponse.json({ message: "Contribution deleted successfully" });
  } catch (error) {
    console.error("Delete contribution error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
