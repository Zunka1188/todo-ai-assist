
#!/bin/bash

# Set colors for better visibility
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BOLD}🛒 Running all Shopping Page Tests...${NC}"

# Function to run test and report status
run_test() {
  local test_file=$1
  local test_name=$2
  
  echo -e "\n${YELLOW}Running ${test_name}...${NC}"
  if npx vitest run "$test_file" --reporter=basic; then
    echo -e "${GREEN}✅ PASSED: ${test_name}${NC}"
    return 0
  else
    echo -e "${RED}❌ FAILED: ${test_name}${NC}"
    return 1
  fi
}

# Run all tests related to shopping functionality
echo -e "\n${BOLD}Running tests with 'Shopping' in their name:${NC}"
npx vitest run --testNamePattern "Shopping" --reporter=basic

echo -e "\n${BOLD}Running specific shopping test files:${NC}"

# Track overall success
PASSED=0
FAILED=0

# Run specific shopping-related test files
run_test "src/components/features/shopping/__tests__/ShoppingPageContent.test.tsx" "Shopping Page Content Tests" && ((PASSED++)) || ((FAILED++))
run_test "src/components/features/shopping/__tests__/ShoppingList.test.tsx" "Shopping List Tests" && ((PASSED++)) || ((FAILED++))
run_test "src/components/features/shopping/__tests__/ShoppingItemsContext.test.tsx" "Shopping Items Context Tests" && ((PASSED++)) || ((FAILED++))
run_test "src/components/features/shopping/__tests__/useShoppingItems.test.tsx" "Use Shopping Items Hook Tests" && ((PASSED++)) || ((FAILED++))
run_test "src/components/features/shopping/__tests__/shopping-comprehensive.test.tsx" "Shopping Comprehensive Tests" && ((PASSED++)) || ((FAILED++))
run_test "src/components/features/shopping/__tests__/ShoppingPage.performance.test.tsx" "Shopping Page Performance Tests" && ((PASSED++)) || ((FAILED++))

# Run E2E tests if they exist
if [ -f "src/tests/e2e/shopping-list.test.ts" ]; then
  echo -e "\n${YELLOW}Running E2E shopping tests...${NC}"
  if npx playwright test src/tests/e2e/shopping-list.test.ts; then
    echo -e "${GREEN}✅ PASSED: E2E Shopping Tests${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAILED: E2E Shopping Tests${NC}"
    ((FAILED++))
  fi
else
  echo -e "\n${YELLOW}Skipping E2E tests (file not found)${NC}"
fi

# Print summary
echo -e "\n${BOLD}🛒 All shopping tests completed!${NC}"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"

# Exit with error if any tests failed
[ $FAILED -eq 0 ] || exit 1
