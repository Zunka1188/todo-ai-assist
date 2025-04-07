
import { test, expect } from '@playwright/test';

test.describe('Document Upload User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the documents page
    await page.goto('/documents');
  });

  test('should upload a document and view in full screen', async ({ page }) => {
    // Check if we're on the documents page
    await expect(page.getByRole('heading', { name: 'Documents' })).toBeVisible();
    
    // Click the Add Item button
    await page.getByRole('button', { name: 'Add Item' }).click();
    
    // Wait for the dialog to appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Add New Document')).toBeVisible();
    
    // Fill in document details
    await dialog.getByLabel('Title*').fill('Test Document');
    
    // Set up file upload by creating a file input handler
    const fileChooserPromise = page.waitForEvent('filechooser');
    await dialog.getByRole('button', { name: 'Upload File' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Test PDF content')
    });
    
    // Wait for file upload to complete (look for the file name in the UI)
    await expect(dialog.getByText('test-document.pdf')).toBeVisible();
    
    // Select a category
    await dialog.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Files' }).click();
    
    // Add a description
    await dialog.getByLabel('Description').fill('This is a test document for automated testing');
    
    // Add tags
    await dialog.getByLabel('Tags (comma separated)').fill('test, automation, document');
    
    // Submit the form
    await dialog.getByRole('button', { name: 'Add Document' }).click();
    
    // Verify the document was added to the list
    await expect(page.getByText('Test Document')).toBeVisible();
    
    // Open the document in full screen preview
    await page.getByText('Test Document').click();
    
    // Wait for the full screen preview to appear
    const fullScreenDialog = page.getByRole('dialog');
    await expect(fullScreenDialog).toBeVisible();
    
    // Verify document title is visible in the preview
    await expect(fullScreenDialog.getByRole('heading', { name: 'Test Document' })).toBeVisible();
    
    // Close the preview
    await fullScreenDialog.getByRole('button', { name: 'Close' }).click();
    
    // Delete the test document (cleanup)
    await page.getByText('Test Document').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    // Verify the document is no longer in the list
    await expect(page.getByText('Test Document')).not.toBeVisible();
  });
});
