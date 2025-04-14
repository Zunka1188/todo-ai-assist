
#!/bin/bash

echo "Running all Shopping Page Tests..."

# Run all tests related to shopping functionality
npx vitest run --testNamePattern "Shopping" --reporter=verbose

echo "Running specific test files..."

# Run specific shopping-related test files
npx vitest run src/components/features/shopping/__tests__/ShoppingPageContent.test.tsx
npx vitest run src/components/features/shopping/__tests__/ShoppingList.test.tsx
npx vitest run src/components/features/shopping/__tests__/ShoppingItemsContext.test.tsx
npx vitest run src/components/features/shopping/__tests__/useShoppingItems.test.tsx
npx vitest run src/components/features/shopping/__tests__/shopping-comprehensive.test.tsx
npx vitest run src/components/features/shopping/__tests__/ShoppingPage.performance.test.tsx

# Run E2E tests if they exist
if [ -f "src/tests/e2e/shopping-list.test.ts" ]; then
  echo "Running E2E shopping tests..."
  npx playwright test src/tests/e2e/shopping-list.test.ts
fi

echo "All shopping tests completed!"
