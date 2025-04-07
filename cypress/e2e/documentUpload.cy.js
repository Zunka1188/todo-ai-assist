
/// <reference types="cypress" />

describe('Document Upload User Journey', () => {
  beforeEach(() => {
    // Visit the documents page
    cy.visit('/documents');
  });

  it('should upload a document and view in full screen', () => {
    // Check if we're on the documents page
    cy.contains('h1', 'Documents').should('be.visible');
    
    // Click the Add Item button
    cy.contains('button', 'Add Item').click();
    
    // Wait for the dialog to appear
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Add New Document').should('be.visible');
    
    // Fill in document details
    cy.get('input#title').type('Test Document');
    
    // Upload a file
    cy.contains('button', 'Upload File').click();
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('Test PDF content'),
      fileName: 'test-document.pdf',
      mimeType: 'application/pdf'
    }, { force: true });
    
    // Wait for file upload to complete
    cy.contains('test-document.pdf').should('be.visible');
    
    // Select a category
    cy.get('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Files').click();
    
    // Add a description
    cy.get('#description').type('This is a test document for automated testing');
    
    // Add tags
    cy.get('#tags').type('test, automation, document');
    
    // Submit the form
    cy.contains('button', 'Add Document').click();
    
    // Verify the document was added to the list
    cy.contains('Test Document').should('be.visible');
    
    // Open the document in full screen preview
    cy.contains('Test Document').click();
    
    // Verify full screen preview appears
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('h2', 'Test Document').should('be.visible');
    
    // Test the download button works
    cy.contains('button', 'Download').should('be.visible');
    
    // Test the share button is visible
    cy.get('button[aria-label="Share"]').should('exist');
    
    // Close the preview
    cy.get('button[aria-label="Close"]').click();
    
    // Delete the test document (cleanup)
    cy.contains('Test Document').click();
    cy.contains('button', 'Delete').click();
    cy.contains('button', 'Confirm').click();
    
    // Verify the document is no longer in the list
    cy.contains('Test Document').should('not.exist');
  });
});
