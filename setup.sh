#!/bin/bash

# Acet Labs Finance Platform - Automated Setup Script
# This script automates the setup process for local development

set -e  # Exit on error

echo "🚀 Acet Labs Finance Platform - Automated Setup"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check Node.js version
print_info "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20 or higher is required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"

# Check npm
print_info "Checking npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm version: $(npm -v)"

echo ""
echo "================================================"
echo "📋 Configuration Setup"
echo "================================================"
echo ""

# Check if .env files exist
if [ -f "backend/.env" ] && [ -f "frontend/.env" ]; then
    print_warning ".env files already exist. Skipping configuration."
else
    print_info "Creating .env files from template..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp .env.example backend/.env
        print_success "Created backend/.env"
        print_warning "Please edit backend/.env with your actual API keys"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cp .env.example frontend/.env
        print_success "Created frontend/.env"
        print_warning "Please edit frontend/.env with your actual API keys"
    fi
fi

echo ""
echo "================================================"
echo "📦 Installing Dependencies"
echo "================================================"
echo ""

# Install backend dependencies
print_info "Installing backend dependencies..."
cd backend
npm install
print_success "Backend dependencies installed"
cd ..

echo ""

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd frontend
npm install
print_success "Frontend dependencies installed"
cd ..

echo ""
echo "================================================"
echo "🎉 Setup Complete!"
echo "================================================"
echo ""
print_success "All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your API keys:"
echo "   - Edit backend/.env with your API keys"
echo "   - Edit frontend/.env with your API keys"
echo "   (See QUICK_START.md for where to get keys)"
echo ""
echo "2. Set up the database:"
echo "   - Create a Supabase project"
echo "   - Run the SQL from database/schema.sql"
echo "   (See QUICK_START.md for detailed instructions)"
echo ""
echo "3. Start the development servers:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
print_info "For detailed setup instructions, see QUICK_START.md"
echo ""

# Check if required API keys are set
echo "================================================"
echo "🔑 API Key Check"
echo "================================================"
echo ""

if [ -f "backend/.env" ]; then
    if grep -q "your-" backend/.env; then
        print_warning "Some API keys in backend/.env are still set to placeholder values"
        print_info "Please update them before starting the servers"
    else
        print_success "Backend API keys appear to be configured"
    fi
else
    print_error "backend/.env not found"
fi

if [ -f "frontend/.env" ]; then
    if grep -q "your-" frontend/.env; then
        print_warning "Some API keys in frontend/.env are still set to placeholder values"
        print_info "Please update them before starting the servers"
    else
        print_success "Frontend API keys appear to be configured"
    fi
else
    print_error "frontend/.env not found"
fi

echo ""
print_success "Setup script completed!"
echo ""
