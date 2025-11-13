# 🚀 Quick Start Guide - Acet Labs Finance Platform

This guide will help you get the platform running in **under 15 minutes**.

---

## ⚡ Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 20+ installed ([download](https://nodejs.org))
- [ ] Git installed
- [ ] A code editor (VS Code recommended)
- [ ] A terminal/command line

---

## 🎯 Step-by-Step Setup

### 1. Get Your API Keys (5 minutes)

#### Supabase (Free - Database & Auth)
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project (takes ~2 minutes)
4. Go to Project Settings → API
5. Copy:
   - `URL` → This is your `SUPABASE_URL`
   - `anon public` key → This is your `SUPABASE_ANON_KEY`

#### Anthropic Claude (Paid - $5 free credit)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up for an account
3. Go to API Keys
4. Create new key → Copy it (starts with `sk-ant-`)

#### Plaid (Free Development Mode)
1. Go to [dashboard.plaid.com/signup](https://dashboard.plaid.com/signup)
2. Sign up for free developer account
3. Complete the verification
4. Go to Team Settings → Keys
5. Copy your:
   - `client_id`
   - `secret` (sandbox)

### 2. Set Up the Database (3 minutes)

1. In Supabase dashboard, go to SQL Editor
2. Create a new query
3. Copy the entire contents of `database/schema.sql`
4. Paste and run it
5. ✅ Done! Your database is ready

### 3. Configure the Project (2 minutes)

#### Backend Configuration

```bash
cd backend
cp ../.env.example .env
```

Edit `backend/.env` with your keys:

```bash
# Database
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...

# AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Financial Data
PLAID_CLIENT_ID=xxxxx
PLAID_SECRET=xxxxx
PLAID_ENV=sandbox

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=change-this-to-random-string
```

#### Frontend Configuration

```bash
cd frontend
cp ../.env.example .env
```

Edit `frontend/.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### 4. Install Dependencies (3 minutes)

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 5. Start the Application (30 seconds)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📊 API available at http://localhost:3001/api
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
```

### 6. Open and Test! 🎉

1. Open [http://localhost:3000](http://localhost:3000)
2. You should see the dashboard!
3. Click "Connect Account" to test Plaid integration
4. Try the "Ask AI Advisor" feature

---

## 🔍 Troubleshooting

### "Cannot connect to database"
- ✅ Check your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- ✅ Verify the SQL schema was run successfully
- ✅ Check Supabase project is active (not paused)

### "AI recommendations not working"
- ✅ Verify your `ANTHROPIC_API_KEY` is correct
- ✅ Check you have credits remaining in Anthropic dashboard
- ✅ Look at backend logs for specific error messages

### "Plaid Link not opening"
- ✅ Check `PLAID_CLIENT_ID` and `PLAID_SECRET`
- ✅ Verify you're using `sandbox` environment
- ✅ Ensure CORS is allowing requests from localhost:3000

### "Port already in use"
- Backend: Change `PORT=3001` to another port like `3002`
- Frontend: Kill process on port 3000 or run on different port

### "Module not found" errors
- ✅ Delete `node_modules` and `package-lock.json`
- ✅ Run `npm install` again
- ✅ Make sure you're in the correct directory

---

## 🎓 What to Do Next

### Explore the Dashboard
- View the mock financial data
- Check out the AI recommendations
- See the spending analytics

### Connect Real Accounts (Sandbox)
1. Click "Connect Account"
2. Search for "Chase" (or any bank)
3. Use Plaid sandbox credentials:
   - Username: `user_good`
   - Password: `pass_good`
4. Watch your transactions sync!

### Try the AI Features
1. Look at the recommended credit card optimizations
2. Check debt reduction suggestions
3. Click "Ask AI Advisor" to chat with Claude

### Customize the Code
- Modify the dashboard layout in `frontend/Dashboard.tsx`
- Add new API endpoints in `backend/server.ts`
- Tweak AI prompts in `backend/services/ai-financial.service.ts`

---

## 📚 Key Files to Explore

```
📁 Core Files
├── ARCHITECTURE.md              # Detailed system design
├── README.md                     # Full documentation
│
📁 Frontend
├── frontend/Dashboard.tsx        # Main dashboard component
├── frontend/package.json         # Dependencies
│
📁 Backend
├── backend/server.ts            # API server
├── backend/services/ai-financial.service.ts  # AI logic
├── backend/package.json         # Dependencies
│
📁 Database
└── database/schema.sql          # Database structure
```

---

## 💡 Development Tips

### Hot Reloading
Both frontend and backend support hot reloading. Just save your files and see changes instantly!

### VS Code Extensions
Install these for best experience:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL

### Debugging
- Backend logs appear in Terminal 1
- Frontend logs in browser console (F12)
- Use `console.log()` liberally while learning

### Testing Changes
1. Make a change to the code
2. Save the file
3. Refresh browser (or it auto-refreshes)
4. Check console for errors

---

## 🚢 Ready to Deploy?

Once you're happy with your local setup, check out:
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Production deployment guide
- [API.md](./docs/API.md) - Complete API documentation

---

## ❓ Need Help?

- 📖 Read the full [README.md](./README.md)
- 🏗️ Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- 💬 Ask questions in our Discord community
- 📧 Email: support@acetlabs.com

---

## ✅ Success Checklist

By now, you should have:

- [x] All API keys configured
- [x] Database schema deployed
- [x] Backend running on port 3001
- [x] Frontend running on port 3000
- [x] Dashboard loading with mock data
- [x] AI recommendations appearing
- [x] Understanding of project structure

**Congratulations! 🎉 You're ready to build amazing financial features!**

---

## 🎯 Next Steps

1. **Customize the UI**: Edit colors, layouts, add your branding
2. **Add Features**: Implement budgeting, bill tracking, investment analysis
3. **Improve AI**: Fine-tune prompts for better recommendations
4. **Connect Real Data**: Move from sandbox to production Plaid
5. **Deploy**: Share your platform with real users!

---

**Pro Tip**: Keep your `.env` files secret and never commit them to Git! 🔒
