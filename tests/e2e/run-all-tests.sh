
#!/bin/bash

# Set colors for better visibility
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BOLD}🧪 Running all E2E Tests...${NC}"

# Start time
START_TIME=$(date +%s)

# Function to run test and report status
run_test() {
  local test_file=$1
  local test_name=$2
  
  echo -e "\n${YELLOW}Running ${test_name}...${NC}"
  if npx playwright test tests/e2e/$test_file --reporter=dot; then
    echo -e "${GREEN}✅ PASSED: ${test_name}${NC}"
    return 0
  else
    echo -e "${RED}❌ FAILED: ${test_name}${NC}"
    return 1
  fi
}

# Track test results
PASSED=0
FAILED=0
FAILED_TESTS=()

# Run individual test files
echo -e "\n${BLUE}${BOLD}Running Page Tests:${NC}"

run_test "home-page.test.ts" "Home Page Tests" && ((PASSED++)) || { ((FAILED++)); FAILED_TESTS+=("Home Page Tests"); }
run_test "calendar-page.test.ts" "Calendar Page Tests" && ((PASSED++)) || { ((FAILED++)); FAILED_TESTS+=("Calendar Page Tests"); }
run_test "shopping-page.test.ts" "Shopping Page Tests" && ((PASSED++)) || { ((FAILED++)); FAILED_TESTS+=("Shopping Page Tests"); }
run_test "shopping-list-comprehensive.test.ts" "Shopping List Comprehensive Tests" && ((PASSED++)) || { ((FAILED++)); FAILED_TESTS+=("Shopping List Comprehensive Tests"); }
run_test "shopping-batch-operations.test.ts" "Shopping Batch Operations Tests" && ((PASSED++)) || { ((FAILED++)); FAILED_TESTS+=("Shopping Batch Operations Tests"); }
run_test "documents-page.test.ts" "Documents Page Tests" && ((PASSED++)) || { ((FAILED++)); FAILED_TESTS+=("Documents Page Tests"); }
run_test "feature-buttons.test.ts" "Feature Buttons Tests" && ((PASSED++)) || { ((FAILED++)); FAILED_TESTS+=("Feature Buttons Tests"); }
run_test "ai-chat-integration.test.ts" "AI Chat Integration Tests" && ((PASSED++)) || { ((FAILED++)); FAILED_TESTS+=("AI Chat Integration Tests"); }
run_test "accessibility.test.ts" "Accessibility Tests" && ((PASSED++)) || { ((FAILED++)); FAILED_TESTS+=("Accessibility Tests"); }

# Calculate elapsed time
END_TIME=$(date +%s)
ELAPSED_TIME=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED_TIME / 60))
SECONDS=$((ELAPSED_TIME % 60))

# Print summary
echo -e "\n${BOLD}🏁 Test Summary:${NC}"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "⏱️  Time elapsed: ${MINUTES}m ${SECONDS}s"

if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
  echo -e "\n${RED}${BOLD}Failed Tests:${NC}"
  for test in "${FAILED_TESTS[@]}"; do
    echo -e "${RED}  - $test${NC}"
  done
fi

# Exit with error code if any test failed
[ $FAILED -eq 0 ] || exit 1

echo -e "\n${GREEN}${BOLD}All tests completed!${NC}"
