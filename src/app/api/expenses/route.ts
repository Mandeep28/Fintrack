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
  roomId: z.string().optional().nullable(),
});

import { BROAD_CATEGORIES } from "@/lib/categorizer";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Base where clause
    const where: any = {
      userId: session.user.id,
      ...(roomId ? { roomId } : { roomId: null }),
    };

    // Separate year & month or combined YYYY-MM filter
    if (year && /^\d{4}$/.test(year)) {
      const yearNum = parseInt(year, 10);
      if (month && month !== "all" && /^\d{1,2}$/.test(month)) {
        const monthNum = parseInt(month, 10);
        where.date = {
          gte: new Date(yearNum, monthNum - 1, 1),
          lte: new Date(yearNum, monthNum, 0, 23, 59, 59, 999),
        };
      } else {
        // Full year filter
        where.date = {
          gte: new Date(yearNum, 0, 1),
          lte: new Date(yearNum, 11, 31, 23, 59, 59, 999),
        };
      }
    } else if (month && month !== "all" && /^\d{4}-\d{2}$/.test(month)) {
      const monthDate = parseISO(`${month}-01`);
      where.date = {
        gte: startOfMonth(monthDate),
        lte: endOfMonth(monthDate),
      };
    }

    // Category filter
    if (category && category !== "All") {
      where.category = category;
    }

    // Search query filter (note or category)
    if (search && search.trim() !== "") {
      where.OR = [
        { note: { contains: search.trim(), mode: "insensitive" } },
        { category: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // If server pagination is requested
    if (page !== null && page !== undefined) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit || "20", 10) || 20);
      const skip = (pageNum - 1) * limitNum;

      const [expenses, total, expenseCategories, customCategories, totalSum] = await Promise.all([
        prisma.expense.findMany({
          where,
          orderBy: { date: "desc" },
          skip,
          take: limitNum,
        }),
        prisma.expense.count({ where }),
        prisma.expense.findMany({
          where: {
            userId: session.user.id,
            ...(roomId ? { roomId } : { roomId: null }),
          },
          select: { category: true },
          distinct: ["category"],
        }),
        prisma.category.findMany({
          where: { userId: session.user.id },
          select: { name: true },
        }),
        prisma.expense.aggregate({
          where,
          _sum: { amount: true },
        }),
      ]);

      const allCategories = Array.from(
        new Set([
          ...BROAD_CATEGORIES,
          ...customCategories.map((c) => c.name),
          ...expenseCategories.map((e) => e.category),
        ])
      ).sort();

      return NextResponse.json({
        expenses,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
        totalAmount: Number(totalSum._sum.amount || 0),
        categories: allCategories,
      });
    }

    // Unpaginated request (for dashboard or rooms that request full list)
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error:", error);
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
    const { amount, category, note, date, roomId } = expenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        amount,
        category,
        note,
        date,
        userId: session.user.id,
        roomId: roomId || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Create expense error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
