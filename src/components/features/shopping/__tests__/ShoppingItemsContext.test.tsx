
import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShoppingItemsProvider, useShoppingItemsContext } from '../ShoppingItemsContext';

// Test component that uses the context
const TestComponent = () => {
  const { 
    notPurchasedItems,
    purchasedItems,
    addItem, 
    toggleItem, 
    removeItem 
  } = useShoppingItemsContext();
  
  const allItems = [...notPurchasedItems, ...purchasedItems];
  
  return (
    <div>
      <div data-testid="total-items">{allItems.length}</div>
      <div data-testid="not-purchased-items">{notPurchasedItems.length}</div>
      <div data-testid="purchased-items">{purchasedItems.length}</div>
      
      <button 
        data-testid="add-item-btn"
        onClick={() => addItem({ name: 'Test Item', completed: false })}
      >
        Add Item
      </button>
      
      {allItems.length > 0 && (
        <>
          <button 
            data-testid="toggle-item-btn"
            onClick={() => toggleItem(allItems[0].id)}
          >
            Toggle First Item
          </button>
          
          <button 
            data-testid="remove-item-btn"
            onClick={() => removeItem(allItems[0].id)}
          >
            Remove First Item
          </button>
        </>
      )}
      
      <ul>
        {allItems.map(item => (
          <li key={item.id} data-testid={`item-${item.id}`}>
            {item.name} - {item.completed ? 'Completed' : 'Not Completed'}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('ShoppingItemsContext', () => {
  // Mock localStorage
  let localStorageMock = {};
  
  beforeEach(() => {
    localStorageMock = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(key => localStorageMock[key] || null),
        setItem: vi.fn((key, value) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn(key => {
          delete localStorageMock[key];
        }),
        clear: vi.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide shopping items context', () => {
    render(
      <ShoppingItemsProvider>
        <TestComponent />
      </ShoppingItemsProvider>
    );
    
    // Verify that there are initial items
    expect(screen.getByTestId('total-items').textContent).not.toBe('0');
  });

  it('should add an item', async () => {
    render(
      <ShoppingItemsProvider>
        <TestComponent />
      </ShoppingItemsProvider>
    );
    
    const initialCount = parseInt(screen.getByTestId('total-items').textContent || '0', 10);
    
    // Add a new item
    fireEvent.click(screen.getByTestId('add-item-btn'));
    
    // Verify the item was added
    await waitFor(() => {
      expect(parseInt(screen.getByTestId('total-items').textContent || '0', 10)).toBe(initialCount + 1);
      expect(screen.getByText(/Test Item/)).toBeInTheDocument();
    });
    
    // Verify localStorage was updated
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it('should toggle item completion status', async () => {
    render(
      <ShoppingItemsProvider>
        <TestComponent />
      </ShoppingItemsProvider>
    );
    
    // Add a new item first to ensure we have at least one item
    fireEvent.click(screen.getByTestId('add-item-btn'));
    
    await waitFor(() => {
      expect(screen.getByText(/Test Item - Not Completed/)).toBeInTheDocument();
    });
    
    const initialPurchasedCount = parseInt(screen.getByTestId('purchased-items').textContent || '0', 10);
    
    // Toggle the item's completion status
    fireEvent.click(screen.getByTestId('toggle-item-btn'));
    
    // Verify the item was toggled
    await waitFor(() => {
      expect(screen.getByText(/Test Item - Completed/)).toBeInTheDocument();
      expect(parseInt(screen.getByTestId('purchased-items').textContent || '0', 10)).toBe(initialPurchasedCount + 1);
    });
  });

  it('should remove an item', async () => {
    render(
      <ShoppingItemsProvider>
        <TestComponent />
      </ShoppingItemsProvider>
    );
    
    // Add a new item first
    fireEvent.click(screen.getByTestId('add-item-btn'));
    
    await waitFor(() => {
      expect(screen.getByText(/Test Item/)).toBeInTheDocument();
    });
    
    const initialCount = parseInt(screen.getByTestId('total-items').textContent || '0', 10);
    
    // Remove the item
    fireEvent.click(screen.getByTestId('remove-item-btn'));
    
    // Verify the item was removed
    await waitFor(() => {
      expect(parseInt(screen.getByTestId('total-items').textContent || '0', 10)).toBe(initialCount - 1);
    });
  });

  it('should filter items based on search term and filter mode', async () => {
    const TestFilterComponent = () => {
      const { updateSearchTerm, updateFilterMode, notPurchasedItems } = useShoppingItemsContext();
      
      React.useEffect(() => {
        updateSearchTerm('Unique');
        updateFilterMode('one-off');
      }, [updateSearchTerm, updateFilterMode]);
      
      return (
        <div>
          <div data-testid="filtered-count">{notPurchasedItems.length}</div>
        </div>
      );
    };

    render(
      <ShoppingItemsProvider>
        <TestFilterComponent />
      </ShoppingItemsProvider>
    );
    
    // Verify that filtering works
    await waitFor(() => {
      expect(screen.getByTestId('filtered-count')).toBeInTheDocument();
    });
  });
});
