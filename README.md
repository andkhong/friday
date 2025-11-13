# 🚀 Acet Labs - AI-Powered Personal Finance Platform

A comprehensive personal finance management platform that leverages artificial intelligence to optimize financial decisions in real-time, providing credit card recommendations, investment advice, debt reduction strategies, and holistic financial health monitoring.

![Dashboard Preview](./docs/dashboard-preview.png)

## ✨ Key Features

### 🎯 Real-Time Financial Optimization
- **Smart Credit Card Selector**: AI recommends the best card for each purchase to maximize rewards
- **Point-of-Sale Intelligence**: Get instant recommendations before making transactions
- **Rewards Tracking**: Automatically track and optimize credit card rewards across all cards

### 🤖 AI Financial Advisor
- **Powered by Claude 3.5 Sonnet**: Advanced reasoning for complex financial scenarios
- **Personalized Recommendations**: Debt reduction, investment strategies, spending optimization
- **Natural Language Queries**: Ask questions like "How can I save $10k in 6 months?"
- **Predictive Analytics**: ML-powered forecasting for spending patterns and financial trends

### 📊 Comprehensive Dashboard
- **Net Worth Tracking**: Real-time view of all financial accounts
- **Spending Analytics**: Category breakdown with interactive visualizations
- **Goal Management**: Track progress toward financial goals
- **Transaction History**: Detailed view with intelligent categorization

### 🔗 Seamless Integration
- **Multi-Institution Support**: Connect all your bank accounts, credit cards, and investments
- **Plaid Integration**: Secure access to 12,000+ financial institutions
- **Real-Time Sync**: Automatic transaction updates
- **Investment Tracking**: Monitor stocks, bonds, and crypto portfolios

### 🎨 Modern, Professional UI
- **Built with Next.js 14**: Server-side rendering and optimal performance
- **Responsive Design**: Beautiful experience on desktop, tablet, and mobile
- **Dark Mode Support**: Easy on the eyes during late-night budgeting sessions
- **Accessibility First**: WCAG 2.1 AA compliant

---

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
- **Type Safety**: TypeScript

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful + WebSocket for real-time updates
- **Authentication**: JWT + Supabase Auth

#### Database
- **Primary**: PostgreSQL 15+ (via Supabase)
- **Caching**: Redis (Upstash)
- **Why PostgreSQL?**
  - ACID compliance (critical for financial data)
  - Advanced JSON support (JSONB)
  - Row-level security
  - Time-series capabilities
  - Proven at scale in fintech

#### AI & Machine Learning
- **LLM**: Claude 3.5 Sonnet (Anthropic)
- **Why Claude?**
  - Superior reasoning for financial analysis
  - 200K token context window
  - Excellent safety guardrails
  - Native function calling
  - Cost-effective at scale

#### Infrastructure
- **Hosting**: Vercel (Frontend) + Railway (Backend)
- **Database**: Supabase
- **Caching**: Upstash Redis
- **File Storage**: AWS S3
- **Monitoring**: Sentry + PostHog

---

## 🚦 Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 15+ (or Supabase account)
- Anthropic API key
- Plaid API credentials
- Redis instance (optional, but recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/acet-labs-finance.git
cd acet-labs-finance
```

### 2. Set Up the Database

#### Option A: Using Supabase (Recommended)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the schema:
   ```bash
   # Copy the schema to Supabase SQL Editor
   cat database/schema.sql
   ```
4. Copy your connection details from Project Settings

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb acet_finance

# Run schema
psql acet_finance < database/schema.sql
```

### 3. Configure Environment Variables

```bash
# Backend
cd backend
cp ../.env.example .env
# Edit .env with your actual credentials

# Frontend
cd ../frontend
cp ../.env.example .env
# Edit .env with your actual credentials
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server runs on http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### 6. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 API Keys Setup

### Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your keys from Project Settings → API
4. Add to `.env`:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJxxx...
   ```

### Anthropic Claude

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Navigate to API Keys section
3. Create a new API key
4. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```

**Cost Estimate**: ~$50/month for 1M tokens (1000 users making 100 AI requests each)

### Plaid

1. Sign up at [dashboard.plaid.com](https://dashboard.plaid.com/signup)
2. Get your credentials from Team Settings → Keys
3. Start with Sandbox environment (free)
4. Add to `.env`:
   ```
   PLAID_CLIENT_ID=xxxxx
   PLAID_SECRET=xxxxx
   PLAID_ENV=sandbox
   ```

**Production Pricing**: $0.60 per active user per month

### Optional: Redis (Upstash)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the connection URL
4. Add to `.env`:
   ```
   REDIS_URL=rediss://xxxxx@xxxxx.upstash.io:6379
   ```

**Free Tier**: 10,000 commands per day

---

## 📁 Project Structure

```
acet-labs-finance/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js 14 app router
│   ├── components/          # React components
│   ├── lib/                 # Utilities and helpers
│   ├── public/              # Static assets
│   ├── styles/              # Global styles
│   └── package.json
│
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── server.ts       # Main server file
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Helper functions
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── database/                # Database schemas and migrations
│   ├── schema.sql          # PostgreSQL schema
│   ├── migrations/         # Database migrations
│   └── seeds/              # Sample data
│
├── shared/                  # Shared code between frontend and backend
│   └── types/              # Shared TypeScript types
│
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── DEPLOYMENT.md       # Deployment guide
│   └── CONTRIBUTING.md     # Contribution guidelines
│
├── .env.example            # Environment variables template
├── ARCHITECTURE.md         # Detailed architecture documentation
└── README.md               # This file
```

---

## 🎨 Key Components

### Frontend Components

```typescript
// Main Dashboard
frontend/app/dashboard/page.tsx

// Credit Card Optimizer Widget
frontend/components/CardOptimizer.tsx

// AI Chat Interface
frontend/components/AIAdvisor.tsx

// Transaction List
frontend/components/TransactionList.tsx

// Financial Goals Tracker
frontend/components/GoalsTracker.tsx

// Net Worth Chart
frontend/components/NetWorthChart.tsx
```

### Backend API Endpoints

```
Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

Accounts
GET    /api/accounts
POST   /api/accounts/link
POST   /api/accounts/sync

Transactions
GET    /api/transactions
GET    /api/transactions/summary

AI Recommendations
POST   /api/recommendations/generate
GET    /api/recommendations/card-optimizer
POST   /api/recommendations/ask

Analytics
GET    /api/analytics/net-worth
GET    /api/analytics/spending
```

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend Tests

```bash
cd backend
npm run test
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Backend (Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd backend
railway up
```

### Database (Supabase)

1. Your Supabase project is already hosted
2. Run migrations:
   ```bash
   npm run migrate:prod
   ```

---

## 📊 Performance Metrics

### Target Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **API Response Time**: < 200ms (p95)
- **AI Response Time**: < 3s
- **Uptime**: 99.9%

### Optimization Strategies
- Server-side rendering (Next.js)
- Edge caching (Vercel)
- Database query optimization
- Redis caching layer
- Image optimization
- Code splitting
- Lazy loading

---

## 🔒 Security

### Implemented Security Measures
- ✅ Row-level security (PostgreSQL RLS)
- ✅ JWT authentication with refresh tokens
- ✅ Rate limiting (100 req/min per user)
- ✅ HTTPS/TLS encryption
- ✅ API key rotation policy
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Secure password hashing (bcrypt)
- ✅ PCI DSS compliance (via Plaid)
- ✅ Audit logging

### Security Best Practices
- Never commit `.env` files
- Rotate API keys quarterly
- Use different credentials for dev/prod
- Enable 2FA on all service accounts
- Regular security audits
- Dependency vulnerability scanning
- Backup encryption

---

## 💰 Cost Breakdown

### MVP Stage (<1,000 users)
| Service | Cost | Notes |
|---------|------|-------|
| Supabase | $0 | Free tier: 500MB DB |
| Vercel | $0 | Free tier |
| Railway | $5 | Backend hosting |
| Anthropic | $50 | ~1M tokens/month |
| Plaid | $0 | Development mode |
| **Total** | **~$55/month** | |

### Growth Stage (1K-10K users)
| Service | Cost | Notes |
|---------|------|-------|
| Supabase | $25 | Pro tier |
| Vercel | $20 | Pro tier |
| Railway | $50 | Scaled compute |
| Anthropic | $300 | ~10M tokens/month |
| Plaid | $600-6,000 | $0.60/active user |
| Redis | $10 | Upstash |
| Monitoring | $20 | Sentry + PostHog |
| **Total** | **~$1,025-6,425/month** | |

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] User authentication
- [x] Account linking (Plaid)
- [x] Transaction sync and categorization
- [x] Basic dashboard
- [x] Credit card management
- [x] AI recommendations

### Phase 2: Enhanced Features (Q1 2026)
- [ ] Investment portfolio tracking
- [ ] Tax optimization suggestions
- [ ] Bill payment reminders
- [ ] Recurring transaction detection
- [ ] Mobile app (React Native)
- [ ] Advanced budgeting tools

### Phase 3: Advanced Intelligence (Q2 2026)
- [ ] Predictive spending forecasts
- [ ] Automated savings rules
- [ ] Smart debt payoff strategies
- [ ] Investment robo-advisor
- [ ] Credit score monitoring
- [ ] Financial health score

### Phase 4: Scale & Expansion (Q3 2026)
- [ ] International market support
- [ ] Multi-currency support
- [ ] Cryptocurrency integration
- [ ] Family account sharing
- [ ] White-label solution
- [ ] Open banking API

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Anthropic** for Claude API
- **Plaid** for financial data aggregation
- **Supabase** for backend infrastructure
- **Vercel** for hosting platform
- **shadcn/ui** for UI components
- **Recharts** for data visualization

---

## 📞 Support

- **Documentation**: [docs.acetlabs.com](https://docs.acetlabs.com)
- **Email**: support@acetlabs.com
- **Discord**: [Join our community](https://discord.gg/acetlabs)
- **Twitter**: [@AcetLabs](https://twitter.com/acetlabs)

---

## ⚠️ Disclaimer

This platform provides financial information and analysis but is not a substitute for professional financial advice. Always consult with a qualified financial advisor for personalized guidance. We do not provide investment advice or recommendations to buy or sell securities.

---

**Built with ❤️ by the Acet Labs team**
