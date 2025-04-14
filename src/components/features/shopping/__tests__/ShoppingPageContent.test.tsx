
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ShoppingItemsContext, ShoppingItemsProvider } from '../ShoppingItemsContext';
import ShoppingPageContent from '../ShoppingPageContent';
import { SortOption } from '../useShoppingItems';

// Mock the necessary hooks and components
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false })
}));

// Mock the useShoppingItemsContext hook
vi.mock('../ShoppingItemsContext', () => {
  const actual = vi.importActual('../ShoppingItemsContext');
  return {
    ...actual,
    useShoppingItemsContext: vi.fn(),
    ShoppingItemsContext: {
      Provider: ({ children, value }) => children
    }
  };
});

describe('ShoppingPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Sample not purchased items
  const notPurchasedItems = [
    { id: '1', name: 'Apples', completed: false },
    { id: '2', name: 'Bananas', completed: false }
  ];
  
  // Sample purchased items
  const purchasedItems = [
    { id: '3', name: 'Coffee', completed: true },
    { id: '4', name: 'Tea', completed: true }
  ];
  
  // Mock functions
  const addItem = vi.fn();
  const updateSearchTerm = vi.fn();
  const updateFilterMode = vi.fn();
  const setSortOption = vi.fn();
  const toggleItem = vi.fn();
  const updateItem = vi.fn();
  const removeItem = vi.fn(); 
  const handleItemSelect = vi.fn();
  const deleteSelectedItems = vi.fn();
  const setSelectedItems = vi.fn();

  const mockContextValue = {
    addItem,
    isLoading: false,
    updateSearchTerm,
    updateFilterMode,
    notPurchasedItems,
    purchasedItems,
    sortOption: 'newest' as SortOption,  // Use type assertion here
    setSortOption,
    toggleItem,
    updateItem,
    removeItem, 
    selectedItems: ['1'],
    handleItemSelect,
    deleteSelectedItems,
    setSelectedItems
  };

  it('renders correctly with initial data', () => {
    // Set up the mock implementation for this test
    const { useShoppingItemsContext } = require('../ShoppingItemsContext');
    useShoppingItemsContext.mockReturnValue(mockContextValue);

    render(<ShoppingPageContent />);
    
    // Basic tests to ensure the component renders
    expect(screen.getByPlaceholderText('Search shopping items...')).toBeInTheDocument();
  });
  
  it('calls updateSearchTerm when search input changes', () => {
    // Set up the mock implementation for this test
    const { useShoppingItemsContext } = require('../ShoppingItemsContext');
    useShoppingItemsContext.mockReturnValue(mockContextValue);

    render(<ShoppingPageContent />);
    
    const searchInput = screen.getByPlaceholderText('Search shopping items...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(updateSearchTerm).toHaveBeenCalledWith('test');
  });
  
  it('renders empty state when there are no items and no search filter', () => {
    // Set up the mock implementation for this test with empty arrays
    const { useShoppingItemsContext } = require('../ShoppingItemsContext');
    useShoppingItemsContext.mockReturnValue({
      ...mockContextValue,
      notPurchasedItems: [],
      purchasedItems: []
    });

    render(<ShoppingPageContent />);
    
    expect(screen.getByText('Your shopping list is empty')).toBeInTheDocument();
  });
});
