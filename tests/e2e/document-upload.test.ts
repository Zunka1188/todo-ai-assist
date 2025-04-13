
/**
 * End-to-end test for document upload functionality
 * This test simulates the entire document upload flow from a user perspective
 */
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Document Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to documents page
    await page.goto('/documents');
    // Wait for page to load
    await page.waitForSelector('h1:text("Documents")');
  });

  test('should upload a document with metadata and view it', async ({ page }) => {
    // Click the Add Item button
    await page.getByRole('button', { name: /Add Item/i }).click();
    
    // Wait for the dialog to appear
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Fill in document details
    await page.getByLabel(/Title/i).fill('E2E Test Document');
    
    // Upload a test file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /Upload File/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, '../../tests/fixtures/test-document.pdf'));
    
    // Wait for file upload to complete
    await expect(page.getByText(/test-document\.pdf/i)).toBeVisible();
    
    // Select a category
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: /Files/i }).click();
    
    // Add a description
    await page.getByLabel(/Description/i).fill('This is a test document uploaded via E2E test');
    
    // Add tags
    await page.getByLabel(/Tags/i).fill('e2e, test, document');
    
    // Submit the form
    await page.getByRole('button', { name: /Add Document/i }).click();
    
    // Verify document was added to the list
    await expect(page.getByText('E2E Test Document')).toBeVisible();
    
    // Search for the document
    await page.getByPlaceholderText(/Search document/i).fill('E2E Test');
    await expect(page.getByText('E2E Test Document')).toBeVisible();
    
    // Open the document details
    await page.getByText('E2E Test Document').click();
    
    // Verify preview appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'E2E Test Document' })).toBeVisible();
    
    // Check if download button exists
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
    
    // Close the preview
    await page.getByRole('button', { name: /Close/i }).click();
    
    // Delete the test document for cleanup
    await page.getByText('E2E Test Document').click();
    await page.getByRole('button', { name: /Delete/i }).click();
    await page.getByRole('button', { name: /Confirm/i }).click();
    
    // Verify document was removed
    await expect(page.getByText('E2E Test Document')).not.toBeVisible();
  });

  test('should handle document search and filtering correctly', async ({ page }) => {
    // Assume there are multiple documents already in the system
    // (could add them here if needed with multiple upload steps)
    
    // Test search functionality
    await page.getByPlaceholderText(/Search document/i).fill('nonexistent');
    
    // Verify no results shown for nonexistent search
    await expect(page.getByText('No documents found')).toBeVisible();
    
    // Clear search
    await page.getByPlaceholderText(/Search document/i).clear();
    
    // Filter by tab (assuming tabs exist for filtering)
    // Click on a category tab if available
    const tabsExist = await page.getByRole('tab').count() > 0;
    
    if (tabsExist) {
      await page.getByRole('tab').nth(1).click();
      // Allow time for filter to apply
      await page.waitForTimeout(500);
    }
  });
});
