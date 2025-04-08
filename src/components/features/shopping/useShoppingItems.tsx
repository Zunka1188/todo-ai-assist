
import { useState, useEffect } from 'react';

export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  category?: string;
  amount?: string;
  dateToPurchase?: string;
  price?: string;
  dateAdded: Date;
  imageUrl?: string;
  notes?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  lastPurchased?: Date;
}

const initialItems: ShoppingItem[] = [
  {
    id: '5',
    name: 'Organic Coffee Beans',
    completed: false,
    dateAdded: new Date(),
    amount: '2 bags',
    price: '14.99',
    dateToPurchase: '2025-05-10',
    imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    notes: 'Dark roast from the local fair trade shop. Get the whole beans, not pre-ground.',
    repeatOption: 'monthly'
  }, {
    id: '1',
    name: 'Dish Soap',
    completed: false,
    dateAdded: new Date('2023-04-01'),
    repeatOption: 'monthly'
  }, {
    id: '2',
    name: 'Apples',
    completed: false,
    dateAdded: new Date('2023-04-02'),
    repeatOption: 'weekly'
  }, {
    id: '3',
    name: 'Bread',
    completed: false,
    dateAdded: new Date('2023-04-02'),
    repeatOption: 'weekly'
  }, {
    id: '4',
    name: 'Toothpaste',
    completed: false,
    dateAdded: new Date('2023-04-03'),
    imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    repeatOption: 'monthly'
  }
];

const parseStoredItems = (items: any[]): ShoppingItem[] => {
  return items.map(item => ({
    ...item,
    dateAdded: new Date(item.dateAdded),
    lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
  }));
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return defaultValue;
    const parsedValue = JSON.parse(storedValue);
    if (key === 'shoppingItems' && Array.isArray(parsedValue)) {
      return parseStoredItems(parsedValue) as unknown as T;
    }
    return parsedValue;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`[DEBUG] useShoppingItems - Saved ${key} to localStorage`, value.length ? `(${value.length} items)` : '');
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export type SortOption = 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc' | 'priceAsc' | 'priceDesc' | 'newest' | 'oldest';

export const useShoppingItems = (filterMode: 'one-off' | 'weekly' | 'monthly' | 'all', searchTerm: string = '') => {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    return loadFromLocalStorage<ShoppingItem[]>('shoppingItems', initialItems);
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  // Save to localStorage whenever items change
  useEffect(() => {
    saveToLocalStorage('shoppingItems', items);
    console.log("[DEBUG] useShoppingItems - Items updated, total count:", items.length);
  }, [items]);

  const getFilteredItems = () => {
    let filtered = items;
    
    switch (filterMode) {
      case 'weekly':
        filtered = items.filter(item => item.repeatOption === 'weekly');
        break;
      case 'monthly':
        filtered = items.filter(item => item.repeatOption === 'monthly');
        break;
      case 'one-off':
        filtered = items.filter(item => !item.repeatOption || item.repeatOption === 'none');
        break;
      case 'all':
      default:
        break;
    }
    
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(lowerSearchTerm) || 
        (item.notes && item.notes.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    return filtered;
  };

  const getSortedItems = (filteredItems: ShoppingItem[]) => {
    return filteredItems.sort((a, b) => {
      switch (sortOption) {
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'dateAsc':
        case 'dateDesc':
          return a.name.localeCompare(b.name);
        case 'priceAsc':
          if (!a.price && !b.price) return 0;
          if (!a.price) return 1;
          if (!b.price) return -1;
          return parseFloat(a.price) - parseFloat(b.price);
        case 'priceDesc':
          if (!a.price && !b.price) return 0;
          if (!a.price) return 1;
          if (!b.price) return -1;
          return parseFloat(b.price) - parseFloat(a.price);
        case 'newest':
          return b.dateAdded.getTime() - a.dateAdded.getTime();
        case 'oldest':
          return a.dateAdded.getTime() - b.dateAdded.getTime();
        default:
          return 0;
      }
    });
  };

  const addItem = (newItem: Omit<ShoppingItem, 'id' | 'dateAdded'> & {dateAdded?: Date, id?: string, file?: string | null}) => {
    try {
      console.log("[DEBUG] useShoppingItems - Adding new item:", JSON.stringify(newItem, null, 2));
      
      if (!newItem || typeof newItem !== 'object') {
        console.error("[ERROR] useShoppingItems - Invalid item data:", newItem);
        return null;
      }
      
      if (!newItem.name) {
        console.error("[ERROR] useShoppingItems - Item name is required");
        return null;
      }
      
      // Ensure completed is explicitly set to false if not provided
      const completed = newItem.completed === undefined ? false : Boolean(newItem.completed);
      
      // Check if this is an update (item with existing ID)
      const isUpdate = newItem.id && items.some(item => item.id === newItem.id);
      
      // Handle both imageUrl and file fields for backward compatibility
      const imageUrl = newItem.imageUrl || newItem.file || '';
      
      const item: ShoppingItem = {
        id: newItem.id || Date.now().toString(),
        completed: completed,
        dateAdded: newItem.dateAdded || new Date(),
        name: newItem.name,
        category: newItem.category || '',
        amount: newItem.amount || '',
        dateToPurchase: newItem.dateToPurchase || '',
        price: newItem.price || '',
        imageUrl: imageUrl,
        notes: newItem.notes || '',
        repeatOption: newItem.repeatOption || 'none',
        lastPurchased: undefined
      };
      
      console.log("[DEBUG] useShoppingItems - Structured item to add/update:", JSON.stringify(item, null, 2));
      
      // Use functional update to ensure we have the latest state
      setItems(prevItems => {
        // If this is an update, replace the existing item
        if (isUpdate) {
          console.log(`[DEBUG] useShoppingItems - Updating existing item with ID: ${item.id}`);
          const updatedItems = prevItems.map(existingItem => 
            existingItem.id === item.id ? item : existingItem
          );
          
          // Immediately save to localStorage to ensure persistence
          saveToLocalStorage('shoppingItems', updatedItems);
          return updatedItems;
        }
        
        // Otherwise, add as a new item
        console.log(`[DEBUG] useShoppingItems - Adding new item with ID: ${item.id}`);
        const newItems = [...prevItems, item];
        
        // Immediately save to localStorage to ensure persistence
        saveToLocalStorage('shoppingItems', newItems);
        return newItems;
      });
      
      console.log("[DEBUG] useShoppingItems - Item successfully added/updated");
      return item;
    } catch (error) {
      console.error("[ERROR] useShoppingItems - Error in addItem:", error);
      return null;
    }
  };

  const toggleItem = (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) {
      console.error("[ERROR] useShoppingItems - Item not found for toggle:", id);
      return null;
    }
    
    if (!item.completed) {
      console.log("[DEBUG] useShoppingItems - Marking item as completed:", id);
      const updatedItems = items.map(i => i.id === id ? {
        ...i,
        completed: true,
        lastPurchased: new Date()
      } : i);
      setItems(updatedItems);
      
      // Immediately save to localStorage to ensure persistence
      saveToLocalStorage('shoppingItems', updatedItems);
      return { completed: true, item };
    } else {
      console.log("[DEBUG] useShoppingItems - Marking item as not completed:", id);
      const updatedItems = items.map(i => i.id === id ? {
        ...i,
        completed: false
      } : i);
      setItems(updatedItems);
      
      // Immediately save to localStorage to ensure persistence
      saveToLocalStorage('shoppingItems', updatedItems);
      return { completed: false, item };
    }
  };

  const removeItem = (id: string) => {
    console.log("[DEBUG] useShoppingItems - Removing item:", id);
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) {
      console.error("[ERROR] useShoppingItems - Item not found for removal:", id);
      return null;
    }
    
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    
    // Immediately save to localStorage to ensure persistence
    saveToLocalStorage('shoppingItems', updatedItems);
    return itemToRemove;
  };

  const updateItem = (id: string, updatedData: Partial<ShoppingItem>) => {
    console.log("[DEBUG] useShoppingItems - Updating item:", id, updatedData);
    const itemExists = items.some(item => item.id === id);
    
    if (!itemExists) {
      console.error("[ERROR] useShoppingItems - Item not found for update:", id);
      return null;
    }
    
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updatedData } : item
    );
    setItems(updatedItems);
    
    // Immediately save to localStorage to ensure persistence
    saveToLocalStorage('shoppingItems', updatedItems);
    
    const updated = updatedItems.find(item => item.id === id);
    console.log("[DEBUG] useShoppingItems - Updated item result:", updated);
    return updated;
  };

  const handleItemSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const deleteSelectedItems = () => {
    const count = selectedItems.length;
    const updatedItems = items.filter(item => !selectedItems.includes(item.id));
    setItems(updatedItems);
    
    // Immediately save to localStorage to ensure persistence
    saveToLocalStorage('shoppingItems', updatedItems);
    
    setSelectedItems([]);
    return count;
  };

  const filteredItems = getFilteredItems();
  const notPurchasedItems = getSortedItems(filteredItems.filter(item => !item.completed));
  const purchasedItems = getSortedItems(filteredItems.filter(item => item.completed));
  
  return {
    items: filteredItems,
    selectedItems,
    sortOption,
    notPurchasedItems,
    purchasedItems,
    setSortOption,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    handleItemSelect,
    deleteSelectedItems,
    setSelectedItems,
  };
};
