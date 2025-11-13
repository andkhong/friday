# Multi-Credit Card Rewards Optimization Integration

This document explains how the multi-credit-card rewards optimization system works and how to use it.

## Overview

The system allows users to add multiple credit cards and receive real-time recommendations on which card to use at point of sale to maximize rewards. This is achieved through:

1. **Backend API** - Credit card management and recommendation engine
2. **Mobile App** - Point-of-sale interface for getting recommendations
3. **AI-Powered Categorization** - Automatic merchant/category detection using Claude

## Architecture

```
┌─────────────────────────────────────────────┐
│      Mobile App (React Native + Expo)       │
│  • Login/Authentication                     │
│  • Card Wallet View                         │
│  • POS Recommendation Screen                │
└──────────────────┬──────────────────────────┘
                   │ REST API (HTTPS)
┌──────────────────┴──────────────────────────┐
│      Backend (Express + TypeScript)         │
│  • POST /api/cards - Add card               │
│  • GET /api/cards - List cards              │
│  • PUT /api/cards/:id - Update card         │
│  • DELETE /api/cards/:id - Remove card      │
│  • POST /api/cards/quick-recommend          │
│    └─ Calculates optimal card               │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│      Database (PostgreSQL/Supabase)         │
│  • credit_cards table                       │
│    - Stores card details                    │
│    - Rewards structure (JSONB)              │
│    - Benefits, fees, limits                 │
└─────────────────────────────────────────────┘
```

## Backend API Endpoints

### 1. Get All Credit Cards
```
GET /api/cards
Authorization: Bearer <token>

Response:
{
  "cards": [
    {
      "id": "uuid",
      "card_name": "Chase Sapphire Preferred",
      "issuer": "Chase",
      "network": "Visa",
      "last_four": "1234",
      "rewards_structure": {
        "base_rate": 1,
        "categories": {
          "dining": 3,
          "travel": 5,
          "groceries": 2
        }
      },
      "annual_fee": 95,
      "is_active": true
    }
  ]
}
```

### 2. Add New Credit Card
```
POST /api/cards
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "cardName": "Chase Sapphire Preferred",
  "issuer": "Chase",
  "network": "Visa",
  "lastFour": "1234",
  "annualFee": 95,
  "rewardsStructure": {
    "base_rate": 1,
    "categories": {
      "dining": 3,
      "travel": 5
    }
  },
  "isActive": true
}

Response:
{
  "message": "Credit card added successfully",
  "card": { ... }
}
```

### 3. Update Credit Card
```
PUT /api/cards/:id
Authorization: Bearer <token>

Request:
{
  "is_active": false,
  "current_balance": 1500.00
}

Response:
{
  "message": "Credit card updated successfully",
  "card": { ... }
}
```

### 4. Delete Credit Card
```
DELETE /api/cards/:id
Authorization: Bearer <token>

Response:
{
  "message": "Credit card deleted successfully"
}
```

### 5. Quick Recommend (Mobile-Optimized)
```
POST /api/cards/quick-recommend
Authorization: Bearer <token>

Request:
{
  "amount": 100.00,
  "merchant": "Whole Foods",  // optional
  "category": "groceries"     // optional
}

Response:
{
  "recommended_card": {
    "id": "uuid",
    "name": "AmEx Blue Cash Preferred",
    "network": "American Express",
    "last_four": "5678"
  },
  "expected_rewards": 6.00,
  "rewards_rate": 6,
  "savings_vs_default": 4.00,
  "category": "Groceries",
  "reasoning": "This card offers 6% rewards for Groceries purchases. You'll earn $6.00 on this $100.00 transaction.",
  "alternatives": [
    {
      "name": "Chase Sapphire Preferred",
      "rewards_amount": 2.00,
      "reward_rate": 2
    }
  ]
}
```

## Database Schema

### credit_cards table

```sql
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_name VARCHAR(255) NOT NULL,
  issuer VARCHAR(100) NOT NULL,
  network VARCHAR(50) NOT NULL,  -- Visa, Mastercard, Amex, Discover
  last_four VARCHAR(4) NOT NULL,
  annual_fee DECIMAL(10, 2) DEFAULT 0,
  interest_rate DECIMAL(5, 2) DEFAULT 0,
  credit_limit DECIMAL(10, 2),
  current_balance DECIMAL(10, 2) DEFAULT 0,

  -- Flexible rewards structure stored as JSON
  rewards_structure JSONB DEFAULT '{"base_rate": 1}'::jsonb,

  -- Card benefits
  benefits TEXT[] DEFAULT '{}',

  -- Signup bonus tracking
  signup_bonus DECIMAL(10, 2),
  signup_bonus_spend_requirement DECIMAL(10, 2),

  foreign_transaction_fee DECIMAL(5, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Rewards Structure Format

The `rewards_structure` JSONB field supports flexible reward rates:

```json
{
  "base_rate": 1.5,
  "categories": {
    "dining": 3,
    "groceries": 6,
    "gas": 2,
    "travel": 5,
    "streaming": 2,
    "online_shopping": 4
  },
  "promotional": {
    "category": "groceries",
    "rate": 8,
    "expires": "2024-12-31"
  }
}
```

## Recommendation Algorithm

The `/api/cards/quick-recommend` endpoint uses this logic:

1. **Fetch Active Cards**: Get all cards where `is_active = true`
2. **Categorize Transaction**:
   - If `category` provided, use it
   - Else if `merchant` provided, use AI to categorize
   - Else use "General"
3. **Calculate Rewards for Each Card**:
   ```typescript
   rewards_rate = card.rewards_structure.categories[category]
                  || card.rewards_structure.base_rate
                  || 1
   rewards_amount = (amount * rewards_rate) / 100
   ```
4. **Sort by Rewards**: Highest rewards first
5. **Calculate Savings**: `best_card_rewards - second_best_rewards`
6. **Return Recommendation**: Include reasoning and alternatives

## Mobile App Usage

### User Flow

1. **Login**
   - User enters email/password
   - Backend validates and returns JWT token
   - Token stored in AsyncStorage

2. **View Cards**
   - Tap "My Cards" button
   - See all credit cards with rewards rates
   - Color-coded by network (Visa = blue, Mastercard = red, etc.)

3. **Get Recommendation**
   - Enter purchase amount (required)
   - Optionally enter merchant name
   - Tap "Get Recommendation"
   - See recommended card with expected rewards
   - View alternative options

4. **Make Purchase**
   - User selects the recommended card from their physical wallet
   - Completes transaction
   - Earns maximum rewards

## Example Use Cases

### Use Case 1: Grocery Shopping
```
User: About to spend $100 at Whole Foods
Input: amount=100, merchant="Whole Foods"

System:
1. Categorizes "Whole Foods" as "groceries"
2. Finds AmEx Blue Cash Preferred has 6% groceries
3. Recommends AmEx: $6.00 rewards
4. Shows Chase Sapphire as alternative: $2.00 rewards
5. Displays $4.00 savings

User: Uses AmEx card, earns $6.00
```

### Use Case 2: Gas Station
```
User: About to spend $50 at Shell
Input: amount=50, merchant="Shell"

System:
1. Categorizes "Shell" as "gas"
2. Finds Chase Freedom Unlimited has 3% gas (Q1 bonus)
3. Recommends Chase: $1.50 rewards
4. Shows Citi Double Cash as alternative: $1.00 rewards
5. Displays $0.50 savings

User: Uses Chase card, earns $1.50
```

### Use Case 3: Unknown Merchant
```
User: About to spend $200 (no merchant name)
Input: amount=200

System:
1. Uses "General" category
2. Compares base rates of all cards
3. Finds Citi Double Cash has 2% base rate
4. Recommends Citi: $4.00 rewards
5. Shows alternatives

User: Uses Citi card, earns $4.00
```

## Setup Instructions

### Backend Setup
1. Backend already has credit card endpoints
2. No additional setup needed
3. Database schema already includes `credit_cards` table

### Mobile App Setup
1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure backend URL in `src/api/client.ts`:
   ```typescript
   const API_URL = 'http://YOUR_IP:3001/api';
   ```

4. Start the app:
   ```bash
   npm start
   ```

5. Scan QR code with Expo Go app

### Testing the Integration

1. **Add test credit cards** via database or API:
   ```sql
   INSERT INTO credit_cards (user_id, card_name, issuer, network, last_four, rewards_structure)
   VALUES
   ('user-uuid', 'AmEx Blue Cash', 'American Express', 'American Express', '5678',
    '{"base_rate": 1, "categories": {"groceries": 6, "gas": 3}}'),
   ('user-uuid', 'Chase Sapphire', 'Chase', 'Visa', '1234',
    '{"base_rate": 1, "categories": {"dining": 3, "travel": 5}}');
   ```

2. **Login to mobile app**
3. **View cards** - Should see both cards
4. **Test recommendation**:
   - Enter amount: 100
   - Enter merchant: "Whole Foods"
   - Should recommend AmEx (6% groceries)

## Security Considerations

- All API endpoints require JWT authentication
- Row-level security ensures users only see their own cards
- Never store full card numbers (only last 4 digits)
- PCI compliance not required (no actual payment processing)
- Use HTTPS in production
- Implement rate limiting to prevent abuse

## Performance Optimizations

- **Caching**: Mobile app caches cards locally
- **Debouncing**: Merchant input debounced before categorization
- **Lazy Loading**: Cards loaded on-demand
- **Optimistic Updates**: UI updates before API confirmation

## Future Enhancements

1. **Add Card from Mobile**: Allow adding cards directly from app
2. **Transaction History**: Track which recommendations were used
3. **Savings Dashboard**: Show total savings from using optimal cards
4. **Push Notifications**: Alert when entering merchant geofence
5. **NFC Detection**: Trigger recommendation when near POS terminal
6. **Card Application Suggestions**: Recommend new cards to apply for
7. **Signup Bonus Tracking**: Progress bars for bonus thresholds
8. **Annual Fee ROI**: Calculate if annual fees are worth it

## Troubleshooting

### "No active credit cards found"
- User hasn't added any cards yet
- All cards are marked `is_active = false`
- Add cards via database or API

### Recommendations seem incorrect
- Check rewards_structure JSON format
- Verify category matching (case-insensitive)
- Test merchant categorization

### Mobile app can't connect
- Verify backend is running
- Check API_URL is correct
- For physical devices, use local IP not localhost
- Ensure firewall allows port 3001

## API Rate Limits

Current limits (configurable in backend):
- 100 requests per 15 minutes per IP
- Adjust in `backend/src/server.ts`:
  ```typescript
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  ```

## Support

For issues or questions:
- Check backend logs: `cd backend && npm run dev`
- Check mobile logs in Expo console
- Verify database schema is up to date
- Test API endpoints with curl or Postman

---

**Version**: 1.0.0
**Last Updated**: 2024
**Author**: Acet Labs Team
