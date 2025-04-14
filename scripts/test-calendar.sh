
#!/bin/bash

# Set colors for better visibility
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BOLD}📅 Running all Calendar Page Tests...${NC}"

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

# Run all tests related to calendar functionality
echo -e "\n${BOLD}Running tests with 'Calendar' in their name:${NC}"
npx vitest run --testNamePattern "Calendar" --reporter=basic

echo -e "\n${BOLD}Running specific calendar test files:${NC}"

# Track overall success
PASSED=0
FAILED=0

# Run specific calendar-related test files
run_test "src/components/features/calendar/ui/CalendarContent.test.tsx" "Calendar Content Tests" && ((PASSED++)) || ((FAILED++))
run_test "src/components/features/calendar/test/CalendarTest.test.tsx" "Calendar Test Component Tests" && ((PASSED++)) || ((FAILED++))
run_test "src/components/features/calendar/tests/CalendarHeader.test.tsx" "Calendar Header Tests" && ((PASSED++)) || ((FAILED++))
run_test "src/components/features/calendar/views/__tests__/EnhancedMonthView.test.tsx" "Enhanced Month View Tests" && ((PASSED++)) || ((FAILED++))

# Run E2E tests if they exist
if [ -f "tests/e2e/calendar.test.ts" ]; then
  echo -e "\n${YELLOW}Running E2E calendar tests...${NC}"
  if npx playwright test tests/e2e/calendar.test.ts; then
    echo -e "${GREEN}✅ PASSED: E2E Calendar Tests${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAILED: E2E Calendar Tests${NC}"
    ((FAILED++))
  fi
else
  echo -e "\n${YELLOW}Skipping E2E tests (file not found)${NC}"
fi

# Print summary
echo -e "\n${BOLD}📅 All calendar tests completed!${NC}"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"

# Exit with error if any tests failed
[ $FAILED -eq 0 ] || exit 1
