import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const bulkExpenseSchema = z.object({
  expenses: z.array(
    z.object({
      amount: z.number().positive("Amount must be positive"),
      category: z.string().min(1, "Category is required"),
      note: z.string().optional().nullable(),
      date: z.string(),
      roomId: z.string().optional().nullable(),
    })
  ).min(1, "At least one expense must be provided"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: max 15 bulk imports per 10 minutes per user
    const rateCheck = checkRateLimit(`bulk_expenses:${session.user.id}`, {
      limit: 15,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateCheck.success) {
      return rateLimitResponse(rateCheck.reset);
    }

    const body = await req.json();
    const { expenses } = bulkExpenseSchema.parse(body);

    const result = await prisma.expense.createMany({
      data: expenses.map((exp) => ({
        amount: exp.amount,
        category: exp.category,
        note: exp.note || null,
        date: new Date(exp.date),
        userId: session.user.id,
        roomId: exp.roomId || null,
      })),
    });

    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Bulk create expenses error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
