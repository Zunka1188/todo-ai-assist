
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShoppingPageContent from '../ShoppingPageContent';
import ShoppingList from '../ShoppingList';
import { ShoppingItemsProvider } from '../ShoppingItemsContext';
import { performanceMonitor } from '@/utils/performance-monitor';

// Mock the necessary hooks and components
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false }),
}));

vi.mock('@/components/ui/search-input', () => ({
  default: ({ value, onChange }) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search shopping items..."
    />
  ),
}));

// Mock ShoppingTabsSection
vi.mock('../ShoppingTabsSection', () => ({
  default: ({ activeTab, handleTabChange }) => (
    <div data-testid="shopping-tabs">
      <button onClick={() => handleTabChange('all')}>All</button>
      <button onClick={() => handleTabChange('one-off')}>One-off</button>
      <button onClick={() => handleTabChange('weekly')}>Weekly</button>
      <button onClick={() => handleTabChange('monthly')}>Monthly</button>
    </div>
  ),
}));

// Mock AddItemDialog
vi.mock('../AddItemDialog', () => ({
  default: ({ open, onOpenChange, onSave }) => (
    <div data-testid="add-item-dialog" style={{ display: open ? 'block' : 'none' }}>
      <button onClick={() => onSave({ name: 'New Item' })}>Save Item</button>
      <button onClick={() => onOpenChange(false)}>Cancel</button>
    </div>
  ),
}));

// Mock ShoppingListContent for ShoppingList
vi.mock('../ShoppingListContent', () => ({
  default: ({ notPurchasedItems, purchasedItems }) => (
    <div data-testid="shopping-list-content">
      <span data-testid="not-purchased-count">{notPurchasedItems.length}</span>
      <span data-testid="purchased-count">{purchasedItems.length}</span>
    </div>
  )
}));

// Mock the ShoppingItemsContext for more controlled testing
vi.mock('../ShoppingItemsContext', () => {
  const actual = vi.importActual('../ShoppingItemsContext');
  
  return {
    ...actual,
    useShoppingItemsContext: vi.fn().mockReturnValue({
      addItem: vi.fn().mockImplementation(item => ({ ...item, id: 'test-id' })),
      toggleItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      isLoading: false,
      updateSearchTerm: vi.fn(),
      updateFilterMode: vi.fn(),
      notPurchasedItems: [{ id: '1', name: 'Test Item', completed: false }],
      purchasedItems: [{ id: '2', name: 'Completed Item', completed: true }],
      sortOption: 'nameAsc',
      setSortOption: vi.fn(),
      selectedItems: [],
      handleItemSelect: vi.fn(),
      deleteSelectedItems: vi.fn(),
    }),
    ShoppingItemsProvider: ({ children }) => <>{children}</>,
  };
});

describe('Shopping Page Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceMonitor.clear();
    performanceMonitor.enable(true);
  });

  describe('ShoppingPageContent', () => {
    it('renders correctly with all required components', async () => {
      render(<ShoppingPageContent />);
      
      // Check that main components are rendered
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-tabs')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
      
      // Dialog should initially be hidden
      expect(screen.getByTestId('add-item-dialog')).not.toBeVisible();
    });

    it('measures performance of rendering the shopping page', async () => {
      performanceMonitor.mark('shopping_page_render_start');
      
      render(<ShoppingPageContent />);
      
      performanceMonitor.mark('shopping_page_render_end');
      const renderTime = performanceMonitor.measure(
        'shopping_page_render', 
        'shopping_page_render_start', 
        'shopping_page_render_end'
      );
      
      // Verify that we can measure performance
      expect(renderTime).not.toBeNull();
    });
  });

  describe('ShoppingList', () => {
    it('renders both unpurchased and purchased items', () => {
      render(
        <ShoppingItemsProvider>
          <ShoppingList />
        </ShoppingItemsProvider>
      );
      
      // Check that we have the right counts of items
      expect(screen.getByTestId('not-purchased-count').textContent).toBe('1');
      expect(screen.getByTestId('purchased-count').textContent).toBe('1');
    });

    it('applies search term and filter mode correctly', async () => {
      const { rerender } = render(
        <ShoppingItemsProvider>
          <ShoppingList searchTerm="" filterMode="all" />
        </ShoppingItemsProvider>
      );
      
      // Update with search term and filter
      rerender(
        <ShoppingItemsProvider>
          <ShoppingList searchTerm="Test" filterMode="weekly" />
        </ShoppingItemsProvider>
      );
      
      // Check that the mocked context functions were called with right params
      await waitFor(() => {
        const context = vi.mocked(vi.importActual('../ShoppingItemsContext')).useShoppingItemsContext();
        expect(context.updateSearchTerm).toHaveBeenCalledWith('Test');
        expect(context.updateFilterMode).toHaveBeenCalledWith('weekly');
      });
    });
  });
  
  describe('Integration between components', () => {
    it('handles add item workflow correctly', async () => {
      const { rerender } = render(
        <ShoppingItemsProvider>
          <ShoppingPageContent />
        </ShoppingItemsProvider>
      );
      
      // Open dialog
      screen.getByText('Add').click();
      
      // Dialog should be visible now
      await waitFor(() => {
        expect(screen.getByTestId('add-item-dialog')).toBeVisible();
      });
      
      // Save new item
      screen.getByText('Save Item').click();
      
      // Dialog should close
      await waitFor(() => {
        expect(screen.getByTestId('add-item-dialog')).not.toBeVisible();
      });
      
      // Check that addItem was called
      await waitFor(() => {
        const context = vi.mocked(vi.importActual('../ShoppingItemsContext')).useShoppingItemsContext();
        expect(context.addItem).toHaveBeenCalledWith({ name: 'New Item' });
      });
    });
    
    it('handles tab change and updates filter mode', async () => {
      render(<ShoppingPageContent />);
      
      // Click on weekly tab
      screen.getByText('Weekly').click();
      
      // Check that filter mode was updated
      await waitFor(() => {
        const context = vi.mocked(vi.importActual('../ShoppingItemsContext')).useShoppingItemsContext();
        expect(context.updateFilterMode).toHaveBeenCalledWith('weekly');
      });
    });
  });
  
  // Test error handling if needed
  describe('Error handling', () => {
    it('handles errors gracefully when loading fails', async () => {
      // First mock the context to return loading state
      vi.mocked(vi.importActual('../ShoppingItemsContext')).useShoppingItemsContext.mockReturnValueOnce({
        ...vi.mocked(vi.importActual('../ShoppingItemsContext')).useShoppingItemsContext(),
        isLoading: true,
      });
      
      const { rerender } = render(<ShoppingPageContent />);
      
      // Then mock an error state
      vi.mocked(vi.importActual('../ShoppingItemsContext')).useShoppingItemsContext.mockReturnValueOnce({
        ...vi.mocked(vi.importActual('../ShoppingItemsContext')).useShoppingItemsContext(),
        isLoading: false,
        notPurchasedItems: [],
        purchasedItems: [],
      });
      
      rerender(<ShoppingPageContent />);
      
      // Empty state should appear
      await waitFor(() => {
        expect(screen.getByText('Your shopping list is empty')).toBeInTheDocument();
      });
    });
  });
});
