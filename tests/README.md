
# Testing Documentation

This directory contains automated tests for the app using various testing frameworks.

## Prerequisites

Before running these tests, make sure you have installed:

- Node.js (v14 or later)
- npm or yarn

## Testing Frameworks

### Playwright

Located in `tests/playwright/`

To run Playwright tests:

```bash
# Install dependencies
npm install @playwright/test
# Install browsers
npx playwright install
# Run the tests
npx playwright test
```

### Cypress

Located in `cypress/e2e/`

To run Cypress tests:

```bash
# Install dependencies
npm install cypress
# Open Cypress Test Runner
npx cypress open
# Or run tests headlessly
npx cypress run
```

### Selenium

Located in `tests/selenium/`

To run Selenium tests:

```bash
# Install dependencies
npm install selenium-webdriver
# You'll need the appropriate WebDriver for your browser
# For Chrome: https://sites.google.com/a/chromium.org/chromedriver/downloads
# Run the tests
npx mocha tests/selenium/*.test.js
```

### KushoAI Recorder

Located in `tests/kusho-recorder/`

These are preset recorded tests that can be imported into the KushoAI Recorder browser extension.

1. Install the KushoAI Recorder extension
2. Open the extension in your browser
3. Import the JSON file from `tests/kusho-recorder/`
4. Click "Play" to run the test

## Common Test Scenarios

All test files cover similar user journeys:

1. **Document Upload Flow**:
   - Navigate to Documents page
   - Add a new document with title, file, category, description and tags
   - Verify the document appears in the list
   - Open document in full screen preview
   - Delete the document (cleanup)
   
## Test Data

Sample test files are located in the `tests/fixtures/` directory.
