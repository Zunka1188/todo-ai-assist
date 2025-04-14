
import { test as base, expect, Page } from '@playwright/test';
import { LogLevel } from '@playwright/test/reporter';

/**
 * Enhanced test utilities for E2E testing with improved logging and error handling
 */

// Custom test fixture with enhanced logging
export const test = base.extend({
  page: async ({ page }, use) => {
    // Add page error handler
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });
    
    // Add page error event handler
    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });
    
    await use(page);
  },
  
  // Add isMobile flag to easily test responsive behavior
  isMobile: async ({ page }, use) => {
    // Default to non-mobile
    await use(false);
    
    // Then run the same test in mobile mode
    await page.setViewportSize({ width: 390, height: 844 });
    await use(true);
  }
});

// Re-export expect
export { expect };

/**
 * Log test step with timestamp
 */
export function logTestStep(message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔍 ${message}`);
}

/**
 * Wait for network to be idle and animations to complete
 */
export async function waitForStableUI(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  // Allow animations to complete
  await page.waitForTimeout(300);
}

/**
 * Test all buttons in a container that match certain criteria
 */
export async function testAllButtonsIn(
  page: Page, 
  container: any, 
  skipTexts: RegExp[] = [/close|cancel|×|save|submit|confirm|yes|no/i]
): Promise<void> {
  const buttons = container.getByRole('button');
  const count = await buttons.count();
  
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const buttonText = await button.textContent();
    
    // Skip buttons that match the skip patterns
    const shouldSkip = skipTexts.some(pattern => buttonText?.match(pattern));
    if (shouldSkip) continue;
    
    // Test button
    if (await button.isVisible()) {
      logTestStep(`Clicking button: ${buttonText || 'unnamed button'}`);
      await button.click();
      await page.waitForTimeout(300);
      
      // Check for dialogs that may have opened and close them
      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        const closeButton = dialog.getByRole('button', { name: /close|cancel|×/i }).first();
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();
        }
      }
    }
  }
}

/**
 * Close any open dialogs
 */
export async function closeOpenDialogs(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible().catch(() => false)) {
    logTestStep('Closing open dialog');
    await dialog.getByRole('button', { name: /close|cancel|×|no/i }).first().click().catch(() => {
      // If clicking the close button fails, try clicking outside
      return page.mouse.click(10, 10);
    });
  }
}

/**
 * Setup common test conditions by navigating to a page and waiting for it to load
 */
export async function setupPageTest(page: Page, route: string): Promise<void> {
  logTestStep(`Navigating to ${route}`);
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  
  // Verify page loaded successfully
  const heading = page.getByRole('heading').first();
  await expect(heading).toBeVisible();
}

/**
 * Take screenshots during test execution for visual debugging
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().getTime();
  await page.screenshot({ path: `./test-results/screenshots/${name}-${timestamp}.png` });
  logTestStep(`Screenshot taken: ${name}-${timestamp}.png`);
}

/**
 * Fill out form fields by label text
 */
export async function fillFormByLabels(page: Page, formData: {[key: string]: string}): Promise<void> {
  for (const [label, value] of Object.entries(formData)) {
    const field = page.getByLabel(new RegExp(label, 'i'));
    if (await field.isVisible()) {
      await field.fill(value);
      logTestStep(`Filled ${label} with "${value}"`);
    }
  }
}

/**
 * Select option from dropdown by label
 */
export async function selectDropdownOption(page: Page, dropdownLabel: string, optionText: string): Promise<void> {
  const dropdown = page.getByLabel(new RegExp(dropdownLabel, 'i'));
  if (await dropdown.isVisible()) {
    await dropdown.click();
    
    // Find and click the option
    const option = page.getByRole('option', { name: new RegExp(optionText, 'i') });
    if (await option.isVisible()) {
      await option.click();
      logTestStep(`Selected "${optionText}" from ${dropdownLabel} dropdown`);
      return;
    }
    
    // If option not found, close dropdown by clicking elsewhere
    await page.mouse.click(10, 10);
  }
}

/**
 * Test pagination controls
 */
export async function testPagination(page: Page): Promise<void> {
  const pagination = page.locator('nav').filter({ has: page.locator('[aria-label="pagination"]') });
  
  if (await pagination.isVisible()) {
    logTestStep('Testing pagination');
    
    // Test next page button
    const nextButton = pagination.getByLabel(/next|forward/i);
    if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
      await nextButton.click();
      await waitForStableUI(page);
    }
    
    // Test previous page button
    const prevButton = pagination.getByLabel(/previous|back/i);
    if (await prevButton.isVisible() && !(await prevButton.isDisabled())) {
      await prevButton.click();
      await waitForStableUI(page);
    }
  }
}
