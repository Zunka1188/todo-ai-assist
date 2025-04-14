
import { test, expect } from '@playwright/test';

/**
 * End-to-end test for simulating complete user journeys
 * This test simulates realistic human interactions across multiple pages
 */
test.describe('Complete User Journey Simulation', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should navigate through main application features', async ({ page }) => {
    // ========== Home Page Interactions ==========
    // Check if we're on the home page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Test scan button interaction
    const scanButton = page.getByTestId('scan-button');
    await expect(scanButton).toBeVisible();
    
    // Navigate to calendar page using main navigation
    await page.getByRole('link', { name: /calendar/i }).click();
    await page.waitForURL('**/calendar');
    await expect(page.getByText(/calendar/i, { exact: false })).toBeVisible();
    
    // ========== Calendar Page Interactions ==========
    // Test view switching
    await page.getByRole('tab', { name: /month/i }).click();
    await expect(page.getByTestId('month-view')).toBeVisible();
    
    await page.getByRole('tab', { name: /week/i }).click();
    await expect(page.getByTestId('week-view')).toBeVisible();
    
    await page.getByRole('tab', { name: /day/i }).click();
    await expect(page.getByTestId('day-view')).toBeVisible();
    
    // Test navigation buttons
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /previous/i }).click();
    await page.getByRole('button', { name: /today/i }).click();
    
    // Create a new event
    await page.getByRole('button', { name: /add event/i }).click();
    
    // Fill in event form
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    await dialog.getByLabel(/title/i).fill('Team Meeting');
    await dialog.getByLabel(/description/i).fill('Weekly team sync');
    await dialog.getByLabel(/location/i).fill('Conference Room B');
    
    // Submit the form
    await dialog.getByRole('button', { name: /save/i }).click();
    
    // Verify event was created
    await expect(page.getByText('Team Meeting')).toBeVisible();
    
    // View the created event
    await page.getByText('Team Meeting').click();
    const viewDialog = page.getByRole('dialog');
    await expect(viewDialog).toBeVisible();
    await expect(viewDialog.getByText('Team Meeting')).toBeVisible();
    await expect(viewDialog.getByText('Weekly team sync')).toBeVisible();
    
    // Close the dialog
    await viewDialog.getByRole('button', { name: /cancel/i }).click();
    
    // ========== Navigate to Shopping Page ==========
    await page.getByRole('link', { name: /shopping/i }).click();
    await page.waitForURL('**/shopping');
    await expect(page.getByText(/shopping/i, { exact: false })).toBeVisible();
    
    // ========== Shopping Page Interactions ==========
    // Add a new item
    await page.getByRole('button', { name: /add item/i }).click();
    
    // Fill in the form
    const shoppingDialog = page.getByRole('dialog');
    await expect(shoppingDialog).toBeVisible();
    
    await shoppingDialog.getByLabel(/name/i).fill('Milk');
    await shoppingDialog.getByLabel(/quantity/i).fill('2');
    
    // Select a category
    await shoppingDialog.getByRole('combobox').click();
    await page.getByRole('option', { name: /dairy/i }).click();
    
    // Save the item
    await shoppingDialog.getByRole('button', { name: /save/i }).click();
    
    // Check if item was added
    await expect(page.getByText('Milk')).toBeVisible();
    await expect(page.getByText(/qty: 2/i)).toBeVisible();
    
    // Mark item as purchased
    await page.locator('[data-testid="shopping-item-checkbox"]').first().click();
    
    // Verify item moved to purchased section
    await expect(page.getByText(/purchased/i).nth(0)).toBeVisible();
    
    // ========== Navigate to Documents Page ==========
    await page.getByRole('link', { name: /documents/i }).click();
    await page.waitForURL('**/documents');
    await expect(page.getByText(/documents/i, { exact: false })).toBeVisible();
    
    // ========== Document Page Interactions ==========
    // Add a new document
    await page.getByRole('button', { name: /add document|add item/i }).click();
    
    // Fill in document details
    const docDialog = page.getByRole('dialog');
    await expect(docDialog).toBeVisible();
    
    await docDialog.getByLabel(/title/i).fill('Project Proposal');
    
    // Upload a file (mock file)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await docDialog.getByText(/upload/i).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'proposal.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock PDF content')
    });
    
    // Select category
    await docDialog.getByRole('combobox').click();
    await page.getByRole('option', { name: /work/i }).click();
    
    // Add description
    await docDialog.getByLabel(/description/i).fill('Proposal for new client project');
    
    // Save document
    await docDialog.getByRole('button', { name: /add|save/i }).click();
    
    // Search for the document
    await page.getByPlaceholderText(/search/i).fill('Project Proposal');
    await expect(page.getByText('Project Proposal')).toBeVisible();
    
    // View document details
    await page.getByText('Project Proposal').click();
    
    // Check document preview
    const previewDialog = page.getByRole('dialog');
    await expect(previewDialog).toBeVisible();
    await expect(previewDialog.getByText('Project Proposal')).toBeVisible();
    
    // Close preview
    await previewDialog.getByRole('button', { name: /close/i }).click();
    
    // Return to home page
    await page.getByRole('link', { name: /home/i }).click();
    await page.waitForURL('**/');
  });
  
  test('should test settings and theme switching', async ({ page }) => {
    // Go to settings
    const settingsLink = page.getByRole('link', { name: /settings/i });
    
    // Some layouts might have the settings in a menu
    try {
      await settingsLink.click();
    } catch (error) {
      // Try clicking the menu first if direct link isn't available
      await page.getByRole('button', { name: /menu/i }).click();
      await page.getByRole('link', { name: /settings/i }).click();
    }
    
    await page.waitForURL('**/settings');
    await expect(page.getByText(/settings/i, { exact: false })).toBeVisible();
    
    // Test theme toggle
    const themeToggle = page.getByRole('switch', { name: /dark mode/i });
    
    // Get current theme
    const isDarkModeEnabled = await themeToggle.isChecked();
    
    // Toggle theme
    await themeToggle.click();
    
    // Verify theme changed
    await expect(themeToggle).toBeChecked({ checked: !isDarkModeEnabled });
    
    // Test language selector if available
    const languageSelector = page.getByRole('combobox', { name: /language/i });
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption({ label: 'English' });
      // Language change might trigger a page reload
      await page.waitForLoadState('networkidle');
    }
  });
  
  test('should test form validation and error states', async ({ page }) => {
    // Navigate to calendar
    await page.getByRole('link', { name: /calendar/i }).click();
    
    // Try to create an event with missing fields
    await page.getByRole('button', { name: /add event/i }).click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Leave the title empty and try to save
    await dialog.getByRole('button', { name: /save/i }).click();
    
    // Check for validation error
    await expect(dialog.getByText(/title is required/i)).toBeVisible();
    
    // Fill required field and submit
    await dialog.getByLabel(/title/i).fill('Valid Event');
    await dialog.getByRole('button', { name: /save/i }).click();
    
    // Verify dialog closed and event was created
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText('Valid Event')).toBeVisible();
  });
  
  test('should test keyboard navigation and accessibility', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Press Enter on focused element (should be a navigation link)
    await page.keyboard.press('Enter');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Tab to an interactive element
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Press Space (for buttons, checkboxes)
    await page.keyboard.press('Space');
    
    // Test Escape key on dialogs
    const anyDialog = page.getByRole('dialog');
    if (await anyDialog.isVisible()) {
      await page.keyboard.press('Escape');
      await expect(anyDialog).not.toBeVisible();
    }
  });
});
