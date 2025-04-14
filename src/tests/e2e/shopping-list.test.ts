
import { test, expect } from '@playwright/test';

/**
 * E2E tests for Shopping List functionality
 */
test.describe('Shopping List E2E Tests', () => {
  // Setup before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to the shopping page
    await page.goto('/shopping');
    
    // Wait for the page to be fully loaded
    await page.waitForSelector('h1:has-text("Shopping")');
  });
  
  test('should render empty shopping list correctly', async ({ page }) => {
    // Check for empty state when no items
    const emptyState = await page.getByText('Your shopping list is empty');
    expect(emptyState).toBeVisible();
    
    // Ensure "Add Item" button is present
    await expect(page.getByRole('button', { name: 'Add Item' })).toBeVisible();
  });
  
  test('should create a new shopping item', async ({ page }) => {
    // Click the add button
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Wait for the dialog to appear
    await page.waitForSelector('div[role="dialog"]');
    
    // Fill in the form
    await page.getByLabel('Name').fill('Test Item');
    await page.getByLabel('Quantity').fill('3');
    
    // Select category dropdown
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Dairy' }).click();
    
    // Submit the form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify item is added
    await expect(page.getByText('Test Item')).toBeVisible();
    await expect(page.getByText('Qty: 3')).toBeVisible();
  });
  
  test('should edit an existing shopping item', async ({ page }) => {
    // First add an item
    await page.getByRole('button', { name: 'Add Item' }).click();
    await page.waitForSelector('div[role="dialog"]');
    await page.getByLabel('Name').fill('Item to Edit');
    await page.getByLabel('Quantity').fill('1');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify item is added
    await expect(page.getByText('Item to Edit')).toBeVisible();
    
    // Click on the item to edit
    await page.getByText('Item to Edit').click();
    
    // Wait for the edit dialog
    await page.waitForSelector('h2:has-text("Edit Item")');
    
    // Change the name and quantity
    await page.getByLabel('Name').fill('Edited Item');
    await page.getByLabel('Quantity').fill('5');
    
    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify changes
    await expect(page.getByText('Edited Item')).toBeVisible();
    await expect(page.getByText('Qty: 5')).toBeVisible();
  });
  
  test('should mark item as purchased', async ({ page }) => {
    // First add an item
    await page.getByRole('button', { name: 'Add Item' }).click();
    await page.waitForSelector('div[role="dialog"]');
    await page.getByLabel('Name').fill('Item to Purchase');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Find and click the checkbox to mark as purchased
    await page.locator('[data-testid="shopping-item-checkbox"]').first().click();
    
    // Check that item moves to purchased section
    await expect(page.locator('h3:has-text("Purchased")')).toBeVisible();
    await expect(page.locator('h3:has-text("Purchased") ~ div').getByText('Item to Purchase')).toBeVisible();
  });
  
  test('should filter items by category', async ({ page }) => {
    // Add items with different categories
    async function addItem(name: string, category: string) {
      await page.getByRole('button', { name: 'Add Item' }).click();
      await page.waitForSelector('div[role="dialog"]');
      await page.getByLabel('Name').fill(name);
      await page.getByRole('combobox').click();
      await page.getByRole('option', { name: category }).click();
      await page.getByRole('button', { name: 'Save' }).click();
    }
    
    await addItem('Milk', 'Dairy');
    await addItem('Apples', 'Produce');
    
    // Click the filter for Dairy
    await page.getByRole('tab', { name: 'Dairy' }).click();
    
    // Should see Milk but not Apples
    await expect(page.getByText('Milk')).toBeVisible();
    await expect(page.getByText('Apples')).not.toBeVisible();
    
    // Switch to Produce filter
    await page.getByRole('tab', { name: 'Produce' }).click();
    
    // Should see Apples but not Milk
    await expect(page.getByText('Apples')).toBeVisible();
    await expect(page.getByText('Milk')).not.toBeVisible();
  });
  
  test('should search for items', async ({ page }) => {
    // Add multiple items
    async function addItem(name: string) {
      await page.getByRole('button', { name: 'Add Item' }).click();
      await page.waitForSelector('div[role="dialog"]');
      await page.getByLabel('Name').fill(name);
      await page.getByRole('button', { name: 'Save' }).click();
    }
    
    await addItem('Bananas');
    await addItem('Oranges');
    await addItem('Banana Bread');
    
    // Enter search term
    await page.getByPlaceholder('Search shopping items...').fill('Banana');
    
    // Should see Bananas and Banana Bread, but not Oranges
    await expect(page.getByText('Bananas')).toBeVisible();
    await expect(page.getByText('Banana Bread')).toBeVisible();
    await expect(page.getByText('Oranges')).not.toBeVisible();
    
    // Change search term
    await page.getByPlaceholder('Search shopping items...').fill('Orange');
    
    // Should see Oranges only
    await expect(page.getByText('Oranges')).toBeVisible();
    await expect(page.getByText('Bananas')).not.toBeVisible();
    await expect(page.getByText('Banana Bread')).not.toBeVisible();
  });
  
  test('should delete an item', async ({ page }) => {
    // Add an item
    await page.getByRole('button', { name: 'Add Item' }).click();
    await page.waitForSelector('div[role="dialog"]');
    await page.getByLabel('Name').fill('Item to Delete');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Click on the item to edit
    await page.getByText('Item to Delete').click();
    
    // Wait for the edit dialog
    await page.waitForSelector('h2:has-text("Edit Item")');
    
    // Click delete button
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion in the confirmation dialog
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    
    // Verify item is removed
    await expect(page.getByText('Item to Delete')).not.toBeVisible();
    
    // Should show empty state again
    await expect(page.getByText('Your shopping list is empty')).toBeVisible();
  });
  
  test('should work offline', async ({ page, context }) => {
    // First add an item online
    await page.getByRole('button', { name: 'Add Item' }).click();
    await page.waitForSelector('div[role="dialog"]');
    await page.getByLabel('Name').fill('Offline Test Item');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify item is added
    await expect(page.getByText('Offline Test Item')).toBeVisible();
    
    // Go offline
    await context.setOffline(true);
    
    // Add another item while offline
    await page.getByRole('button', { name: 'Add Item' }).click();
    await page.waitForSelector('div[role="dialog"]');
    await page.getByLabel('Name').fill('Added While Offline');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify both items are visible
    await expect(page.getByText('Offline Test Item')).toBeVisible();
    await expect(page.getByText('Added While Offline')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Verify sync notification appears (implementation dependent)
    await expect(page.getByText(/synchronized|synced/i)).toBeVisible();
    
    // Verify both items are still visible
    await expect(page.getByText('Offline Test Item')).toBeVisible();
    await expect(page.getByText('Added While Offline')).toBeVisible();
  });
});
