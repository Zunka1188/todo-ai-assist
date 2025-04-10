import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo, useEffect } from 'react';
import { useShoppingItems, ShoppingItem, SortOption } from './useShoppingItems';
import { loadItems, saveItems, setupMobilePersistence, enhancedMobileSave, checkAndRestoreBackup } from '@/services/shoppingService';
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
  
  const shoppingItemsData = useShoppingItems(filterMode, searchTerm);
  
  const updateFilterMode = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
  }, []);
  
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  useEffect(() => {
    if (initialized) return;
    
    try {
      setIsLoading(true);
      
      const storedItems = loadItems();
      
      if (storedItems && storedItems.length > 0) {
        shoppingItemsData.setItems(storedItems);
        console.log("[ShoppingItemsContext] Loaded items from localStorage:", storedItems.length);
      } else {
        const backupItems = checkAndRestoreBackup();
        if (backupItems && backupItems.length > 0) {
          shoppingItemsData.setItems(backupItems);
          console.log("[ShoppingItemsContext] Restored items from backup:", backupItems.length);
        } else if (shoppingItemsData.items.length > 0) {
          persistItemsToStorage(shoppingItemsData.items, isMobile);
          console.log("[ShoppingItemsContext] Used in-memory items:", shoppingItemsData.items.length);
        }
      }
      
      setInitialized(true);
      setIsLoading(false);
    } catch (err) {
      console.error("[ERROR] ShoppingItemsContext - Failed to load items:", err);
      setError(err instanceof Error ? err : new Error("Failed to load shopping items"));
      setIsLoading(false);
      setInitialized(true);
    }
  }, [shoppingItemsData.setItems, initialized, shoppingItemsData.items, isMobile]);
  
  useEffect(() => {
    if (!isLoading && initialized && shoppingItemsData.items.length > 0) {
      persistItemsToStorage(shoppingItemsData.items, isMobile);
    }
  }, [shoppingItemsData.items, isLoading, initialized, isMobile]);
  
  useEffect(() => {
    if (isMobile) {
      return setupMobilePersistence();
    }
    return undefined;
  }, [isMobile]);
  
  useEffect(() => {
    if (isMobile && !isLoading && initialized) {
      const intervalId = setInterval(() => {
        if (shoppingItemsData.items.length > 0) {
          persistItemsToStorage(shoppingItemsData.items, true);
          console.log("[ShoppingItemsContext] Periodic mobile data backup completed");
        }
      }, 10000);
      
      return () => clearInterval(intervalId);
    }
    return undefined;
  }, [isMobile, isLoading, initialized, shoppingItemsData.items]);
  
  const enhancedAddItem = useCallback((
    item: Omit<ShoppingItem, 'id' | 'dateAdded'> & {dateAdded?: Date, id?: string, file?: string | null}
  ) => {
    const result = shoppingItemsData.addItem(item);
    
    if (result && isMobile) {
      try {
        const allItems = [...shoppingItemsData.items];
        if (!allItems.find(i => i.id === result.id)) {
          allItems.push(result);
        }
        
        persistItemsToStorage(allItems, true);
        
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
  
  const enhancedToggleItem = useCallback((id: string) => {
    const result = shoppingItemsData.toggleItem(id);
    
    if (result && isMobile) {
      try {
        persistItemsToStorage(shoppingItemsData.items, true);
        
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
  
  const contextValue = useMemo(() => ({
    ...shoppingItemsData,
    addItem: enhancedAddItem,
    toggleItem: enhancedToggleItem,
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
