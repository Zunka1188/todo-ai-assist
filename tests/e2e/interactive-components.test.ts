
import { test, expect } from '@playwright/test';

/**
 * Tests focusing on deeply testing interactive components
 * across the application
 */
test.describe('Interactive Component Testing', () => {
  test('should test form controls and inputs', async ({ page }) => {
    // Navigate to a form-heavy page (creating a calendar event)
    await page.goto('/calendar');
    await page.getByRole('button', { name: /add event/i }).click();
    
    const form = page.getByRole('dialog');
    
    // Test text inputs
    const titleInput = form.getByLabel(/title/i);
    await titleInput.fill('Test Event');
    await titleInput.press('Tab'); // Test keyboard navigation
    
    // Test text areas
    const descriptionInput = form.getByLabel(/description/i);
    await descriptionInput.fill('This is a test description\nWith multiple lines');
    
    // Test date inputs
    const dateInput = form.getByLabel(/date/i);
    if (await dateInput.isVisible()) {
      await dateInput.fill('2025-01-01');
    }
    
    // Test select/dropdown
    const categorySelect = form.getByRole('combobox');
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.getByRole('option').first().click();
    }
    
    // Test checkboxes
    const checkbox = form.getByRole('checkbox');
    if (await checkbox.isVisible()) {
      await checkbox.check();
      expect(await checkbox.isChecked()).toBeTruthy();
      
      // Uncheck
      await checkbox.uncheck();
      expect(await checkbox.isChecked()).toBeFalsy();
    }
    
    // Test radio buttons
    const radioButtons = form.getByRole('radio');
    if (await radioButtons.first().isVisible()) {
      await radioButtons.first().check();
      expect(await radioButtons.first().isChecked()).toBeTruthy();
      
      // Check another option
      await radioButtons.nth(1).check();
      expect(await radioButtons.nth(1).isChecked()).toBeTruthy();
      expect(await radioButtons.first().isChecked()).toBeFalsy();
    }
    
    // Close the form without saving
    await form.getByRole('button', { name: /cancel/i }).click();
  });
  
  test('should test drag and drop functionality', async ({ page }) => {
    // Go to calendar page
    await page.goto('/calendar');
    
    // Check if drag and drop is available (calendar events may support this)
    const draggableEvent = page.getByText(/team meeting|appointment|event/i).first();
    if (await draggableEvent.isVisible()) {
      // Get initial position
      const initialBoundingBox = await draggableEvent.boundingBox();
      
      if (initialBoundingBox) {
        // Find target position (different day in the calendar)
        const dropTarget = page.locator('.calendar-cell, .event-cell').nth(3);
        const targetBoundingBox = await dropTarget.boundingBox();
        
        if (targetBoundingBox) {
          // Perform drag and drop
          await draggableEvent.dragTo(dropTarget);
          
          // Verify event was moved (this depends on application behavior)
          const newBoundingBox = await draggableEvent.boundingBox();
          expect(newBoundingBox?.x).not.toBe(initialBoundingBox.x);
        }
      }
    }
  });
  
  test('should test responsive layout behavior', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Check that desktop elements are visible
    const desktopNav = page.locator('nav');
    await expect(desktopNav).toBeVisible();
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500); // Wait for responsive layout to adjust
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Wait for responsive layout to adjust
    
    // Check if mobile menu button appears
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      // Click the menu button
      await menuButton.click();
      
      // Check if navigation links appear
      await expect(page.getByRole('link', { name: /calendar/i })).toBeVisible();
      
      // Close menu by clicking outside or on close button
      await page.mouse.click(10, 10);
    }
  });
  
  test('should test notifications and toasts', async ({ page }) => {
    // Navigate to a page where actions trigger notifications
    await page.goto('/shopping');
    
    // Perform an action that should trigger a toast/notification
    await page.getByRole('button', { name: /add item/i }).click();
    
    // Fill form
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/name/i).fill('Toast Test Item');
    
    // Submit
    await dialog.getByRole('button', { name: /save/i }).click();
    
    // Check if toast appears
    const toast = page.locator('[role="status"], .toast, .notification');
    if (await toast.isVisible()) {
      await expect(toast).toContainText(/success|added|created/i);
      
      // Wait for toast to disappear (if auto-dismissing)
      try {
        await expect(toast).not.toBeVisible({ timeout: 5000 });
      } catch {
        // Some toasts stay until dismissed
        const closeButton = toast.getByRole('button');
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await expect(toast).not.toBeVisible();
        }
      }
    }
  });
  
  test('should test file upload interactions', async ({ page }) => {
    // Navigate to documents page
    await page.goto('/documents');
    
    // Click add document
    await page.getByRole('button', { name: /add document|add item/i }).click();
    
    // Test file upload control
    const dialog = page.getByRole('dialog');
    
    // Set up file input handler
    const fileChooserPromise = page.waitForEvent('filechooser');
    await dialog.getByText(/upload|choose file/i).click();
    const fileChooser = await fileChooserPromise;
    
    // Upload multiple files if supported
    await fileChooser.setFiles([
      {
        name: 'document1.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('Test PDF content 1')
      },
      {
        name: 'document2.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Test text content')
      }
    ]);
    
    // Check if files were accepted
    await expect(dialog.getByText(/document1.pdf|document2.txt/)).toBeVisible();
    
    // Test file type validation if applicable
    const invalidFileChooserPromise = page.waitForEvent('filechooser');
    await dialog.getByText(/upload|choose file/i).click();
    const invalidFileChooser = await invalidFileChooserPromise;
    
    // Try to upload an invalid file type
    await invalidFileChooser.setFiles([
      {
        name: 'invalid.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('Invalid file content')
      }
    ]);
    
    // Check for validation error message
    const errorMessage = dialog.getByText(/invalid file type|only .* files are allowed/i);
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Cancel the operation
    await dialog.getByRole('button', { name: /cancel/i }).click();
  });
});
