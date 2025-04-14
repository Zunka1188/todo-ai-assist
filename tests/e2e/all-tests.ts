
import { test } from '@playwright/test';
import { logTestStep } from './utils/test-utils';

/**
 * Master test suite that runs all individual test suites
 * This helps maintain a single entry point while having modular tests
 */

test.describe('All Application Tests', () => {
  test('Run complete test suite', async ({ page }) => {
    // This is a placeholder test that will run when "all-tests.ts" is executed directly
    logTestStep('Running the complete test suite...');
    logTestStep('Please run individual test files or use the test runner to execute all tests');
    
    // Display available test files
    const availableTests = [
      'home-page.test.ts',
      'calendar-page.test.ts',
      'shopping-page.test.ts',
      'documents-page.test.ts',
      'ai-chat-integration.test.ts',
      'accessibility.test.ts'
    ];
    
    logTestStep('Available test files:');
    availableTests.forEach(file => {
      console.log(`- ${file}`);
    });
    
    logTestStep('Run with: npx playwright test tests/e2e/[test-name].test.ts');
    logTestStep('Or run all tests with: npx playwright test tests/e2e/');
  });
});

// Import all test suites here to ensure they're discovered
// when running the test runner on this directory
import './home-page.test.ts';
import './calendar-page.test.ts';
import './shopping-page.test.ts';
import './documents-page.test.ts';
import './ai-chat-integration.test.ts';
import './accessibility.test.ts';
