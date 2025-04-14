
import { expect } from '@playwright/test';
import { test, logTestStep, waitForStableUI } from './utils/test-utils';

test.describe('Shopping List Batch Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to shopping page
    await page.goto('/shopping');
    await page.waitForSelector('h1:text("Shopping")');
    logTestStep('Shopping page loaded');
  });

  test('should perform batch operations on multiple items', async ({ page }) => {
    // Add multiple test items
    logTestStep('Adding test items for batch operations');
    
    // Add first item
    await page.getByRole('button', { name: /add item|\+/i }).click();
    await page.getByRole('dialog').getByLabel(/name/i).fill('Batch Test Item 1');
    await page.getByRole('dialog').getByRole('button', { name: /save|add|create/i }).click();
    await waitForStableUI(page);
    
    // Add second item
    await page.getByRole('button', { name: /add item|\+/i }).click();
    await page.getByRole('dialog').getByLabel(/name/i).fill('Batch Test Item 2');
    await page.getByRole('dialog').getByRole('button', { name: /save|add|create/i }).click();
    await waitForStableUI(page);
    
    // Add third item
    await page.getByRole('button', { name: /add item|\+/i }).click();
    await page.getByRole('dialog').getByLabel(/name/i).fill('Batch Test Item 3');
    await page.getByRole('dialog').getByRole('button', { name: /save|add|create/i }).click();
    await waitForStableUI(page);
    
    // Enable batch selection mode
    logTestStep('Enabling batch selection mode');
    const batchModeButton = page.getByRole('button', { name: /select|batch/i });
    await batchModeButton.click();
    await waitForStableUI(page);
    
    // Select the first two items
    logTestStep('Selecting multiple items');
    const checkboxes = page.locator('[data-testid="shopping-batch-checkbox"]');
    await checkboxes.first().check();
    await waitForStableUI(page);
    await checkboxes.nth(1).check();
    await waitForStableUI(page);
    
    // Test batch mark as completed
    logTestStep('Testing batch mark as completed');
    await page.getByRole('button', { name: /mark completed|complete selected/i }).click();
    await waitForStableUI(page);
    
    // Verify items moved to completed section
    const purchasedSection = page.locator('h3:has-text("Purchased")');
    await expect(purchasedSection).toBeVisible();
    await expect(page.getByText('Batch Test Item 1')).toBeVisible();
    await expect(page.getByText('Batch Test Item 2')).toBeVisible();
    
    // Test batch delete
    logTestStep('Testing batch delete');
    // Enable batch mode again
    await batchModeButton.click();
    await waitForStableUI(page);
    
    // Select all items in purchased section
    const purchasedCheckboxes = page.locator('[data-testid="shopping-batch-checkbox"]');
    await purchasedCheckboxes.first().check();
    await waitForStableUI(page);
    await purchasedCheckboxes.nth(1).check();
    await waitForStableUI(page);
    
    // Delete selected items
    await page.getByRole('button', { name: /delete selected|remove selected/i }).click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();
    await waitForStableUI(page);
    
    // Verify items were deleted
    await expect(page.getByText('Batch Test Item 1')).not.toBeVisible();
    await expect(page.getByText('Batch Test Item 2')).not.toBeVisible();
  });
  
  test('should test image features', async ({ page }) => {
    // Add item with image
    logTestStep('Testing image upload features');
    await page.getByRole('button', { name: /add item|\+/i }).click();
    
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/name/i).fill('Image Test Item');
    
    // Test image upload button
    const imageUploadButton = dialog.getByRole('button', { name: /image|upload|photo/i });
    await expect(imageUploadButton).toBeVisible();
    await imageUploadButton.click();
    
    // Since we can't actually upload a file in this test, we'll just verify
    // the image options are displayed
    const imageOptions = dialog.getByRole('group', { name: /image options/i });
    await expect(imageOptions).toBeVisible();
    
    // Close image options and save item
    const closeButton = dialog.getByRole('button', { name: /close|cancel|×/i }).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
    
    await dialog.getByRole('button', { name: /save|add|create/i }).click();
    await waitForStableUI(page);
    
    // Verify item was added
    await expect(page.getByText('Image Test Item')).toBeVisible();
  });
});
