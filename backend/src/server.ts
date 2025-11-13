import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { Configuration as PlaidConfiguration, PlaidApi, PlaidEnvironments } from 'plaid'

// Environment variables
const PORT = process.env.PORT || 3001
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY!
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID!
const PLAID_SECRET = process.env.PLAID_SECRET!

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
const plaidConfig = new PlaidConfiguration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
})
const plaidClient = new PlaidApi(plaidConfig)

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// ==================== AUTHENTICATION ====================

interface AuthRequest extends Request {
  userId?: string
}

// JWT verification middleware (simplified - use proper JWT in production)
const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.userId = user.id
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) throw error

    res.status(201).json({ 
      message: 'User registered successfully',
      user: data.user,
      session: data.session
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    res.json({ 
      user: data.user,
      session: data.session
    })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

// ==================== ACCOUNTS ====================

// Get all accounts
app.get('/api/accounts', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ accounts: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Link new account via Plaid
app.post('/api/accounts/link', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { publicToken, institutionName } = req.body

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    })
    
    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // Get account details
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken
    })

    // Store accounts in database
    const accounts = accountsResponse.data.accounts.map(account => ({
      user_id: req.userId,
      institution_name: institutionName,
      plaid_account_id: account.account_id,
      account_type: account.type,
      balance: account.balances.current || 0,
      currency: account.balances.iso_currency_code || 'USD',
      last_synced: new Date().toISOString(),
      metadata: {
        plaid_item_id: itemId,
        plaid_access_token: accessToken, // Encrypt this in production!
        account_name: account.name,
        mask: account.mask
      }
    }))

    const { data, error } = await supabase
      .from('financial_accounts')
      .insert(accounts)
      .select()

    if (error) throw error

    res.status(201).json({ 
      message: 'Accounts linked successfully',
      accounts: data
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Sync account transactions
app.post('/api/accounts/sync', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.body

    // Get account from database
    const { data: account, error: accountError } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', req.userId)
      .single()

    if (accountError || !account) throw new Error('Account not found')

    const accessToken = account.metadata.plaid_access_token

    // Fetch transactions from Plaid
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Last 30 days
    
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    })

    // Process and categorize transactions using AI
    const transactions = await Promise.all(
      transactionsResponse.data.transactions.map(async (txn) => {
        // Use Claude for intelligent categorization
        const category = await categorizeTransaction(txn.name, txn.merchant_name || '')

        return {
          account_id: accountId,
          user_id: req.userId,
          amount: txn.amount,
          description: txn.name,
          merchant_name: txn.merchant_name,
          category: category,
          transaction_date: txn.date,
          pending: txn.pending,
          metadata: {
            plaid_transaction_id: txn.transaction_id,
            payment_channel: txn.payment_channel
          }
        }
      })
    )

    // Insert transactions
    const { data, error } = await supabase
      .from('transactions')
      .upsert(transactions, { 
        onConflict: 'metadata->plaid_transaction_id',
        ignoreDuplicates: true 
      })
      .select()

    if (error) throw error

    // Update last sync time
    await supabase
      .from('financial_accounts')
      .update({ last_synced: new Date().toISOString() })
      .eq('id', accountId)

    res.json({ 
      message: 'Transactions synced successfully',
      count: data?.length || 0
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== TRANSACTIONS ====================

// Get transactions with filters
app.get('/api/transactions', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, category, limit = 50 } = req.query

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.userId)

    if (from) query = query.gte('transaction_date', from)
    if (to) query = query.lte('transaction_date', to)
    if (category) query = query.eq('category', category)

    query = query
      .order('transaction_date', { ascending: false })
      .limit(Number(limit))

    const { data, error } = await query

    if (error) throw error

    res.json({ transactions: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Get spending summary
app.get('/api/transactions/summary', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { period = '30' } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(period))

    const { data, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', req.userId)
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .lt('amount', 0) // Only expenses

    if (error) throw error

    // Aggregate by category
    const summary = data.reduce((acc: any, txn) => {
      const category = txn.category || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 }
      }
      acc[category].total += Math.abs(txn.amount)
      acc[category].count += 1
      return acc
    }, {})

    res.json({ summary, period: `${period} days` })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== AI RECOMMENDATIONS ====================

// Generate AI recommendations
app.post('/api/recommendations/generate', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    // Fetch user's financial data
    const [accountsRes, transactionsRes, goalsRes] = await Promise.all([
      supabase.from('financial_accounts').select('*').eq('user_id', req.userId),
      supabase.from('transactions').select('*').eq('user_id', req.userId).order('transaction_date', { ascending: false }).limit(100),
      supabase.from('financial_goals').select('*').eq('user_id', req.userId)
    ])

    const financialContext = {
      accounts: accountsRes.data,
      recentTransactions: transactionsRes.data,
      goals: goalsRes.data
    }

    // Use Claude to generate personalized recommendations
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are a certified financial advisor AI. Analyze this user's financial data and provide 3-5 actionable recommendations to optimize their finances.

Financial Data:
${JSON.stringify(financialContext, null, 2)}

For each recommendation, provide:
1. Type (credit_card, savings, investment, debt_reduction)
2. Title (concise, actionable)
3. Description (detailed explanation)
4. Expected annual benefit in dollars
5. Confidence score (0-100)
6. Specific action items

Format as JSON array of recommendations.`
      }]
    })

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : ''
    const recommendations = JSON.parse(aiResponse)

    // Store recommendations in database
    const { data, error } = await supabase
      .from('ai_recommendations')
      .insert(
        recommendations.map((rec: any) => ({
          user_id: req.userId,
          recommendation_type: rec.type,
          title: rec.title,
          description: rec.description,
          expected_benefit: rec.expectedBenefit,
          confidence_score: rec.confidence,
          action_items: rec.actionItems,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }))
      )
      .select()

    if (error) throw error

    res.json({ recommendations: data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Credit card optimizer
app.get('/api/recommendations/card-optimizer', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { merchant, amount } = req.query

    if (!merchant || !amount) {
      return res.status(400).json({ error: 'Merchant and amount required' })
    }

    // Get user's credit cards
    const { data: cards, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', req.userId)
      .eq('is_active', true)

    if (error) throw error

    // Use Claude to determine optimal card
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze which credit card would give the best rewards for this purchase:

Merchant: ${merchant}
Amount: $${amount}

Available Cards:
${JSON.stringify(cards, null, 2)}

Respond with JSON: { "optimalCard": "card_name", "rewardsAmount": number, "reasoning": "explanation" }`
      }]
    })

    const response = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const result = JSON.parse(response)

    res.json(result)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// AI Chat endpoint
app.post('/api/recommendations/ask', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { question } = req.body

    // Fetch user context
    const [accountsRes, transactionsRes] = await Promise.all([
      supabase.from('financial_accounts').select('*').eq('user_id', req.userId),
      supabase.from('transactions').select('*').eq('user_id', req.userId).limit(50)
    ])

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: `You are a personal financial advisor AI. Provide helpful, accurate financial advice while:
- Being cautious about risk
- Explaining concepts clearly
- Providing specific, actionable recommendations
- Disclosing when professional advice is needed

User's Financial Context:
Accounts: ${JSON.stringify(accountsRes.data)}
Recent Transactions: ${JSON.stringify(transactionsRes.data)}`,
      messages: [{
        role: 'user',
        content: question
      }]
    })

    const answer = message.content[0].type === 'text' ? message.content[0].text : ''

    res.json({ answer })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== ANALYTICS ====================

// Net worth calculation
app.get('/api/analytics/net-worth', authenticateUser, async (req: AuthRequest, res: Response) => {
  try {
    const { data: accounts, error } = await supabase
      .from('financial_accounts')
      .select('balance, account_type')
      .eq('user_id', req.userId)

    if (error) throw error

    const netWorth = accounts.reduce((sum, account) => {
      // Don't count credit card debt as negative net worth (it's already tracked elsewhere)
      if (account.account_type === 'credit') return sum
      return sum + (account.balance || 0)
    }, 0)

    const breakdown = {
      checking: accounts.filter(a => a.account_type === 'checking').reduce((s, a) => s + a.balance, 0),
      savings: accounts.filter(a => a.account_type === 'savings').reduce((s, a) => s + a.balance, 0),
      investment: accounts.filter(a => a.account_type === 'investment').reduce((s, a) => s + a.balance, 0),
    }

    res.json({ netWorth, breakdown })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== HELPER FUNCTIONS ====================

async function categorizeTransaction(description: string, merchant: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `Categorize this transaction into ONE of these categories: Dining, Groceries, Transportation, Entertainment, Shopping, Utilities, Healthcare, Other

Transaction: ${description}
Merchant: ${merchant}

Respond with only the category name.`
      }]
    })

    return message.content[0].type === 'text' ? message.content[0].text.trim() : 'Other'
  } catch {
    return 'Other'
  }
}

// ==================== ERROR HANDLING ====================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 API available at http://localhost:${PORT}/api`)
})

export default app
