
import { expect } from '@playwright/test';
import { test, logTestStep, waitForStableUI, testAllButtonsIn, closeOpenDialogs } from './utils/test-utils';

test.describe('Home Page Interactive Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should test all interactive elements on Home page', async ({ page }) => {
    logTestStep('Testing Home page interactions');
    
    // Test page title is visible
    await expect(page.getByRole('heading').first()).toBeVisible();

    // Test main scan button
    const scanButton = page.getByTestId('scan-button');
    await expect(scanButton).toBeVisible();
    await scanButton.hover();
    logTestStep('Verified scan button');

    // Test theme toggle
    const themeToggle = page.locator('header button').filter({ hasText: '' }).nth(3);
    await themeToggle.click();
    await themeToggle.click(); // Toggle back
    logTestStep('Toggled theme');

    // Test all navigation links in the header menu
    logTestStep('Testing header menu');
    await page.getByRole('button', { name: /menu/i }).click();
    const menuItems = page.locator('[role="menuitem"]');
    const menuCount = await menuItems.count();
    
    for (let i = 0; i < menuCount; i++) {
      await expect(menuItems.nth(i)).toBeVisible();
    }
    
    // Close menu by clicking elsewhere
    await page.mouse.click(10, 10);

    // Test settings navigation
    logTestStep('Testing settings navigation');
    await page.getByRole('link', { name: /settings/i }).click();
    await page.waitForURL('**/settings');
    await expect(page.getByText(/settings/i)).toBeVisible();
    await page.goBack();
    await waitForStableUI(page);

    // Test language selector
    logTestStep('Testing language selector');
    const languageSelector = page.locator('header button').filter({ hasText: '' }).nth(0);
    await languageSelector.click();
    await page.mouse.click(10, 10); // Close dropdown

    // Test AI chat button
    logTestStep('Testing AI chat button');
    const chatButton = page.locator('header button').filter({ hasText: '' }).first();
    await chatButton.click();
    const chatPanel = page.locator('[role="dialog"]').filter({ hasText: /AI Food Assistant/i });
    await expect(chatPanel).toBeVisible();
    await page.getByRole('button', { name: /close|×/i }).click();

    // Test all feature cards
    logTestStep('Testing feature cards');
    const featureCards = page.getByRole('link').filter({ has: page.locator('.hover-scale') });
    const cardCount = await featureCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 3); i++) { // Test first 3 cards to keep test reasonable
      const cardText = await featureCards.nth(i).textContent();
      logTestStep(`Clicking feature card: ${cardText}`);
      await featureCards.nth(i).click();
      
      // Verify navigation happened
      await expect(page).not.toHaveURL('/');
      
      // Go back to home page
      await page.goBack();
      await waitForStableUI(page);
    }

    // Test widgets on home page
    logTestStep('Testing home page widgets');
    const widgets = page.locator('.widget, [class*="widget"]');
    const widgetCount = await widgets.count();
    
    for (let i = 0; i < widgetCount; i++) {
      await widgets.nth(i).hover();
      logTestStep(`Testing widget ${i + 1}`);
      
      // If widget has buttons, test them
      const widgetButtons = widgets.nth(i).getByRole('button');
      await testAllButtonsIn(page, widgets.nth(i));
    }
  });

  test('should test bottom navigation menu and redirection', async ({ page }) => {
    logTestStep('Testing bottom navigation');
    
    // Test bottom navigation
    const bottomNav = page.locator('nav').filter({ has: page.locator('[class*="bottom-navigation"]') });
    
    if (await bottomNav.isVisible()) {
      const navLinks = bottomNav.getByRole('link');
      const navCount = await navLinks.count();
      
      for (let i = 0; i < navCount; i++) {
        const linkText = await navLinks.nth(i).textContent();
        logTestStep(`Clicking nav item: ${linkText || `item ${i+1}`}`);
        
        // Click navigation item
        await navLinks.nth(i).click();
        await waitForStableUI(page);
        
        // Ensure page navigated
        const currentUrl = page.url();
        expect(currentUrl).not.toBe('about:blank');
        
        // Check page has content
        await expect(page.getByRole('heading').first()).toBeVisible();
        
        // If there are interactive elements on this page, test a few
        const buttons = page.getByRole('button');
        if (await buttons.count() > 0) {
          await buttons.first().hover();
        }
        
        // Navigate back to home for next test
        if (i < navCount - 1) {
          await page.goto('/');
          await waitForStableUI(page);
        }
      }
    } else {
      logTestStep('Bottom navigation not found, skipping test');
    }
  });

  test('should test keyboard navigation and accessibility on home page', async ({ page }) => {
    logTestStep('Testing keyboard navigation');
    
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
      
      // Log focused element
      if (focusedElement) {
        logTestStep(`Focused element: ${focusedElement.tagName} - ${focusedElement.textContent || 'no text'}`);
      }
      
      // If it's a button or link, press Enter to activate it
      if (i === 5) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        await closeOpenDialogs(page);
      }
    }
  });
});
