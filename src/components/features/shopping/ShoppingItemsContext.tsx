
import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo, useEffect } from 'react';
import { useShoppingItems, ShoppingItem, SortOption } from './useShoppingItems';
import { loadItems, saveItems } from '@/services/shoppingService';

type FilterMode = 'one-off' | 'weekly' | 'monthly' | 'all';

interface ShoppingItemsContextValue {
  items: ShoppingItem[];
  selectedItems: string[];
  sortOption: SortOption;
  notPurchasedItems: ShoppingItem[];
  purchasedItems: ShoppingItem[];
  setSortOption: (option: SortOption) => void;
  addItem: (item: Omit<ShoppingItem, 'id' | 'dateAdded'> & {dateAdded?: Date, id?: string, file?: string | null}) => ShoppingItem | null;
  toggleItem: (id: string) => { completed: boolean, item: ShoppingItem } | null;
  removeItem: (id: string) => ShoppingItem | null;
  updateItem: (id: string, updatedData: Partial<ShoppingItem>) => ShoppingItem | null;
  handleItemSelect: (id: string) => void;
  deleteSelectedItems: () => number;
  setSelectedItems: (items: string[]) => void;
  filterMode: FilterMode;
  searchTerm: string;
  updateFilterMode: (mode: FilterMode) => void;
  updateSearchTerm: (term: string) => void;
  isLoading: boolean;
  error: Error | null;
  setItems: (items: ShoppingItem[]) => void;
}

const ShoppingItemsContext = createContext<ShoppingItemsContextValue | undefined>(undefined);

export const useShoppingItemsContext = () => {
  const context = useContext(ShoppingItemsContext);
  if (!context) {
    throw new Error('useShoppingItemsContext must be used within a ShoppingItemsProvider');
  }
  return context;
};

interface ShoppingItemsProviderProps {
  children: ReactNode;
  defaultFilterMode?: FilterMode;
  defaultSearchTerm?: string;
}

// Create a new function to handle localStorage persistence with error handling
const persistItemsToStorage = (items: ShoppingItem[]) => {
  try {
    saveItems(items);
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to persist items to localStorage:", error);
    return false;
  }
};

export const ShoppingItemsProvider: React.FC<ShoppingItemsProviderProps> = ({
  children,
  defaultFilterMode = 'all',
  defaultSearchTerm = '',
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>(defaultFilterMode);
  const [searchTerm, setSearchTerm] = useState<string>(defaultSearchTerm);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Create a single instance of useShoppingItems
  const shoppingItemsData = useShoppingItems(filterMode, searchTerm);
  
  // Expose methods to update filterMode and searchTerm
  const updateFilterMode = useCallback((mode: FilterMode) => {
    console.log("[DEBUG] ShoppingItemsContext - Updating filter mode:", mode);
    setFilterMode(mode);
  }, []);
  
  const updateSearchTerm = useCallback((term: string) => {
    console.log("[DEBUG] ShoppingItemsContext - Updating search term:", term);
    setSearchTerm(term);
  }, []);
  
  // Load items from localStorage on initial render
  useEffect(() => {
    if (initialized) return;
    
    try {
      setIsLoading(true);
      const storedItems = loadItems();
      
      if (storedItems && storedItems.length > 0) {
        // Only update if we have items to prevent unnecessary re-renders
        console.log("[DEBUG] ShoppingItemsContext - Loaded items from localStorage:", storedItems.length);
        shoppingItemsData.setItems(storedItems);
      } else {
        console.log("[DEBUG] ShoppingItemsContext - No stored items found, using defaults");
      }
      
      setInitialized(true);
      setIsLoading(false);
    } catch (err) {
      console.error("[ERROR] ShoppingItemsContext - Failed to load items:", err);
      setError(err instanceof Error ? err : new Error("Failed to load shopping items"));
      setIsLoading(false);
      setInitialized(true);
    }
  }, [shoppingItemsData.setItems, initialized]);
  
  // Save items to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && initialized && shoppingItemsData.items.length > 0) {
      console.log("[DEBUG] ShoppingItemsContext - Saving items to localStorage:", shoppingItemsData.items.length);
      persistItemsToStorage(shoppingItemsData.items);
    }
  }, [shoppingItemsData.items, isLoading, initialized]);

  // Handle storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'shoppingItems' && event.newValue) {
        try {
          console.log("[DEBUG] ShoppingItemsContext - Storage event detected in another tab");
          const parsedItems = JSON.parse(event.newValue);
          
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            // Convert date strings back to Date objects
            const items = parsedItems.map((item: any) => ({
              ...item,
              dateAdded: new Date(item.dateAdded),
              lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
            }));
            
            shoppingItemsData.setItems(items);
          }
        } catch (err) {
          console.error("[ERROR] ShoppingItemsContext - Failed to process storage event:", err);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [shoppingItemsData.setItems]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...shoppingItemsData,
    filterMode,
    searchTerm,
    updateFilterMode,
    updateSearchTerm,
    isLoading,
    error,
    setItems: shoppingItemsData.setItems
  }), [
    shoppingItemsData, 
    filterMode, 
    searchTerm, 
    updateFilterMode, 
    updateSearchTerm,
    isLoading,
    error
  ]);
  
  return (
    <ShoppingItemsContext.Provider value={contextValue}>
      {children}
    </ShoppingItemsContext.Provider>
  );
};
