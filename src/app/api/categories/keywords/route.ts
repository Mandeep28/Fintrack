import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedSystemKeywordsIfEmpty } from "@/lib/keywords";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    await seedSystemKeywordsIfEmpty();

    // Fetch system default keywords and user manual keywords
    // NOTE: source="AI" background keywords are NOT returned to the user list
    const [systemRecords, userRecords] = await Promise.all([
      prisma.categoryKeyword.findMany({
        where: { userId: null, source: "SYSTEM" },
        select: { id: true, keyword: true, category: true },
        orderBy: { keyword: "asc" },
      }),
      prisma.categoryKeyword.findMany({
        where: { userId, source: "USER" },
        select: { id: true, keyword: true, category: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Group system keywords by category for clean UI display
    const systemKeywords: Record<string, string[]> = {};
    for (const record of systemRecords) {
      if (!systemKeywords[record.category]) {
        systemKeywords[record.category] = [];
      }
      systemKeywords[record.category].push(record.keyword);
    }

    return NextResponse.json({
      success: true,
      systemKeywords,
      userKeywords: userRecords,
    });
  } catch (error) {
    console.error("GET /api/categories/keywords error:", error);
    return NextResponse.json({ message: "Failed to fetch keywords" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const rawKeyword = typeof body.keyword === "string" ? body.keyword.trim().toLowerCase() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";

    if (!rawKeyword || rawKeyword.length < 2) {
      return NextResponse.json({ message: "Keyword must be at least 2 characters long" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ message: "Category is required" }, { status: 400 });
    }

    // Upsert or create user-specific keyword
    const keywordRecord = await prisma.categoryKeyword.upsert({
      where: {
        keyword_userId: {
          keyword: rawKeyword,
          userId,
        },
      },
      create: {
        keyword: rawKeyword,
        category,
        userId,
        source: "USER",
      },
      update: {
        category,
        source: "USER",
      },
    });

    return NextResponse.json({
      success: true,
      keyword: keywordRecord,
    });
  } catch (error) {
    console.error("POST /api/categories/keywords error:", error);
    return NextResponse.json({ message: "Failed to create custom keyword" }, { status: 500 });
  }
}
