
import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo, useEffect } from 'react';
import { useShoppingItems, ShoppingItem, SortOption } from './useShoppingItems';
import { loadItems, saveItems, setupMobilePersistence } from '@/services/shoppingService';
import { useIsMobile } from '@/hooks/use-mobile';

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

// Create a new function to handle localStorage persistence with error handling and mobile optimizations
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
  const { isMobile } = useIsMobile();
  
  // Create a single instance of useShoppingItems
  const shoppingItemsData = useShoppingItems(filterMode, searchTerm);
  
  // Expose methods to update filterMode and searchTerm
  const updateFilterMode = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
  }, []);
  
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  // Load items from localStorage on initial render with mobile optimization
  useEffect(() => {
    if (initialized) return;
    
    try {
      setIsLoading(true);
      const storedItems = loadItems();
      
      if (storedItems && storedItems.length > 0) {
        // Only update if we have items to prevent unnecessary re-renders
        shoppingItemsData.setItems(storedItems);
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
  
  // Save items to localStorage whenever they change with extra mobile safeguards
  useEffect(() => {
    if (!isLoading && initialized && shoppingItemsData.items.length > 0) {
      persistItemsToStorage(shoppingItemsData.items);
      
      // For mobile devices, do extra verification that items were actually saved
      if (isMobile) {
        // Verify the save was successful by reading back
        setTimeout(() => {
          try {
            const verifiedItems = loadItems();
            if (verifiedItems.length !== shoppingItemsData.items.length) {
              persistItemsToStorage(shoppingItemsData.items);
            }
          } catch (err) {
            console.error("[ERROR] ShoppingItemsContext - Mobile verification failed:", err);
          }
        }, 200);
      }
    }
  }, [shoppingItemsData.items, isLoading, initialized, isMobile]);

  // Setup mobile-specific persistence for page unload events
  useEffect(() => {
    if (isMobile) {
      return setupMobilePersistence();
    }
    return undefined;
  }, [isMobile]);

  // Handle storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'shoppingItems' && event.newValue) {
        try {
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

  // Improve the addItem method for better mobile reliability
  const enhancedAddItem = useCallback((
    item: Omit<ShoppingItem, 'id' | 'dateAdded'> & {dateAdded?: Date, id?: string, file?: string | null}
  ) => {
    const result = shoppingItemsData.addItem(item);
    
    // Extra save for mobile reliability
    if (result && isMobile) {
      try {
        const allItems = [...shoppingItemsData.items];
        if (!allItems.find(i => i.id === result.id)) {
          allItems.push(result);
        }
        
        // Immediate save
        persistItemsToStorage(allItems);
        
        // Extra save with timeout for reliability
        setTimeout(() => {
          try {
            persistItemsToStorage(allItems);
          } catch (err) {
            console.error("[ERROR] Mobile add item backup save failed:", err);
          }
        }, 300);
      } catch (error) {
        console.error("[ERROR] Enhanced add item mobile save failed:", error);
      }
    }
    
    return result;
  }, [shoppingItemsData, shoppingItemsData.addItem, shoppingItemsData.items, isMobile]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...shoppingItemsData,
    addItem: enhancedAddItem, // Use enhanced version for mobile reliability
    filterMode,
    searchTerm,
    updateFilterMode,
    updateSearchTerm,
    isLoading,
    error,
    setItems: shoppingItemsData.setItems
  }), [
    shoppingItemsData, 
    enhancedAddItem,
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
