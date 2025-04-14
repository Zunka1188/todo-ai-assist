
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useShoppingItems } from '../useShoppingItems';

describe('useShoppingItems', () => {
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

    // Mock storage event
    window.dispatchEvent = vi.fn();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default items when localStorage is empty', () => {
    const { result } = renderHook(() => useShoppingItems('all'));
    
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(localStorage.getItem).toHaveBeenCalledWith('shoppingItems');
  });

  it('should add a new item correctly', () => {
    const { result } = renderHook(() => useShoppingItems('all'));
    
    const initialCount = result.current.items.length;
    
    act(() => {
      result.current.addItem({
        name: 'Test Item',
        completed: false,
      });
    });
    
    expect(result.current.items.length).toBe(initialCount + 1);
    expect(result.current.items.some(item => item.name === 'Test Item')).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should toggle item completion status', () => {
    const { result } = renderHook(() => useShoppingItems('all'));
    
    // First add an item
    let itemId: string;
    act(() => {
      const newItem = result.current.addItem({
        name: 'Toggle Test Item',
        completed: false,
      });
      itemId = newItem ? newItem.id : '';
    });
    
    // Toggle the item
    act(() => {
      result.current.toggleItem(itemId);
    });
    
    // Verify the item is marked as completed
    expect(result.current.items.find(item => item.id === itemId)?.completed).toBe(true);
    
    // Toggle it back
    act(() => {
      result.current.toggleItem(itemId);
    });
    
    // Verify the item is not completed
    expect(result.current.items.find(item => item.id === itemId)?.completed).toBe(false);
  });

  it('should remove an item', () => {
    const { result } = renderHook(() => useShoppingItems('all'));
    
    // First add an item
    let itemId: string;
    act(() => {
      const newItem = result.current.addItem({
        name: 'Item To Remove',
        completed: false,
      });
      itemId = newItem ? newItem.id : '';
    });
    
    const initialCount = result.current.items.length;
    
    // Remove the item
    act(() => {
      result.current.removeItem(itemId);
    });
    
    expect(result.current.items.length).toBe(initialCount - 1);
    expect(result.current.items.some(item => item.id === itemId)).toBe(false);
  });

  it('should filter items correctly based on filter mode', () => {
    const { result: allResult } = renderHook(() => useShoppingItems('all'));
    const { result: weeklyResult } = renderHook(() => useShoppingItems('weekly'));
    const { result: monthlyResult } = renderHook(() => useShoppingItems('monthly'));
    const { result: oneOffResult } = renderHook(() => useShoppingItems('one-off'));
    
    // All should have all items
    expect(allResult.current.notPurchasedItems.length + allResult.current.purchasedItems.length)
      .toBe(allResult.current.items.length);
    
    // Weekly should only have weekly items
    expect(weeklyResult.current.notPurchasedItems.every(item => item.repeatOption === 'weekly')).toBe(true);
    
    // Monthly should only have monthly items
    expect(monthlyResult.current.notPurchasedItems.every(item => item.repeatOption === 'monthly')).toBe(true);
    
    // One-off should only have one-off items
    expect(oneOffResult.current.notPurchasedItems.every(item => 
      !item.repeatOption || item.repeatOption === 'none'
    )).toBe(true);
  });

  it('should filter items based on search term', () => {
    const searchTerm = 'Unique Search Term';
    const { result } = renderHook(() => useShoppingItems('all', searchTerm));
    
    // Add an item that matches the search term
    act(() => {
      result.current.addItem({
        name: `Item With ${searchTerm}`,
        completed: false,
      });
    });
    
    // Add an item that doesn't match the search term
    act(() => {
      result.current.addItem({
        name: 'Regular Item',
        completed: false,
      });
    });
    
    // Check that filtering works
    expect(result.current.notPurchasedItems.length).toBe(1);
    expect(result.current.notPurchasedItems[0].name).toBe(`Item With ${searchTerm}`);
  });
  
  it('should update an existing item correctly', () => {
    const { result } = renderHook(() => useShoppingItems('all'));
    
    // First add an item
    let itemId: string;
    act(() => {
      const newItem = result.current.addItem({
        name: 'Item To Update',
        completed: false,
      });
      itemId = newItem ? newItem.id : '';
    });
    
    // Update the item
    act(() => {
      result.current.updateItem(itemId, {
        name: 'Updated Item Name',
        notes: 'New notes',
      });
    });
    
    // Check that the item was updated
    const updatedItem = result.current.items.find(item => item.id === itemId);
    expect(updatedItem?.name).toBe('Updated Item Name');
    expect(updatedItem?.notes).toBe('New notes');
  });
});
