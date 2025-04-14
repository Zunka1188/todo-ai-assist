
import { expect } from '@playwright/test';
import { test, logTestStep, setupPageTest } from './utils/test-utils';

test.describe('Accessibility Testing', () => {
  test('should test keyboard navigation and accessibility on all pages', async ({ page }) => {
    // List of pages to test
    const pagesToTest = [
      '/',
      '/calendar',
      '/shopping',
      '/documents',
      '/settings'
    ];
    
    for (const route of pagesToTest) {
      logTestStep(`Testing keyboard navigation on ${route}`);
      await setupPageTest(page, route);
      
      // Press Tab multiple times to navigate through focusable elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        
        // Get the focused element
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? { 
            tagName: el.tagName, 
            className: el.className,
            textContent: el.textContent?.trim()
          } : null;
        });
        
        // Ensure something is focused
        expect(focusedElement).not.toBeNull();
        logTestStep(`Tab ${i+1}: Focused ${focusedElement?.tagName} with text "${focusedElement?.textContent || 'none'}"`);
        
        // Test space/enter on focusable element if it's a control
        if (i === 5) {
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          
          // Press escape to close any dialogs
          await page.keyboard.press('Escape');
        }
      }
      
      // Test arrow key navigation if applicable
      if (['/calendar'].includes(route)) {
        logTestStep(`Testing arrow key navigation on ${route}`);
        for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) {
          await page.keyboard.press(key);
          await page.waitForTimeout(200);
        }
      }
    }
  });

  test('should test settings page interactions for accessibility', async ({ page }) => {
    await setupPageTest(page, '/settings');
    
    logTestStep('Testing settings page elements with keyboard');
    
    // Find all form controls
    const formControls = [
      page.getByRole('switch'),
      page.getByRole('combobox'),
      page.getByRole('checkbox'),
      page.getByRole('radio'),
      page.getByRole('textbox')
    ];
    
    // Tab to each control and interact with it
    for (let i = 0; i < 15; i++) { // Limit to prevent infinite loop
      await page.keyboard.press('Tab');
      
      // Get the focused element
      const element = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? {
          tagName: el.tagName,
          role: el.getAttribute('role'),
          type: el.getAttribute('type')
        } : null;
      });
      
      if (element) {
        logTestStep(`Focused element: ${element.tagName} (${element.role || element.type || 'no role'})`);
        
        // Interact with element based on its type
        if (element.role === 'switch' || element.type === 'checkbox') {
          await page.keyboard.press('Space');
          await page.waitForTimeout(300);
        } else if (element.role === 'combobox' || element.tagName === 'SELECT') {
          await page.keyboard.press('Enter');
          await page.waitForTimeout(300);
          await page.keyboard.press('Escape');
        }
      }
    }
  });
});
