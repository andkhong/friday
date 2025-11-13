export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface CreditCard {
  id: string;
  user_id: string;
  card_name: string;
  issuer: string;
  network: 'Visa' | 'Mastercard' | 'American Express' | 'Discover' | 'Other';
  last_four: string;
  annual_fee: number;
  interest_rate: number;
  credit_limit: number | null;
  current_balance: number;
  rewards_structure: RewardsStructure;
  benefits: string[];
  signup_bonus: number | null;
  signup_bonus_spend_requirement: number | null;
  foreign_transaction_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RewardsStructure {
  base_rate: number;
  categories?: {
    [key: string]: number;
  };
}

export interface CardRecommendation {
  recommended_card: {
    id: string;
    name: string;
    network: string;
    last_four: string;
  };
  expected_rewards: number;
  rewards_rate: number;
  savings_vs_default: number;
  category: string;
  reasoning: string;
  alternatives: Array<{
    name: string;
    rewards_amount: number;
    reward_rate: number;
  }>;
}
