import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = await params;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // Expects YYYY-MM

    let date = new Date();
    if (dateParam) {
      date = parseISO(`${dateParam}-01`);
    }

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    // Verify membership
    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get all expenses for the month
    const expenses = await prisma.expense.findMany({
      where: {
        roomId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Get active members (for simplicity, we use all current members)
    const members = await prisma.roomMember.findMany({
      where: { roomId },
      include: { user: { select: { id: true, name: true } } },
    });

    const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const splitAmount = members.length > 0 ? totalExpense / members.length : 0;

    // Calculate balances
    const userPayments: Record<string, number> = {};
    members.forEach((m) => (userPayments[m.userId] = 0));
    expenses.forEach((exp) => {
      userPayments[exp.userId] = (userPayments[exp.userId] || 0) + Number(exp.amount);
    });

    const balances = members.map((m) => {
      const paid = userPayments[m.userId] || 0;
      return {
        userId: m.userId,
        name: m.user.name,
        paid: Number(paid.toFixed(2)),
        balance: Number((paid - splitAmount).toFixed(2)), // Positive means gets back, Negative means owes
      };
    });

    return NextResponse.json({
      totalExpense: Number(totalExpense.toFixed(2)),
      splitAmount: Number(splitAmount.toFixed(2)),
      memberCount: members.length,
      balances,
    });
  } catch (error) {
    console.error("Monthly summary error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
