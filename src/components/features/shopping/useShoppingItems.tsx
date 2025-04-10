import { useState, useEffect, useCallback } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

const ShoppingItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  completed: z.boolean(),
  category: z.string().optional(),
  amount: z.string().optional(),
  dateToPurchase: z.string().optional(),
  price: z.string().optional()
    .refine(val => !val || !isNaN(parseFloat(val)), {
      message: "Price must be a valid number"
    }),
  dateAdded: z.instanceof(Date),
  imageUrl: z.string().nullable().optional(),
  notes: z.string().optional(),
  repeatOption: z.enum(['none', 'weekly', 'monthly']).optional(),
  lastPurchased: z.instanceof(Date).optional(),
});

export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;

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
    repeatOption: 'monthly',
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    amount: '1 bottle'
  }, {
    id: '2',
    name: 'Apples',
    completed: false,
    dateAdded: new Date('2023-04-02'),
    repeatOption: 'weekly',
    imageUrl: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    amount: '1 kg'
  }, {
    id: '3',
    name: 'Bread',
    completed: false,
    dateAdded: new Date('2023-04-02'),
    repeatOption: 'weekly',
    imageUrl: 'https://images.unsplash.com/photo-1534620808146-d33bb39128b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    amount: '1 loaf'
  }, {
    id: '4',
    name: 'Toothpaste',
    completed: false,
    dateAdded: new Date('2023-04-03'),
    imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    repeatOption: 'monthly',
    amount: '1 tube'
  },
  {
    id: '6',
    name: 'Milk',
    completed: false,
    dateAdded: new Date('2023-04-03'),
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    repeatOption: 'weekly',
    amount: '1 gallon'
  },
  {
    id: '7',
    name: 'Bananas',
    completed: false,
    dateAdded: new Date('2023-04-04'),
    imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    repeatOption: 'weekly',
    amount: '1 bunch'
  },
  {
    id: '8',
    name: 'Paper Towels',
    completed: false,
    dateAdded: new Date('2023-04-05'),
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    repeatOption: 'monthly',
    amount: '2 rolls'
  },
  {
    id: '9',
    name: 'Orange Juice',
    completed: false,
    dateAdded: new Date('2023-04-06'),
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    repeatOption: 'weekly',
    amount: '1 carton'
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
    
    if (typeof window !== 'undefined') {
      const storageEvent = new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(value),
        url: window.location.href
      });
      window.dispatchEvent(storageEvent);
    }
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export type SortOption = 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc' | 'priceAsc' | 'priceDesc' | 'newest' | 'oldest';

export const useShoppingItems = (filterMode: 'one-off' | 'weekly' | 'monthly' | 'all', searchTerm: string = '') => {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const loadedItems = loadFromLocalStorage<ShoppingItem[]>('shoppingItems', []);
    
    if (loadedItems.length === 0) {
      return initialItems;
    }
    
    return loadedItems;
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [lastStorageUpdate, setLastStorageUpdate] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shoppingItems' && e.newValue) {
        if (e.newValue !== lastStorageUpdate) {
          try {
            const newItems = parseStoredItems(JSON.parse(e.newValue));
            setItems(newItems);
            setLastStorageUpdate(e.newValue);
            console.log('[DEBUG] Storage event received - updating items from another tab');
          } catch (error) {
            console.error('[ERROR] Failed to parse items from storage event:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [lastStorageUpdate]);
  
  useEffect(() => {
    saveToLocalStorage('shoppingItems', items);
    console.log("[DEBUG] useShoppingItems - Items updated, total count:", items.length);
    
    try {
      sessionStorage.setItem('shoppingItems_backup', JSON.stringify(items));
    } catch (error) {
      console.error("[ERROR] Failed to create session storage backup:", error);
    }
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

  const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input);
  };

  const validateItemData = (data: Partial<ShoppingItem>): { valid: boolean; errors?: string[] } => {
    try {
      const partialSchema = ShoppingItemSchema.partial();
      partialSchema.parse(data);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  };

  const addItem = useCallback((newItem: Omit<ShoppingItem, 'id' | 'dateAdded'> & {dateAdded?: Date, id?: string, file?: string | null}) => {
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
      
      const sanitizedItem = {
        ...newItem,
        name: sanitizeInput(newItem.name),
        notes: newItem.notes ? sanitizeInput(newItem.notes) : '',
        category: newItem.category ? sanitizeInput(newItem.category) : '',
      };
      
      const completed = newItem.completed === undefined ? false : Boolean(newItem.completed);
      
      const isUpdate = newItem.id && items.some(item => item.id === newItem.id);
      
      const imageUrl = newItem.imageUrl || newItem.file || '';
      
      const item: ShoppingItem = {
        id: newItem.id || Date.now().toString(),
        completed: completed,
        dateAdded: newItem.dateAdded || new Date(),
        name: sanitizedItem.name,
        category: sanitizedItem.category || '',
        amount: sanitizedItem.amount || '',
        dateToPurchase: sanitizedItem.dateToPurchase || '',
        price: sanitizedItem.price || '',
        imageUrl: imageUrl,
        notes: sanitizedItem.notes || '',
        repeatOption: sanitizedItem.repeatOption || 'none',
        lastPurchased: undefined
      };
      
      const validation = validateItemData(item);
      if (!validation.valid) {
        console.error("[ERROR] useShoppingItems - Invalid item data:", validation.errors);
        return null;
      }
      
      console.log("[DEBUG] useShoppingItems - Structured item to add/update:", JSON.stringify(item, null, 2));
      
      setItems(prevItems => {
        if (isUpdate) {
          console.log(`[DEBUG] useShoppingItems - Updating existing item with ID: ${item.id}`);
          return prevItems.map(existingItem => 
            existingItem.id === item.id ? item : existingItem
          );
        }
        
        console.log(`[DEBUG] useShoppingItems - Adding new item with ID: ${item.id}`);
        return [...prevItems, item];
      });
      
      console.log("[DEBUG] useShoppingItems - Item successfully added/updated");
      return item;
    } catch (error) {
      console.error("[ERROR] useShoppingItems - Error in addItem:", error);
      return null;
    }
  }, [items]);

  const toggleItem = useCallback((id: string) => {
    const item = items.find(item => item.id === id);
    if (!item) {
      console.error("[ERROR] useShoppingItems - Item not found for toggle:", id);
      return null;
    }
    
    if (!item.completed) {
      console.log("[DEBUG] useShoppingItems - Marking item as completed:", id);
      setItems(prevItems => prevItems.map(i => i.id === id ? {
        ...i,
        completed: true,
        lastPurchased: new Date()
      } : i));
      
      return { completed: true, item };
    } else {
      console.log("[DEBUG] useShoppingItems - Marking item as not completed:", id);
      setItems(prevItems => prevItems.map(i => i.id === id ? {
        ...i,
        completed: false
      } : i));
      
      return { completed: false, item };
    }
  }, [items]);

  const removeItem = useCallback((id: string) => {
    console.log("[DEBUG] useShoppingItems - Removing item:", id);
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) {
      console.error("[ERROR] useShoppingItems - Item not found for removal:", id);
      return null;
    }
    
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    return itemToRemove;
  }, [items]);

  const updateItem = useCallback((id: string, updatedData: Partial<ShoppingItem>) => {
    console.log("[DEBUG] useShoppingItems - Updating item:", id, updatedData);
    const itemExists = items.some(item => item.id === id);
    
    if (!itemExists) {
      console.error("[ERROR] useShoppingItems - Item not found for update:", id);
      return null;
    }
    
    const sanitizedData = { ...updatedData };
    if (updatedData.name) sanitizedData.name = sanitizeInput(updatedData.name);
    if (updatedData.notes) sanitizedData.notes = sanitizeInput(updatedData.notes);
    if (updatedData.category) sanitizedData.category = sanitizeInput(updatedData.category);
    
    const validation = validateItemData(sanitizedData);
    if (!validation.valid) {
      console.error("[ERROR] useShoppingItems - Invalid update data:", validation.errors);
      return null;
    }
    
    setItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, ...sanitizedData } : item
    ));
    
    const updated = items.find(item => item.id === id);
    console.log("[DEBUG] useShoppingItems - Updated item result:", updated);
    return updated ? { ...updated, ...sanitizedData } : null;
  }, [items]);

  const handleItemSelect = useCallback((id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const deleteSelectedItems = useCallback(() => {
    const count = selectedItems.length;
    setItems(prevItems => prevItems.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    return count;
  }, [selectedItems]);

  const filteredItems = getFilteredItems();
  const notPurchasedItems = getSortedItems(filteredItems.filter(item => !item.completed));
  const purchasedItems = getSortedItems(filteredItems.filter(item => item.completed));
  
  return {
    items,
    setItems,
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
