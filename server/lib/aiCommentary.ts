import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface FinancialData {
  month: number;
  year: number;
  netIncome: number;
  totalRevenue: number;
  totalExpenses: number;
  collectionRate: number;
  unitsInArrears: number;
  totalCash: number;
  operatingCash: number;
  reserveCash: number;
  maintenanceCollected: number;
  maintenanceBudget: number;
  assessmentCollected: number;
  lateFees: number;
  topExpenses: Array<{ category: string; actual: number; budget: number }>;
  delinquencyDetails: Array<{ unitNumber: string; amount: number; status: string }>;
  priorMonthData?: {
    netIncome: number;
    collectionRate: number;
    totalCash: number;
  };
}

export async function generateFinancialCommentary(data: FinancialData): Promise<string> {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthName = monthNames[data.month - 1];
  
  const prompt = `You are a professional financial analyst for Juda & Eskew, CPAs, providing monthly commentary for Heritage Condominium Association, a 24-unit building in North Miami, FL.

Write a comprehensive "Management Discussion & Analysis" section for the ${monthName} ${data.year} financial report. This should be professional, insightful, and actionable for the Board of Directors.

FINANCIAL DATA FOR ${monthName.toUpperCase()} ${data.year}:
- Net Income: $${data.netIncome.toLocaleString()} ${data.priorMonthData ? `(Prior month: $${data.priorMonthData.netIncome.toLocaleString()})` : ''}
- Total Revenue: $${data.totalRevenue.toLocaleString()}
- Total Expenses: $${data.totalExpenses.toLocaleString()}
- Collection Rate: ${data.collectionRate}% ${data.priorMonthData ? `(Prior: ${data.priorMonthData.collectionRate}%)` : ''}
- Units in Arrears: ${data.unitsInArrears} out of 24
- Total Cash on Hand: $${data.totalCash.toLocaleString()} ${data.priorMonthData ? `(Prior: $${data.priorMonthData.totalCash.toLocaleString()})` : ''}
  - Operating Account: $${data.operatingCash.toLocaleString()}
  - Reserve Fund: $${data.reserveCash.toLocaleString()}

REVENUE BREAKDOWN:
- Maintenance Fees Collected: $${data.maintenanceCollected.toLocaleString()} of $${data.maintenanceBudget.toLocaleString()} budgeted
- Assessment Payments: $${data.assessmentCollected.toLocaleString()}
- Late Fees: $${data.lateFees.toLocaleString()}

TOP EXPENSE CATEGORIES:
${data.topExpenses.map(e => `- ${e.category}: $${e.actual.toLocaleString()} (Budget: $${e.budget.toLocaleString()}, Variance: ${((e.actual - e.budget) / e.budget * 100).toFixed(1)}%)`).join('\n')}

DELINQUENCY SITUATION:
${data.delinquencyDetails.map(d => `- Unit ${d.unitNumber}: $${d.amount.toLocaleString()} (${d.status})`).join('\n')}

Write a 4-6 paragraph analysis covering:

1. **Financial Performance Overview**: Summarize the month's financial health. Is net income healthy? How does cash position look?

2. **Revenue Analysis**: Evaluate collection performance. Highlight concerns about the ${data.collectionRate}% collection rate (target is 85%). Address any significant gaps.

3. **Expense Management**: Analyze spending vs. budget. Identify any concerning overruns or noteworthy savings.

4. **Delinquency & Collections**: Discuss the ${data.unitsInArrears} units in arrears. Assess the impact on cash flow and recommend specific actions if needed.

5. **Cash Flow & Reserves**: Evaluate the $${data.totalCash.toLocaleString()} cash position. Is the reserve fund adequate? Any liquidity concerns?

6. **Recommendations & Action Items**: Provide 2-4 specific, actionable recommendations for the Board to consider.

TONE: Professional, factual, balanced. Acknowledge both positives and concerns. Be specific with numbers and percentages.

FORMAT: Write in clear paragraphs with appropriate section headings. Do NOT use bullet points in the main text - use full sentences and paragraphs only.

LENGTH: Aim for 500-700 words total.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return content.text;
    }
    
    throw new Error("Unexpected response format from Claude");
  } catch (error) {
    console.error("Error generating AI commentary:", error);
    throw new Error("Failed to generate financial commentary");
  }
}

export interface BudgetAnalysisData {
  currentYear: number;
  nextYear: number;
  historicalData: {
    monthlyRevenue: Array<{ month: string; amount: number }>;
    monthlyExpenses: Array<{ month: string; amount: number }>;
    averageCollectionRate: number;
  };
  currentAssessment: number;
  totalUnits: number;
  currentYearProjections: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  };
  expenseCategories: Array<{
    category: string;
    currentYearTotal: number;
    averageMonthly: number;
    trend: string; // 'increasing', 'stable', 'decreasing'
  }>;
  capitalNeeds: Array<{
    item: string;
    estimatedCost: number;
    urgency: string; // 'immediate', 'within_year', 'future'
  }>;
  reserveFundBalance: number;
  reserveFundTarget: number;
  delinquencyRate: number;
}

export async function generateBudgetProposal(data: BudgetAnalysisData): Promise<{
  executiveSummary: string;
  recommendedAssessment: number;
  assessmentChange: string;
  scenarios: {
    conservative: any;
    moderate: any;
    optimistic: any;
  };
  risks: string[];
  recommendations: string[];
}> {
  const prompt = `You are a financial consultant preparing a budget proposal for Heritage Condominium Association (24-unit building, North Miami, FL) for ${data.nextYear}.

CURRENT SITUATION (${data.currentYear}):
- Current Monthly Assessment: $${data.currentAssessment.toLocaleString()} per unit
- Total Units: ${data.totalUnits}
- Projected ${data.currentYear} Revenue: $${data.currentYearProjections.totalRevenue.toLocaleString()}
- Projected ${data.currentYear} Expenses: $${data.currentYearProjections.totalExpenses.toLocaleString()}
- Projected ${data.currentYear} Net Income: $${data.currentYearProjections.netIncome.toLocaleString()}
- Average Collection Rate: ${data.historicalData.averageCollectionRate}%
- Current Delinquency Rate: ${data.delinquencyRate}%
- Reserve Fund: $${data.reserveFundBalance.toLocaleString()} (Target: $${data.reserveFundTarget.toLocaleString()})

EXPENSE TRENDS:
${data.expenseCategories.map(e => `- ${e.category}: $${e.currentYearTotal.toLocaleString()} annually (${e.trend})`).join('\n')}

CAPITAL NEEDS:
${data.capitalNeeds.map(c => `- ${c.item}: $${c.estimatedCost.toLocaleString()} (${c.urgency})`).join('\n')}

TASK: Create a comprehensive ${data.nextYear} budget proposal with THREE scenarios:

1. **Conservative Scenario**: Assumes 3-5% expense inflation, maintains current service levels, minimal capital projects, builds reserves cautiously.

2. **Moderate Scenario** (RECOMMENDED): Assumes realistic 4-6% expense inflation, addresses critical capital needs, maintains reserve targets, potential small assessment increase.

3. **Optimistic Scenario**: Assumes best-case collection rates, controlled expense growth, aggressive capital improvements, strong reserve funding.

For EACH scenario, provide:
- Recommended monthly assessment per unit
- Assessment change percentage vs. current
- Projected annual revenue (considering collection rate)
- Projected annual expenses by category
- Projected net income
- Capital projects included
- Reserve fund impact
- Key assumptions

Also provide:
- Executive Summary (2-3 paragraphs)
- Top 5-7 identified risks
- Top 5-7 actionable recommendations

Return your response as a JSON object with this structure:
{
  "executiveSummary": "2-3 paragraph summary...",
  "recommendedAssessment": 625.00,
  "assessmentChange": "+3.5%",
  "scenarios": {
    "conservative": {
      "monthlyAssessment": 600,
      "assessmentChange": "-1.5%",
      "annualRevenue": 172800,
      "annualExpenses": 165000,
      "netIncome": 7800,
      "collectionRateAssumed": 83,
      "expenseBreakdown": [
        {"category": "Insurance", "amount": 48000},
        {"category": "Management Fees", "amount": 24000}
      ],
      "capitalProjects": [{"name": "Emergency repairs only", "cost": 5000}],
      "reserveImpact": "+3500",
      "keyAssumptions": ["3% expense inflation", "83% collection rate", "No elective capital projects"]
    },
    "moderate": { ... },
    "optimistic": { ... }
  },
  "risks": [
    "Delinquency rate of ${data.delinquencyRate}% threatens cash flow stability",
    "Insurance costs likely to increase 8-12% in ${data.nextYear}",
    ...
  ],
  "recommendations": [
    "Implement aggressive collections process to improve from ${data.historicalData.averageCollectionRate}% to 90%+ collection rate",
    "Establish $50,000 emergency fund within reserve account",
    ...
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation, just the JSON object.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      temperature: 0.8,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("No valid JSON found in response");
    }
    
    throw new Error("Unexpected response format from Claude");
  } catch (error) {
    console.error("Error generating budget proposal:", error);
    throw new Error("Failed to generate budget proposal");
  }
}
