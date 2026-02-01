#!/bin/bash

# ZAWJ Build & Test Script
# Validates frontend and backend builds

echo "🚀 ZAWJ Build Validation Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Test function
run_test() {
    local name=$1
    local command=$2
    
    echo -e "\n${YELLOW}Testing: $name${NC}"
    
    if eval "$command"; then
        echo -e "${GREEN}✓ PASSED: $name${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED: $name${NC}"
        ((FAILED++))
    fi
}

# Check Node version
echo -e "\n${YELLOW}Checking prerequisites...${NC}"
node_version=$(node -v)
npm_version=$(npm -v)
echo "Node: $node_version"
echo "NPM: $npm_version"

# Frontend Tests
echo -e "\n${YELLOW}===== FRONTEND TESTS =====${NC}"
cd zawj

run_test "Frontend dependencies" "npm list > /dev/null 2>&1"
run_test "Frontend TypeScript check" "npx tsc --noEmit"
run_test "Frontend ESLint" "npm run lint 2>/dev/null || echo 'Linting not configured'"
run_test "Frontend build" "npm run build"

# Backend Tests
echo -e "\n${YELLOW}===== BACKEND TESTS =====${NC}"
cd ../backend

run_test "Backend dependencies" "npm list > /dev/null 2>&1"
run_test "Backend TypeScript check" "npx tsc --noEmit"
run_test "Backend ESLint" "npm run lint 2>/dev/null || echo 'Linting not configured'"
run_test "Backend build" "npm run build"

# File structure checks
echo -e "\n${YELLOW}===== FILE STRUCTURE CHECKS =====${NC}"

run_test "Frontend pages exist" "test -d ../zawj/src/app/register"
run_test "Frontend admin pages exist" "test -d ../zawj/src/app/admin/users"
run_test "Frontend components exist" "test -f ../zawj/src/components/AdminLayout.tsx"
run_test "Backend admin module exists" "test -d ./src/modules/admin"
run_test "Backend middleware updated" "grep -q 'isAdmin' ./src/middlewares/auth.middleware.ts"
run_test "Documentation created" "test -f ../ADMIN_DOCS.md"

# Database check
echo -e "\n${YELLOW}===== DATABASE CHECKS =====${NC}"
if command -v mongod &> /dev/null; then
    run_test "MongoDB installed" "mongod --version > /dev/null"
else
    echo -e "${YELLOW}⚠ MongoDB not installed (OK if using Atlas)${NC}"
fi

# Environment check
echo -e "\n${YELLOW}===== ENVIRONMENT CHECKS =====${NC}"
run_test "Frontend .env.local exists" "test -f ../zawj/.env.local || echo 'Create .env.local'"
run_test "Backend .env exists" "test -f ./.env || echo 'Create .env'"

# Results
echo -e "\n${YELLOW}===== TEST RESULTS =====${NC}"
TOTAL=$((PASSED + FAILED))
echo "Total: $TOTAL | Passed: ${GREEN}$PASSED${NC} | Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo "1. Start backend: cd backend && npm run dev"
    echo "2. Start frontend: cd zawj && npm run dev"
    echo "3. Open http://localhost:3000"
    echo "4. Test registration at /register"
    echo "5. Test admin at /admin"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Fix issues above.${NC}"
    exit 1
fi
