
const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');
const path = require('path');

describe('Document Upload User Journey', function() {
  let driver;
  
  before(async function() {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function() {
    await driver.quit();
  });

  it('should upload a document and view in full screen', async function() {
    // Navigate to the documents page
    await driver.get('http://localhost:3000/documents');
    
    // Check if we're on the documents page
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert.strictEqual(pageTitle, 'Documents');
    
    // Click the Add Item button
    await driver.findElement(By.xpath("//button[contains(text(), 'Add Item')]")).click();
    
    // Wait for the dialog to appear
    await driver.wait(until.elementLocated(By.role('dialog')), 5000);
    const dialogTitle = await driver.findElement(By.xpath("//h2[contains(text(), 'Add New Document')]")).getText();
    assert.strictEqual(dialogTitle, 'Add New Document');
    
    // Fill in document details
    await driver.findElement(By.id('title')).sendKeys('Test Document');
    
    // Upload a file
    const fileInput = await driver.findElement(By.css('input[type="file"]'));
    const filePath = path.resolve(__dirname, '../fixtures/test-document.pdf');
    await fileInput.sendKeys(filePath);
    
    // Wait for file upload to complete
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'test-document.pdf')]")), 5000);
    
    // Select a category
    await driver.findElement(By.css('[role="combobox"]')).click();
    await driver.findElement(By.xpath("//div[@role='option' and contains(text(), 'Files')]")).click();
    
    // Add a description
    await driver.findElement(By.id('description')).sendKeys('This is a test document for automated testing');
    
    // Add tags
    await driver.findElement(By.id('tags')).sendKeys('test, automation, document');
    
    // Submit the form
    await driver.findElement(By.xpath("//button[contains(text(), 'Add Document')]")).click();
    
    // Verify the document was added to the list
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Test Document')]")), 5000);
    
    // Open the document in full screen preview
    await driver.findElement(By.xpath("//*[contains(text(), 'Test Document')]")).click();
    
    // Verify full screen preview appears
    await driver.wait(until.elementLocated(By.role('dialog')), 5000);
    const previewTitle = await driver.findElement(By.xpath("//h2[contains(text(), 'Test Document')]")).getText();
    assert.strictEqual(previewTitle, 'Test Document');
    
    // Close the preview
    await driver.findElement(By.css('button[aria-label="Close"]')).click();
    
    // Delete the test document (cleanup)
    await driver.findElement(By.xpath("//*[contains(text(), 'Test Document')]")).click();
    await driver.findElement(By.xpath("//button[text()='Delete']")).click();
    await driver.findElement(By.xpath("//button[text()='Confirm']")).click();
    
    // Verify the document is no longer in the list
    try {
      await driver.findElement(By.xpath("//*[contains(text(), 'Test Document')]"));
      assert.fail('Document still exists in the list');
    } catch (e) {
      // Element not found, which is expected
    }
  });
});
