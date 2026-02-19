import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  note: z.string().optional(),
  date: z.string().transform((val) => new Date(val)),
});

// GET individual expense (optional, but good for completeness)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: expenseId } = await params;

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    if (expense.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Fetch expense error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// UPDATE expense
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: expenseId } = await params;
    const body = await req.json();
    const validatedData = expenseSchema.parse(body);

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    if (expense.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: validatedData,
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Update expense error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE expense
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: expenseId } = await params;

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    if (expense.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
