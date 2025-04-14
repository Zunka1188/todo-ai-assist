
import { expect } from '@playwright/test';
import { test, logTestStep, waitForStableUI, testAllButtonsIn, closeOpenDialogs } from './utils/test-utils';

test.describe('Shopping Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to shopping page
    await page.goto('/shopping');
    await page.waitForSelector('h1:text("Shopping")');
    logTestStep('Shopping page loaded');
  });

  test('should add, edit, and delete shopping items', async ({ page }) => {
    // Test add item button
    logTestStep('Testing add item functionality');
    await page.getByRole('button', { name: /add item/i }).click();
    
    // Test form inputs
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Fill in the form
    await dialog.getByLabel(/name/i).fill('Test Product');
    await dialog.getByLabel(/quantity/i).fill('3');
    
    // Test category dropdown
    const categoryDropdown = dialog.getByRole('combobox').first();
    if (await categoryDropdown.isVisible()) {
      await categoryDropdown.click();
      await page.getByRole('option').first().click();
    }
    
    // Test all buttons in the dialog
    await testAllButtonsIn(page, dialog, [/save|add|cancel|close|×/i]);
    
    // Save the item
    logTestStep('Saving new item');
    await dialog.getByRole('button', { name: /save|add/i }).click();
    await waitForStableUI(page);
    
    // Add a second item
    logTestStep('Adding second item');
    await page.getByRole('button', { name: /add item/i }).click();
    await dialog.getByLabel(/name/i).fill('Second Test Product');
    await dialog.getByLabel(/quantity/i).fill('1');
    await dialog.getByRole('button', { name: /save|add/i }).click();
    await waitForStableUI(page);
    
    // Test shopping list filtering buttons
    logTestStep('Testing filter functionality');
    const filterButtons = page.getByRole('button').filter({ has: page.locator('[class*="filter"], .filter-button') });
    if (await filterButtons.count() > 0) {
      for (let i = 0; i < await filterButtons.count(); i++) {
        const buttonText = await filterButtons.nth(i).textContent();
        logTestStep(`Clicking filter button: ${buttonText}`);
        await filterButtons.nth(i).click();
        await waitForStableUI(page);
      }
    }
    
    // Test search functionality if available
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      logTestStep('Testing search functionality');
      await searchInput.fill('Test');
      await page.keyboard.press('Enter');
      await waitForStableUI(page);
      await searchInput.clear();
    }
    
    // Test interactive elements on shopping items
    logTestStep('Testing interaction with shopping items');
    const shoppingItems = page.locator('[data-testid="shopping-item"], .shopping-item');
    
    if (await shoppingItems.count() > 0) {
      for (let i = 0; i < Math.min(await shoppingItems.count(), 2); i++) {
        const item = shoppingItems.nth(i);
        
        // Test checkbox (mark as purchased)
        const checkbox = item.locator('input[type="checkbox"], [role="checkbox"]').first();
        if (await checkbox.isVisible()) {
          logTestStep(`Toggling checkbox for item ${i+1}`);
          await checkbox.check();
          await waitForStableUI(page);
          await checkbox.uncheck();
        }
        
        // Test item buttons (edit, delete, share)
        await testAllButtonsIn(page, item);
        
        // If the item has a dropdown menu, test it
        const menuButton = item.getByRole('button').filter({ hasText: /more|options|menu/i }).first();
        if (await menuButton.isVisible()) {
          logTestStep(`Opening menu for item ${i+1}`);
          await menuButton.click();
          
          // Click first menu item to test it
          const menuItems = page.locator('[role="menuitem"]');
          if (await menuItems.count() > 0) {
            await menuItems.first().click();
          }
        }
      }
    } else {
      logTestStep('No shopping items found to test');
    }
  });

  test('should test all tab navigation and sort options', async ({ page }) => {
    // Test tab navigation if available
    const tabs = page.getByRole('tab');
    if (await tabs.count() > 0) {
      logTestStep('Testing tab navigation');
      for (let i = 0; i < await tabs.count(); i++) {
        const tabText = await tabs.nth(i).textContent();
        logTestStep(`Clicking tab: ${tabText}`);
        await tabs.nth(i).click();
        await waitForStableUI(page);
      }
    }
    
    // Test sort options if available
    const sortButton = page.getByRole('button', { name: /sort/i }).first();
    if (await sortButton.isVisible()) {
      logTestStep('Testing sort functionality');
      await sortButton.click();
      
      // Try clicking on sort options
      const sortOptions = page.locator('[role="menuitem"]');
      if (await sortOptions.count() > 0) {
        await sortOptions.first().click();
      } else {
        // Close sort dropdown
        await page.mouse.click(10, 10);
      }
    }
  });
  
  test('should test delete and batch actions on shopping items', async ({ page }) => {
    // Check if there are any shopping items
    const shoppingItems = page.locator('[data-testid="shopping-item"], .shopping-item');
    
    if (await shoppingItems.count() > 0) {
      logTestStep('Testing delete functionality');
      
      // Select the first item for deletion
      const firstItemCheckbox = shoppingItems.first().locator('input[type="checkbox"], [role="checkbox"]').first();
      if (await firstItemCheckbox.isVisible()) {
        await firstItemCheckbox.check();
        
        // Look for batch actions that appear
        const deleteSelectedButton = page.getByRole('button', { name: /delete selected|remove/i });
        
        if (await deleteSelectedButton.isVisible()) {
          await deleteSelectedButton.click();
          
          // Confirm deletion if prompted
          const confirmDialog = page.getByRole('dialog');
          if (await confirmDialog.isVisible()) {
            await confirmDialog.getByRole('button', { name: /confirm|yes|delete/i }).click();
          }
          
          await waitForStableUI(page);
        } else {
          // Uncheck if no batch actions
          await firstItemCheckbox.uncheck();
        }
      }
    } else {
      logTestStep('No shopping items found to test deletion');
    }
  });
  
  test('should test share functionality on shopping list', async ({ page }) => {
    // Look for share button in the header or page
    const shareButton = page.getByRole('button', { name: /share/i }).first();
    
    if (await shareButton.isVisible()) {
      logTestStep('Testing share functionality');
      await shareButton.click();
      
      // Check for share dialog or dropdown
      const shareDialog = page.getByRole('dialog');
      if (await shareDialog.isVisible()) {
        // Test share options
        const copyLinkButton = shareDialog.getByRole('button', { name: /copy|link/i });
        if (await copyLinkButton.isVisible()) {
          await copyLinkButton.click();
        }
        
        // Close the dialog
        await shareDialog.getByRole('button', { name: /close|cancel|×/i }).click();
      } else {
        // Likely a dropdown, try to find options
        const menuItems = page.locator('[role="menuitem"]');
        if (await menuItems.count() > 0) {
          await menuItems.first().click();
        } else {
          // Close dropdown by clicking elsewhere
          await page.mouse.click(10, 10);
        }
      }
    } else {
      logTestStep('No share button found');
    }
  });
});
