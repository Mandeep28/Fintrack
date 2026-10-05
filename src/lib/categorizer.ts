/**
 * Auto-categorization & One-liner parser for FinTrack
 */

export const BROAD_CATEGORIES = [
  "Food",
  "Travel",
  "Bills & Utilities",
  "Shopping",
  "Entertainment",
  "Health",
  "Other",
] as const;

export type Category = (typeof BROAD_CATEGORIES)[number];

const CATEGORY_KEYWORDS: Record<Exclude<Category, "Other">, string[]> = {
  "Bills & Utilities": [
    // Subscriptions
    "youtube premium", "yt premium", "subscription", "subscriptions",
    // Living & Utilities
    "rent", "room rent", "flat rent", "pg", "maintenance", "electricity", "bijli", "power",
    "water", "wifi", "broadband", "internet", "recharge", "jio", "airtel", "vi", "bsnl",
    "cylinder", "gas cylinder", "lpg", "gas", "maid", "cook", "bill", "bills", "society"
  ],
  Food: [
    // Dining & Meals
    "dinner", "lunch", "breakfast", "brunch", "snack", "snacks", "food", "meal", "meals",
    "biryani", "pizza", "burger", "dosa", "roti", "thali", "momo", "momos", "roll", "rolls",
    "maggi", "sandwich", "noodles", "paneer", "chicken", "sweets", "bakery", "bread",
    // Ice Cream & Desserts & Fruits
    "ice cream", "icecream", "dessert", "kulfi", "fruit", "fruits", "apple", "banana", "mango",
    // Food Delivery & Restaurants
    "swiggy", "zomato", "eatclub", "mcdonalds", "mcd", "kfc", "dominos", "subway", "haldiram", "burger king",
    // Cafe & Chai
    "chai", "tea", "coffee", "cafe", "café", "starbucks", "ccds", "tapri", "sutta",
    // Groceries & Daily Essentials
    "grocery", "groceries", "dmart", "d-mart", "zepto", "blinkit", "instamart", "bigbasket",
    "milk", "curd", "dahi", "egg", "eggs", "vegetables", "veggies", "sabzi", "rice",
    "dal", "atta", "oil", "masala", "biscuit", "water jar", "bisleri"
  ],
  Travel: [
    // Commute & Rides
    "rapido", "uber", "ola", "auto", "cab", "taxi", "rickshaw", "metro", "bus", "train",
    "irctc", "railway", "ticket", "tickets", "train ticket", "bus ticket", "flight", "indigo", "air india", "fare",
    // Fuel & Vehicle
    "petrol", "diesel", "cng", "fuel", "hpcl", "bpcl", "iocl", "shell", "toll", "fastag",
    "parking", "puncture", "service", "mechanic", "vehicle", "vechile", "bike", "scooter", "car"
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
    "health insurance", "heath insurance", "insurance", "mediclaim", "policy", "medical",
    "health", "heath", "checkup", "therapy", "consultation",
    "medicine", "medicines", "pharmacy", "apollo", "pharmeasy", "1mg", "chemist", "doctor",
    "clinic", "hospital", "dental", "dentist", "gym", "fitness", "protein", "supplement",
    "blood test", "lab", "tablets", "syrup"
  ],
};

function matchesKeyword(text: string, kw: string): boolean {
  if (kw.includes(" ") || kw.includes("-")) {
    return text.includes(kw);
  }
  const regex = new RegExp(`\\b${kw}\\b`, "i");
  return regex.test(text);
}

/**
 * Detect category from text description / note.
 */
export function detectCategory(text: string): Category {
  if (!text) return "Other";
  const clean = text.toLowerCase().trim();

  // Multi-word exact phrases or specific keywords first
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (matchesKeyword(clean, kw)) {
        return category as Category;
      }
    }
  }

  return "Other";
}

const MONTH_NAMES: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

export interface ParsedExpense {
  amount: number;
  category: Category;
  note: string;
  date: string; // YYYY-MM-DD
  raw: string;
}

/**
 * Format a Date to local YYYY-MM-DD string
 */
function toLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a single one-liner input into an expense object.
 * Examples:
 * - "1 aug 1149 bus ticket"
 * - "11 aug 4760 rent"
 * - "10 sept 1598 zudio"
 * - "15 sept 1000 cash withdraw"
 * - "5 sept 2900 vechile service"
 * - "yesterday 1200 dmart"
 * - "train ticket 450"
 * - "80 chai"
 * - "2k shoes 15 aug"
 */
export function parseOneLiner(line: string, defaultDate: Date = new Date()): ParsedExpense | null {
  const raw = line.trim();
  if (!raw) return null;

  let text = raw;
  let parsedDate: Date = new Date(defaultDate);
  let dateFound = false;

  // 1. Check relative dates: "today", "yesterday"
  const yesterdayMatch = text.match(/\byesterday\b/i);
  if (yesterdayMatch) {
    const y = new Date(defaultDate);
    y.setDate(y.getDate() - 1);
    parsedDate = y;
    dateFound = true;
    text = text.slice(0, yesterdayMatch.index!) + " " + text.slice(yesterdayMatch.index! + yesterdayMatch[0].length);
  } else {
    const todayMatch = text.match(/\btoday\b/i);
    if (todayMatch) {
      parsedDate = new Date(defaultDate);
      dateFound = true;
      text = text.slice(0, todayMatch.index!) + " " + text.slice(todayMatch.index! + todayMatch[0].length);
    }
  }

  // 2. Check numeric dates: "20/09/2026", "20-09-2026", "20/09", "20-09"
  if (!dateFound) {
    const slashMatch = text.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
    if (slashMatch) {
      const day = parseInt(slashMatch[1], 10);
      const month = parseInt(slashMatch[2], 10) - 1;
      const year = slashMatch[3]
        ? slashMatch[3].length === 2
          ? 2000 + parseInt(slashMatch[3], 10)
          : parseInt(slashMatch[3], 10)
        : defaultDate.getFullYear();

      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        parsedDate = new Date(year, month, day);
        dateFound = true;
        text = text.slice(0, slashMatch.index!) + " " + text.slice(slashMatch.index! + slashMatch[0].length);
      }
    }
  }

  // 3. Named month dates: "20 sept", "20th sept", "20 sept 2026", "sept 20", "september 20th", "1 aug 1149"
  if (!dateFound) {
    // Pattern A: Day first -> "20 sept [year]" or "1 aug [year]"
    const dayMonthRegex =
      /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*(?:\s+(\d{4}))?\b/i;
    const matchA = text.match(dayMonthRegex);

    if (matchA) {
      const day = parseInt(matchA[1], 10);
      const mStr = matchA[2].toLowerCase();
      const month = MONTH_NAMES[mStr] ?? defaultDate.getMonth();
      let year = defaultDate.getFullYear();
      let matchLength = matchA[0].length;

      // Only treat 4-digit number as a year if:
      // - It falls in a plausible year range (2000-2099), AND
      // - There is another number in the text representing the expense amount!
      if (matchA[3]) {
        const potentialYear = parseInt(matchA[3], 10);
        const remainderText = text.slice(matchA.index! + matchA[0].length);
        const hasOtherNumber = /(?:rs\.?|inr|₹)?\s*\b\d+(?:\.\d+)?\b/i.test(remainderText) ||
          /(?:rs\.?|inr|₹)?\s*\b\d+(?:\.\d+)?\b/i.test(text.slice(0, matchA.index!));

        if (potentialYear >= 2000 && potentialYear <= 2099 && hasOtherNumber) {
          year = potentialYear;
        } else {
          // It's NOT a year (it's the amount!) -> don't consume it as part of date
          const datePartOnly = matchA[0].slice(0, matchA[0].lastIndexOf(matchA[3])).trimEnd();
          matchLength = datePartOnly.length;
        }
      }

      parsedDate = new Date(year, month, day);
      dateFound = true;
      text = text.slice(0, matchA.index!) + " " + text.slice(matchA.index! + matchLength);
    } else {
      // Pattern B: Month first -> "sept 20 [year]" or "aug 1 [year]"
      const monthDayRegex =
        /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?\b/i;
      const matchB = text.match(monthDayRegex);

      if (matchB) {
        const mStr = matchB[1].toLowerCase();
        const month = MONTH_NAMES[mStr] ?? defaultDate.getMonth();
        const day = parseInt(matchB[2], 10);
        let year = defaultDate.getFullYear();
        let matchLength = matchB[0].length;

        if (matchB[3]) {
          const potentialYear = parseInt(matchB[3], 10);
          const remainderText = text.slice(matchB.index! + matchB[0].length);
          const hasOtherNumber = /(?:rs\.?|inr|₹)?\s*\b\d+(?:\.\d+)?\b/i.test(remainderText) ||
            /(?:rs\.?|inr|₹)?\s*\b\d+(?:\.\d+)?\b/i.test(text.slice(0, matchB.index!));

          if (potentialYear >= 2000 && potentialYear <= 2099 && hasOtherNumber) {
            year = potentialYear;
          } else {
            const datePartOnly = matchB[0].slice(0, matchB[0].lastIndexOf(matchB[3])).trimEnd();
            matchLength = datePartOnly.length;
          }
        }

        parsedDate = new Date(year, month, day);
        dateFound = true;
        text = text.slice(0, matchB.index!) + " " + text.slice(matchB.index! + matchLength);
      }
    }
  }

  // 4. Extract Amount: "2k", "1.5k", "250", "₹250", "rs 250", "429.53", "142.25", "1149", etc.
  let amount: number | null = null;

  // Check "2k", "1.5k"
  const kMatch = text.match(/(?:(?:rs\.?|inr|₹)\s*)?(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    amount = parseFloat(kMatch[1]) * 1000;
    text = text.slice(0, kMatch.index!) + " " + text.slice(kMatch.index! + kMatch[0].length);
  } else {
    // Normal number (supports integers and decimals like 16.5, 429.53, 532.8)
    const numMatch = text.match(/(?:(?:rs\.?|inr|₹)\s*)?(\d+(?:\.\d+)?)/i);
    if (numMatch) {
      amount = parseFloat(numMatch[1]);
      text = text.slice(0, numMatch.index!) + " " + text.slice(numMatch.index! + numMatch[0].length);
    }
  }

  if (amount === null || isNaN(amount) || amount <= 0) {
    return null;
  }

  // 5. Clean remaining text as Note / Description
  const note = text
    .replace(/[,\-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 6. Detect Category
  const category = detectCategory(note || raw);

  return {
    amount: Math.round(amount * 100) / 100,
    category,
    note: note || category,
    date: toLocalDateString(parsedDate),
    raw,
  };
}

/**
 * Parses multiple lines of text into expenses.
 */
export function parseBulkText(text: string, defaultDate: Date = new Date()): ParsedExpense[] {
  const lines = text.split(/\r?\n/);
  const results: ParsedExpense[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parsed = parseOneLiner(line, defaultDate);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}
