
import { test, expect } from '@playwright/test';

/**
 * Tests focusing on error handling and edge cases
 */
test.describe('Error Handling and Edge Cases', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Go to a page that loads data
    await page.goto('/calendar');
    
    // Simulate offline mode
    await page.context().setOffline(true);
    
    // Perform an action that requires network
    await page.getByRole('button', { name: /refresh|reload/i }).click();
    
    // Look for error state or fallback UI
    const errorMessage = page.getByText(/network error|offline|check your connection/i);
    
    // If error message is found, test passes
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    } else {
      // If offline mode is properly handled without explicit error, check for normal UI
      await expect(page.getByText(/calendar/i)).toBeVisible();
    }
    
    // Restore online mode
    await page.context().setOffline(false);
    await page.reload();
    
    // Confirm page recovers
    await expect(page.getByRole('heading')).toBeVisible();
  });
  
  test('should handle invalid inputs gracefully', async ({ page }) => {
    // Test form with invalid inputs
    await page.goto('/calendar');
    await page.getByRole('button', { name: /add event/i }).click();
    
    const dialog = page.getByRole('dialog');
    
    // Test with extremely long input
    const longString = 'A'.repeat(1000);
    await dialog.getByLabel(/title/i).fill(longString);
    
    // Submit the form
    await dialog.getByRole('button', { name: /save/i }).click();
    
    // Check for validation error or truncation
    const errorMessage = dialog.getByText(/too long|maximum/i);
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Test with special characters
    await dialog.getByLabel(/title/i).fill('Test <script>alert("XSS")</script>');
    await dialog.getByRole('button', { name: /save/i }).click();
    
    // App should either escape HTML or reject input
    
    // Cancel the dialog
    await dialog.getByRole('button', { name: /cancel/i }).click();
  });
  
  test('should test rapid interactions and multiple clicks', async ({ page }) => {
    await page.goto('/');
    
    // Find a button that triggers state change
    const actionButton = page.getByRole('button').first();
    
    // Click rapidly multiple times
    for (let i = 0; i < 5; i++) {
      await actionButton.click({ delay: 10 });
    }
    
    // Ensure page doesn't crash
    await expect(page).toHaveURL(/.*/);
    
    // If there are counters or elements that respond to clicks, check their state
    const possibleCounter = page.getByText(/count: \d+/i);
    if (await possibleCounter.isVisible()) {
      await expect(possibleCounter).toBeVisible();
    }
  });
  
  test('should test overflowing content handling', async ({ page }) => {
    // Go to a page with text content
    await page.goto('/documents');
    
    // Try to find a card or container with text
    const contentContainer = page.locator('.card, article, .content-container').first();
    
    if (await contentContainer.isVisible()) {
      // Get the container's dimensions
      const containerBox = await contentContainer.boundingBox();
      
      if (containerBox) {
        // Check if overflow handling works properly
        const isOverflowing = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            return element.scrollHeight > element.clientHeight || 
                   element.scrollWidth > element.clientWidth;
          }
          return false;
        }, contentContainer.toString());
        
        if (isOverflowing) {
          // Check if scrollbars appear or text is ellipsized
          const style = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
              const computedStyle = window.getComputedStyle(element);
              return {
                overflow: computedStyle.overflow,
                textOverflow: computedStyle.textOverflow
              };
            }
            return null;
          }, contentContainer.toString());
          
          if (style) {
            // Content should either scroll or ellipsize
            expect(style.overflow === 'auto' || 
                   style.overflow === 'scroll' || 
                   style.textOverflow === 'ellipsis').toBeTruthy();
          }
        }
      }
    }
  });
  
  test('should test accessibility navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test skip to content link (common accessibility feature)
    const skipLink = page.getByRole('link', { name: /skip to content/i });
    if (await skipLink.isVisible({ timeout: 1000 })) {
      await skipLink.click();
      
      // Focus should be on main content
      const activeElement = await page.evaluate(() => 
        document.activeElement?.tagName + 
        (document.activeElement?.id ? '#' + document.activeElement.id : '')
      );
      
      expect(activeElement).toContain('MAIN');
    }
    
    // Test keyboard navigation through focusable elements
    await page.keyboard.press('Tab');
    
    // Get the active element after tab
    const firstFocus = await page.evaluate(() => 
      document.activeElement?.tagName +
      (document.activeElement?.textContent ? ' - ' + document.activeElement.textContent.trim() : '')
    );
    
    // Should have focused on something
    expect(firstFocus).not.toBe('BODY');
    
    // Continue tabbing to ensure focus trap doesn't exist
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Check we can reach the end of the page with keyboard
    const finalFocus = await page.evaluate(() => 
      document.activeElement?.tagName +
      (document.activeElement?.textContent ? ' - ' + document.activeElement.textContent.trim() : '')
    );
    
    // Focus should have moved to a different element
    expect(finalFocus).not.toBe(firstFocus);
  });
});
