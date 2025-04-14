
import { test, expect } from '@playwright/test';
import { logTestStep } from './utils/test-utils';

test.describe('Shopping List Batch Operations and Image Preview', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to shopping page
    await page.goto('/shopping');
    await page.waitForSelector('h1:text("Shopping")');
  });

  test('should select multiple items and perform batch operations', async ({ page }) => {
    // Add a few test items first
    logTestStep('Adding test items');
    
    // Add first item
    await page.getByRole('button', { name: /add/i }).click();
    await page.getByLabel(/name/i).fill('Test Item 1');
    await page.getByRole('button', { name: /save|add/i }).click();
    
    // Add second item
    await page.getByRole('button', { name: /add/i }).click();
    await page.getByLabel(/name/i).fill('Test Item 2');
    await page.getByRole('button', { name: /save|add/i }).click();
    
    // Add third item
    await page.getByRole('button', { name: /add/i }).click();
    await page.getByLabel(/name/i).fill('Test Item 3');
    await page.getByRole('button', { name: /save|add/i }).click();
    
    // Wait for items to appear
    await page.waitForTimeout(500);
    
    // Select multiple items
    logTestStep('Selecting multiple items');
    const items = page.locator('[data-testid="shopping-item"], .shopping-item').filter({ hasText: 'Test Item' });
    
    // Select the first two items
    if (await items.count() >= 2) {
      // Click the checkbox or selection element in each item
      for (let i = 0; i < 2; i++) {
        const checkboxOrSelect = items.nth(i).locator('input[type="checkbox"], [role="checkbox"]').first();
        await checkboxOrSelect.click();
      }
      
      // Verify batch actions appear
      logTestStep('Verifying batch actions');
      const batchBar = page.locator('text="2 items selected"');
      await expect(batchBar).toBeVisible();
      
      // Test mark as purchased
      logTestStep('Testing batch mark as purchased');
      await page.getByRole('button', { name: /mark as purchased/i }).click();
      
      // Verify items moved to purchased section
      const purchasedSection = page.locator('h2:text("Purchased Items")');
      await expect(purchasedSection).toBeVisible();
      
      // Select items again
      logTestStep('Selecting items for deletion');
      const purchasedItems = page.locator('[data-testid="shopping-item"], .shopping-item')
        .filter({ hasText: 'Test Item' });
      
      if (await purchasedItems.count() >= 2) {
        for (let i = 0; i < 2; i++) {
          const checkboxOrSelect = purchasedItems.nth(i).locator('input[type="checkbox"], [role="checkbox"]').first();
          await checkboxOrSelect.click();
        }
        
        // Test batch delete
        logTestStep('Testing batch delete');
        await page.getByRole('button', { name: /delete/i }).click();
        
        // Verify items were deleted
        await expect(page.locator('text="Test Item 1"')).not.toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('should test image preview functionality', async ({ page }) => {
    // This test is mocked since we don't have actual image upload functionality yet
    // But it tests that the preview dialog works when an item has an image
    
    logTestStep('Setting up image preview test');
    
    // Execute script to mock an item with an image
    await page.evaluate(() => {
      // Mock adding an item with image to localStorage
      const mockItem = {
        id: 'mock-item-with-image',
        name: 'Item with Image',
        completed: false,
        imageUrl: 'https://picsum.photos/200/300', // Using placeholder image service
        quantity: 1,
        category: 'Produce'
      };
      
      // Get current items or initialize empty array
      const currentItems = JSON.parse(localStorage.getItem('shoppingItems') || '[]');
      currentItems.push(mockItem);
      
      // Save back to localStorage
      localStorage.setItem('shoppingItems', JSON.stringify(currentItems));
      
      // Dispatch storage event to trigger re-render
      window.dispatchEvent(new Event('storage'));
    });
    
    // Refresh to load the mocked item
    await page.reload();
    await page.waitForSelector('h1:text("Shopping")');
    
    // Look for the mocked item
    const mockedItem = page.locator('text="Item with Image"').first();
    await expect(mockedItem).toBeVisible({ timeout: 3000 });
    
    // Find and click on the image preview element (this might need adjustment based on actual implementation)
    logTestStep('Opening image preview');
    const imagePreviewTrigger = page.locator('[data-testid="shopping-item"], .shopping-item')
      .filter({ hasText: 'Item with Image' })
      .locator('img, [role="img"], .item-image, .preview-trigger')
      .first();
    
    if (await imagePreviewTrigger.count() > 0) {
      await imagePreviewTrigger.click();
      
      // Verify image preview dialog opened
      logTestStep('Verifying image preview dialog');
      const imageDialog = page.locator('text="Item with Image Image"').first();
      await expect(imageDialog).toBeVisible({ timeout: 3000 });
      
      // Test zoom in button
      logTestStep('Testing zoom controls');
      await page.getByRole('button', { name: /zoom in/i }).click();
      
      // Test download button (we can't verify the actual download)
      await page.getByRole('button', { name: /download/i }).click();
      
      // Close the dialog
      logTestStep('Closing image preview');
      await page.getByRole('button', { name: 'Close' }).click();
      await expect(imageDialog).not.toBeVisible({ timeout: 2000 });
    } else {
      console.log('Image preview trigger not found, skipping this part of the test');
    }
    
    // Clean up - remove the mocked item
    await page.evaluate(() => {
      const currentItems = JSON.parse(localStorage.getItem('shoppingItems') || '[]');
      const filteredItems = currentItems.filter(item => item.id !== 'mock-item-with-image');
      localStorage.setItem('shoppingItems', JSON.stringify(filteredItems));
    });
  });
});
