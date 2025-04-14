
/**
 * Script to run all shopping-related tests
 * This can be executed via ts-node or via npm script
 */
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

console.log('🛒 Running all Shopping Page Tests...');

try {
  // Run all tests that have "Shopping" in their name or description
  console.log('\n📋 Running tests with "Shopping" in their name or description:');
  execSync('npx vitest run --testNamePattern "Shopping" --reporter=verbose', { stdio: 'inherit' });

  // Run specific shopping test files
  console.log('\n📋 Running specific shopping test files:');
  const shoppingTestFiles = [
    'src/components/features/shopping/__tests__/ShoppingPageContent.test.tsx',
    'src/components/features/shopping/__tests__/ShoppingList.test.tsx',
    'src/components/features/shopping/__tests__/ShoppingItemsContext.test.tsx',
    'src/components/features/shopping/__tests__/useShoppingItems.test.tsx',
    'src/components/features/shopping/__tests__/shopping-comprehensive.test.tsx',
  ];

  // Run each test file
  for (const file of shoppingTestFiles) {
    if (fs.existsSync(file)) {
      console.log(`\n🧪 Testing: ${file}`);
      execSync(`npx vitest run ${file}`, { stdio: 'inherit' });
    } else {
      console.warn(`⚠️ Warning: Test file ${file} not found, skipping...`);
    }
  }

  // Check for E2E tests
  const e2eTestFile = 'src/tests/e2e/shopping-list.test.ts';
  if (fs.existsSync(e2eTestFile)) {
    console.log('\n🔄 Running E2E shopping tests:');
    execSync(`npx playwright test ${e2eTestFile}`, { stdio: 'inherit' });
  } else {
    console.log('\n⚠️ No E2E tests found or Playwright not configured.');
  }

  console.log('\n✅ All shopping tests completed successfully!');
} catch (error) {
  console.error('\n❌ Some tests failed:', error);
  process.exit(1);
}
