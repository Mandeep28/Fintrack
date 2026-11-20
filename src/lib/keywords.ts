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

/**
 * Detects category from database keywords:
 * 1. User manual keywords (top priority, scoped to user)
 * 2. System default keywords (global)
 * 3. AI background learned keywords (global or user-scoped)
 */
export async function detectCategoryFromDB(
  text: string,
  userId: string
): Promise<MatchedCategoryResult | null> {
  if (!text) return null;
  const cleanText = text.toLowerCase().trim();

  await seedSystemKeywordsIfEmpty();

  // Parallel fetch for candidate keywords
  const [userKeywords, systemKeywords, aiKeywords] = await Promise.all([
    // 1. User-specific manual keywords
    prisma.categoryKeyword.findMany({
      where: { userId, source: "USER" },
      select: { keyword: true, category: true },
    }),
    // 2. Global system default keywords
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

  // Sort longest keywords first to prevent substring collisions
  const sortByLength = (a: { keyword: string }, b: { keyword: string }) => b.keyword.length - a.keyword.length;

  userKeywords.sort(sortByLength);
  systemKeywords.sort(sortByLength);
  aiKeywords.sort(sortByLength);

  // Check 1: User manual keywords
  for (const item of userKeywords) {
    if (matchesKeyword(cleanText, item.keyword)) {
      return { category: item.category, matchedKeyword: item.keyword, source: "USER" };
    }
  }

  // Check 2: System global keywords
  for (const item of systemKeywords) {
    if (matchesKeyword(cleanText, item.keyword)) {
      return { category: item.category, matchedKeyword: item.keyword, source: "SYSTEM" };
    }
  }

  // Check 3: AI learned keywords
  for (const item of aiKeywords) {
    if (matchesKeyword(cleanText, item.keyword)) {
      return { category: item.category, matchedKeyword: item.keyword, source: "AI" };
    }
  }

  return null;
}

/**
 * Saves a newly discovered keyword from AI into the database.
 * If category is standard, it is saved as GLOBAL (userId = null).
 * If category is user's custom category, it is saved as USER-SCOPED (userId = userId).
 */
export async function saveLearnedKeyword(
  keyword: string,
  category: string,
  userId: string
) {
  const cleanKw = keyword.toLowerCase().trim();
  if (!cleanKw || cleanKw.length < 2) return;

  const isStandard = STANDARD_CATEGORIES.includes(category as any);
  const targetUserId = isStandard ? null : userId;

  try {
    // Check if keyword already exists for this scope
    const existing = await prisma.categoryKeyword.findFirst({
      where: {
        keyword: cleanKw,
        userId: targetUserId,
      },
    });

    if (!existing) {
      await prisma.categoryKeyword.create({
        data: {
          keyword: cleanKw,
          category,
          userId: targetUserId,
          source: "AI",
        },
      });
    }
  } catch (err) {
    console.warn(`Could not save AI learned keyword "${cleanKw}":`, err);
  }
}

/**
 * Calls OpenAI or OpenRouter to classify unknown expense descriptions.
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

  let endpoint = "https://api.openai.com/v1/chat/completions";
  let apiKey = "";
  let model = process.env.AI_MODEL?.trim() || "gpt-4o-mini";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (openRouterKey) {
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
    apiKey = openRouterKey;
    headers["Authorization"] = `Bearer ${apiKey}`;
    headers["HTTP-Referer"] = "https://fintrack.app";
    headers["X-Title"] = "FinTrack Categorizer";
    if (!process.env.AI_MODEL) {
      model = "meta-llama/llama-3.3-70b-instruct:free";
    }
  } else if (openAiKey) {
    endpoint = "https://api.openai.com/v1/chat/completions";
    apiKey = openAiKey;
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const promptItems = items.map((it) => ({
    id: it.index,
    description: it.note,
  }));

  const systemPrompt = `You are a finance assistant. Categorize each expense description into the single most appropriate category from the allowed list:
Allowed Categories: ${JSON.stringify(availableCategories)}

For each item, also extract the core merchant or expense keyword (e.g., from 'sagar ratna dinner' extract 'sagar ratna'; from 'uber ride to office' extract 'uber'; from 'bought fresh fruits' extract 'fruits').

Return a STRICT JSON array with no markdown backticks:
[
  { "id": number, "category": "CategoryName", "keyword": "extracted merchant/item keyword" }
]`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Categorize these items: ${JSON.stringify(promptItems)}` },
        ],
        temperature: 0.1,
        max_tokens: 400,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn("AI categorization returned non-200. Using fallback.");
      for (const item of items) {
        results.set(item.index, { category: "Other", extractedKeyword: item.note });
      }
      return results;
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) return results;

    const cleaned = content.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        if (typeof entry.id === "number" && entry.category) {
          const matchedCategory = availableCategories.includes(entry.category) ? entry.category : "Other";
          const extractedKeyword = (entry.keyword || "").toLowerCase().trim();

          results.set(entry.id, {
            category: matchedCategory,
            extractedKeyword: extractedKeyword || "unknown",
          });

          // Save learned keyword into DB in background
          if (extractedKeyword && extractedKeyword.length >= 2) {
            await saveLearnedKeyword(extractedKeyword, matchedCategory, userId);
          }
        }
      }
    }
  } catch (err) {
    console.warn("AI categorization error:", err);
    for (const item of items) {
      results.set(item.index, { category: "Other", extractedKeyword: item.note });
    }
  }

  return results;
}
