import Anthropic from '@anthropic-ai/sdk'

interface CreditCard {
  id: string
  cardName: string
  issuer: string
  rewardsStructure: {
    baseRate: number
    categories: { [key: string]: number }
  }
  annualFee: number
  benefits: string[]
}

interface Transaction {
  merchant: string
  amount: number
  category?: string
  location?: string
}

interface CardRecommendation {
  optimalCard: CreditCard
  rewardsAmount: number
  reasoning: string
  alternativeCards: Array<{
    card: CreditCard
    rewardsAmount: number
  }>
  savingsVsCurrentCard?: number
}

interface FinancialProfile {
  accounts: any[]
  transactions: any[]
  goals: any[]
  monthlyIncome?: number
  totalDebt?: number
  creditScore?: number
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive'
}

interface AIRecommendation {
  type: 'credit_card' | 'savings' | 'investment' | 'debt_reduction' | 'spending'
  title: string
  description: string
  reasoning: string
  actionItems: string[]
  expectedBenefit: number
  confidence: number
  timeframe?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export class AIFinancialService {
  private anthropic: Anthropic
  private model: string = 'claude-3-5-sonnet-20241022'

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey })
  }

  /**
   * Optimizes credit card selection for a specific transaction
   * This is the core feature that recommends the best card at point of sale
   */
  async optimizeCardForTransaction(
    transaction: Transaction,
    userCards: CreditCard[],
    currentCard?: CreditCard
  ): Promise<CardRecommendation> {
    const prompt = `You are an expert credit card rewards optimizer. Analyze this transaction and recommend the optimal credit card to maximize rewards.

Transaction Details:
- Merchant: ${transaction.merchant}
- Amount: $${transaction.amount}
- Category: ${transaction.category || 'Unknown'}
${transaction.location ? `- Location: ${transaction.location}` : ''}

Available Credit Cards:
${JSON.stringify(userCards, null, 2)}

${currentCard ? `Current Card Being Used: ${currentCard.cardName}` : ''}

Instructions:
1. First, intelligently categorize this transaction if category is unknown
2. Calculate exact rewards for EACH card based on their rewards structure
3. Consider:
   - Base rewards rate
   - Category-specific bonuses
   - Annual fees (amortized per transaction)
   - Any special promotions or multipliers
4. Recommend the card with highest net rewards value
5. Provide clear reasoning for the recommendation
6. Show alternative options ranked by rewards

Respond with ONLY valid JSON in this exact format:
{
  "category": "dining|groceries|gas|travel|shopping|other",
  "optimalCardId": "card_id",
  "rewardsAmount": 12.50,
  "reasoning": "Detailed explanation of why this card is best",
  "calculations": {
    "card_name": {
      "rewardsRate": "3%",
      "rewardsAmount": 12.50,
      "effectiveValue": 12.35
    }
  },
  "alternatives": [
    {
      "cardId": "card_id",
      "rewardsAmount": 10.00,
      "reason": "Brief explanation"
    }
  ],
  "savingsVsCurrentCard": 5.50
}`

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 2048,
        temperature: 0.3, // Lower temperature for more deterministic financial calculations
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}'

      // Parse AI response
      const result = JSON.parse(this.cleanJsonResponse(responseText))

      // Find the optimal card
      const optimalCard = userCards.find(c => c.id === result.optimalCardId)
      if (!optimalCard) {
        throw new Error('Optimal card not found in user cards')
      }

      // Build alternatives
      const alternativeCards = result.alternatives
        .map((alt: any) => {
          const card = userCards.find(c => c.id === alt.cardId)
          return card ? {
            card,
            rewardsAmount: alt.rewardsAmount,
            reason: alt.reason
          } : null
        })
        .filter(Boolean)

      return {
        optimalCard,
        rewardsAmount: result.rewardsAmount,
        reasoning: result.reasoning,
        alternativeCards,
        savingsVsCurrentCard: result.savingsVsCurrentCard
      }
    } catch (error) {
      console.error('Error optimizing card selection:', error)
      throw new Error('Failed to optimize card selection')
    }
  }

  /**
   * Generates comprehensive financial recommendations
   * Analyzes user's complete financial profile to suggest improvements
   */
  async generateFinancialRecommendations(
    profile: FinancialProfile,
    count: number = 5
  ): Promise<AIRecommendation[]> {
    const prompt = `You are a certified financial advisor analyzing a user's complete financial situation. Provide ${count} personalized, actionable recommendations to optimize their finances.

Financial Profile:
${JSON.stringify(profile, null, 2)}

Guidelines:
1. Analyze spending patterns, debt levels, savings rate, and goals
2. Identify opportunities for:
   - Credit card optimization (better rewards)
   - Debt reduction strategies (avalanche/snowball)
   - Savings optimization (high-yield accounts)
   - Investment opportunities (based on risk tolerance)
   - Spending adjustments (unnecessary subscriptions, etc.)
3. Calculate expected annual benefit in dollars
4. Assign confidence score (0-100) based on data quality
5. Prioritize by impact and urgency
6. Provide specific, actionable steps

CRITICAL: Include proper disclaimers for investment and financial advice.

Respond with ONLY valid JSON array:
[
  {
    "type": "credit_card|savings|investment|debt_reduction|spending",
    "title": "Concise, actionable title",
    "description": "Detailed 2-3 sentence explanation",
    "reasoning": "Why this recommendation makes sense for this user",
    "actionItems": [
      "Specific step 1",
      "Specific step 2",
      "Specific step 3"
    ],
    "expectedBenefit": 1250.00,
    "confidence": 92,
    "timeframe": "3 months|6 months|1 year|2+ years",
    "priority": "low|medium|high|urgent",
    "disclaimer": "Optional disclaimer for investment/legal advice"
  }
]`

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '[]'

      const recommendations = JSON.parse(this.cleanJsonResponse(responseText))

      // Validate and sort by priority
      return recommendations
        .filter((rec: any) => this.validateRecommendation(rec))
        .sort((a: AIRecommendation, b: AIRecommendation) => {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw new Error('Failed to generate recommendations')
    }
  }

  /**
   * Analyzes spending patterns and detects anomalies
   */
  async analyzeSpendingPatterns(
    transactions: any[],
    historicalData?: any
  ): Promise<{
    insights: string[]
    anomalies: Array<{
      transaction: any
      reason: string
      severity: 'low' | 'medium' | 'high'
    }>
    trends: {
      increasing: string[]
      decreasing: string[]
      stable: string[]
    }
    categoryBreakdown: { [key: string]: number }
  }> {
    const prompt = `Analyze these transactions and identify spending patterns, anomalies, and trends.

Transactions (last 90 days):
${JSON.stringify(transactions.slice(0, 200), null, 2)}

${historicalData ? `Historical Comparison Data:\n${JSON.stringify(historicalData, null, 2)}` : ''}

Provide:
1. Key insights about spending behavior
2. Unusual transactions (anomalies)
3. Spending trends by category
4. Category breakdown with totals

Respond with ONLY valid JSON:
{
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "anomalies": [
    {
      "transactionId": "id",
      "merchant": "name",
      "amount": 500,
      "reason": "Why this is unusual",
      "severity": "low|medium|high"
    }
  ],
  "trends": {
    "increasing": ["category1", "category2"],
    "decreasing": ["category3"],
    "stable": ["category4"]
  },
  "categoryBreakdown": {
    "dining": 1250.50,
    "groceries": 980.00
  }
}`

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 3072,
        temperature: 0.4,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}'

      return JSON.parse(this.cleanJsonResponse(responseText))
    } catch (error) {
      console.error('Error analyzing spending patterns:', error)
      throw new Error('Failed to analyze spending patterns')
    }
  }

  /**
   * Creates a personalized debt payoff strategy
   */
  async createDebtPayoffPlan(debts: Array<{
    name: string
    balance: number
    interestRate: number
    minimumPayment: number
  }>, extraPayment: number): Promise<{
    strategy: 'avalanche' | 'snowball' | 'hybrid'
    reasoning: string
    payoffOrder: string[]
    timeline: number // months
    totalInterestSaved: number
    monthlyPlan: Array<{
      month: number
      payments: { [debtName: string]: number }
    }>
  }> {
    const prompt = `Create an optimal debt payoff strategy for this user.

Debts:
${JSON.stringify(debts, null, 2)}

Extra Monthly Payment Available: $${extraPayment}

Instructions:
1. Calculate both avalanche (highest interest first) and snowball (lowest balance first)
2. Recommend the optimal strategy based on:
   - Total interest savings
   - Psychological factors (quick wins)
   - Time to debt freedom
3. Create month-by-month payment plan
4. Calculate total interest saved vs minimum payments

Respond with ONLY valid JSON:
{
  "strategy": "avalanche|snowball|hybrid",
  "reasoning": "Why this strategy is best for this user",
  "payoffOrder": ["debt1", "debt2", "debt3"],
  "timeline": 24,
  "totalInterestSaved": 5420.50,
  "monthlyPlan": [
    {
      "month": 1,
      "payments": {
        "Credit Card A": 500,
        "Credit Card B": 50
      }
    }
  ]
}`

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 3072,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}'

      return JSON.parse(this.cleanJsonResponse(responseText))
    } catch (error) {
      console.error('Error creating debt payoff plan:', error)
      throw new Error('Failed to create debt payoff plan')
    }
  }

  /**
   * Answers natural language financial questions
   */
  async askFinancialAdvisor(
    question: string,
    userContext: FinancialProfile
  ): Promise<string> {
    const systemPrompt = `You are an expert personal financial advisor with certifications in financial planning, tax strategy, and investment management. You provide clear, actionable advice while being:

1. **Cautious**: Always include appropriate disclaimers
2. **Specific**: Give concrete numbers and timelines when possible
3. **Educational**: Explain concepts clearly
4. **Personalized**: Tailor advice to the user's situation
5. **Practical**: Focus on actionable steps

CRITICAL RULES:
- Never guarantee investment returns
- Always mention risk factors
- Recommend consulting professionals for complex situations (tax, legal, etc.)
- Don't provide specific stock/crypto recommendations
- Be transparent about limitations of AI advice

User's Financial Context:
${JSON.stringify(userContext, null, 2)}`

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 2048,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: question
          }
        ]
      })

      return message.content[0].type === 'text' 
        ? message.content[0].text 
        : 'I apologize, but I was unable to process your question. Please try rephrasing it.'
    } catch (error) {
      console.error('Error in financial advisor chat:', error)
      throw new Error('Failed to get advisor response')
    }
  }

  /**
   * Categorizes a transaction using AI
   */
  async categorizeTransaction(
    description: string,
    merchant: string,
    amount: number
  ): Promise<{
    category: string
    subcategory?: string
    confidence: number
  }> {
    const prompt = `Categorize this transaction:

Description: ${description}
Merchant: ${merchant}
Amount: $${amount}

Choose from these categories:
- Dining & Restaurants
- Groceries
- Transportation (gas, parking, public transit, rideshare)
- Shopping (retail, online shopping, clothing)
- Entertainment (movies, concerts, streaming)
- Travel (hotels, flights, vacation)
- Healthcare (medical, pharmacy, fitness)
- Utilities (electric, water, internet, phone)
- Housing (rent, mortgage, maintenance)
- Insurance
- Education
- Personal Care
- Subscriptions
- Other

Respond with ONLY valid JSON:
{
  "category": "exact category name from list above",
  "subcategory": "optional more specific category",
  "confidence": 95
}`

    try {
      const message = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 256,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '{}'

      return JSON.parse(this.cleanJsonResponse(responseText))
    } catch (error) {
      console.error('Error categorizing transaction:', error)
      return {
        category: 'Other',
        confidence: 0
      }
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Cleans AI response to extract valid JSON
   */
  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    
    // Try to find JSON object/array in the text
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/m)
    if (jsonMatch) {
      cleaned = jsonMatch[1]
    }
    
    return cleaned.trim()
  }

  /**
   * Validates a recommendation object
   */
  private validateRecommendation(rec: any): boolean {
    return (
      rec &&
      typeof rec.type === 'string' &&
      typeof rec.title === 'string' &&
      typeof rec.description === 'string' &&
      Array.isArray(rec.actionItems) &&
      typeof rec.expectedBenefit === 'number' &&
      typeof rec.confidence === 'number' &&
      rec.confidence >= 0 &&
      rec.confidence <= 100
    )
  }
}

// Export singleton instance factory
export function createAIFinancialService(apiKey: string): AIFinancialService {
  return new AIFinancialService(apiKey)
}
