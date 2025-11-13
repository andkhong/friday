'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  Target, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

// Types
interface Transaction {
  id: string
  amount: number
  merchant: string
  category: string
  date: string
  cardUsed?: string
  optimalCard?: string
  savingsOpportunity?: number
}

interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  change: number
  changePercent: number
}

interface AIRecommendation {
  id: string
  type: 'card' | 'savings' | 'investment' | 'debt'
  title: string
  description: string
  impact: number
  confidence: number
  status: 'new' | 'active' | 'completed'
}

// Mock Data
const accountsData: Account[] = [
  { id: '1', name: 'Chase Checking', type: 'checking', balance: 12450.32, change: 1250.50, changePercent: 11.2 },
  { id: '2', name: 'Ally Savings', type: 'savings', balance: 28900.00, change: 450.00, changePercent: 1.6 },
  { id: '3', name: 'Chase Sapphire Reserve', type: 'credit', balance: -2340.50, change: -340.50, changePercent: -17.0 },
  { id: '4', name: 'Vanguard Investment', type: 'investment', balance: 45600.00, change: 3200.00, changePercent: 7.5 }
]

const netWorthData = [
  { month: 'Jan', value: 78000, investment: 42000, savings: 26000, checking: 10000 },
  { month: 'Feb', value: 79500, investment: 42800, savings: 26500, checking: 10200 },
  { month: 'Mar', value: 81200, investment: 43600, savings: 27000, checking: 10600 },
  { month: 'Apr', value: 82100, investment: 44200, savings: 27200, checking: 10700 },
  { month: 'May', value: 83800, investment: 45000, savings: 27800, checking: 11000 },
  { month: 'Jun', value: 84600, investment: 45600, savings: 28000, checking: 11000 }
]

const spendingData = [
  { category: 'Dining', amount: 1250, percentage: 28, color: '#3b82f6' },
  { category: 'Groceries', amount: 980, percentage: 22, color: '#10b981' },
  { category: 'Transportation', amount: 650, percentage: 15, color: '#f59e0b' },
  { category: 'Entertainment', amount: 520, percentage: 12, color: '#8b5cf6' },
  { category: 'Shopping', amount: 450, percentage: 10, color: '#ec4899' },
  { category: 'Other', amount: 550, percentage: 13, color: '#6b7280' }
]

const recentTransactions: Transaction[] = [
  { id: '1', amount: -45.32, merchant: 'Whole Foods', category: 'Groceries', date: '2025-11-11', cardUsed: 'Chase Freedom', optimalCard: 'Amex Blue Cash', savingsOpportunity: 2.27 },
  { id: '2', amount: -89.50, merchant: 'Shell Gas Station', category: 'Transportation', date: '2025-11-10', cardUsed: 'Chase Sapphire', optimalCard: 'Same', savingsOpportunity: 0 },
  { id: '3', amount: -125.00, merchant: 'Nobu Restaurant', category: 'Dining', date: '2025-11-10', cardUsed: 'Chase Sapphire Reserve', optimalCard: 'Same', savingsOpportunity: 0 },
  { id: '4', amount: 2500.00, merchant: 'Payroll Deposit', category: 'Income', date: '2025-11-09', cardUsed: '' },
  { id: '5', amount: -23.99, merchant: 'Netflix', category: 'Entertainment', date: '2025-11-09', cardUsed: 'Chase Freedom' }
]

const aiRecommendations: AIRecommendation[] = [
  {
    id: '1',
    type: 'card',
    title: 'Switch to Amex Blue Cash for groceries',
    description: 'You spend $980/month on groceries. Amex Blue Cash offers 6% back vs your current 1.5%. Potential savings: $44/month',
    impact: 528,
    confidence: 95,
    status: 'new'
  },
  {
    id: '2',
    type: 'debt',
    title: 'Accelerate credit card payoff',
    description: 'Pay an extra $500/month to eliminate 19.99% APR debt 8 months earlier, saving $1,240 in interest',
    impact: 1240,
    confidence: 88,
    status: 'new'
  },
  {
    id: '3',
    type: 'savings',
    title: 'Optimize emergency fund allocation',
    description: 'Move $5,000 from checking to high-yield savings (4.5% APY) to earn an extra $225/year',
    impact: 225,
    confidence: 92,
    status: 'active'
  }
]

const Dashboard: React.FC = () => {
  const [netWorth, setNetWorth] = useState(84609.82)
  const [monthlyChange, setMonthlyChange] = useState(4809.82)
  const [selectedPeriod, setSelectedPeriod] = useState('6M')
  const [isAIThinking, setIsAIThinking] = useState(false)

  const calculateTotalBalance = () => {
    return accountsData.reduce((sum, account) => {
      return sum + (account.type === 'credit' ? 0 : account.balance)
    }, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount))
  }

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Acet Labs</h1>
                <p className="text-sm text-slate-500">AI-Powered Finance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Connect Account
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Ask AI Advisor
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Net Worth Summary */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Total Net Worth</p>
                <h2 className="text-5xl font-bold mb-2">{formatCurrency(netWorth)}</h2>
                <div className="flex items-center space-x-2">
                  {monthlyChange >= 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-green-300" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 text-red-300" />
                  )}
                  <span className="text-lg font-semibold">
                    {formatCurrency(monthlyChange)} ({formatPercent((monthlyChange / (netWorth - monthlyChange)) * 100)})
                  </span>
                  <span className="text-blue-200 text-sm">this month</span>
                </div>
              </div>
              <div className="flex space-x-2">
                {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      selectedPeriod === period
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-600/30 text-white hover:bg-blue-600/50'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Net Worth Chart */}
            <div className="h-48 -mx-4 -mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthData}>
                  <defs>
                    <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ffffff" 
                    strokeWidth={3}
                    fill="url(#netWorthGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {accountsData.map((account) => (
            <div key={account.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">{account.name}</p>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {account.type === 'credit' && account.balance < 0 ? '-' : ''}
                    {formatCurrency(account.balance)}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  account.type === 'checking' ? 'bg-blue-100' :
                  account.type === 'savings' ? 'bg-green-100' :
                  account.type === 'credit' ? 'bg-orange-100' :
                  'bg-purple-100'
                }`}>
                  {account.type === 'checking' && <Wallet className="w-5 h-5 text-blue-600" />}
                  {account.type === 'savings' && <DollarSign className="w-5 h-5 text-green-600" />}
                  {account.type === 'credit' && <CreditCard className="w-5 h-5 text-orange-600" />}
                  {account.type === 'investment' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wider">{account.type}</span>
                <div className="flex items-center space-x-1">
                  {account.changePercent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-semibold ${
                    account.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercent(account.changePercent)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Recommendations */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 mb-8 border border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Recommendations</h3>
                <p className="text-sm text-slate-600">Personalized insights to optimize your finances</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {aiRecommendations.map((rec) => (
              <div key={rec.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      rec.type === 'card' ? 'bg-blue-100' :
                      rec.type === 'debt' ? 'bg-red-100' :
                      rec.type === 'savings' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      {rec.type === 'card' && <CreditCard className="w-5 h-5 text-blue-600" />}
                      {rec.type === 'debt' && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {rec.type === 'savings' && <Target className="w-5 h-5 text-green-600" />}
                      {rec.type === 'investment' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-green-600 font-semibold">
                          Save {formatCurrency(rec.impact)}/year
                        </span>
                        <span className="text-slate-500">
                          {rec.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      Dismiss
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spending & Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Spending Breakdown */}
          <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Spending Breakdown</h3>
            <div className="h-64 flex items-center justify-center mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {spendingData.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-700">{item.category}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                    <span className="text-xs text-slate-500">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      {transaction.amount > 0 ? (
                        <ArrowDownRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{transaction.merchant}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-slate-500">{transaction.category}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{new Date(transaction.date).toLocaleDateString()}</span>
                        {transaction.savingsOpportunity && transaction.savingsOpportunity > 0 && (
                          <>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-orange-600 font-medium">
                              <Zap className="w-3 h-3 inline mr-1" />
                              Could save {formatCurrency(transaction.savingsOpportunity)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-slate-900'
                    }`}>
                      {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    {transaction.cardUsed && (
                      <p className="text-xs text-slate-500 mt-1">{transaction.cardUsed}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Goals */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Financial Goals</h3>
            <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
              Add Goal
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">Emergency Fund</h4>
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div className="mb-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold text-slate-900">$18,000</span>
                  <span className="text-sm text-slate-600">of $25,000</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
              <p className="text-sm text-slate-600">72% complete • 5 months remaining</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">Debt Payoff</h4>
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="mb-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold text-slate-900">$4,200</span>
                  <span className="text-sm text-slate-600">of $8,500</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '49%' }} />
                </div>
              </div>
              <p className="text-sm text-slate-600">49% complete • 12 months remaining</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">Vacation Fund</h4>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div className="mb-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold text-slate-900">$3,800</span>
                  <span className="text-sm text-slate-600">of $6,000</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '63%' }} />
                </div>
              </div>
              <p className="text-sm text-slate-600">63% complete • 3 months remaining</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
