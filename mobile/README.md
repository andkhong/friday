# Acet Labs Finance - Mobile App

A React Native mobile application for smart credit card optimization. Get real-time recommendations on which credit card to use at point of sale to maximize rewards.

## Features

- **Card Optimizer**: Get instant recommendations on which card to use for maximum rewards
- **Card Wallet**: View all your credit cards and their rewards structures
- **Smart Categorization**: Automatic merchant categorization for accurate recommendations
- **Real-time Calculations**: See expected rewards and savings instantly

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- Axios for API calls
- AsyncStorage for local data persistence

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (installed automatically with the project)
- iOS Simulator (Mac only) or Android Emulator

## Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure backend URL:
   - Open `src/api/client.ts`
   - Update the `API_URL` constant to point to your backend server
   - For local development: `http://localhost:3001/api`
   - For actual device testing, use your computer's IP address: `http://192.168.1.XXX:3001/api`

## Running the App

### Start the development server:
```bash
npm start
```

### Run on iOS Simulator (Mac only):
```bash
npm run ios
```

### Run on Android Emulator:
```bash
npm run android
```

### Run on Web:
```bash
npm run web
```

### Run on Physical Device:
1. Install the Expo Go app from App Store or Play Store
2. Scan the QR code shown in the terminal
3. Make sure your device is on the same network as your computer
4. Update the `API_URL` in `src/api/client.ts` to use your computer's local IP address

## Project Structure

```
mobile/
├── src/
│   ├── api/
│   │   └── client.ts          # API service and endpoints
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── screens/
│   │   ├── LoginScreen.tsx           # Login screen
│   │   ├── CardWalletScreen.tsx      # View all credit cards
│   │   └── RecommendationScreen.tsx  # POS card optimizer
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── App.tsx                    # Main app entry point with navigation
└── package.json              # Dependencies and scripts
```

## Usage

### 1. Login
- Use your existing Acet Labs Finance account credentials
- If you don't have an account, create one through the backend

### 2. View Your Cards
- Tap "My Cards" in the header
- See all your credit cards with their rewards rates
- Pull to refresh to sync latest data

### 3. Get Card Recommendations
- From the main screen, enter the purchase amount
- Optionally, enter the merchant name for more accurate categorization
- Tap "Get Recommendation"
- See which card gives you the most rewards
- View alternative options and savings

## API Endpoints Used

The mobile app communicates with these backend endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/cards` - Fetch all user's credit cards
- `POST /api/cards/quick-recommend` - Get card recommendation for a purchase

## Configuration

### Backend URL
Update `src/api/client.ts`:
```typescript
const API_URL = 'http://YOUR_BACKEND_URL:3001/api';
```

For local development:
- **iOS Simulator**: `http://localhost:3001/api`
- **Android Emulator**: `http://10.0.2.2:3001/api`
- **Physical Device**: `http://YOUR_LOCAL_IP:3001/api` (e.g., `http://192.168.1.5:3001/api`)

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

For more details, see [Expo Build Documentation](https://docs.expo.dev/classic/building-standalone-apps/)

## Troubleshooting

### Can't connect to backend
- Make sure the backend server is running
- Check that the `API_URL` is correct
- For physical devices, ensure you're on the same network
- Try using your computer's IP address instead of `localhost`

### Cards not loading
- Verify you have credit cards added in the database
- Check the backend logs for errors
- Ensure your auth token is valid (try logging out and back in)

### App crashes on startup
- Clear the Expo cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Future Enhancements

- [ ] Add new credit card directly from mobile app
- [ ] Edit/delete cards
- [ ] Transaction history
- [ ] Push notifications for recommendations
- [ ] Geolocation-based merchant detection
- [ ] NFC tap-to-pay detection
- [ ] Dark mode support
- [ ] Rewards tracking dashboard

## Contributing

This is part of the Acet Labs Finance platform. For backend changes, see the main project README.

## License

Copyright 2024 Acet Labs
