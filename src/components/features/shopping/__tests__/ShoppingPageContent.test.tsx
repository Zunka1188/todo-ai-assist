
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ShoppingItemsProvider, useShoppingItemsContext } from '../ShoppingItemsContext';
import ShoppingPageContent from '../ShoppingPageContent';

// Mock the necessary hooks and components
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false })
}));

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
  
  // Use a custom test component that provides the mock context
  const TestComponent = () => {
    const mockContextValue = {
      addItem,
      isLoading: false,
      updateSearchTerm,
      updateFilterMode,
      notPurchasedItems,
      purchasedItems,
      sortOption: 'newest',
      setSortOption,
      toggleItem,
      updateItem,
      removeItem, 
      selectedItems: ['1'],
      handleItemSelect,
      deleteSelectedItems,
      setSelectedItems
    };

    return <ShoppingPageContent />;
  };

  it('renders correctly with initial data', () => {
    render(
      <ShoppingItemsProvider>
        <TestComponent />
      </ShoppingItemsProvider>
    );
    
    // Basic tests to ensure the component renders
    expect(screen.getByPlaceholderText('Search shopping items...')).toBeInTheDocument();
  });
  
  it('calls updateSearchTerm when search input changes', () => {
    render(
      <ShoppingItemsProvider>
        <TestComponent />
      </ShoppingItemsProvider>
    );
    
    const searchInput = screen.getByPlaceholderText('Search shopping items...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(updateSearchTerm).toHaveBeenCalledWith('test');
  });
  
  it('renders empty state when there are no items and no search filter', () => {
    const EmptyTestComponent = () => {
      const mockContextValue = {
        ...useShoppingItemsContext(),
        notPurchasedItems: [],
        purchasedItems: [],
      };

      return <ShoppingPageContent />;
    };
    
    render(
      <ShoppingItemsProvider>
        <EmptyTestComponent />
      </ShoppingItemsProvider>
    );
    
    expect(screen.getByText('Your shopping list is empty')).toBeInTheDocument();
  });
});

export default ShoppingPageContent;

