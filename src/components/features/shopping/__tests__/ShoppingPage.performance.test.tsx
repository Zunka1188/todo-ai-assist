
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ShoppingPage from '@/pages/ShoppingPage';
import { performanceMonitor } from '@/utils/performance-monitor';

// Mock the required components and hooks
vi.mock('@/components/ui/app-page', () => ({
  default: ({ children }) => <div data-testid="app-page">{children}</div>
}));

vi.mock('@/components/features/shopping/ShoppingItemsContext', () => ({
  ShoppingItemsProvider: ({ children }) => <div data-testid="shopping-provider">{children}</div>,
  useShoppingItemsContext: () => ({
    items: [],
    addItem: vi.fn(),
    toggleItem: vi.fn(),
    removeItem: vi.fn(),
    updateItem: vi.fn(),
  })
}));

vi.mock('@/components/features/shopping/ShoppingPageContent', () => ({
  default: () => <div data-testid="shopping-content">Shopping Content</div>
}));

vi.mock('@/hooks/useDataRecovery', () => ({
  useDataRecovery: () => ({
    isRecovering: false,
    retryRecovery: vi.fn()
  })
}));

vi.mock('@/hooks/useVisibilityChange', () => ({
  useVisibilityChange: vi.fn()
}));

vi.mock('@/hooks/usePersistenceSetup', () => ({
  usePersistenceSetup: vi.fn()
}));

describe('ShoppingPage Performance Tests', () => {
  beforeEach(() => {
    performanceMonitor.clear();
    performanceMonitor.enable(true);
  });

  afterEach(() => {
    performanceMonitor.enable(false);
    vi.clearAllMocks();
  });

  it('measures the rendering performance of the ShoppingPage', async () => {
    // Start performance measurement
    performanceMonitor.mark('shopping_page_start');
    
    // Render the component
    const { container } = render(<ShoppingPage />);
    
    // End performance measurement
    performanceMonitor.mark('shopping_page_end');
    const duration = performanceMonitor.measure(
      'shopping_page_render',
      'shopping_page_start',
      'shopping_page_end'
    );
    
    // Verify we have a measurement
    expect(duration).not.toBeNull();
    
    // Verify the main components rendered
    expect(container.querySelector('[data-testid="app-page"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="shopping-provider"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="shopping-content"]')).toBeInTheDocument();
  });

  it('measures async operations in the ShoppingPage components', async () => {
    // Create a mock async function to measure
    const mockAsyncOperation = vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return { success: true };
    });
    
    // Measure the async operation
    const timedResult = await performanceMonitor.timeAsync(
      'shopping_async_operation',
      mockAsyncOperation
    );
    
    // Verify the result and timing
    expect(timedResult.result).toEqual({ success: true });
    expect(timedResult.executionTime).toBeGreaterThan(0);
  });
});
