
/**
 * Script to run all shopping-related tests
 * This can be executed via ts-node or via npm script
 */
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as chalk from 'chalk';

// Enable color output
const colorize = {
  heading: (text: string) => chalk.bold.blue(text),
  success: (text: string) => chalk.green(text),
  error: (text: string) => chalk.red(text),
  warning: (text: string) => chalk.yellow(text),
  info: (text: string) => chalk.cyan(text)
};

console.log(colorize.heading('🛒 Running all Shopping Page Tests...'));

// Track test results
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
}

const results: TestResult[] = [];
const startTime = Date.now();

// Helper function to run a test and track results
function runTest(testPath: string, testName: string): boolean {
  const testStart = Date.now();
  console.log(`\n${colorize.warning(`Running ${testName}...`)}`);
  
  try {
    execSync(`npx vitest run ${testPath} --reporter=basic`, { stdio: 'inherit' });
    const duration = Date.now() - testStart;
    results.push({ name: testName, passed: true, duration });
    console.log(colorize.success(`✅ PASSED: ${testName} (${duration}ms)`));
    return true;
  } catch (error) {
    const duration = Date.now() - testStart;
    results.push({ name: testName, passed: false, duration });
    console.log(colorize.error(`❌ FAILED: ${testName} (${duration}ms)`));
    return false;
  }
}

try {
  // Run all tests that have "Shopping" in their name or description
  console.log(`\n${colorize.heading('📋 Running tests with "Shopping" in their name:')}`);
  try {
    execSync('npx vitest run --testNamePattern "Shopping" --reporter=basic', { stdio: 'inherit' });
  } catch (error) {
    console.error(colorize.error('\n❌ Some pattern-matched tests failed'));
  }

  // Run specific shopping test files
  console.log(`\n${colorize.heading('📋 Running specific shopping test files:')}`);
  const shoppingTestFiles = [
    'src/components/features/shopping/__tests__/ShoppingPageContent.test.tsx',
    'src/components/features/shopping/__tests__/ShoppingList.test.tsx',
    'src/components/features/shopping/__tests__/ShoppingItemsContext.test.tsx',
    'src/components/features/shopping/__tests__/useShoppingItems.test.tsx',
    'src/components/features/shopping/__tests__/shopping-comprehensive.test.tsx',
    'src/components/features/shopping/__tests__/ShoppingPage.performance.test.tsx'
  ];

  // Run each test file
  let passedCount = 0;
  let failedCount = 0;

  for (const [index, file] of shoppingTestFiles.entries()) {
    if (fs.existsSync(file)) {
      const testName = path.basename(file, '.tsx').replace(/\./g, ' ');
      const success = runTest(file, testName);
      if (success) passedCount++; else failedCount++;
    } else {
      console.warn(colorize.warning(`⚠️ Warning: Test file ${file} not found, skipping...`));
    }
  }

  // Check for E2E tests
  const e2eTestFile = 'src/tests/e2e/shopping-list.test.ts';
  if (fs.existsSync(e2eTestFile)) {
    console.log(`\n${colorize.heading('🔄 Running E2E shopping tests:')}`);
    try {
      execSync(`npx playwright test ${e2eTestFile}`, { stdio: 'inherit' });
      passedCount++;
      results.push({ name: 'E2E Shopping Tests', passed: true, duration: 0 });
    } catch (error) {
      failedCount++;
      results.push({ name: 'E2E Shopping Tests', passed: false, duration: 0 });
    }
  } else {
    console.log(`\n${colorize.warning('⚠️ No E2E tests found or Playwright not configured.')}`);
  }

  // Print summary
  const totalTime = Date.now() - startTime;
  console.log(`\n${colorize.heading('📊 Test Summary:')}`);
  console.log(colorize.success(`✅ Tests passed: ${passedCount}`));
  console.log(colorize.error(`❌ Tests failed: ${failedCount}`));
  console.log(colorize.info(`⏱️ Total duration: ${totalTime}ms`));

  console.log(`\n${colorize.heading('✅ All shopping tests completed!')}`);
  
  // Exit with error code if any test failed
  if (failedCount > 0) {
    process.exit(1);
  }
} catch (error) {
  console.error(colorize.error(`\n❌ Error running tests: ${error}`));
  process.exit(1);
}
