import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";
import { BROAD_CATEGORIES } from "@/lib/categorizer";
import { format } from "date-fns";

const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(30, "Max 30 characters"),
  budgetAmount: z.number().nonnegative("Budget must be non-negative").optional().nullable(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch user's custom categories
    const customCategories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });

    // 2. Fetch distinct categories from user's budgets & expenses
    const [budgetRows, expenseRows] = await Promise.all([
      prisma.budget.findMany({
        where: { userId: session.user.id },
        select: { category: true },
        distinct: ["category"],
      }),
      prisma.expense.findMany({
        where: { userId: session.user.id },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    const combinedSet = new Set<string>([
      ...BROAD_CATEGORIES,
      ...customCategories.map((c) => c.name),
      ...budgetRows.map((b) => b.category),
      ...expenseRows.map((e) => e.category),
    ]);

    return NextResponse.json({
      broad: BROAD_CATEGORIES,
      custom: customCategories.map((c) => c.name),
      all: Array.from(combinedSet),
    });
  } catch (error) {
    console.error("Fetch categories error:", error);
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
    const { name, budgetAmount, month } = createCategorySchema.parse(body);
    const targetMonth = month || format(new Date(), "yyyy-MM");

    // Create or update custom category
    const category = await prisma.category.upsert({
      where: {
        userId_name: {
          userId: session.user.id,
          name,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        name,
      },
    });

    // If budget specified, also upsert budget
    let budget = null;
    if (budgetAmount !== undefined && budgetAmount !== null && budgetAmount > 0) {
      budget = await prisma.budget.upsert({
        where: {
          userId_category_month: {
            userId: session.user.id,
            category: name,
            month: targetMonth,
          },
        },
        update: {
          amount: budgetAmount,
        },
        create: {
          userId: session.user.id,
          category: name,
          amount: budgetAmount,
          month: targetMonth,
        },
      });
    }

    return NextResponse.json({ category, budget }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Create custom category error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
