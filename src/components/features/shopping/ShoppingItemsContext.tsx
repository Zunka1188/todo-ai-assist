
import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo, useEffect } from 'react';
import { useShoppingItems, ShoppingItem, SortOption } from './useShoppingItems';
import { loadItems, saveItems, setupMobilePersistence, enhancedMobileSave } from '@/services/shoppingService';
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
const persistItemsToStorage = (items: ShoppingItem[], isMobile = false) => {
  try {
    if (isMobile) {
      return enhancedMobileSave(items);
    } else {
      return saveItems(items);
    }
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
      persistItemsToStorage(shoppingItemsData.items, isMobile);
    }
  }, [shoppingItemsData.items, isLoading, initialized, isMobile]);

  // Setup mobile-specific persistence for page unload events
  useEffect(() => {
    if (isMobile) {
      return setupMobilePersistence();
    }
    return undefined;
  }, [isMobile]);

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
        persistItemsToStorage(allItems, true);
        
        // Extra save with timeout for reliability
        setTimeout(() => {
          try {
            persistItemsToStorage(allItems, true);
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
  
  // Enhanced toggle item for better mobile reliability
  const enhancedToggleItem = useCallback((id: string) => {
    const result = shoppingItemsData.toggleItem(id);
    
    // Extra save for mobile reliability
    if (result && isMobile) {
      try {
        // Immediate save
        persistItemsToStorage(shoppingItemsData.items, true);
        
        // Extra save with timeout for reliability
        setTimeout(() => {
          try {
            persistItemsToStorage(shoppingItemsData.items, true);
          } catch (err) {
            console.error("[ERROR] Mobile toggle item backup save failed:", err);
          }
        }, 300);
      } catch (error) {
        console.error("[ERROR] Enhanced toggle item mobile save failed:", error);
      }
    }
    
    return result;
  }, [shoppingItemsData, shoppingItemsData.toggleItem, shoppingItemsData.items, isMobile]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...shoppingItemsData,
    addItem: enhancedAddItem, // Use enhanced version for mobile reliability
    toggleItem: enhancedToggleItem, // Use enhanced version for mobile reliability
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
    enhancedToggleItem,
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
