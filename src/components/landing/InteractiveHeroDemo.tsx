"use client";

import { useState, useTransition } from "react";
import { Sparkles, ArrowRight, CheckCircle2, CornerDownLeft, RotateCcw } from "lucide-react";

// Client-side quick keyword dictionary for 0ms demo response
const DEMO_KEYWORDS: Record<string, { category: string; color: string }> = {
  // Food & Dining
  swiggy: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  zomato: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  dinner: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  lunch: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  breakfast: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  coffee: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  tea: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  starbucks: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  groceries: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  grocery: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  blinkit: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  zepto: { category: "Food & Dining", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },

  // Travel & Commute
  uber: { category: "Travel", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  ola: { category: "Travel", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  rapido: { category: "Travel", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  metro: { category: "Travel", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  flight: { category: "Travel", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  petrol: { category: "Travel", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  fuel: { category: "Travel", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  cab: { category: "Travel", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },

  // Entertainment
  netflix: { category: "Entertainment", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  spotify: { category: "Entertainment", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  movie: { category: "Entertainment", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  pvr: { category: "Entertainment", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  cinema: { category: "Entertainment", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  prime: { category: "Entertainment", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },

  // Shopping
  amazon: { category: "Shopping", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  flipkart: { category: "Shopping", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  myntra: { category: "Shopping", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  shoes: { category: "Shopping", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  clothes: { category: "Shopping", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },

  // Bills & Utilities
  wifi: { category: "Bills & Utilities", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  recharge: { category: "Bills & Utilities", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  electricity: { category: "Bills & Utilities", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  rent: { category: "Bills & Utilities", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },

  // Health
  gym: { category: "Health", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  doctor: { category: "Health", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  medicine: { category: "Health", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  pharmacy: { category: "Health", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
};

function parseRawInput(raw: string) {
  const text = raw.trim();
  if (!text) {
    return null;
  }

  // Extract amount: numbers with optional decimals or currency symbols
  const amountMatch = text.match(/(?:₹|rs\.?|inr|\$)?\s*(\d+(?:[.,]\d+)?)/i);
  let amountStr = "0.00";
  if (amountMatch) {
    amountStr = parseFloat(amountMatch[1].replace(/,/g, "")).toFixed(2);
  }

  // Match keyword
  const lower = text.toLowerCase();
  let matchedCategory = "General";
  let badgeColor = "text-primary bg-primary/10 border-primary/20";

  for (const [kw, meta] of Object.entries(DEMO_KEYWORDS)) {
    // word boundary regex
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    if (regex.test(lower)) {
      matchedCategory = meta.category;
      badgeColor = meta.color;
      break;
    }
  }

  return {
    raw: text,
    category: matchedCategory,
    amount: amountStr,
    badgeColor,
  };
}

const SAMPLE_CHIPS = [
  { label: "swiggy 250 dinner", desc: "Food" },
  { label: "uber 320 to airport", desc: "Travel" },
  { label: "netflix 199 premium", desc: "Entertainment" },
];

export default function InteractiveHeroDemo() {
  const [inputVal, setInputVal] = useState("swiggy 250 dinner");
  const [, startTransition] = useTransition();

  const parsed = parseRawInput(inputVal);

  const handleSelectSample = (sample: string) => {
    startTransition(() => {
      setInputVal(sample);
    });
  };

  const handleClear = () => {
    setInputVal("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Sleek Command Input Container */}
      <div className="relative group rounded-2xl sm:rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-2 sm:p-2.5 shadow-2xl shadow-primary/5 transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
        <div className="flex items-center gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2">
          {/* Terminal / Magic Icon */}
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Interactive Input */}
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type any expense: e.g. 'coffee 150 with team'..."
            aria-label="Try typing an expense"
            className="w-full bg-transparent border-0 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
          />

          {/* Right Action */}
          <div className="flex items-center gap-1.5 shrink-0">
            {inputVal && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors text-xs"
                title="Clear"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-[11px] font-mono text-muted-foreground border border-border/60">
              <span>Enter</span>
              <CornerDownLeft className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Live Parsed Preview Bar */}
        {parsed && (
          <div className="mt-2 pt-2.5 pb-1 px-3 sm:px-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 transition-all">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Parsed:
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${parsed.badgeColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {parsed.category}
              </span>
              <span className="text-xs sm:text-sm font-bold text-foreground font-mono">
                ₹{parsed.amount}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Instant Match (0ms)</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-muted-foreground/80 font-medium text-[11px]">Try one-click:</span>
        {SAMPLE_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => handleSelectSample(chip.label)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/50 text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>&quot;{chip.label}&quot;</span>
            <ArrowRight className="w-2.5 h-2.5 text-primary opacity-60" />
          </button>
        ))}
      </div>
    </div>
  );
}
