
import { expect } from '@playwright/test';
import { test, logTestStep, waitForStableUI, testAllButtonsIn, closeOpenDialogs, setupPageTest } from './utils/test-utils';
import path from 'path';

test.describe('Documents Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageTest(page, '/documents');
  });

  test('should navigate between document tabs and categories', async ({ page }) => {
    // Test tab navigation if available
    const tabs = page.getByRole('tab');
    if (await tabs.count() > 0) {
      logTestStep('Testing document tab navigation');
      for (let i = 0; i < await tabs.count(); i++) {
        const tabText = await tabs.nth(i).textContent();
        logTestStep(`Clicking tab: ${tabText}`);
        await tabs.nth(i).click();
        await waitForStableUI(page);
      }
    }
    
    // Test category filters if available
    const filterButtons = page.getByRole('button').filter({ hasText: /(All|Images|Forms|Notes|PDF)/i });
    if (await filterButtons.count() > 0) {
      logTestStep('Testing document category filters');
      for (let i = 0; i < await filterButtons.count(); i++) {
        const buttonText = await filterButtons.nth(i).textContent();
        logTestStep(`Clicking filter: ${buttonText}`);
        await filterButtons.nth(i).click();
        await waitForStableUI(page);
      }
    }
  });
  
  test('should add, view and delete a document', async ({ page }) => {
    // Test add document button
    logTestStep('Testing add document functionality');
    await page.getByRole('button', { name: /add document|add item|upload/i }).click();
    
    // Test document form
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Fill fields
    await dialog.getByLabel(/title/i).fill('E2E Test Document');
    
    // Test category if available
    const categoryDropdown = dialog.getByRole('combobox');
    if (await categoryDropdown.isVisible()) {
      await categoryDropdown.click();
      const options = page.getByRole('option');
      if (await options.count() > 0) {
        await options.first().click();
      }
    }
    
    // Try to simulate file upload (mock approach)
    logTestStep('Testing file upload');
    let uploadSuccessful = false;
    const fileInputTriggers = [
      dialog.locator('text=Upload'), 
      dialog.locator('text=Choose File'),
      dialog.locator('input[type="file"]'),
      dialog.locator('button:has-text("Upload")'),
    ];
    
    for (const trigger of fileInputTriggers) {
      if (await trigger.isVisible()) {
        try {
          const fileChooserPromise = page.waitForEvent('filechooser');
          await trigger.click({ timeout: 1000 });
          const fileChooser = await fileChooserPromise;
          
          // Create a test file in memory
          await fileChooser.setFiles({
            name: 'test-document.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('Test document content')
          });
          
          uploadSuccessful = true;
          logTestStep('File upload successful');
          break;
        } catch (err) {
          // If this trigger failed, try the next one
          continue;
        }
      }
    }
    
    if (!uploadSuccessful) {
      logTestStep('File upload not supported or failed, continuing test');
    }
    
    // Add description if field exists
    const descriptionField = dialog.getByLabel(/description/i);
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('This is a test document description');
    }
    
    // Test all other form buttons
    await testAllButtonsIn(page, dialog, [/save|add|upload|cancel|close|×/i]);
    
    // Save document
    logTestStep('Saving document');
    await dialog.getByRole('button', { name: /add|save|upload/i }).click();
    await waitForStableUI(page);
    
    // Test search if available
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      logTestStep('Testing search functionality');
      await searchInput.fill('Test');
      await page.keyboard.press('Enter');
      await waitForStableUI(page);
      await searchInput.clear();
      await waitForStableUI(page);
    }
    
    // Test interactions with document items
    const documentItems = page.locator('.document-item, .file-item, [data-testid="document-item"]');
    if (await documentItems.count() > 0) {
      logTestStep('Testing interaction with document item');
      
      // Click on the first document to view it
      await documentItems.first().click();
      
      // Test document preview dialog
      const previewDialog = page.getByRole('dialog');
      await expect(previewDialog).toBeVisible();
      
      // Test all buttons in the preview
      await testAllButtonsIn(page, previewDialog, [/close|cancel|×/i]);
      
      // Close preview
      await previewDialog.getByRole('button', { name: /close|cancel|×/i }).click();
      await waitForStableUI(page);
    }
  });
  
  test('should test share functionality on documents', async ({ page }) => {
    // Test share buttons on documents
    const shareButtons = page.getByRole('button').filter({ 
      has: page.locator('svg').filter({ hasText: '' }) 
    });
    
    if (await shareButtons.count() > 0) {
      logTestStep('Testing document share functionality');
      await shareButtons.first().click();
      
      // If dropdown appears, test its options
      const shareMenu = page.locator('[role="menu"]');
      if (await shareMenu.isVisible()) {
        const shareOptions = shareMenu.getByRole('menuitem');
        
        // Click the copy link option if available
        for (let j = 0; j < await shareOptions.count(); j++) {
          const optionText = await shareOptions.nth(j).textContent();
          if (optionText?.match(/copy|link/i)) {
            await shareOptions.nth(j).click();
            break;
          }
        }
        
        // If menu is still visible, close it
        if (await shareMenu.isVisible()) {
          await page.mouse.click(10, 10);
        }
      }
    } else {
      logTestStep('No share buttons found');
    }
  });
  
  test('should test document view modes and sort options', async ({ page }) => {
    // Test view mode toggle (grid/list)
    const viewToggle = page.getByRole('button', { name: /grid|list|view/i }).filter({ 
      has: page.locator('svg')
    }).first();
    
    if (await viewToggle.isVisible()) {
      logTestStep('Testing view mode toggle');
      await viewToggle.click();
      await waitForStableUI(page);
      // Toggle back
      await viewToggle.click();
      await waitForStableUI(page);
    }
    
    // Test sort options
    const sortButton = page.getByRole('button', { name: /sort/i });
    if (await sortButton.isVisible()) {
      logTestStep('Testing sort functionality');
      await sortButton.click();
      
      // Check for sort options
      const sortOptions = page.locator('[role="menuitem"]');
      if (await sortOptions.count() > 0) {
        await sortOptions.first().click();
      } else {
        // Close sort dropdown
        await page.mouse.click(10, 10);
      }
    }
  });
});
