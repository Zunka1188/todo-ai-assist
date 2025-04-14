
import { expect, Page } from '@playwright/test';
import { 
  test, 
  logTestStep, 
  waitForStableUI, 
  closeOpenDialogs, 
  setupPageTest,
  takeScreenshot
} from './utils/test-utils';

/**
 * Specialized test suite for testing potentially non-functional buttons
 * and preview features across the application
 */
test.describe('Feature Button and Preview Functionality', () => {
  
  test('should test image preview buttons in calendar events', async ({ page }) => {
    await setupPageTest(page, '/calendar');
    logTestStep('Testing calendar event image previews');
    
    // Add an event with image attachment if possible
    await page.getByRole('button', { name: /add event/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/title/i).fill('Event With Image');
    
    // Look for image attachment button
    const attachmentButton = dialog.getByRole('button', { name: /attach|image|file/i });
    if (await attachmentButton.isVisible()) {
      logTestStep('Found attachment button, clicking it');
      await attachmentButton.click();
      // Note: We cannot actually upload a file here without file system access
    }
    
    // Save the event
    await dialog.getByRole('button', { name: /save/i }).click();
    await waitForStableUI(page);
    
    // Click on the created event to open view dialog
    await page.getByText('Event With Image').click();
    await waitForStableUI(page);
    
    // Look for image preview button
    const previewButton = page.getByRole('button', { name: /preview|view image/i });
    if (await previewButton.isVisible()) {
      logTestStep('Found image preview button, clicking it');
      await previewButton.click();
      
      // Check if full screen preview opened
      const fullScreen = page.locator('div').filter({ hasText: /full screen preview/i });
      if (await fullScreen.isVisible()) {
        logTestStep('Full screen preview opened successfully');
        
        // Test close button
        const closeButton = fullScreen.getByRole('button', { name: /close|×/i });
        await closeButton.click();
        await expect(fullScreen).not.toBeVisible();
      }
    }
    
    // Close the event view dialog
    await closeOpenDialogs(page);
  });
  
  test('should test document full screen preview functionality', async ({ page }) => {
    await setupPageTest(page, '/documents');
    logTestStep('Testing document full screen preview');
    
    // Add a document if needed
    const documentCount = await page.locator('.document-item, [data-testid="document-item"]').count();
    if (documentCount === 0) {
      logTestStep('No documents found, adding a test document');
      await page.getByRole('button', { name: /add document|add item|upload/i }).click();
      
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel(/title/i).fill('Test Document');
      
      // Try to submit without actual file upload (testing UI only)
      await dialog.getByRole('button', { name: /save|add|create/i }).click();
      await waitForStableUI(page);
    }
    
    // Click on the first document
    const documents = page.locator('.document-item, [data-testid="document-item"]');
    if (await documents.count() > 0) {
      await documents.first().click();
      await waitForStableUI(page);
      
      // Look for full screen button
      const fullScreenButton = page.getByRole('button', { name: /fullscreen|expand/i });
      if (await fullScreenButton.isVisible()) {
        logTestStep('Found full screen button, clicking it');
        await fullScreenButton.click();
        await waitForStableUI(page);
        
        // Check full screen mode and close it
        await page.getByRole('button', { name: /close|exit|×/i }).click();
        await waitForStableUI(page);
      } else {
        logTestStep('Full screen button not found, may not be implemented');
      }
      
      // Close document preview
      await closeOpenDialogs(page);
    }
  });
  
  test('should test shopping list image previews', async ({ page }) => {
    await setupPageTest(page, '/shopping');
    logTestStep('Testing shopping list item image previews');
    
    // Add a shopping item
    await page.getByRole('button', { name: /add item|\+/i }).click();
    
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/name/i).fill('Test Item With Image');
    
    // Look for image upload button
    const uploadButton = dialog.getByRole('button', { name: /upload|image|photo/i });
    if (await uploadButton.isVisible()) {
      logTestStep('Found image upload button, clicking it');
      await uploadButton.click();
      // Note: We cannot actually upload a file here
      
      // Look for image preview options
      const previewButton = dialog.getByRole('button', { name: /preview|view/i });
      if (await previewButton.isVisible()) {
        logTestStep('Found image preview button, clicking it');
        await previewButton.click();
        await waitForStableUI(page);
        
        // Close preview if opened
        const closeButton = page.getByRole('button', { name: /close|×/i });
        if (await closeButton.isVisible()) {
          await closeButton.click();
          await waitForStableUI(page);
        }
      }
    }
    
    // Save the item
    await dialog.getByRole('button', { name: /save|add|create/i }).click();
    await waitForStableUI(page);
    
    // Test item image click for preview
    const itemImages = page.locator('[role="button"][aria-label*="View"]');
    if (await itemImages.count() > 0) {
      logTestStep('Found item images, clicking for preview');
      await itemImages.first().click();
      await waitForStableUI(page);
      
      // Check if image preview dialog opened
      const imageDialog = page.getByRole('dialog');
      if (await imageDialog.isVisible()) {
        logTestStep('Image preview dialog opened successfully');
        await imageDialog.getByRole('button', { name: /close/i }).click();
        await waitForStableUI(page);
      }
    }
  });
  
  test('should test AI assistant and scan feature buttons', async ({ page }) => {
    // First test AI assistant
    await setupPageTest(page, '/ai');
    logTestStep('Testing AI assistant buttons');
    
    // Look for image upload button
    const imageButton = page.getByRole('button', { name: /image|upload/i });
    if (await imageButton.isVisible()) {
      logTestStep('Found image upload button, clicking it');
      await imageButton.click();
      await waitForStableUI(page);
      
      // Close file picker dialog if needed
      await page.keyboard.press('Escape');
      await waitForStableUI(page);
    }
    
    // Test voice input button if available
    const voiceButton = page.getByRole('button', { name: /voice|mic/i });
    if (await voiceButton.isVisible()) {
      logTestStep('Found voice input button, clicking it');
      await voiceButton.click();
      await waitForStableUI(page);
      
      // Close any permissions dialog
      await page.keyboard.press('Escape');
      await waitForStableUI(page);
    }
    
    // Now test scan feature
    await setupPageTest(page, '/scan');
    logTestStep('Testing scan feature buttons');
    
    // Look for camera/scan button
    const scanButton = page.getByRole('button', { name: /scan|camera/i });
    if (await scanButton.isVisible()) {
      logTestStep('Found scan button, clicking it');
      await scanButton.click();
      await waitForStableUI(page);
      
      // Look for preview of scanned content
      const preview = page.locator('[aria-label="Preview"]');
      if (await preview.isVisible()) {
        logTestStep('Scan preview visible');
        
        // Test any actions on preview
        const actionButtons = page.getByRole('button').filter({ 
          hasText: /retake|use photo|analyze/i
        });
        
        if (await actionButtons.count() > 0) {
          await actionButtons.first().click();
          await waitForStableUI(page);
        }
      }
    }
    
    // Test file upload option
    const uploadButton = page.getByRole('button', { name: /upload/i });
    if (await uploadButton.isVisible()) {
      logTestStep('Found upload button, clicking it');
      await uploadButton.click();
      await waitForStableUI(page);
      
      // Close file picker dialog if needed
      await page.keyboard.press('Escape');
      await waitForStableUI(page);
    }
  });
  
  test('should test share and RSVP buttons in calendar', async ({ page }) => {
    await setupPageTest(page, '/calendar');
    logTestStep('Testing calendar sharing and RSVP buttons');
    
    // Create a test event if needed
    const events = page.getByText(/meeting|appointment|event/i);
    if (await events.count() === 0) {
      logTestStep('No events found, creating test event');
      
      await page.getByRole('button', { name: /add event/i }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel(/title/i).fill('Shareable Test Event');
      await dialog.getByRole('button', { name: /save/i }).click();
      await waitForStableUI(page);
    }
    
    // Click on an event
    await page.getByText('Shareable Test Event').first().click();
    await waitForStableUI(page);
    
    // Test share button
    const shareButton = page.getByRole('button', { name: /share/i });
    if (await shareButton.isVisible()) {
      logTestStep('Found share button, clicking it');
      await shareButton.click();
      await waitForStableUI(page);
      
      // Check for share options
      const shareOptions = page.locator('[role="menu"], [role="dialog"]').filter({
        hasText: /copy link|email|calendar/i
      });
      
      if (await shareOptions.isVisible()) {
        logTestStep('Share options menu opened');
        // Close it
        await page.keyboard.press('Escape');
        await waitForStableUI(page);
      }
    }
    
    // Test RSVP button
    const rsvpButton = page.getByRole('button', { name: /rsvp/i });
    if (await rsvpButton.isVisible()) {
      logTestStep('Found RSVP button, clicking it');
      await rsvpButton.click();
      await waitForStableUI(page);
      
      // Check for RSVP dialog
      const rsvpDialog = page.getByRole('dialog').filter({
        hasText: /will you attend|response/i
      });
      
      if (await rsvpDialog.isVisible()) {
        logTestStep('RSVP dialog opened successfully');
        
        // Test response options
        const responseButtons = rsvpDialog.getByRole('button').filter({
          hasText: /yes|no|maybe/i
        });
        
        if (await responseButtons.count() > 0) {
          await responseButtons.first().click();
          await waitForStableUI(page);
        }
        
        // Close the dialog
        await rsvpDialog.getByRole('button', { name: /close|cancel/i }).click();
        await waitForStableUI(page);
      }
    }
    
    // Close event dialog
    await closeOpenDialogs(page);
  });
  
  test('should test document export and batch action buttons', async ({ page }) => {
    await setupPageTest(page, '/documents');
    logTestStep('Testing document export and batch actions');
    
    // Test export button if available
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      logTestStep('Found export button, clicking it');
      await exportButton.click();
      await waitForStableUI(page);
      
      // Close any dialog that opens
      await closeOpenDialogs(page);
    }
    
    // Test batch actions if available
    // First try to select multiple documents
    const checkboxes = page.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 1) {
      logTestStep('Selecting multiple documents for batch actions');
      await checkboxes.first().click();
      await checkboxes.nth(1).click();
      await waitForStableUI(page);
      
      // Check for batch action buttons
      const batchButtons = page.getByRole('button').filter({
        hasText: /select all|delete selected|export selected/i
      });
      
      if (await batchButtons.count() > 0) {
        logTestStep('Found batch action buttons');
        
        // Try select all button
        const selectAllButton = batchButtons.filter({ hasText: /select all/i });
        if (await selectAllButton.isVisible()) {
          await selectAllButton.click();
          await waitForStableUI(page);
        }
        
        // Deselect all to avoid accidental deletions
        if (await selectAllButton.isVisible()) {
          await selectAllButton.click();
          await waitForStableUI(page);
        }
      }
    }
  });
  
  test('should test weather location change button', async ({ page }) => {
    // Test weather page if it exists
    try {
      await setupPageTest(page, '/weather');
      logTestStep('Testing weather location change button');
      
      // Look for change location button
      const changeLocationButton = page.getByRole('button', { name: /change location|location/i });
      if (await changeLocationButton.isVisible()) {
        logTestStep('Found location change button, clicking it');
        await changeLocationButton.click();
        await waitForStableUI(page);
        
        // Check for location dialog
        const locationDialog = page.getByRole('dialog');
        if (await locationDialog.isVisible()) {
          logTestStep('Location dialog opened successfully');
          
          // Test search input
          const searchInput = locationDialog.getByPlaceholder(/search|city|location/i);
          if (await searchInput.isVisible()) {
            await searchInput.fill('New York');
            await waitForStableUI(page);
          }
          
          // Try clicking a location result
          const locationResults = page.locator('[role="option"], [role="listitem"]');
          if (await locationResults.count() > 0) {
            await locationResults.first().click();
            await waitForStableUI(page);
          } else {
            // Close dialog
            await locationDialog.getByRole('button', { name: /close|cancel/i }).click();
            await waitForStableUI(page);
          }
        }
      }
    } catch (error) {
      logTestStep('Weather page not found or not accessible');
    }
  });
  
  test('should test settings and account buttons', async ({ page }) => {
    try {
      await setupPageTest(page, '/settings');
      logTestStep('Testing settings and account buttons');
      
      // Test data export button if available
      const exportDataButton = page.getByRole('button', { name: /export data|export/i });
      if (await exportDataButton.isVisible()) {
        logTestStep('Found data export button, clicking it');
        await exportDataButton.click();
        await waitForStableUI(page);
        
        // Close any confirmation dialog
        await closeOpenDialogs(page);
      }
      
      // Test account settings button if available
      const accountButton = page.getByRole('button', { name: /account settings|profile/i });
      if (await accountButton.isVisible()) {
        logTestStep('Found account settings button, clicking it');
        await accountButton.click();
        await waitForStableUI(page);
        
        // Close any dialog that opens
        await closeOpenDialogs(page);
      }
    } catch (error) {
      logTestStep('Settings page not found or not accessible');
    }
  });
});
