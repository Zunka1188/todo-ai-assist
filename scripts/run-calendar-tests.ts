
/**
 * Script to run all calendar-related tests
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

console.log(colorize.heading('📅 Running all Calendar Page Tests...'));

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
  // Run all tests that have "Calendar" in their name or description
  console.log(`\n${colorize.heading('📋 Running tests with "Calendar" in their name:')}`);
  try {
    execSync('npx vitest run --testNamePattern "Calendar" --reporter=basic', { stdio: 'inherit' });
  } catch (error) {
    console.error(colorize.error('\n❌ Some pattern-matched tests failed'));
  }

  // Run specific calendar test files
  console.log(`\n${colorize.heading('📋 Running specific calendar test files:')}`);
  const calendarTestFiles = [
    'src/components/features/calendar/ui/CalendarContent.test.tsx',
    'src/components/features/calendar/test/CalendarTest.test.tsx',
    'src/components/features/calendar/tests/CalendarHeader.test.tsx',
    'src/components/features/calendar/views/__tests__/EnhancedMonthView.test.tsx'
  ];

  // Run each test file
  let passedCount = 0;
  let failedCount = 0;

  for (const [index, file] of calendarTestFiles.entries()) {
    if (fs.existsSync(file)) {
      const testName = path.basename(file, '.tsx').replace(/\./g, ' ');
      const success = runTest(file, testName);
      if (success) passedCount++; else failedCount++;
    } else {
      console.warn(colorize.warning(`⚠️ Warning: Test file ${file} not found, skipping...`));
    }
  }

  // Check for E2E tests
  const e2eTestFile = 'tests/e2e/calendar.test.ts';
  if (fs.existsSync(e2eTestFile)) {
    console.log(`\n${colorize.heading('🔄 Running E2E calendar tests:')}`);
    try {
      execSync(`npx playwright test ${e2eTestFile}`, { stdio: 'inherit' });
      passedCount++;
      results.push({ name: 'E2E Calendar Tests', passed: true, duration: 0 });
    } catch (error) {
      failedCount++;
      results.push({ name: 'E2E Calendar Tests', passed: false, duration: 0 });
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

  console.log(`\n${colorize.heading('✅ All calendar tests completed!')}`);
  
  // Exit with error code if any test failed
  if (failedCount > 0) {
    process.exit(1);
  }
} catch (error) {
  console.error(colorize.error(`\n❌ Error running tests: ${error}`));
  process.exit(1);
}
