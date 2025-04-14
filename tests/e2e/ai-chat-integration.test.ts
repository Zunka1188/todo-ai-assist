
import { expect } from '@playwright/test';
import { test, logTestStep, waitForStableUI, closeOpenDialogs, setupPageTest } from './utils/test-utils';

test.describe('AI Chat Integration', () => {
  test('should test AI chat functionality and cross-page interactions', async ({ page }) => {
    // Start from home page
    await setupPageTest(page, '/');
    
    // Open AI Food Assistant
    logTestStep('Opening AI chat assistant');
    await page.locator('header button').filter({ hasText: '' }).first().click();
    
    const chatPanel = page.locator('[role="dialog"]').filter({ hasText: /AI Food Assistant/i });
    await expect(chatPanel).toBeVisible();
    
    // Test chat input
    logTestStep('Testing chat message input');
    await chatPanel.getByRole('textbox').fill('I want to cook pasta');
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Test dietary restriction checkboxes if they appear
    const checkboxes = chatPanel.locator('input[type="checkbox"], [role="checkbox"]');
    if (await checkboxes.count() > 0) {
      logTestStep('Testing dietary restriction options');
      await checkboxes.first().check();
      
      // Look for a continue button
      const continueButton = chatPanel.getByRole('button', { name: /continue/i });
      if (await continueButton.isVisible()) {
        await continueButton.click();
      }
    }
    
    // Test recipe search if it appears
    const searchInput = chatPanel.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      logTestStep('Testing recipe search in chat');
      await searchInput.fill('pasta');
      await page.keyboard.press('Enter');
      
      // Click on a recipe result if one appears
      const recipeResults = chatPanel.locator('[class*="recipe-result"], [class*="recipe-item"]');
      if (await recipeResults.count() > 0) {
        await recipeResults.first().click();
      }
    }
    
    // Test buttons in the chat messages
    const messageButtons = chatPanel.locator('.message button, [class*="message"] button');
    if (await messageButtons.count() > 0) {
      logTestStep('Testing chat message buttons');
      for (let i = 0; i < Math.min(await messageButtons.count(), 3); i++) { // Test first 3 buttons
        const buttonText = await messageButtons.nth(i).textContent();
        logTestStep(`Clicking message button: ${buttonText || i+1}`);
        await messageButtons.nth(i).click();
        await page.waitForTimeout(500);
      }
    }
    
    // Test calendar integration if it appears
    const datePicker = chatPanel.locator('[class*="calendar"], [class*="date-picker"]');
    if (await datePicker.isVisible()) {
      logTestStep('Testing calendar integration in chat');
      const dateButtons = datePicker.getByRole('button');
      if (await dateButtons.count() > 0) {
        await dateButtons.first().click();
      }
      
      // Test event notes field if it appears
      const notesField = chatPanel.getByPlaceholder(/notes/i);
      if (await notesField.isVisible()) {
        await notesField.fill('Testing calendar integration');
      }
    }
    
    // Send another message
    logTestStep('Sending follow-up message');
    await chatPanel.getByRole('textbox').fill('Show me vegetarian recipes');
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Wait for response and test any recipe cards that appear
    await page.waitForTimeout(1000);
    
    // Close the chat panel
    await chatPanel.getByRole('button', { name: /close|×/i }).click();
    
    // Test cross-page interaction: Navigate to calendar then back to chat
    logTestStep('Testing cross-page interaction with calendar');
    await page.getByRole('link', { name: /calendar/i }).click();
    await page.waitForURL('**/calendar');
    
    // Open AI assistant again from calendar page
    await page.locator('header button').filter({ hasText: '' }).first().click();
    await expect(chatPanel).toBeVisible();
    
    // Send a calendar-specific message
    logTestStep('Testing calendar-specific chat');
    await chatPanel.getByRole('textbox').fill('Add cooking event to my calendar');
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Close chat and navigate to shopping page
    await chatPanel.getByRole('button', { name: /close|×/i }).click();
    await page.getByRole('link', { name: /shopping/i }).click();
    await page.waitForURL('**/shopping');
    
    // Open AI assistant from shopping page
    logTestStep('Testing shopping-specific chat');
    await page.locator('header button').filter({ hasText: '' }).first().click();
    await expect(chatPanel).toBeVisible();
    
    // Send a shopping-specific message
    await chatPanel.getByRole('textbox').fill('Create a shopping list for pasta dinner');
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Close chat dialog
    await chatPanel.getByRole('button', { name: /close|×/i }).click();
  });
  
  test('should test AI chat error recovery and edge cases', async ({ page }) => {
    // Start from home page
    await setupPageTest(page, '/');
    
    // Open AI Food Assistant
    await page.locator('header button').filter({ hasText: '' }).first().click();
    const chatPanel = page.locator('[role="dialog"]').filter({ hasText: /AI Food Assistant/i });
    
    // Test empty submission
    logTestStep('Testing empty message submission');
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Test very long input
    logTestStep('Testing very long message');
    const longText = 'Test '.repeat(100);
    await chatPanel.getByRole('textbox').fill(longText);
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Test special characters
    logTestStep('Testing special characters input');
    await chatPanel.getByRole('textbox').fill('Test with special chars: !@#$%^&*()_+<>?:"{}|');
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Check for error messages
    const errorMessages = chatPanel.locator('.error, [class*="error"]');
    if (await errorMessages.count() > 0) {
      logTestStep(`Found ${await errorMessages.count()} error messages`);
    }
    
    // Test chat reset if available
    const resetButton = chatPanel.getByRole('button', { name: /reset|clear|new/i });
    if (await resetButton.isVisible()) {
      logTestStep('Testing chat reset');
      await resetButton.click();
      
      // Check for confirmation dialog
      const confirmDialog = page.getByRole('dialog').nth(1);
      if (await confirmDialog.isVisible()) {
        await confirmDialog.getByRole('button', { name: /confirm|yes/i }).click();
      }
    }
    
    // Close chat dialog
    await chatPanel.getByRole('button', { name: /close|×/i }).click();
  });
});
