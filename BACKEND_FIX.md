# 🔧 Backend Setup Fix

## The Issue

You're getting `ERR_MODULE_NOT_FOUND` because the TypeScript files need to be in a `src/` directory structure.

## ✅ Quick Fix

Run these commands in your backend directory:

```bash
cd backend

# 1. Create src directory structure
mkdir -p src/services

# 2. Move the TypeScript files
mv server.ts src/ 2>/dev/null || true
mv services/ai-financial.service.ts src/services/ 2>/dev/null || true

# 3. Remove old services directory if empty
rmdir services 2>/dev/null || true

# 4. Install dependencies (if not already done)
npm install

# 5. Now run dev
npm run dev
```

## 📁 Correct Directory Structure

Your backend folder should look like this:

```
backend/
├── src/
│   ├── server.ts                    # Main server file
│   └── services/
│       └── ai-financial.service.ts  # AI service
├── package.json
├── tsconfig.json                    # TypeScript config
├── .env                             # Your environment variables
└── node_modules/                    # Installed packages
```

## 🚀 Step-by-Step Setup

### 1. Install Dependencies First

```bash
cd backend
npm install
```

This will install all required packages including:
- express
- @anthropic-ai/sdk
- @supabase/supabase-js
- plaid
- tsx (for running TypeScript)
- And all other dependencies

### 2. Verify File Structure

Make sure your files are in the right place:

```bash
ls -la src/
# Should show: server.ts

ls -la src/services/
# Should show: ai-financial.service.ts
```

### 3. Configure Environment Variables

Create or edit `backend/.env`:

```bash
# Copy from example
cp ../.env.example .env

# Then edit with your actual keys
nano .env  # or use your preferred editor
```

**Required variables:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key-here
ANTHROPIC_API_KEY=sk-ant-api03-your-key
PLAID_CLIENT_ID=your-client-id
PLAID_SECRET=your-secret
PLAID_ENV=sandbox
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-random-secret-string
```

### 4. Start the Development Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📊 API available at http://localhost:3001/api
```

## 🐛 Still Having Issues?

### Issue: "Cannot find module 'tsx'"

**Fix:**
```bash
npm install tsx --save-dev
```

### Issue: "Cannot find module '@anthropic-ai/sdk'"

**Fix:**
```bash
npm install @anthropic-ai/sdk @supabase/supabase-js plaid
```

### Issue: TypeScript errors

**Fix:**
```bash
npm install --save-dev typescript @types/node @types/express @types/cors
```

### Issue: Port 3001 already in use

**Fix:**
Change the PORT in `.env`:
```env
PORT=3002
```

## 📝 Complete Fresh Install

If you want to start completely fresh:

```bash
cd backend

# Remove old installations
rm -rf node_modules package-lock.json

# Ensure correct structure
mkdir -p src/services
mv server.ts src/ 2>/dev/null || true
mv services/ai-financial.service.ts src/services/ 2>/dev/null || true

# Install everything
npm install

# Configure environment
cp ../.env.example .env
nano .env  # Add your API keys

# Start dev server
npm run dev
```

## ✅ Verification Checklist

Before running `npm run dev`, verify:

- [ ] Files are in `src/` directory
- [ ] `tsconfig.json` exists in backend folder
- [ ] `node_modules/` folder exists
- [ ] `.env` file exists with your API keys
- [ ] `tsx` package is installed (`npm list tsx`)
- [ ] TypeScript is installed (`npm list typescript`)

## 🎯 What Each File Does

**src/server.ts**
- Main Express application
- Defines all API routes
- Handles authentication
- Integrates with Plaid and Supabase

**src/services/ai-financial.service.ts**
- AI/ML logic using Claude
- Credit card optimization
- Financial recommendations
- Spending analysis

**tsconfig.json**
- TypeScript compiler configuration
- Tells TypeScript where to find files
- Configures build output

**package.json**
- Lists all dependencies
- Defines npm scripts
- Project metadata

## 🚀 Next Steps After Backend is Running

1. **Test the API:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Start the Frontend:**
   Open a new terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📞 Need More Help?

If you're still having issues:

1. **Check Node version:**
   ```bash
   node -v  # Should be v20.0.0 or higher
   ```

2. **Check if files exist:**
   ```bash
   ls -la src/
   ls -la src/services/
   ```

3. **Check dependencies:**
   ```bash
   npm list tsx @anthropic-ai/sdk express
   ```

4. **See full error:**
   Run with verbose logging:
   ```bash
   npm run dev --verbose
   ```

## 💡 Pro Tips

1. **Use nodemon alternative:**
   If tsx causes issues, try nodemon:
   ```bash
   npm install --save-dev nodemon ts-node
   ```
   
   Then update package.json script:
   ```json
   "dev": "nodemon --exec ts-node src/server.ts"
   ```

2. **Pre-compile TypeScript:**
   ```bash
   npm run build
   npm start
   ```

3. **Watch TypeScript compilation:**
   ```bash
   npx tsc --watch
   ```

---

**You're almost there! Follow these steps and your backend will be running smoothly. 🎉**
