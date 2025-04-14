
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
  skipTexts: RegExp[] = [/close|cancel|×|save|submit/i]
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
    await dialog.getByRole('button', { name: /close|cancel|×/i }).first().click().catch(() => {
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
