
/**
 * End-to-end test for the calendar feature
 * This test requires a running application and uses Playwright to simulate user interactions
 */
import { test, expect } from '@playwright/test';

test.describe('Calendar Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to calendar page
    await page.goto('/calendar');
    // Wait for calendar to load
    await page.waitForSelector('h1:text("Calendar")');
  });

  test('should navigate between different views', async ({ page }) => {
    // Check initial state (presumably month view)
    await expect(page.getByRole('heading', { name: /Calendar/ })).toBeVisible();
    
    // Switch to day view
    await page.getByRole('button', { name: /Day/i }).click();
    await expect(page.getByTestId('day-view')).toBeVisible();
    
    // Switch to agenda view
    await page.getByRole('button', { name: /Agenda/i }).click();
    await expect(page.getByTestId('agenda-view')).toBeVisible();
    
    // Switch back to month view
    await page.getByRole('button', { name: /Month/i }).click();
    await expect(page.getByTestId('month-view')).toBeVisible();
  });

  test('should create, view, edit and delete an event', async ({ page }) => {
    // Create a new event
    await page.getByRole('button', { name: /Create/i }).click();
    
    // Fill in event details
    await page.getByLabel('Title').fill('E2E Test Event');
    await page.getByLabel('Description').fill('This is an automated test event');
    
    // Select start date/time (implementation depends on your date picker)
    // Example assuming a simple input:
    await page.getByLabel(/Start Date/i).fill('2025-01-01');
    await page.getByLabel(/Start Time/i).fill('10:00');
    
    // Add location
    await page.getByLabel(/Location/i).fill('Test Location');
    
    // Save the event
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Verify event was created
    await expect(page.getByText('E2E Test Event')).toBeVisible();
    
    // Open the event
    await page.getByText('E2E Test Event').click();
    
    // Verify event details
    await expect(page.getByText('This is an automated test event')).toBeVisible();
    await expect(page.getByText('Test Location')).toBeVisible();
    
    // Edit the event
    await page.getByRole('button', { name: /Edit/i }).click();
    
    // Change title
    await page.getByLabel('Title').clear();
    await page.getByLabel('Title').fill('Updated E2E Test Event');
    
    // Save changes
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Verify event was updated
    await expect(page.getByText('Updated E2E Test Event')).toBeVisible();
    
    // Delete the event
    await page.getByText('Updated E2E Test Event').click();
    await page.getByRole('button', { name: /Delete/i }).click();
    await page.getByRole('button', { name: /Confirm/i }).click();
    
    // Verify event was deleted
    await expect(page.getByText('Updated E2E Test Event')).not.toBeVisible();
  });

  test('should navigate between different dates', async ({ page }) => {
    // Navigate to next month
    await page.getByRole('button', { name: /Next/i }).click();
    
    // Navigate back to current month
    await page.getByRole('button', { name: /Today/i }).click();
    
    // Navigate to previous month
    await page.getByRole('button', { name: /Previous/i }).click();
  });
});
