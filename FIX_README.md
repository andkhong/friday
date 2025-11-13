# ⚡ Quick Fix for Backend Error

## The Problem
You're seeing: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module`

This happens because the TypeScript files need to be in a `src/` directory.

---

## ✅ The Solution (Choose One)

### Option 1: Automated Fix (Easiest) ⭐

```bash
cd backend
chmod +x fix-structure.sh
./fix-structure.sh
npm run dev
```

**Done!** The script fixes everything automatically.

---

### Option 2: Manual Fix (5 commands)

```bash
cd backend

# Create src directory
mkdir -p src/services

# Move files
mv server.ts src/
mv services/ai-financial.service.ts src/services/

# Install dependencies
npm install

# Run
npm run dev
```

---

## 📁 What It Should Look Like

**Before (Wrong):**
```
backend/
├── server.ts          ❌
├── services/
│   └── ai-financial.service.ts  ❌
└── package.json
```

**After (Correct):**
```
backend/
├── src/               ✅
│   ├── server.ts      ✅
│   └── services/
│       └── ai-financial.service.ts  ✅
├── package.json
└── tsconfig.json
```

---

## 🚀 After the Fix

Once the structure is correct:

1. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

2. **Add your API keys** to `.env`:
   ```bash
   nano .env  # or use your editor
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```

4. **You should see**:
   ```
   🚀 Server running on port 3001
   📊 API available at http://localhost:3001/api
   ```

---

## 🐛 Still Not Working?

### Check Node.js version:
```bash
node -v  # Should be v20+ 
```

### Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check if tsx is installed:
```bash
npm list tsx
```

If not found:
```bash
npm install --save-dev tsx typescript
```

---

## 📞 More Help

See **BACKEND_FIX.md** for detailed troubleshooting.

---

**That's it! Run the fix script and you'll be up and running! 🎉**
