import { prisma } from "@/lib/prisma";

export const STANDARD_CATEGORIES = [
  "Food",
  "Travel",
  "Bills & Utilities",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
] as const;

export type StandardCategory = (typeof STANDARD_CATEGORIES)[number];

export const DEFAULT_SYSTEM_KEYWORDS: Record<Exclude<StandardCategory, "Other">, string[]> = {
  "Bills & Utilities": [
    "youtube premium", "yt premium", "subscription", "subscriptions",
    "rent", "room rent", "flat rent", "pg", "maintenance", "electricity", "bijli", "power",
    "water", "wifi", "broadband", "internet", "recharge", "jio", "airtel", "vi", "bsnl",
    "cylinder", "gas cylinder", "lpg", "gas", "maid", "cook", "bill", "bills", "society"
  ],
  Food: [
    "dinner", "lunch", "breakfast", "brunch", "snack", "snacks", "food", "meal", "meals",
    "biryani", "pizza", "burger", "dosa", "roti", "thali", "momo", "momos", "roll", "rolls",
    "maggi", "sandwich", "noodles", "paneer", "chicken", "sweets", "bakery", "bread",
    "ice cream", "icecream", "dessert", "kulfi", "fruit", "fruits", "apple", "banana", "mango",
    "swiggy", "zomato", "eatclub", "mcdonalds", "mcd", "kfc", "dominos", "subway", "haldiram", "burger king",
    "chai", "tea", "coffee", "cafe", "café", "starbucks", "ccds", "tapri", "sutta",
    "grocery", "groceries", "dmart", "d-mart", "zepto", "blinkit", "instamart", "bigbasket",
    "milk", "curd", "dahi", "egg", "eggs", "vegetables", "veggies", "sabzi", "rice",
    "dal", "atta", "oil", "masala", "biscuit", "water jar", "bisleri"
  ],
  Travel: [
    "rapido", "uber", "ola", "auto", "cab", "taxi", "rickshaw", "metro", "bus", "train",
    "irctc", "railway", "ticket", "tickets", "train ticket", "bus ticket", "flight", "indigo", "air india", "fare",
    "petrol", "diesel", "cng", "fuel", "hpcl", "bpcl", "iocl", "shell", "toll", "fastag",
    "parking", "puncture", "service", "mechanic", "vehicle", "bike", "scooter", "car"
  ],
  Shopping: [
    "amazon", "flipkart", "myntra", "meesho", "ajio", "zudio", "trends", "pantaloons", "westside",
    "max", "h&m", "zara", "decathlon", "ikea", "clothes", "clothing", "shirt", "pants",
    "tshirt", "t-shirt", "jeans", "shoes", "footwear", "shopping", "dress", "jacket",
    "electronics", "gadget", "charger", "cable", "earphones", "headphones", "mobile", "laptop",
    "watch", "book", "books", "bag", "stationery"
  ],
  Entertainment: [
    "movie", "movies", "cinema", "theatre", "theater", "pvr", "inox", "film",
    "netflix", "prime", "hotstar", "disney", "spotify", "youtube",
    "game", "gaming", "steam", "playstation", "ps5", "xbox",
    "party", "club", "outing", "concert", "show", "trip", "beer", "wine", "drinks", "liquor"
  ],
  Health: [
    "health insurance", "insurance", "mediclaim", "policy", "medical",
    "health", "checkup", "therapy", "consultation",
    "medicine", "medicines", "pharmacy", "apollo", "pharmeasy", "1mg", "chemist", "doctor",
    "clinic", "hospital", "dental", "dentist", "gym", "fitness", "protein", "supplement",
    "blood test", "lab", "tablets", "syrup"
  ],
};

function matchesKeyword(text: string, kw: string): boolean {
  const cleanKw = kw.toLowerCase().trim();
  if (!cleanKw) return false;
  if (cleanKw.includes(" ") || cleanKw.includes("-")) {
    return text.includes(cleanKw);
  }
  const regex = new RegExp(`\\b${cleanKw}\\b`, "i");
  return regex.test(text);
}

/**
 * Seeds default system global keywords if they do not exist yet.
 */
export async function seedSystemKeywordsIfEmpty() {
  try {
    const existingCount = await prisma.categoryKeyword.count({
      where: { source: "SYSTEM" },
    });

    if (existingCount > 0) return;

    const records: Array<{ keyword: string; category: string; source: string; userId: null }> = [];

    for (const [category, keywords] of Object.entries(DEFAULT_SYSTEM_KEYWORDS)) {
      for (const kw of keywords) {
        const clean = kw.toLowerCase().trim();
        if (clean) {
          records.push({
            keyword: clean,
            category,
            source: "SYSTEM",
            userId: null,
          });
        }
      }
    }

    if (records.length > 0) {
      await prisma.categoryKeyword.createMany({
        data: records,
        skipDuplicates: true,
      });
      console.log(`Seeded ${records.length} system category keywords into database.`);
    }
  } catch (err) {
    console.error("Failed to seed system keywords:", err);
  }
}

export interface MatchedCategoryResult {
  category: string;
  matchedKeyword: string;
  source: "USER" | "SYSTEM" | "AI";
}

export interface LoadedKeywords {
  userKeywords: Array<{ keyword: string; category: string }>;
  systemKeywords: Array<{ keyword: string; category: string }>;
  aiKeywords: Array<{ keyword: string; category: string }>;
}

/**
 * Pre-loads all keywords for the user in a SINGLE parallel batch query.
 * Allows instant, zero-delay in-memory matching for 2,000+ entries.
 */
export async function preloadKeywordsForUser(userId: string): Promise<LoadedKeywords> {
  await seedSystemKeywordsIfEmpty();

  const [userKeywords, systemKeywords, aiKeywords] = await Promise.all([
    // 1. User manual keywords
    prisma.categoryKeyword.findMany({
      where: { userId, source: "USER" },
      select: { keyword: true, category: true },
    }),
    // 2. System default keywords
    prisma.categoryKeyword.findMany({
      where: { userId: null, source: "SYSTEM" },
      select: { keyword: true, category: true },
    }),
    // 3. AI background learned keywords
    prisma.categoryKeyword.findMany({
      where: {
        source: "AI",
        OR: [{ userId: null }, { userId }],
      },
      select: { keyword: true, category: true },
    }),
  ]);

  const sortByLength = (a: { keyword: string }, b: { keyword: string }) => b.keyword.length - a.keyword.length;
  userKeywords.sort(sortByLength);
  systemKeywords.sort(sortByLength);
  aiKeywords.sort(sortByLength);

  return { userKeywords, systemKeywords, aiKeywords };
}

/**
 * Fast in-memory category matcher against preloaded keywords.
 */
export function matchCategoryFromLoadedKeywords(
  text: string,
  loaded: LoadedKeywords
): MatchedCategoryResult | null {
  if (!text) return null;
  const cleanText = text.toLowerCase().trim();

  // Check 1: User manual keywords
  for (const item of loaded.userKeywords) {
    if (matchesKeyword(cleanText, item.keyword)) {
      return { category: item.category, matchedKeyword: item.keyword, source: "USER" };
    }
  }

  // Check 2: System global keywords
  for (const item of loaded.systemKeywords) {
    if (matchesKeyword(cleanText, item.keyword)) {
      return { category: item.category, matchedKeyword: item.keyword, source: "SYSTEM" };
    }
  }

  // Check 3: AI learned keywords
  for (const item of loaded.aiKeywords) {
    if (matchesKeyword(cleanText, item.keyword)) {
      return { category: item.category, matchedKeyword: item.keyword, source: "AI" };
    }
  }

  return null;
}

/**
 * Backward-compatible single item matcher.
 */
export async function detectCategoryFromDB(
  text: string,
  userId: string
): Promise<MatchedCategoryResult | null> {
  const loaded = await preloadKeywordsForUser(userId);
  return matchCategoryFromLoadedKeywords(text, loaded);
}

/**
 * Saves newly discovered keywords from AI into the database in bulk.
 */
export async function saveLearnedKeywordsBulk(
  keywords: Array<{ keyword: string; category: string }>,
  userId: string
) {
  if (keywords.length === 0) return;

  const records = keywords
    .map((k) => ({
      keyword: k.keyword.toLowerCase().trim(),
      category: k.category,
      userId: STANDARD_CATEGORIES.includes(k.category as any) ? null : userId,
      source: "AI",
    }))
    .filter((k) => k.keyword.length >= 2);

  if (records.length === 0) return;

  try {
    await prisma.categoryKeyword.createMany({
      data: records,
      skipDuplicates: true,
    });
  } catch (err) {
    console.warn("Could not batch save AI learned keywords:", err);
  }
}

/**
 * Calls AI in chunked batches with deduplication to classify unknown expense descriptions.
 * Optimized for thousands of entries without token limits or timeouts.
 */
export async function batchClassifyWithAI(
  items: Array<{ index: number; note: string }>,
  availableCategories: string[],
  userId: string
): Promise<Map<number, { category: string; extractedKeyword: string }>> {
  const results = new Map<number, { category: string; extractedKeyword: string }>();
  if (items.length === 0) return results;

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();

  // If no AI key configured, return fallback
  if (!openAiKey && !openRouterKey) {
    for (const item of items) {
      results.set(item.index, { category: "Other", extractedKeyword: item.note });
    }
    return results;
  }

  // Configure endpoint & model (Defaults to high-speed google/gemini-2.0-flash-exp:free)
  let endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const apiKey = openRouterKey || openAiKey || "";
  let model = process.env.AI_MODEL?.trim() || "openrouter/free";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (openRouterKey) {
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
    headers["HTTP-Referer"] = "https://fintrack.app";
    headers["X-Title"] = "FinTrack Categorizer";
  } else if (openAiKey) {
    endpoint = "https://api.openai.com/v1/chat/completions";
    if (!process.env.AI_MODEL) {
      model = "gpt-4o-mini";
    }
  }

  // 1. DEDUPLICATION: Map unique notes to their respective item indices
  // This drastically cuts down LLM calls when 2000 entries share common merchants.
  const noteToIndices = new Map<string, number[]>();
  for (const item of items) {
    const cleanNote = item.note.toLowerCase().trim();
    if (!noteToIndices.has(cleanNote)) {
      noteToIndices.set(cleanNote, []);
    }
    noteToIndices.get(cleanNote)!.push(item.index);
  }

  const uniqueNotes = Array.from(noteToIndices.keys());
  const learnedKeywordsToSave: Array<{ keyword: string; category: string }> = [];

  // 2. CHUNKING: Split unique notes into manageable batches (30 items per chunk)
  const CHUNK_SIZE = 30;
  const chunks: string[][] = [];
  for (let i = 0; i < uniqueNotes.length; i += CHUNK_SIZE) {
    chunks.push(uniqueNotes.slice(i, i + CHUNK_SIZE));
  }

  const systemPrompt = `You are a finance assistant. Categorize each expense description into the single most appropriate category from the allowed list:
Allowed Categories: ${JSON.stringify(availableCategories)}

For each item, also extract the core merchant or expense keyword (e.g., from 'sagar ratna dinner' extract 'sagar ratna'; from 'uber ride to office' extract 'uber'; from 'bought fresh fruits' extract 'fruits').

Return ONLY a strict JSON array with NO markdown backticks:
[
  { "description": "exact description text", "category": "CategoryName", "keyword": "extracted keyword" }
]`;

  // Helper to process a single chunk
  const processChunk = async (chunkNotes: string[]) => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Categorize these items:\n${JSON.stringify(chunkNotes)}` },
          ],
          temperature: 0.1,
          max_tokens: 3000,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        console.warn(`AI categorization chunk returned HTTP ${response.status}. Using fallback.`);
        for (const note of chunkNotes) {
          const indices = noteToIndices.get(note) || [];
          for (const idx of indices) {
            results.set(idx, { category: "Other", extractedKeyword: note });
          }
        }
        return;
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) return;

      // Extract JSON array robustly
      let cleaned = content.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
      const firstBracket = cleaned.indexOf("[");
      const lastBracket = cleaned.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      }

      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          const entryDesc = (entry.description || "").toLowerCase().trim();
          const matchedCategory = availableCategories.includes(entry.category) ? entry.category : "Other";
          const extractedKeyword = (entry.keyword || "").toLowerCase().trim() || entryDesc;

          if (extractedKeyword && extractedKeyword.length >= 2 && matchedCategory !== "Other") {
            learnedKeywordsToSave.push({ keyword: extractedKeyword, category: matchedCategory });
          }

          // Map back to all lines matching this note
          const indices = noteToIndices.get(entryDesc) || [];
          for (const idx of indices) {
            results.set(idx, {
              category: matchedCategory,
              extractedKeyword,
            });
          }
        }
      }
    } catch (err) {
      console.warn("AI categorization chunk error:", err);
      // Fallback for this chunk
      for (const note of chunkNotes) {
        const indices = noteToIndices.get(note) || [];
        for (const idx of indices) {
          results.set(idx, { category: "Other", extractedKeyword: note });
        }
      }
    }
  };

  // 3. EXECUTION: Run chunks concurrently in batches of 3
  const CONCURRENCY = 3;
  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map((chunk) => processChunk(chunk)));
  }

  // 4. Fallback fill for any items that didn't receive a result
  for (const item of items) {
    if (!results.has(item.index)) {
      results.set(item.index, { category: "Other", extractedKeyword: item.note });
    }
  }

  // 5. Batch persist learned keywords
  if (learnedKeywordsToSave.length > 0) {
    await saveLearnedKeywordsBulk(learnedKeywordsToSave, userId);
  }

  return results;
}
