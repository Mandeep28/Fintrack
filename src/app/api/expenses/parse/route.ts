import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseOneLiner } from "@/lib/categorizer";
import {
  STANDARD_CATEGORIES,
  detectCategoryFromDB,
  batchClassifyWithAI,
  seedSystemKeywordsIfEmpty,
} from "@/lib/keywords";

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

    await seedSystemKeywordsIfEmpty();

    // 1. Split raw text by newline and extract date, amount, note
    const lines = rawText.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    const parsedItems: ParsedExpenseResponse[] = [];
    const unknownItemsForAI: Array<{ index: number; note: string }> = [];

    // User's custom categories
    const userCategories = await prisma.category.findMany({
      where: { userId },
      select: { name: true },
    });

    const allAvailableCategories = Array.from(
      new Set([...STANDARD_CATEGORIES, ...userCategories.map((c) => c.name)])
    );

    // 2. Parse each line and attempt DB categorization
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parsed = parseOneLiner(line);
      if (!parsed) continue;

      const itemIndex = parsedItems.length;

      // Check DB (User custom keywords -> System default -> AI cached)
      const dbMatch = await detectCategoryFromDB(parsed.note, userId);

      if (dbMatch && dbMatch.category !== "Other") {
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
        // Unknown or "Other" - queue for AI classification
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

    // 3. If there are unknown items, send them to AI in a single batch
    if (unknownItemsForAI.length > 0) {
      const aiResults = await batchClassifyWithAI(
        unknownItemsForAI,
        allAvailableCategories,
        userId
      );

      for (const [idx, aiRes] of aiResults.entries()) {
        if (parsedItems[idx] && aiRes.category !== "Other") {
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
    });
  } catch (error) {
    console.error("POST /api/expenses/parse error:", error);
    return NextResponse.json({ message: "Failed to parse expenses" }, { status: 500 });
  }
}
