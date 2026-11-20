import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseOneLiner } from "@/lib/categorizer";
import {
  STANDARD_CATEGORIES,
  preloadKeywordsForUser,
  matchCategoryFromLoadedKeywords,
  batchClassifyWithAI,
} from "@/lib/keywords";

export const maxDuration = 60; // Allow up to 60 seconds for large bulk batch classification
export const dynamic = "force-dynamic";

export interface ParsedExpenseResponse {
  date: string;
  amount: number;
  category: string;
  note: string;
  raw: string;
  isAICategorized: boolean;
  matchedKeyword?: string;
  matchedSource?: "USER" | "SYSTEM" | "AI";
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const rawText = typeof body.text === "string" ? body.text : "";

    if (!rawText.trim()) {
      return NextResponse.json({ message: "Please provide text to parse" }, { status: 400 });
    }

    // 1. Fetch user categories and preload all DB keywords in a single fast parallel query
    const [userCategories, loadedKeywords] = await Promise.all([
      prisma.category.findMany({
        where: { userId },
        select: { name: true },
      }),
      preloadKeywordsForUser(userId),
    ]);

    const allAvailableCategories = Array.from(
      new Set([...STANDARD_CATEGORIES, ...userCategories.map((c) => c.name)])
    );

    // 2. Split raw text by newline and parse each line
    const lines = rawText.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    const parsedItems: ParsedExpenseResponse[] = [];
    const unknownItemsForAI: Array<{ index: number; note: string }> = [];

    let dbMatchedCount = 0;

    // 3. Ultra-fast in-memory matching against DB keywords (takes <15ms for 2000+ items)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parsed = parseOneLiner(line);
      if (!parsed) continue;

      const itemIndex = parsedItems.length;

      // In-memory check against user -> system -> AI cached keywords
      const dbMatch = matchCategoryFromLoadedKeywords(parsed.note, loadedKeywords);

      if (dbMatch && dbMatch.category !== "Other") {
        dbMatchedCount++;
        parsedItems.push({
          date: parsed.date,
          amount: parsed.amount,
          category: dbMatch.category,
          note: parsed.note,
          raw: parsed.raw,
          isAICategorized: dbMatch.source === "AI",
          matchedKeyword: dbMatch.matchedKeyword,
          matchedSource: dbMatch.source,
        });
      } else {
        // Unknown: queue for AI classification
        parsedItems.push({
          date: parsed.date,
          amount: parsed.amount,
          category: "Other",
          note: parsed.note,
          raw: parsed.raw,
          isAICategorized: false,
        });

        if (parsed.note.trim()) {
          unknownItemsForAI.push({ index: itemIndex, note: parsed.note.trim() });
        }
      }
    }

    if (parsedItems.length === 0) {
      return NextResponse.json(
        { message: "Could not detect any expenses. Please check format (e.g. '12 nov 250 sagar ratna')" },
        { status: 400 }
      );
    }

    // 4. Send remaining unknown items to AI (deduplicated & chunked)
    let aiMatchedCount = 0;
    if (unknownItemsForAI.length > 0) {
      const aiResults = await batchClassifyWithAI(
        unknownItemsForAI,
        allAvailableCategories,
        userId
      );

      for (const [idx, aiRes] of aiResults.entries()) {
        if (parsedItems[idx] && aiRes.category !== "Other") {
          aiMatchedCount++;
          parsedItems[idx].category = aiRes.category;
          parsedItems[idx].isAICategorized = true;
          parsedItems[idx].matchedKeyword = aiRes.extractedKeyword;
          parsedItems[idx].matchedSource = "AI";
        }
      }
    }

    return NextResponse.json({
      success: true,
      items: parsedItems,
      totalCount: parsedItems.length,
      dbMatchedCount,
      aiMatchedCount,
    });
  } catch (error) {
    console.error("POST /api/expenses/parse error:", error);
    return NextResponse.json({ message: "Failed to parse expenses" }, { status: 500 });
  }
}
