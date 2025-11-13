-- AI-Powered Personal Finance Platform
-- PostgreSQL Database Schema (Optimized for Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- ==================== USERS TABLE ====================
-- Managed by Supabase Auth, but we extend with additional fields

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{
    "notifications": {
      "email": true,
      "push": true,
      "spending_alerts": true,
      "goal_reminders": true
    },
    "preferences": {
      "currency": "USD",
      "theme": "light",
      "dashboard_layout": "default"
    }
  }'::jsonb,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  risk_tolerance VARCHAR(20) DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ==================== FINANCIAL ACCOUNTS ====================

CREATE TABLE IF NOT EXISTS public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit', 'investment', 'loan', 'mortgage')),
  account_name VARCHAR(255),
  plaid_account_id VARCHAR(255),
  plaid_item_id VARCHAR(255),
  balance DECIMAL(15, 2) DEFAULT 0.00,
  available_balance DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  account_number_mask VARCHAR(10), -- Last 4 digits only
  routing_number_mask VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  is_manual BOOLEAN DEFAULT FALSE, -- User-added vs API-linked
  last_synced TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'active' CHECK (sync_status IN ('active', 'error', 'disconnected', 'reauth_required')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT positive_balance_for_assets CHECK (
    (account_type IN ('credit', 'loan', 'mortgage') OR balance >= 0)
  )
);

-- Indexes
CREATE INDEX idx_financial_accounts_user_id ON public.financial_accounts(user_id);
CREATE INDEX idx_financial_accounts_type ON public.financial_accounts(account_type);
CREATE INDEX idx_financial_accounts_active ON public.financial_accounts(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_financial_accounts_plaid ON public.financial_accounts(plaid_account_id) WHERE plaid_account_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON public.financial_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON public.financial_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON public.financial_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- ==================== TRANSACTIONS ====================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.financial_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT NOT NULL,
  merchant_name VARCHAR(255),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  transaction_date DATE NOT NULL,
  posted_date DATE,
  pending BOOLEAN DEFAULT FALSE,
  transaction_type VARCHAR(50) CHECK (transaction_type IN ('debit', 'credit', 'transfer', 'fee', 'interest')),
  payment_channel VARCHAR(50) CHECK (payment_channel IN ('online', 'in store', 'other')),
  location JSONB, -- {city, state, country, lat, lon}
  plaid_transaction_id VARCHAR(255) UNIQUE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(50) CHECK (recurring_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  tags TEXT[], -- User-defined tags
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_amount CHECK (amount != 0)
);

-- Indexes for high-performance queries
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON public.transactions(category);
CREATE INDEX idx_transactions_merchant ON public.transactions(merchant_name);
CREATE INDEX idx_transactions_amount ON public.transactions(amount);
CREATE INDEX idx_transactions_pending ON public.transactions(pending) WHERE pending = TRUE;
CREATE INDEX idx_transactions_plaid ON public.transactions(plaid_transaction_id) WHERE plaid_transaction_id IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_transactions_description_fts ON public.transactions USING gin(to_tsvector('english', description));

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- ==================== CREDIT CARDS ====================

CREATE TABLE IF NOT EXISTS public.credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
  card_name VARCHAR(255) NOT NULL,
  issuer VARCHAR(100) NOT NULL,
  network VARCHAR(50) CHECK (network IN ('Visa', 'Mastercard', 'Amex', 'Discover', 'Other')),
  last_four VARCHAR(4),
  expiration_date DATE,
  annual_fee DECIMAL(10, 2) DEFAULT 0.00,
  interest_rate DECIMAL(5, 2), -- APR percentage
  credit_limit DECIMAL(15, 2),
  current_balance DECIMAL(15, 2) DEFAULT 0.00,
  available_credit DECIMAL(15, 2),
  minimum_payment DECIMAL(15, 2),
  payment_due_date DATE,
  statement_closing_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  is_primary BOOLEAN DEFAULT FALSE,
  rewards_structure JSONB DEFAULT '{}'::jsonb, -- {base_rate: 1.5, categories: {dining: 3, travel: 2}}
  benefits JSONB DEFAULT '[]'::jsonb, -- Array of benefits
  signup_bonus JSONB, -- {amount: 50000, spend_requirement: 3000, timeframe_days: 90}
  foreign_transaction_fee DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_credit_limit CHECK (credit_limit >= 0),
  CONSTRAINT valid_balance CHECK (current_balance >= 0)
);

-- Indexes
CREATE INDEX idx_credit_cards_user_id ON public.credit_cards(user_id);
CREATE INDEX idx_credit_cards_active ON public.credit_cards(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_credit_cards_issuer ON public.credit_cards(issuer);

-- Enable RLS
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.credit_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cards" ON public.credit_cards
  FOR ALL USING (auth.uid() = user_id);

-- ==================== AI RECOMMENDATIONS ====================

CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('credit_card', 'savings', 'investment', 'debt_reduction', 'spending', 'goal', 'tax')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT, -- AI explanation
  action_items JSONB DEFAULT '[]'::jsonb, -- Array of actionable steps
  expected_benefit DECIMAL(15, 2), -- Estimated annual savings/gains
  confidence_score DECIMAL(5, 2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'completed', 'expired')),
  user_feedback TEXT,
  implemented_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_type ON public.ai_recommendations(recommendation_type);
CREATE INDEX idx_ai_recommendations_status ON public.ai_recommendations(status);
CREATE INDEX idx_ai_recommendations_priority ON public.ai_recommendations(priority);
CREATE INDEX idx_ai_recommendations_created ON public.ai_recommendations(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON public.ai_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

-- ==================== FINANCIAL GOALS ====================

CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('emergency_fund', 'debt_payoff', 'savings', 'investment', 'purchase', 'retirement', 'education', 'custom')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0.00,
  monthly_contribution DECIMAL(15, 2),
  target_date DATE,
  start_date DATE DEFAULT CURRENT_DATE,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  completion_date DATE,
  linked_accounts UUID[], -- Array of account IDs
  auto_contribute BOOLEAN DEFAULT FALSE,
  contribution_day INTEGER CHECK (contribution_day >= 1 AND contribution_day <= 31),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_target CHECK (target_amount > 0),
  CONSTRAINT valid_current CHECK (current_amount >= 0)
);

-- Indexes
CREATE INDEX idx_financial_goals_user_id ON public.financial_goals(user_id);
CREATE INDEX idx_financial_goals_status ON public.financial_goals(status);
CREATE INDEX idx_financial_goals_target_date ON public.financial_goals(target_date);

-- Enable RLS
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals" ON public.financial_goals
  FOR ALL USING (auth.uid() = user_id);

-- ==================== SPENDING INSIGHTS ====================

CREATE TABLE IF NOT EXISTS public.spending_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_income DECIMAL(15, 2) DEFAULT 0.00,
  total_expenses DECIMAL(15, 2) DEFAULT 0.00,
  net_savings DECIMAL(15, 2) DEFAULT 0.00,
  category_breakdown JSONB DEFAULT '{}'::jsonb, -- {dining: 450, groceries: 320, ...}
  top_merchants JSONB DEFAULT '[]'::jsonb,
  anomalies JSONB DEFAULT '[]'::jsonb, -- Unusual transactions
  trends JSONB DEFAULT '{}'::jsonb, -- Spending trends
  ai_analysis TEXT, -- Claude's analysis
  budget_comparison JSONB DEFAULT '{}'::jsonb,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- Indexes
CREATE INDEX idx_spending_insights_user_id ON public.spending_insights(user_id);
CREATE INDEX idx_spending_insights_period ON public.spending_insights(period_start, period_end);

-- Enable RLS
ALTER TABLE public.spending_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON public.spending_insights
  FOR SELECT USING (auth.uid() = user_id);

-- ==================== BUDGETS ====================

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  monthly_limit DECIMAL(15, 2) NOT NULL,
  current_spending DECIMAL(15, 2) DEFAULT 0.00,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  alert_threshold DECIMAL(5, 2) DEFAULT 80.00 CHECK (alert_threshold >= 0 AND alert_threshold <= 100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'exceeded', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_limit CHECK (monthly_limit > 0),
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- Indexes
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_category ON public.budgets(category);
CREATE INDEX idx_budgets_period ON public.budgets(period_start, period_end);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = user_id);

-- ==================== NOTIFICATIONS ====================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('transaction', 'goal', 'budget', 'recommendation', 'alert', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ==================== AUDIT LOG ====================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);

-- No RLS on audit log - it's for administrative purposes

-- ==================== FUNCTIONS AND TRIGGERS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_accounts_updated_at BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at BEFORE UPDATE ON public.credit_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON public.ai_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate net worth
CREATE OR REPLACE FUNCTION calculate_net_worth(p_user_id UUID)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
  v_net_worth DECIMAL(15, 2);
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN account_type IN ('checking', 'savings', 'investment') THEN balance
      WHEN account_type IN ('credit', 'loan', 'mortgage') THEN -ABS(balance)
      ELSE 0
    END
  ), 0) INTO v_net_worth
  FROM public.financial_accounts
  WHERE user_id = p_user_id AND is_active = TRUE;
  
  RETURN v_net_worth;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== VIEWS ====================

-- Monthly spending summary view
CREATE OR REPLACE VIEW public.monthly_spending_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', transaction_date) as month,
  category,
  COUNT(*) as transaction_count,
  SUM(ABS(amount)) as total_spent,
  AVG(ABS(amount)) as avg_transaction,
  MIN(ABS(amount)) as min_transaction,
  MAX(ABS(amount)) as max_transaction
FROM public.transactions
WHERE amount < 0  -- Only expenses
GROUP BY user_id, DATE_TRUNC('month', transaction_date), category;

-- Account balances overview
CREATE OR REPLACE VIEW public.account_balances_overview AS
SELECT 
  user_id,
  account_type,
  COUNT(*) as account_count,
  SUM(balance) as total_balance,
  AVG(balance) as avg_balance
FROM public.financial_accounts
WHERE is_active = TRUE
GROUP BY user_id, account_type;

-- ==================== SAMPLE DATA (for testing) ====================

-- Note: In production, remove this section
-- This is just for development/testing purposes

-- Insert sample user (you'll need to create this through Supabase Auth first)
-- INSERT INTO public.users (id, email, full_name) 
-- VALUES ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User');

-- ==================== PERFORMANCE OPTIMIZATIONS ====================

-- Analyze tables for query planner
ANALYZE public.users;
ANALYZE public.financial_accounts;
ANALYZE public.transactions;
ANALYZE public.credit_cards;
ANALYZE public.ai_recommendations;
ANALYZE public.financial_goals;
ANALYZE public.spending_insights;
ANALYZE public.budgets;
ANALYZE public.notifications;

-- Set up automatic vacuuming for high-traffic tables
ALTER TABLE public.transactions SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE public.notifications SET (autovacuum_vacuum_scale_factor = 0.1);

-- ==================== COMMENTS ====================

COMMENT ON TABLE public.users IS 'Extended user profiles with financial preferences';
COMMENT ON TABLE public.financial_accounts IS 'Bank accounts, credit cards, and investment accounts';
COMMENT ON TABLE public.transactions IS 'All financial transactions across accounts';
COMMENT ON TABLE public.credit_cards IS 'Credit card details and rewards structures';
COMMENT ON TABLE public.ai_recommendations IS 'AI-generated financial recommendations';
COMMENT ON TABLE public.financial_goals IS 'User-defined financial goals and targets';
COMMENT ON TABLE public.spending_insights IS 'Periodic spending analysis and insights';
COMMENT ON TABLE public.budgets IS 'Category-based spending budgets';
COMMENT ON TABLE public.notifications IS 'User notifications and alerts';
COMMENT ON TABLE public.audit_log IS 'Audit trail for security and compliance';

-- ==================== GRANTS ====================

-- Grant appropriate permissions (adjust based on your needs)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ==================== COMPLETION MESSAGE ====================

DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Remember to:';
  RAISE NOTICE '1. Update JWT secret in database configuration';
  RAISE NOTICE '2. Set up Supabase Auth';
  RAISE NOTICE '3. Configure RLS policies for your specific needs';
  RAISE NOTICE '4. Set up automated backups';
  RAISE NOTICE '5. Remove sample data section before production';
END $$;
