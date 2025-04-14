
import { expect, Page } from '@playwright/test';
import { test, logTestStep, waitForStableUI, closeOpenDialogs } from './utils/test-utils';

/**
 * Comprehensive E2E tests for Shopping List functionality
 * Tests all interactive elements on desktop and mobile views
 */

// Helper function to test responsive behavior
async function runTestsInViewport(page: Page, width: number, height: number, isMobile: boolean) {
  await page.setViewportSize({ width, height });
  const viewportType = isMobile ? 'Mobile' : 'Desktop';
  logTestStep(`Testing on ${viewportType} viewport (${width}x${height})`);
}

test.describe('Shopping List Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the shopping page
    await page.goto('/shopping');
    
    // Wait for the page to be fully loaded
    await page.waitForSelector('h1', { hasText: /Shopping/i });
    logTestStep('Shopping page loaded');
  });

  test('should test all header elements and interactions', async ({ page, isMobile }) => {
    // Test screen sizes (run tests on both desktop and mobile)
    if (!isMobile) {
      await runTestsInViewport(page, 1280, 800, false);
    } else {
      await runTestsInViewport(page, 390, 844, true);
    }
    
    // Test search functionality
    logTestStep('Testing search bar');
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Test Item');
    await page.keyboard.press('Enter');
    await waitForStableUI(page);
    
    // Test add item button
    logTestStep('Testing add item button');
    const addButton = page.getByRole('button', { name: /add item|\+/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // Verify add dialog opened
    const addDialog = page.getByRole('dialog');
    await expect(addDialog).toBeVisible();
    await expect(addDialog.getByText(/Add Item|New Item/i)).toBeVisible();
    
    // Close dialog to continue tests
    await closeOpenDialogs(page);
    
    // Test filter dropdown if available
    logTestStep('Testing filter dropdown');
    const filterButton = page.getByRole('button', { name: /filter/i }).first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await waitForStableUI(page);
      
      // Try clicking first filter option
      const filterOptions = page.locator('[role="menuitem"]');
      if (await filterOptions.count() > 0) {
        await filterOptions.first().click();
      } else {
        // Close dropdown by clicking elsewhere
        await page.mouse.click(10, 10);
      }
    }
    
    // Test sort dropdown if available
    logTestStep('Testing sort dropdown');
    const sortButton = page.getByRole('button', { name: /sort/i }).first();
    if (await sortButton.isVisible()) {
      await sortButton.click();
      await waitForStableUI(page);
      
      // Try clicking first sort option
      const sortOptions = page.locator('[role="menuitem"]');
      if (await sortOptions.count() > 0) {
        await sortOptions.first().click();
      } else {
        // Close dropdown by clicking elsewhere
        await page.mouse.click(10, 10);
      }
    }
  });

  test('should test filter tabs functionality', async ({ page, isMobile }) => {
    // Test screen sizes (run tests on both desktop and mobile)
    if (!isMobile) {
      await runTestsInViewport(page, 1280, 800, false);
    } else {
      await runTestsInViewport(page, 390, 844, true);
    }
    
    // Test tab navigation
    logTestStep('Testing filter tabs');
    const tabs = [
      { name: 'All', selector: /all/i },
      { name: 'One-off', selector: /one-off/i },
      { name: 'Weekly', selector: /weekly/i },
      { name: 'Monthly', selector: /monthly/i },
    ];
    
    for (const tab of tabs) {
      const tabElement = page.getByRole('tab', { name: tab.selector });
      if (await tabElement.isVisible()) {
        logTestStep(`Clicking ${tab.name} tab`);
        await tabElement.click();
        await waitForStableUI(page);
        
        // Verify tab is selected
        await expect(tabElement).toHaveAttribute('aria-selected', 'true');
      } else {
        logTestStep(`Tab "${tab.name}" not found, skipping`);
      }
    }
  });

  test('should add, edit and delete a shopping item', async ({ page, isMobile }) => {
    // Test screen sizes (run tests on both desktop and mobile)
    if (!isMobile) {
      await runTestsInViewport(page, 1280, 800, false);
    } else {
      await runTestsInViewport(page, 390, 844, true);
    }
    
    // Add new item
    logTestStep('Adding a new shopping item');
    await page.getByRole('button', { name: /add item|\+/i }).click();
    
    // Fill out the form
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/name/i).fill('Test Shopping Item');
    
    // Fill amount if available
    const amountInput = dialog.getByLabel(/amount|quantity/i);
    if (await amountInput.isVisible()) {
      await amountInput.fill('3');
    }
    
    // Fill notes if available
    const notesInput = dialog.getByLabel(/notes/i);
    if (await notesInput.isVisible()) {
      await notesInput.fill('Test notes for this item');
    }
    
    // Select category if dropdown is available
    const categoryDropdown = page.getByRole('combobox');
    if (await categoryDropdown.isVisible()) {
      await categoryDropdown.click();
      await waitForStableUI(page);
      
      // Select first option
      const option = page.getByRole('option').first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
    
    // Test repeat options if available
    logTestStep('Testing repeat options');
    const repeatOptions = [
      { name: 'None', selector: /none/i },
      { name: 'Weekly', selector: /weekly/i },
      { name: 'Monthly', selector: /monthly/i },
    ];
    
    for (const option of repeatOptions) {
      const optionElement = dialog.getByText(option.selector);
      if (await optionElement.isVisible()) {
        await optionElement.click();
        logTestStep(`Selected ${option.name} repeat option`);
        break; // Select just one option
      }
    }
    
    // Test image upload if available
    logTestStep('Testing image upload functionality');
    const uploadButton = dialog.getByRole('button', { name: /upload|image|photo/i });
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
      // Note: We can't actually upload a file in this test without additional setup
      // Just verify the button works
      logTestStep('Clicked upload button');
      
      // Check for full screen preview button and click it if available
      const previewButton = dialog.getByRole('button', { name: /preview|fullscreen/i });
      if (await previewButton.isVisible()) {
        await previewButton.click();
        await waitForStableUI(page);
        
        // Close preview if opened
        const closeButton = page.getByRole('button', { name: /close|×/i });
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
      
      // Check for clear image button
      const clearButton = dialog.getByRole('button', { name: /clear|×/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();
      }
    }
    
    // Save the item
    await dialog.getByRole('button', { name: /save|add|create/i }).click();
    await waitForStableUI(page);
    
    // Verify item was added
    await expect(page.getByText('Test Shopping Item')).toBeVisible();
    
    // Test item checkbox (complete/incomplete)
    logTestStep('Testing item checkbox');
    const checkbox = page.locator('[data-testid="shopping-item-checkbox"], [role="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await waitForStableUI(page);
      
      // Toggle back
      await checkbox.click();
      await waitForStableUI(page);
    }
    
    // Test edit functionality
    logTestStep('Testing edit functionality');
    const editButton = page.getByRole('button', { name: /edit|✎/i }).first();
    if (await editButton.isVisible()) {
      await editButton.click();
    } else {
      // Alternative: click on the item itself to edit
      await page.getByText('Test Shopping Item').click();
    }
    
    // Verify edit dialog opened
    const editDialog = page.getByRole('dialog');
    await expect(editDialog).toBeVisible();
    
    // Modify the item
    await editDialog.getByLabel(/name/i).fill('Test Shopping Item (Edited)');
    await editDialog.getByRole('button', { name: /save/i }).click();
    await waitForStableUI(page);
    
    // Verify item was edited
    await expect(page.getByText('Test Shopping Item (Edited)')).toBeVisible();
    
    // Test delete functionality
    logTestStep('Testing delete functionality');
    // Click on item again to open edit dialog
    await page.getByText('Test Shopping Item (Edited)').click();
    
    // Find and click delete button
    const deleteButton = page.getByRole('button', { name: /delete|remove|trash|🗑️/i });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion if prompted
      const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      await waitForStableUI(page);
      
      // Verify item was deleted
      await expect(page.getByText('Test Shopping Item (Edited)')).not.toBeVisible();
    }
  });

  test('should test bulk actions functionality', async ({ page, isMobile }) => {
    // Test screen sizes (run tests on both desktop and mobile)
    if (!isMobile) {
      await runTestsInViewport(page, 1280, 800, false);
    } else {
      await runTestsInViewport(page, 390, 844, true);
    }
    
    // First add multiple items
    const itemNames = ['Bulk Item 1', 'Bulk Item 2', 'Bulk Item 3'];
    
    for (const name of itemNames) {
      // Add new item
      await page.getByRole('button', { name: /add item|\+/i }).click();
      
      // Fill out form with minimal fields
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel(/name/i).fill(name);
      await dialog.getByRole('button', { name: /save|add|create/i }).click();
      await waitForStableUI(page);
    }
    
    // Test select all functionality if available
    logTestStep('Testing bulk actions');
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    
    if (await selectAllButton.isVisible()) {
      await selectAllButton.click();
      await waitForStableUI(page);
      
      // Test delete selected if available
      const deleteSelectedButton = page.getByRole('button', { name: /delete selected/i });
      if (await deleteSelectedButton.isVisible()) {
        await deleteSelectedButton.click();
        
        // Confirm deletion if prompted
        const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        await waitForStableUI(page);
        
        // Verify items were deleted
        for (const name of itemNames) {
          await expect(page.getByText(name)).not.toBeVisible();
        }
      } else {
        // If no bulk delete, deselect by clicking select all again
        await selectAllButton.click();
      }
    } else {
      // Alternative: select items individually
      logTestStep('Select all button not found, selecting items individually');
      
      const checkboxes = page.locator('[data-testid="shopping-item-checkbox"], [role="checkbox"]');
      const count = await checkboxes.count();
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        await checkboxes.nth(i).click();
        await waitForStableUI(page);
      }
      
      // Check for any bulk action buttons that appear
      const bulkActionButtons = page.getByRole('button').filter({ 
        hasText: /delete selected|share selected|clear completed/i 
      });
      
      if (await bulkActionButtons.count() > 0) {
        await bulkActionButtons.first().click();
        
        // Confirm if prompted
        const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
    }
  });

  test('should test all item action buttons', async ({ page, isMobile }) => {
    // Test screen sizes (run tests on both desktop and mobile)
    if (!isMobile) {
      await runTestsInViewport(page, 1280, 800, false);
    } else {
      await runTestsInViewport(page, 390, 844, true);
    }
    
    // Add a test item
    await page.getByRole('button', { name: /add item|\+/i }).click();
    await page.getByRole('dialog').getByLabel(/name/i).fill('Action Test Item');
    await page.getByRole('dialog').getByRole('button', { name: /save|add|create/i }).click();
    await waitForStableUI(page);
    
    // Find the added item
    const item = page.getByText('Action Test Item');
    await expect(item).toBeVisible();
    
    // Get the item container
    const itemContainer = item.locator('..').locator('..'); // Get parent of parent
    
    // Test favorite button if available
    logTestStep('Testing item action buttons');
    const favoriteButton = itemContainer.getByRole('button', { name: /favorite|⭐/i }).first();
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      await waitForStableUI(page);
    }
    
    // Test share button if available
    const shareButton = itemContainer.getByRole('button', { name: /share|↗️/i }).first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await waitForStableUI(page);
      
      // Close share dialog if opened
      await closeOpenDialogs(page);
    }
    
    // Test duplicate button if available
    const duplicateButton = itemContainer.getByRole('button', { name: /duplicate|copy|📋/i }).first();
    if (await duplicateButton.isVisible()) {
      await duplicateButton.click();
      await waitForStableUI(page);
      
      // Verify item was duplicated
      const items = page.getByText('Action Test Item');
      await expect(await items.count()).toBeGreaterThan(1);
    }
    
    // Test item completion
    const checkbox = itemContainer.locator('[data-testid="shopping-item-checkbox"], [role="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await waitForStableUI(page);
      
      // Check if moved to completed section
      const completedSection = page.locator('h3:has-text("Completed"), h3:has-text("Purchased")').first();
      if (await completedSection.isVisible()) {
        // Look for the item in the completed section
        await expect(page.getByText('Action Test Item')).toBeVisible();
      }
    }
    
    // Clean up - delete the test item
    // First try finding the item (it may have moved to a completed section)
    const itemToDelete = page.getByText('Action Test Item').first();
    
    // Click on the item to open edit dialog
    await itemToDelete.click();
    
    // Find and click delete button
    await page.getByRole('dialog').getByRole('button', { name: /delete|remove|trash|🗑️/i }).click();
    
    // Confirm deletion if prompted
    const confirmButton = page.getByRole('button', { name: /confirm|yes/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
  });
});
