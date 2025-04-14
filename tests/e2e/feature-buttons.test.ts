
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

  test('should test global navigation elements', async ({ page }) => {
    await setupPageTest(page, '/');
    logTestStep('Testing global navigation elements');
    
    // Test language selector
    const languageButton = page.getByRole('button', { name: /language|translations/i });
    if (await languageButton.isVisible()) {
      await languageButton.click();
      await waitForStableUI(page);
      // Close dropdown
      await page.keyboard.press('Escape');
    }
    
    // Test menu dropdown
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await waitForStableUI(page);
      
      // Test menu items
      const menuItems = page.getByRole('menuitem');
      if (await menuItems.count() > 0) {
        await menuItems.first().click();
        await waitForStableUI(page);
      }
    }
    
    // Test bottom navigation
    const bottomNav = page.locator('nav').filter({ has: page.getByRole('link') }).last();
    if (await bottomNav.isVisible()) {
      const navLinks = bottomNav.getByRole('link');
      for (let i = 0; i < Math.min(await navLinks.count(), 2); i++) {
        await navLinks.nth(i).click();
        await waitForStableUI(page);
        await page.goBack();
      }
    }
  });

  test('should test home page widgets and cards', async ({ page }) => {
    await setupPageTest(page, '/');
    logTestStep('Testing home page widgets and cards');
    
    // Test widget quick add buttons
    const quickAddButtons = page.getByRole('button', { name: /\+|add/i });
    if (await quickAddButtons.count() > 0) {
      for (let i = 0; i < Math.min(await quickAddButtons.count(), 2); i++) {
        await quickAddButtons.nth(i).click();
        await waitForStableUI(page);
        await closeOpenDialogs(page);
      }
    }
    
    // Test feature cards
    const featureCards = page.getByRole('link').filter({ has: page.locator('.hover-scale') });
    if (await featureCards.count() > 0) {
      for (let i = 0; i < Math.min(await featureCards.count(), 2); i++) {
        const href = await featureCards.nth(i).getAttribute('href');
        await featureCards.nth(i).click();
        await waitForStableUI(page);
        await page.goBack();
      }
    }
  });

  // NEW TEST: Main scan button test
  test('should test main scan button functionality', async ({ page }) => {
    await setupPageTest(page, '/');
    logTestStep('Testing main scan button');
    
    // Find and test main scan button
    const mainScanButton = page.getByTestId('scan-button');
    if (await mainScanButton.isVisible()) {
      logTestStep('Found main scan button, clicking it');
      await mainScanButton.click();
      
      // Verify navigation to scan page
      await page.waitForURL('**/scan');
      
      // Verify scan interface options are shown
      const scanOptions = [
        page.getByRole('button', { name: /camera|scan/i }),
        page.getByRole('button', { name: /upload/i })
      ];
      
      for (const option of scanOptions) {
        await expect(option).toBeVisible();
      }
      
      // Go back to home
      await page.goBack();
    } else {
      logTestStep('Main scan button not found, looking for alternatives');
      
      // Try alternative selectors
      const altScanButtons = [
        page.getByRole('button', { name: /scan/i }),
        page.locator('button').filter({ hasText: /scan/i }),
        page.locator('[class*="scan-button"]')
      ];
      
      for (const button of altScanButtons) {
        if (await button.isVisible()) {
          await button.click();
          await waitForStableUI(page);
          const currentUrl = page.url();
          if (currentUrl.includes('scan')) {
            logTestStep('Successfully navigated to scan page');
            await page.goBack();
            break;
          }
        }
      }
    }
  });

  // NEW TEST: Test home page widget details
  test('should test home page widget functionality', async ({ page }) => {
    await setupPageTest(page, '/');
    logTestStep('Testing home page widget functionality');
    
    // Test Calendar widget
    logTestStep('Testing calendar widget');
    const calendarWidget = page.locator('[class*="calendar-widget"], [data-testid="calendar-widget"]');
    if (await calendarWidget.isVisible()) {
      // Test today's date display
      const dateDisplay = calendarWidget.locator('.date, [class*="date"]');
      await expect(dateDisplay).toBeVisible();
      
      // Test next event preview
      const eventPreview = calendarWidget.locator('.event, [class*="event"]');
      if (await eventPreview.isVisible()) {
        await eventPreview.hover();
      }
      
      // Test quick add event button
      const addEventButton = calendarWidget.getByRole('button', { name: /\+|add/i });
      if (await addEventButton.isVisible()) {
        await addEventButton.click();
        await waitForStableUI(page);
        await closeOpenDialogs(page);
      }
    }
    
    // Test Task widget
    logTestStep('Testing task widget');
    const taskWidget = page.locator('[class*="task-widget"], [data-testid="task-widget"]');
    if (await taskWidget.isVisible()) {
      // Test task list preview
      const taskList = taskWidget.locator('li, .task-item, [class*="task-item"]');
      if (await taskList.count() > 0) {
        await taskList.first().hover();
        
        // Test task checkboxes
        const checkbox = taskList.first().locator('input[type="checkbox"], [role="checkbox"]');
        if (await checkbox.isVisible()) {
          await checkbox.click();
          await waitForStableUI(page);
          // Uncheck to restore state
          await checkbox.click();
        }
      }
      
      // Test quick add task button
      const addTaskButton = taskWidget.getByRole('button', { name: /\+|add/i });
      if (await addTaskButton.isVisible()) {
        await addTaskButton.click();
        await waitForStableUI(page);
        await closeOpenDialogs(page);
      }
    }
  });

  // NEW TEST: Test notes expansion in shopping list
  test('should test notes expansion in shopping list', async ({ page }) => {
    await setupPageTest(page, '/shopping');
    logTestStep('Testing notes expansion in shopping list');
    
    // Ensure there's at least one item with notes
    let hasItemWithNotes = false;
    
    // First check if any existing item has notes
    const shoppingItems = page.locator('[data-testid="shopping-item"], .shopping-item');
    const count = await shoppingItems.count();
    
    for (let i = 0; i < count; i++) {
      const item = shoppingItems.nth(i);
      const notesExpander = item.getByRole('button', { name: /notes|expand|show more/i });
      
      if (await notesExpander.isVisible()) {
        logTestStep('Found item with notes, testing expansion');
        await notesExpander.click();
        await waitForStableUI(page);
        
        // Verify notes are shown
        const expandedNotes = item.locator('.notes-content, [class*="notes"]');
        await expect(expandedNotes).toBeVisible();
        
        // Collapse notes
        await notesExpander.click();
        hasItemWithNotes = true;
        break;
      }
    }
    
    // If no item with notes found, create one
    if (!hasItemWithNotes) {
      logTestStep('No item with notes found, creating test item');
      
      await page.getByRole('button', { name: /add item/i }).click();
      const dialog = page.getByRole('dialog');
      
      await dialog.getByLabel(/name/i).fill('Test Item With Notes');
      
      // Add notes
      const notesField = dialog.getByLabel(/notes/i);
      if (await notesField.isVisible()) {
        await notesField.fill('These are test notes that should be expandable');
        
        // Save the item
        await dialog.getByRole('button', { name: /save|add/i }).click();
        await waitForStableUI(page);
        
        // Find the new item and test notes expansion
        const newItem = page.getByText('Test Item With Notes').first();
        await newItem.click();
        
        // Look for notes expander in item or details view
        const notesExpander = page.getByRole('button', { name: /notes|expand|show more/i });
        if (await notesExpander.isVisible()) {
          await notesExpander.click();
          await waitForStableUI(page);
          
          // Verify notes are shown
          await expect(page.getByText('These are test notes that should be expandable')).toBeVisible();
        }
      }
    }
  });

  // NEW TEST: Test calendar share features
  test('should test calendar share functionality in detail', async ({ page }) => {
    await setupPageTest(page, '/calendar');
    logTestStep('Testing calendar share functionality');
    
    // First try to find and click share button in the calendar header
    const shareButtons = page.getByRole('button', { name: /share/i });
    if (await shareButtons.count() > 0) {
      logTestStep('Found share button in calendar, clicking it');
      await shareButtons.first().click();
      await waitForStableUI(page);
      
      // Test share options
      const shareDialog = page.getByRole('dialog');
      if (await shareDialog.isVisible()) {
        // Test generate link button
        const generateLinkButton = shareDialog.getByRole('button', { name: /generate|create link/i });
        if (await generateLinkButton.isVisible()) {
          await generateLinkButton.click();
          await waitForStableUI(page);
        }
        
        // Test copy link button
        const copyLinkButton = shareDialog.getByRole('button', { name: /copy/i });
        if (await copyLinkButton.isVisible()) {
          await copyLinkButton.click();
          await waitForStableUI(page);
        }
        
        // Close dialog
        await shareDialog.getByRole('button', { name: /close|cancel/i }).click();
      }
    } else {
      // If no general share button, test sharing an individual event
      logTestStep('No calendar-wide share button, testing event sharing');
      
      // Create event if needed
      const events = page.getByText(/meeting|appointment|event/i);
      if (await events.count() === 0) {
        await page.getByRole('button', { name: /add event/i }).click();
        const dialog = page.getByRole('dialog');
        await dialog.getByLabel(/title/i).fill('Event To Share');
        await dialog.getByRole('button', { name: /save/i }).click();
        await waitForStableUI(page);
      }
      
      // Open event
      const event = await page.getByText(/meeting|appointment|event/i).first();
      await event.click();
      await waitForStableUI(page);
      
      // Test event share button
      const eventShareButton = page.getByRole('button', { name: /share/i });
      if (await eventShareButton.isVisible()) {
        await eventShareButton.click();
        await waitForStableUI(page);
        
        // Look for share options
        const shareOptions = page.locator('[role="menu"], [role="dialog"]');
        if (await shareOptions.isVisible()) {
          // Close options
          await page.keyboard.press('Escape');
        }
      }
      
      // Close event dialog
      await closeOpenDialogs(page);
    }
  });

  // NEW TEST: Test document template categories and zoom controls
  test('should test document categories and zoom controls', async ({ page }) => {
    await setupPageTest(page, '/documents');
    logTestStep('Testing document categories and zoom controls');
    
    // Test document categories tabs
    const categoryTabs = [
      page.getByRole('tab', { name: /all/i }),
      page.getByRole('tab', { name: /style/i }),
      page.getByRole('tab', { name: /shared/i }),
      page.getByRole('tab', { name: /templates/i })
    ];
    
    for (const tab of categoryTabs) {
      if (await tab.isVisible()) {
        const tabText = await tab.textContent();
        logTestStep(`Clicking category tab: ${tabText}`);
        await tab.click();
        await waitForStableUI(page);
      }
    }
    
    // Open a document to test zoom controls
    const documents = page.locator('.document-item, [data-testid="document-item"]');
    if (await documents.count() > 0) {
      await documents.first().click();
      await waitForStableUI(page);
      
      // Test zoom controls in document viewer
      const zoomControls = [
        page.getByRole('button', { name: /zoom in/i }),
        page.getByRole('button', { name: /zoom out/i }),
        page.getByRole('button', { name: /fit/i })
      ];
      
      for (const control of zoomControls) {
        if (await control.isVisible()) {
          await control.click();
          await waitForStableUI(page);
        }
      }
      
      // Close document viewer
      await closeOpenDialogs(page);
    }
  });

  // NEW TEST: Test detection engine features more thoroughly
  test('should test detection engine features', async ({ page }) => {
    await setupPageTest(page, '/scan');
    logTestStep('Testing detection engine features');
    
    // Test barcode scanner interface
    const scanButton = page.getByRole('button', { name: /scan|barcode/i });
    if (await scanButton.isVisible()) {
      await scanButton.click();
      await waitForStableUI(page);
      
      // Test camera controls
      const flashButton = page.getByRole('button', { name: /flash|light/i });
      if (await flashButton.isVisible()) {
        await flashButton.click();
      }
      
      // Test capture button
      const captureButton = page.getByRole('button', { name: /capture|take photo/i });
      if (await captureButton.isVisible()) {
        await captureButton.click();
        await waitForStableUI(page);
      }
      
      // Close scanner
      await closeOpenDialogs(page);
    }
    
    // Test document classification
    const uploadButton = page.getByRole('button', { name: /upload|choose file/i });
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
      await waitForStableUI(page);
      await closeOpenDialogs(page);
    }
  });

  // NEW TEST: Test enhanced weather interactions
  test('should test enhanced weather interactions', async ({ page }) => {
    await setupPageTest(page, '/weather');
    logTestStep('Testing weather page interactions');
    
    // Test map view toggle if available
    const mapToggle = page.getByRole('button', { name: /map|view/i });
    if (await mapToggle.isVisible()) {
      await mapToggle.click();
      await waitForStableUI(page);
    }
    
    // Test forecast cards
    const forecastCards = page.locator('[data-testid="forecast-card"]');
    if (await forecastCards.count() > 0) {
      for (let i = 0; i < Math.min(await forecastCards.count(), 2); i++) {
        await forecastCards.nth(i).hover();
        await waitForStableUI(page);
        
        const expandButton = forecastCards.nth(i).getByRole('button', { name: /details|expand/i });
        if (await expandButton.isVisible()) {
          await expandButton.click();
          await waitForStableUI(page);
        }
      }
    }
  });

  // NEW TEST: Test help tooltips and keyboard shortcuts
  test('should test help tooltips and keyboard shortcuts', async ({ page }) => {
    await setupPageTest(page, '/');
    logTestStep('Testing help tooltips and keyboard shortcuts');
    
    // Test help tooltips if present
    const helpButtons = page.getByRole('button', { name: /help|\?/i });
    if (await helpButtons.count() > 0) {
      for (let i = 0; i < Math.min(await helpButtons.count(), 2); i++) {
        await helpButtons.nth(i).hover();
        await waitForStableUI(page);
        
        // Try clicking to see if it opens help dialog
        await helpButtons.nth(i).click();
        await closeOpenDialogs(page);
      }
    }
    
    // Test keyboard shortcuts modal if available
    await page.keyboard.press('?');
    await waitForStableUI(page);
    
    // Check if keyboard shortcuts dialog appeared
    const shortcutsDialog = page.getByRole('dialog').filter({
      hasText: /keyboard shortcuts|shortcuts|hotkeys/i
    });
    
    if (await shortcutsDialog.isVisible()) {
      logTestStep('Keyboard shortcuts dialog opened successfully');
      await shortcutsDialog.getByRole('button', { name: /close|×/i }).click();
    }
    
    // Test common keyboard shortcuts
    const shortcuts = ['/', 'n', 'h'];
    for (const key of shortcuts) {
      await page.keyboard.press(key);
      await waitForStableUI(page);
    }
  });

  // NEW TEST: Test settings with all options
  test('should test all settings options', async ({ page }) => {
    await setupPageTest(page, '/settings');
    logTestStep('Testing all settings options');
    
    // Test language auto-detect toggle
    const autoDetectToggle = page.locator('label').filter({ hasText: /auto-detect/i }).first();
    if (await autoDetectToggle.isVisible()) {
      await autoDetectToggle.click();
      await waitForStableUI(page);
    }
    
    // Test system preference toggle for theme
    const systemPrefToggle = page.locator('label').filter({ hasText: /system|preference/i }).first();
    if (await systemPrefToggle.isVisible()) {
      await systemPrefToggle.click();
      await waitForStableUI(page);
    }
    
    // Test notification settings
    const notificationToggles = page.locator('label').filter({ hasText: /notification/i });
    if (await notificationToggles.count() > 0) {
      await notificationToggles.first().click();
      await waitForStableUI(page);
    }
    
    // Test preference controls
    const preferenceDropdowns = page.getByRole('combobox');
    if (await preferenceDropdowns.count() > 0) {
      await preferenceDropdowns.first().click();
      await waitForStableUI(page);
      
      // Select first option
      const options = page.getByRole('option');
      if (await options.count() > 0) {
        await options.first().click();
      } else {
        // Close dropdown by clicking elsewhere
        await page.mouse.click(10, 10);
      }
    }
    
    // Test privacy controls
    const privacySection = page.getByText(/privacy|data/i).first();
    if (await privacySection.isVisible()) {
      await privacySection.click();
      await waitForStableUI(page);
      
      // Check for toggles in this section
      const privacyToggles = page.locator('input[type="checkbox"]').nth(0);
      if (await privacyToggles.isVisible()) {
        await privacyToggles.click();
        await waitForStableUI(page);
      }
    }
  });
  
  // NEW TEST: Test AI special features
  test('should test AI special features', async ({ page }) => {
    // Try to navigate to AI food page if it exists
    try {
      await setupPageTest(page, '/ai');
      logTestStep('Testing AI special features');
      
      // Test food recognition features
      const uploadPhotoButton = page.getByRole('button', { name: /upload|photo/i });
      if (await uploadPhotoButton.isVisible()) {
        await uploadPhotoButton.click();
        await waitForStableUI(page);
        await closeOpenDialogs(page);
      }
      
      // Send a test prompt about food
      const chatInput = page.getByRole('textbox');
      if (await chatInput.isVisible()) {
        await chatInput.fill('What can I cook with potatoes and chicken?');
        await page.getByRole('button', { name: /send/i }).click();
        await waitForStableUI(page);
        
        // Wait for response cards
        await page.waitForTimeout(1000);
        
        // Test recipe suggestion cards
        const recipeCards = page.locator('.recipe-card, [class*="recipe"]');
        if (await recipeCards.count() > 0) {
          // Click on first recipe card
          await recipeCards.first().click();
          await waitForStableUI(page);
          
          // Test save/share buttons on recipe detail
          const actionButtons = page.getByRole('button').filter({ 
            hasText: /save|share|favorite|like/i 
          });
          
          if (await actionButtons.count() > 0) {
            await actionButtons.first().click();
            await waitForStableUI(page);
          }
        }
      }
    } catch (error) {
      logTestStep('AI page not found, trying alternate approach');
      
      // Open AI assistant from home page
      await setupPageTest(page, '/');
      const chatButton = page.locator('header button').filter({ hasText: '' }).first();
      
      if (await chatButton.isVisible()) {
        await chatButton.click();
        await waitForStableUI(page);
        
        // Test chat input with food question
        const chatPanel = page.locator('[role="dialog"]').filter({ hasText: /AI|Assistant/i });
        if (await chatPanel.isVisible()) {
          const chatInput = chatPanel.getByRole('textbox');
          await chatInput.fill('What can I cook with potatoes and chicken?');
          await chatPanel.getByRole('button', { name: /send/i }).click();
          
          // Wait for response
          await page.waitForTimeout(1000);
          
          // Close chat
          await chatPanel.getByRole('button', { name: /close|×/i }).click();
        }
      }
    }
  });
});
