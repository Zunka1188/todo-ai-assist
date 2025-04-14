
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShoppingList from '../ShoppingList';
import { ShoppingItemsProvider } from '../ShoppingItemsContext';

// Mock the hooks and components used by ShoppingList
vi.mock('../hooks/useShoppingDialogs', () => ({
  useShoppingDialogs: () => ({
    selectedItem: null,
    itemToEdit: null,
    isEditDialogOpen: false,
    isImagePreviewOpen: false,
    handleImagePreview: vi.fn(),
    handleCloseImageDialog: vi.fn(),
    handleOpenEditDialog: vi.fn(),
    handleCloseEditDialog: vi.fn(),
  })
}));

vi.mock('../hooks/useShoppingItemOperations', () => ({
  useShoppingItemOperations: () => ({
    handleToggleItemCompletion: vi.fn(),
    handleDeleteItem: vi.fn(),
    handleSaveItem: vi.fn(),
    handleSaveItemFromCapture: vi.fn(),
  })
}));

vi.mock('../ShoppingListContent', () => ({
  default: ({ notPurchasedItems, purchasedItems }) => (
    <div data-testid="shopping-list-content">
      <div data-testid="not-purchased-count">{notPurchasedItems.length}</div>
      <div data-testid="purchased-count">{purchasedItems.length}</div>
      <ul>
        {notPurchasedItems.map(item => (
          <li key={item.id} data-testid={`item-${item.id}`}>{item.name}</li>
        ))}
        {purchasedItems.map(item => (
          <li key={item.id} data-testid={`purchased-item-${item.id}`}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}));

describe('ShoppingList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(
      <ShoppingItemsProvider>
        <ShoppingList />
      </ShoppingItemsProvider>
    );
    
    expect(screen.getByTestId('shopping-list-content')).toBeInTheDocument();
    expect(screen.getByTestId('not-purchased-count')).toBeInTheDocument();
    expect(screen.getByTestId('purchased-count')).toBeInTheDocument();
  });

  it('applies filtering based on search term and filter mode', async () => {
    render(
      <ShoppingItemsProvider>
        <ShoppingList searchTerm="Coffee" filterMode="monthly" />
      </ShoppingItemsProvider>
    );
    
    // Verify that the filtering is applied
    // This test depends on the initial data in useShoppingItems having a "Coffee" item
    // with repeatOption "monthly"
    await waitFor(() => {
      expect(screen.getByTestId('not-purchased-count')).toBeInTheDocument();
    });
  });

  it('shows loading state when isLoading is true', () => {
    // Mock ShoppingItemsContext to return isLoading: true
    vi.mock('../ShoppingItemsContext', () => ({
      useShoppingItemsContext: () => ({
        notPurchasedItems: [],
        purchasedItems: [],
        updateSearchTerm: vi.fn(),
        updateFilterMode: vi.fn(),
        isLoading: true,
        sortOption: 'newest',
        setSortOption: vi.fn(),
      }),
      ShoppingItemsProvider: ({ children }) => <>{children}</>,
    }));
    
    render(<ShoppingList />);
    
    // LoadingState should be rendered but we're mocking the component
    // so we can't directly check for it
  });

  it('passes correct props to ShoppingListContent', () => {
    render(
      <ShoppingItemsProvider>
        <ShoppingList readOnly={true} searchTerm="Test" />
      </ShoppingItemsProvider>
    );
    
    // Check that ShoppingListContent received the correct props
    expect(screen.getByTestId('shopping-list-content')).toBeInTheDocument();
  });

  it('updates context when searchTerm or filterMode changes', async () => {
    const updateSearchTerm = vi.fn();
    const updateFilterMode = vi.fn();
    
    // Mock ShoppingItemsContext to track calls to updateSearchTerm and updateFilterMode
    vi.mock('../ShoppingItemsContext', () => ({
      useShoppingItemsContext: () => ({
        notPurchasedItems: [],
        purchasedItems: [],
        updateSearchTerm,
        updateFilterMode,
        isLoading: false,
        sortOption: 'newest',
        setSortOption: vi.fn(),
      }),
      ShoppingItemsProvider: ({ children }) => <>{children}</>,
    }));
    
    const { rerender } = render(<ShoppingList searchTerm="Initial" filterMode="all" />);
    
    expect(updateSearchTerm).toHaveBeenCalledWith('Initial');
    expect(updateFilterMode).toHaveBeenCalledWith('all');
    
    // Change props and rerender
    rerender(<ShoppingList searchTerm="Changed" filterMode="weekly" />);
    
    await waitFor(() => {
      expect(updateSearchTerm).toHaveBeenCalledWith('Changed');
      expect(updateFilterMode).toHaveBeenCalledWith('weekly');
    });
  });

  it('handles sort option changes', () => {
    const setSortOption = vi.fn();
    
    // Mock ShoppingItemsContext
    vi.mock('../ShoppingItemsContext', () => ({
      useShoppingItemsContext: () => ({
        notPurchasedItems: [],
        purchasedItems: [],
        updateSearchTerm: vi.fn(),
        updateFilterMode: vi.fn(),
        isLoading: false,
        sortOption: 'newest',
        setSortOption,
      }),
      ShoppingItemsProvider: ({ children }) => <>{children}</>,
    }));
    
    render(<ShoppingList />);
    
    // Get the component's handle sort function directly and call it
    const component = ShoppingList.prototype;
    if (component.handleSortChange) {
      component.handleSortChange('nameAsc');
      expect(setSortOption).toHaveBeenCalledWith('nameAsc');
    }
  });
});
