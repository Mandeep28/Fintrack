export interface FinancialAggregateData {
  currentMonthTotal: number;
  previousMonthTotal: number;
  topCategories: Array<{
    name: string;
    spent: number;
    budget: number | null;
    status: "normal" | "warning" | "exceeded" | "no_budget";
  }>;
  goalsFundedThisMonth: number;
  activeGoalsCount: number;
  budgetDisciplineScore: number; // max 40
  savingsVelocityScore: number;  // max 30
  spendingStabilityScore: number;// max 30
  baseScore: number;             // max 100
}

export interface FinancialInsightResult {
  score: number;
  tier: "Excellent" | "Good" | "Needs Attention" | "High Risk";
  pillars: {
    budgetDiscipline: number;
    savingsVelocity: number;
    spendingStability: number;
  };
  summary: string;
  insights: string[];
  isAI: boolean;
}

function getTier(score: number): "Excellent" | "Good" | "Needs Attention" | "High Risk" {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Attention";
  return "High Risk";
}

function generateAlgorithmicFallback(data: FinancialAggregateData): FinancialInsightResult {
  const score = Math.min(100, Math.max(0, Math.round(data.baseScore)));
  const tier = getTier(score);

  const insights: string[] = [];

  // Insight 1: Month-over-month comparison
  if (data.previousMonthTotal > 0) {
    const diff = data.currentMonthTotal - data.previousMonthTotal;
    const pct = Math.abs(Math.round((diff / data.previousMonthTotal) * 100));
    if (diff < 0) {
      insights.push(`Overall spending is down ${pct}% compared to last month — excellent budget discipline!`);
    } else if (diff > 0) {
      insights.push(`Overall spending is up ${pct}% compared to last month. Watch discretionary categories.`);
    } else {
      insights.push("Your spending is perfectly steady and tracking alongside last month's pace.");
    }
  } else {
    insights.push(`You have tracked $${data.currentMonthTotal.toFixed(2)} in total expenses so far this month.`);
  }

  // Insight 2: Category budget compliance
  const exceededCategories = data.topCategories.filter((c) => c.status === "exceeded");
  const totalBudgetCategories = data.topCategories.filter((c) => c.budget !== null).length;

  if (exceededCategories.length > 0) {
    const names = exceededCategories.map((c) => c.name).join(", ");
    insights.push(`Spending limit exceeded in ${names}. Consider trimming non-essential purchases.`);
  } else if (totalBudgetCategories > 0) {
    insights.push(`All ${totalBudgetCategories} budgeted categories are within safe spending thresholds.`);
  } else {
    insights.push("Create custom category limits to monitor spending caps and prevent budget overruns.");
  }

  // Insight 3: Goal contributions & savings velocity
  if (data.goalsFundedThisMonth > 0) {
    insights.push(
      `You funded $${data.goalsFundedThisMonth.toFixed(2)} across ${data.activeGoalsCount} active savings goals this month.`
    );
  } else if (data.activeGoalsCount > 0) {
    insights.push(`You have ${data.activeGoalsCount} active goals. Allocate a small contribution to maintain momentum.`);
  } else {
    insights.push("Set up a savings goal to start tracking progress toward future purchases or debt payoff.");
  }

  // Formulate summary
  let summary = "";
  if (score >= 85) {
    summary = "Outstanding financial momentum! Your expenses are well-controlled and savings velocity is strong.";
  } else if (score >= 70) {
    summary = "Solid financial balance this month. Your core budget categories remain on track with healthy discipline.";
  } else if (score >= 50) {
    summary = "Moderate financial volatility detected. Several categories require closer attention to prevent overspending.";
  } else {
    summary = "High spending alert this month. Budget limits have been surpassed in key areas—take corrective steps.";
  }

  return {
    score,
    tier,
    pillars: {
      budgetDiscipline: data.budgetDisciplineScore,
      savingsVelocity: data.savingsVelocityScore,
      spendingStability: data.spendingStabilityScore,
    },
    summary,
    insights: insights.slice(0, 3),
    isAI: false,
  };
}

export async function generateFinancialInsights(data: FinancialAggregateData): Promise<FinancialInsightResult> {
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  // If no AI key provided, immediately return the local algorithmic insights
  if (!openRouterKey && !openAiKey) {
    return generateAlgorithmicFallback(data);
  }

  try {
    let endpoint = "";
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
      headers["X-Title"] = "FinTrack Financial Analytics";
      if (!process.env.AI_MODEL) {
        model = "openrouter/free";
      }
    } else if (openAiKey) {
      endpoint = "https://api.openai.com/v1/chat/completions";
      apiKey = openAiKey;
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const promptPayload = {
      currentMonthSpent: Number(data.currentMonthTotal.toFixed(2)),
      previousMonthSpent: Number(data.previousMonthTotal.toFixed(2)),
      topCategories: data.topCategories.map((c) => ({
        category: c.name,
        spent: Number(c.spent.toFixed(2)),
        budget: c.budget,
        status: c.status,
      })),
      goalsFundedThisMonth: Number(data.goalsFundedThisMonth.toFixed(2)),
      activeGoalsCount: data.activeGoalsCount,
      baselineCalculatedScore: Math.round(data.baseScore),
    };

    const systemPrompt = `You are FinTrack AI, an encouraging and razor-sharp personal finance advisor.
Analyze the user's monthly spending numbers and return a STRICT JSON object in this format:
{
  "score": number (0 to 100 based on the user's financial health, where 100 is ideal),
  "tier": "Excellent" | "Good" | "Needs Attention" | "High Risk",
  "summary": "2 concise, encouraging sentences analyzing the month's overall financial health and trends.",
  "insights": [
    "Insight 1 (specific to category changes or budget compliance)",
    "Insight 2 (actionable advice or praise)",
    "Insight 3 (goal or savings advisory)"
  ]
}
Do NOT include markdown formatting or backticks around the json. Output pure valid JSON only.`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the financial data for this month: ${JSON.stringify(promptPayload)}` },
        ],
        temperature: 0.3,
        max_tokens: 350,
      }),
      signal: AbortSignal.timeout(8000), // 8-second safety timeout
    });

    if (!response.ok) {
      console.warn(`AI Provider returned status ${response.status}. Falling back to algorithmic insights.`);
      return generateAlgorithmicFallback(data);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return generateAlgorithmicFallback(data);
    }

    // Strip any accidental markdown formatting
    const cleaned = content.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned);

    const score = Math.min(100, Math.max(0, typeof parsed.score === "number" ? Math.round(parsed.score) : Math.round(data.baseScore)));
    const tier = ["Excellent", "Good", "Needs Attention", "High Risk"].includes(parsed.tier)
      ? parsed.tier
      : getTier(score);

    const summary = typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : generateAlgorithmicFallback(data).summary;

    const insights = Array.isArray(parsed.insights) && parsed.insights.length > 0
      ? parsed.insights.map((item: any) => String(item).trim()).filter(Boolean).slice(0, 3)
      : generateAlgorithmicFallback(data).insights;

    return {
      score,
      tier,
      pillars: {
        budgetDiscipline: data.budgetDisciplineScore,
        savingsVelocity: data.savingsVelocityScore,
        spendingStability: data.spendingStabilityScore,
      },
      summary,
      insights,
      isAI: true,
    };
  } catch (err) {
    console.warn("AI generation encountered an error. Seamlessly falling back to local algorithm:", err);
    return generateAlgorithmicFallback(data);
  }
}
