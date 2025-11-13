#!/bin/bash

# Backend Structure Fix Script
# Fixes the ERR_MODULE_NOT_FOUND error by restructuring directories

set -e

echo "🔧 Acet Labs Finance - Backend Structure Fix"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the backend directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Creating correct directory structure...${NC}"
mkdir -p src/services

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

echo -e "${YELLOW}Step 2: Moving TypeScript files to src/...${NC}"

# Move server.ts if it exists in root
if [ -f "server.ts" ]; then
    mv server.ts src/
    echo -e "${GREEN}✓ Moved server.ts to src/${NC}"
fi

# Move ai-financial.service.ts if it exists
if [ -f "services/ai-financial.service.ts" ]; then
    mv services/ai-financial.service.ts src/services/
    echo -e "${GREEN}✓ Moved ai-financial.service.ts to src/services/${NC}"
fi

# Clean up old services directory if empty
if [ -d "services" ] && [ -z "$(ls -A services)" ]; then
    rmdir services
    echo -e "${GREEN}✓ Removed empty services directory${NC}"
fi

echo ""

echo -e "${YELLOW}Step 3: Checking if files are in place...${NC}"
if [ ! -f "src/server.ts" ]; then
    echo -e "${RED}✗ src/server.ts not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ src/server.ts exists${NC}"

if [ ! -f "src/services/ai-financial.service.ts" ]; then
    echo -e "${RED}✗ src/services/ai-financial.service.ts not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ src/services/ai-financial.service.ts exists${NC}"

echo ""

echo -e "${YELLOW}Step 4: Checking tsconfig.json...${NC}"
if [ ! -f "tsconfig.json" ]; then
    echo -e "${YELLOW}Creating tsconfig.json...${NC}"
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
    echo -e "${GREEN}✓ Created tsconfig.json${NC}"
else
    echo -e "${GREEN}✓ tsconfig.json already exists${NC}"
fi

echo ""

echo -e "${YELLOW}Step 5: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies... (this may take a minute)${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ node_modules exists${NC}"
    
    # Check for critical dependencies
    if ! npm list tsx &> /dev/null; then
        echo -e "${YELLOW}Installing tsx...${NC}"
        npm install --save-dev tsx
    fi
    
    if ! npm list typescript &> /dev/null; then
        echo -e "${YELLOW}Installing TypeScript...${NC}"
        npm install --save-dev typescript
    fi
fi

echo ""

echo -e "${YELLOW}Step 6: Checking .env file...${NC}"
if [ ! -f ".env" ]; then
    if [ -f "../.env.example" ]; then
        cp ../.env.example .env
        echo -e "${YELLOW}⚠ Created .env from template${NC}"
        echo -e "${YELLOW}⚠ Please edit .env and add your API keys!${NC}"
    else
        echo -e "${RED}✗ No .env file found and no template available${NC}"
        echo -e "${YELLOW}Please create .env manually${NC}"
    fi
else
    echo -e "${GREEN}✓ .env exists${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✓ Backend structure fixed successfully!${NC}"
echo "=============================================="
echo ""
echo "Your backend directory now has the correct structure:"
echo ""
echo "backend/"
echo "├── src/"
echo "│   ├── server.ts"
echo "│   └── services/"
echo "│       └── ai-financial.service.ts"
echo "├── package.json"
echo "├── tsconfig.json"
echo "└── .env"
echo ""
echo "Next steps:"
echo ""
echo "1. Make sure your .env file has all required API keys"
echo "2. Run: npm run dev"
echo "3. Your backend should start on http://localhost:3001"
echo ""
echo -e "${GREEN}Ready to go! 🚀${NC}"
echo ""
