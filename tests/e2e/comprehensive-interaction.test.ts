
import { test, expect } from '@playwright/test';

/**
 * Comprehensive end-to-end test that tests every button, feature,
 * and interactive element across all pages of the application
 */
test.describe('Comprehensive UI Interaction Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should test every interactive element on the Home page', async ({ page }) => {
    // ===== HOME PAGE INTERACTIONS =====
    // Test page title is visible
    await expect(page.getByRole('heading').first()).toBeVisible();

    // Test main scan button
    const scanButton = page.getByTestId('scan-button');
    await expect(scanButton).toBeVisible();
    await scanButton.hover();

    // Test theme toggle
    const themeToggle = page.locator('header button').filter({ hasText: '' }).nth(3);
    await themeToggle.click();
    await themeToggle.click(); // Toggle back

    // Test all navigation links in the header menu
    await page.getByRole('button', { name: /menu/i }).click();
    const menuItems = page.locator('[role="menuitem"]');
    const menuCount = await menuItems.count();
    for (let i = 0; i < menuCount; i++) {
      await expect(menuItems.nth(i)).toBeVisible();
    }
    // Close menu by clicking elsewhere
    await page.mouse.click(10, 10);

    // Test settings navigation
    await page.getByRole('link', { name: /settings/i }).click();
    await page.waitForURL('**/settings');
    await expect(page.getByText(/settings/i)).toBeVisible();
    await page.goBack();

    // Test language selector
    const languageSelector = page.locator('header button').filter({ hasText: '' }).nth(0);
    await languageSelector.click();
    await page.mouse.click(10, 10); // Close dropdown

    // Test AI chat button
    const chatButton = page.locator('header button').filter({ hasText: '' }).first();
    await chatButton.click();
    const chatPanel = page.locator('[role="dialog"]').filter({ hasText: /AI Food Assistant/i });
    await expect(chatPanel).toBeVisible();
    await page.getByRole('button', { name: /close|×/i }).click();

    // Test all feature cards
    const featureCards = page.getByRole('link').filter({ has: page.locator('.hover-scale') });
    const cardCount = await featureCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 3); i++) { // Test first 3 cards to keep test reasonable
      const cardText = await featureCards.nth(i).textContent();
      await featureCards.nth(i).click();
      
      // Verify navigation happened
      await expect(page).not.toHaveURL('/');
      
      // Go back to home page
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }

    // Test widgets on home page
    const widgets = page.locator('.widget, [class*="widget"]');
    const widgetCount = await widgets.count();
    
    for (let i = 0; i < widgetCount; i++) {
      await widgets.nth(i).hover();
      
      // If widget has buttons, test them
      const widgetButtons = widgets.nth(i).getByRole('button');
      const buttonCount = await widgetButtons.count();
      
      for (let j = 0; j < buttonCount; j++) {
        await widgetButtons.nth(j).click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should test every interactive element on the Calendar page', async ({ page }) => {
    // Navigate to calendar page
    await page.getByRole('link', { name: /calendar/i }).click();
    await page.waitForURL('**/calendar');
    
    // Test view switching tabs
    const viewTabs = page.getByRole('tab');
    const tabCount = await viewTabs.count();
    for (let i = 0; i < tabCount; i++) {
      await viewTabs.nth(i).click();
      await page.waitForTimeout(300);
    }
    
    // Test navigation buttons
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /previous/i }).click();
    await page.getByRole('button', { name: /today/i }).click();
    
    // Create a new event
    await page.getByRole('button', { name: /add event/i }).click();
    
    // Fill in event form
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    await dialog.getByLabel(/title/i).fill('Comprehensive Test Event');
    await dialog.getByLabel(/description/i).fill('Testing all interactions');
    await dialog.getByLabel(/location/i).fill('Test Location');
    
    // Test date/time inputs
    const dateInputs = dialog.locator('input[type="date"], [role="textbox"][aria-label*="date"]');
    if (await dateInputs.count() > 0) {
      await dateInputs.first().click();
      await page.keyboard.press('Escape');
    }
    
    // Test all buttons in the dialog
    const dialogButtons = dialog.getByRole('button');
    const saveButton = dialog.getByRole('button', { name: /save/i });
    
    // Click all non-save/cancel buttons (like attachment, options, etc)
    const buttonCount = await dialogButtons.count();
    for (let i = 0; i < buttonCount; i++) {
      const buttonText = await dialogButtons.nth(i).textContent();
      if (!buttonText?.match(/save|cancel|close|×/i)) {
        await dialogButtons.nth(i).click();
        await page.waitForTimeout(300);
      }
    }
    
    // Save the event
    await saveButton.click();
    
    // Verify event was created and click on it
    await page.getByText('Comprehensive Test Event').click();
    
    // Test event view dialog
    const viewDialog = page.getByRole('dialog');
    await expect(viewDialog).toBeVisible();
    
    // Test all buttons in the view dialog (edit, delete, share, etc)
    const viewDialogButtons = viewDialog.getByRole('button');
    const buttonTexts = [];
    for (let i = 0; i < await viewDialogButtons.count(); i++) {
      const button = viewDialogButtons.nth(i);
      const text = await button.textContent();
      buttonTexts.push(text);
      
      // Skip close/cancel buttons
      if (text && !text.match(/close|cancel|×/i) && await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(300);
        
        // If clicking created a new dialog, close it
        const nestedDialog = page.getByRole('dialog').nth(1);
        if (await nestedDialog.isVisible()) {
          await nestedDialog.getByRole('button', { name: /cancel|close|×/i }).click();
        }
      }
    }
    
    // Close the dialog
    await viewDialog.getByRole('button', { name: /close|cancel|×/i }).click();
  });

  test('should test every interactive element on the Shopping page', async ({ page }) => {
    // Navigate to shopping page
    await page.getByRole('link', { name: /shopping/i }).click();
    await page.waitForURL('**/shopping');
    
    // Test add item button
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
    const dialogButtons = dialog.getByRole('button');
    for (let i = 0; i < await dialogButtons.count(); i++) {
      const buttonText = await dialogButtons.nth(i).textContent();
      if (!buttonText?.match(/save|add|cancel|close|×/i)) {
        await dialogButtons.nth(i).click();
        await page.waitForTimeout(300);
      }
    }
    
    // Save the item
    await dialog.getByRole('button', { name: /save|add/i }).click();
    
    // Add a second item
    await page.getByRole('button', { name: /add item/i }).click();
    await dialog.getByLabel(/name/i).fill('Second Test Product');
    await dialog.getByLabel(/quantity/i).fill('1');
    await dialog.getByRole('button', { name: /save|add/i }).click();
    
    // Test shopping list filtering buttons
    const filterButtons = page.getByRole('button').filter({ has: page.locator('[class*="filter"], .filter-button') });
    if (await filterButtons.count() > 0) {
      for (let i = 0; i < await filterButtons.count(); i++) {
        await filterButtons.nth(i).click();
        await page.waitForTimeout(300);
      }
    }
    
    // Test search functionality if available
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Test');
      await page.keyboard.press('Enter');
      await searchInput.clear();
    }
    
    // Test interactive elements on shopping items
    const shoppingItems = page.locator('[data-testid="shopping-item"], .shopping-item');
    for (let i = 0; i < await shoppingItems.count(); i++) {
      const item = shoppingItems.nth(i);
      
      // Test checkbox (mark as purchased)
      const checkbox = item.locator('input[type="checkbox"], [role="checkbox"]').first();
      if (await checkbox.isVisible()) {
        await checkbox.check();
        await page.waitForTimeout(500);
        await checkbox.uncheck();
      }
      
      // Test item buttons (edit, delete, share)
      const itemButtons = item.getByRole('button');
      for (let j = 0; j < await itemButtons.count(); j++) {
        const button = itemButtons.nth(j);
        await button.click();
        
        // If a dropdown appears, test its options
        const dropdown = page.locator('[role="menu"]');
        if (await dropdown.isVisible()) {
          const dropdownItems = dropdown.getByRole('menuitem');
          if (await dropdownItems.count() > 0) {
            // Click the first option to test it
            await dropdownItems.first().click();
          } else {
            // Close dropdown by clicking elsewhere
            await page.mouse.click(10, 10);
          }
        }
        
        // If a dialog appears, close it
        const newDialog = page.getByRole('dialog');
        if (await newDialog.isVisible() && j !== 0) {  // Skip first button if it opened a dialog
          await newDialog.getByRole('button', { name: /cancel|close|×/i }).click();
        }
        
        await page.waitForTimeout(300);
      }
    }
  });

  test('should test every interactive element on the Documents page', async ({ page }) => {
    // Navigate to documents page
    await page.getByRole('link', { name: /documents/i }).click();
    await page.waitForURL('**/documents');
    
    // Test tab navigation if available
    const tabs = page.getByRole('tab');
    for (let i = 0; i < await tabs.count(); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(300);
    }
    
    // Test add document button
    await page.getByRole('button', { name: /add document|add item|upload/i }).click();
    
    // Test document form
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Fill fields
    await dialog.getByLabel(/title/i).fill('Test Document');
    
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
          
          await fileChooser.setFiles({
            name: 'test-document.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('Test document content')
          });
          
          break;
        } catch (err) {
          // If this trigger failed, try the next one
          continue;
        }
      }
    }
    
    // Add description if field exists
    const descriptionField = dialog.getByLabel(/description/i);
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('This is a test document description');
    }
    
    // Test all other form buttons
    const formButtons = dialog.getByRole('button');
    for (let i = 0; i < await formButtons.count(); i++) {
      const buttonText = await formButtons.nth(i).textContent();
      if (!buttonText?.match(/save|add|upload|cancel|close|×/i)) {
        await formButtons.nth(i).click();
        await page.waitForTimeout(300);
      }
    }
    
    // Save document
    await dialog.getByRole('button', { name: /add|save|upload/i }).click();
    
    // Test search if available
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Test');
      await page.keyboard.press('Enter');
      await searchInput.clear();
    }
    
    // Test all filter and sort buttons
    const utilityButtons = page.getByRole('button').filter({ has: page.locator('[class*="filter"], [class*="sort"]') });
    for (let i = 0; i < await utilityButtons.count(); i++) {
      await utilityButtons.nth(i).click();
      
      // Close dropdown if one appears
      const dropdown = page.locator('[role="menu"]');
      if (await dropdown.isVisible()) {
        await page.mouse.click(10, 10);
      }
    }
    
    // Test interactions with document items
    const documentItems = page.locator('.document-item, .file-item, [data-testid="document-item"]');
    if (await documentItems.count() > 0) {
      // Click on the first document to view it
      await documentItems.first().click();
      
      // Test document preview dialog
      const previewDialog = page.getByRole('dialog');
      
      // Test all buttons in the preview
      const previewButtons = previewDialog.getByRole('button');
      for (let i = 0; i < await previewButtons.count(); i++) {
        const buttonText = await previewButtons.nth(i).textContent();
        if (!buttonText?.match(/close|cancel|×/i)) {
          await previewButtons.nth(i).click();
          
          // If a dropdown appears, close it
          const dropdown = page.locator('[role="menu"]');
          if (await dropdown.isVisible()) {
            await page.mouse.click(10, 10);
          }
          
          await page.waitForTimeout(300);
        }
      }
      
      // Close preview
      await previewDialog.getByRole('button', { name: /close|cancel|×/i }).click();
      
      // Test share buttons and options
      const shareButtons = page.getByRole('button').filter({ has: page.locator('[data-testid="share-icon"], [class*="share"]') });
      for (let i = 0; i < await shareButtons.count(); i++) {
        await shareButtons.nth(i).click();
        
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
      }
    }
  });

  test('should test AI chat functionality and cross-page interactions', async ({ page }) => {
    // Open AI Food Assistant
    await page.locator('header button').filter({ hasText: '' }).first().click();
    
    const chatPanel = page.locator('[role="dialog"]').filter({ hasText: /AI Food Assistant/i });
    await expect(chatPanel).toBeVisible();
    
    // Test chat input
    await chatPanel.getByRole('textbox').fill('I want to cook pasta');
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Test dietary restriction checkboxes if they appear
    const checkboxes = chatPanel.locator('input[type="checkbox"], [role="checkbox"]');
    if (await checkboxes.count() > 0) {
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
    for (let i = 0; i < Math.min(await messageButtons.count(), 3); i++) { // Test first 3 buttons
      await messageButtons.nth(i).click();
      await page.waitForTimeout(500);
    }
    
    // Test calendar integration if it appears
    const datePicker = chatPanel.locator('[class*="calendar"], [class*="date-picker"]');
    if (await datePicker.isVisible()) {
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
    await chatPanel.getByRole('textbox').fill('Show me vegetarian recipes');
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Wait for response and test any recipe cards that appear
    await page.waitForTimeout(1000);
    
    // Close the chat panel
    await chatPanel.getByRole('button', { name: /close|×/i }).click();
    
    // Test cross-page interaction: Navigate to calendar then back to chat
    await page.getByRole('link', { name: /calendar/i }).click();
    await page.waitForURL('**/calendar');
    
    // Open AI assistant again from calendar page
    await page.locator('header button').filter({ hasText: '' }).first().click();
    await expect(chatPanel).toBeVisible();
    
    // Send a calendar-specific message
    await chatPanel.getByRole('textbox').fill('Add cooking event to my calendar');
    await chatPanel.getByRole('button', { name: /send/i }).click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Close chat and navigate to shopping page
    await chatPanel.getByRole('button', { name: /close|×/i }).click();
    await page.getByRole('link', { name: /shopping/i }).click();
    await page.waitForURL('**/shopping');
    
    // Open AI assistant from shopping page
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

  test('should test bottom navigation menu and redirection', async ({ page }) => {
    // Test bottom navigation
    const bottomNav = page.locator('nav').filter({ has: page.locator('[class*="bottom-navigation"]') });
    
    if (await bottomNav.isVisible()) {
      const navLinks = bottomNav.getByRole('link');
      const navCount = await navLinks.count();
      
      for (let i = 0; i < navCount; i++) {
        // Click navigation item
        await navLinks.nth(i).click();
        
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
      }
    }
  });

  test('should test share functionality on multiple page elements', async ({ page }) => {
    // Test share buttons across different pages
    const pagesToTest = ['/calendar', '/shopping', '/documents'];
    
    for (const pageUrl of pagesToTest) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      // Find share buttons
      const shareButtons = page.getByRole('button').filter({ 
        has: page.locator('svg').filter({ hasText: '' }) 
      });
      
      // Test first 2 share buttons on each page
      for (let i = 0; i < Math.min(await shareButtons.count(), 2); i++) {
        await shareButtons.nth(i).click();
        await page.waitForTimeout(300);
        
        // If dropdown appears, test its options
        const dropdown = page.locator('[role="menu"]');
        if (await dropdown.isVisible()) {
          // Click "Copy link" option if available
          const copyOption = dropdown.getByText(/copy/i).first();
          if (await copyOption.isVisible()) {
            await copyOption.click();
          } else {
            // Close dropdown by clicking elsewhere
            await page.mouse.click(10, 10);
          }
        }
      }
    }
  });

  test('should test settings page interactions', async ({ page }) => {
    // Navigate to settings
    await page.getByRole('link', { name: /settings/i }).click();
    await page.waitForURL('**/settings');
    
    // Test theme toggle
    const themeToggle = page.getByRole('switch', { name: /dark mode/i });
    if (await themeToggle.isVisible()) {
      const initialState = await themeToggle.isChecked();
      await themeToggle.click();
      await expect(themeToggle).toBeChecked({ checked: !initialState });
      await themeToggle.click();
      await expect(themeToggle).toBeChecked({ checked: initialState });
    }
    
    // Test language selector
    const languageSelector = page.getByRole('combobox', { name: /language/i });
    if (await languageSelector.isVisible()) {
      await languageSelector.click();
      await page.getByText('English').click();
    }
    
    // Test all toggle switches
    const toggles = page.getByRole('switch');
    for (let i = 0; i < await toggles.count(); i++) {
      const toggle = toggles.nth(i);
      const initialState = await toggle.isChecked();
      await toggle.click();
      await expect(toggle).toBeChecked({ checked: !initialState });
      await toggle.click();
      await expect(toggle).toBeChecked({ checked: initialState });
    }
    
    // Test all buttons on settings page
    const buttons = page.getByRole('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const buttonText = await buttons.nth(i).textContent();
      if (buttonText && !buttonText.match(/save|cancel|close|submit|reset|×/i)) {
        await buttons.nth(i).click();
        await page.waitForTimeout(300);
        
        // If dialog appears, close it
        try {
          const dialog = page.getByRole('dialog');
          if (await dialog.isVisible({ timeout: 1000 })) {
            await dialog.getByRole('button', { name: /cancel|close|×/i }).click();
          }
        } catch {
          // No dialog appeared, continue
        }
      }
    }
    
    // Test all dropdown menus
    const dropdowns = page.getByRole('combobox');
    for (let i = 0; i < await dropdowns.count(); i++) {
      await dropdowns.nth(i).click();
      await page.keyboard.press('Escape');
    }
  });

  test('should test cross-device synchronization UI if available', async ({ page }) => {
    // This test checks for device sync UI components that might exist in the app
    
    // Look for sync indicators across different pages
    const pagesToCheck = ['/', '/settings', '/documents'];
    
    for (const pageUrl of pagesToCheck) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      // Look for sync status indicators
      const syncIndicators = page.locator('[class*="sync"], [data-testid*="sync"]');
      if (await syncIndicators.count() > 0) {
        await syncIndicators.first().hover();
      }
      
      // Look for sync buttons
      const syncButtons = page.getByRole('button').filter({ hasText: /sync|refresh|reload/i });
      if (await syncButtons.count() > 0) {
        await syncButtons.first().click();
        await page.waitForTimeout(500);
      }
    }
    
    // Check settings page for sync options
    await page.goto('/settings');
    const syncOptions = page.getByText(/sync|synchronization|device/i).first();
    if (await syncOptions.isVisible()) {
      await syncOptions.click();
    }
  });

  test('should test keyboard navigation and accessibility across pages', async ({ page }) => {
    // Test keyboard navigation on home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
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
      
      // If it's a button or link, press Enter to activate it
      if (i === 5) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Close any dialogs that might have opened
        try {
          const dialog = page.getByRole('dialog');
          if (await dialog.isVisible({ timeout: 1000 })) {
            await dialog.getByRole('button', { name: /cancel|close|×/i }).click();
          }
        } catch {
          // No dialog appeared, continue
        }
      }
    }
    
    // Test keyboard navigation on calendar page
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    
    // Test tab navigation
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Test arrow key navigation for calendar elements
    for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) {
      await page.keyboard.press(key);
      await page.waitForTimeout(200);
    }
    
    // Test space key on a focused element
    await page.keyboard.press('Space');
    
    // Test escape key to close any dialogs
    await page.keyboard.press('Escape');
  });
});
