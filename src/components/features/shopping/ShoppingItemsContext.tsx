
import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo, useEffect } from 'react';
import { useShoppingItems, ShoppingItem, SortOption } from './useShoppingItems';
import { loadItems, saveItems, setupMobilePersistence, enhancedMobileSave, checkAndRestoreBackup, attemptDataRecovery } from '@/services/shoppingService';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

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
    if (!Array.isArray(items)) {
      logger.error("[ERROR] persistItemsToStorage: items is not an array");
      return false;
    }
    
    if (isMobile) {
      return enhancedMobileSave(items);
    } else {
      return saveItems(items);
    }
  } catch (error) {
    logger.error("[ERROR] Failed to persist items to localStorage:", error);
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
  const { toast } = useToast();
  
  const shoppingItemsData = useShoppingItems(filterMode, searchTerm);
  
  const updateFilterMode = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
  }, []);
  
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  // Initialize data on component mount
  useEffect(() => {
    if (initialized) return;
    
    try {
      setIsLoading(true);
      
      const recovery = attemptDataRecovery();
      
      if (recovery.items && recovery.items.length > 0) {
        shoppingItemsData.setItems(recovery.items);
        logger.log(`[ShoppingItemsContext] Loaded items from ${recovery.source}:`, recovery.items.length);
        
        if (recovery.source !== 'localStorage') {
          // If we recovered from backup, show a toast
          toast({
            title: "Data Recovered",
            description: `Your shopping list has been restored from backup.`,
            duration: 3000,
          });
        }
      } else if (shoppingItemsData.items.length > 0) {
        // If we have in-memory items, persist them
        persistItemsToStorage(shoppingItemsData.items, isMobile);
        logger.log("[ShoppingItemsContext] Used in-memory items:", shoppingItemsData.items.length);
      }
      
      setInitialized(true);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logger.error("[ERROR] ShoppingItemsContext - Failed to load items:", errorMessage);
      setError(err instanceof Error ? err : new Error("Failed to load shopping items"));
      setIsLoading(false);
      setInitialized(true);
      
      // Show error toast
      toast({
        title: "Error Loading Data",
        description: "There was a problem loading your shopping list.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [shoppingItemsData.setItems, initialized, shoppingItemsData.items, isMobile, toast]);
  
  // Persist items whenever they change
  useEffect(() => {
    if (!isLoading && initialized && shoppingItemsData.items.length > 0) {
      persistItemsToStorage(shoppingItemsData.items, isMobile);
    }
  }, [shoppingItemsData.items, isLoading, initialized, isMobile]);
  
  // Setup mobile persistence
  useEffect(() => {
    if (!isMobile) return;
    
    const cleanup = setupMobilePersistence();
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [isMobile]);
  
  // Periodic backup for mobile devices
  useEffect(() => {
    if (!isMobile || isLoading || !initialized) return;
    
    const intervalId = setInterval(() => {
      if (shoppingItemsData.items.length > 0) {
        persistItemsToStorage(shoppingItemsData.items, true);
        logger.log("[ShoppingItemsContext] Periodic mobile data backup completed");
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [isMobile, isLoading, initialized, shoppingItemsData.items]);
  
  // Enhanced item operations with better error handling
  const enhancedAddItem = useCallback((
    item: Omit<ShoppingItem, 'id' | 'dateAdded'> & {dateAdded?: Date, id?: string, file?: string | null}
  ) => {
    try {
      const result = shoppingItemsData.addItem(item);
      
      if (result && isMobile) {
        try {
          const allItems = [...shoppingItemsData.items];
          if (!allItems.find(i => i.id === result.id)) {
            allItems.push(result);
          }
          
          persistItemsToStorage(allItems, true);
          
          // Schedule an extra save to ensure persistence
          setTimeout(() => {
            try {
              persistItemsToStorage(allItems, true);
            } catch (err) {
              logger.error("[ERROR] Mobile add item backup save failed:", err);
            }
          }, 300);
        } catch (error) {
          logger.error("[ERROR] Enhanced add item mobile save failed:", error);
        }
      }
      
      return result;
    } catch (error) {
      logger.error("[ERROR] Failed to add item:", error);
      toast({
        title: "Error Adding Item",
        description: "There was a problem adding your item. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return null;
    }
  }, [shoppingItemsData, shoppingItemsData.addItem, shoppingItemsData.items, isMobile, toast]);
  
  const enhancedToggleItem = useCallback((id: string) => {
    try {
      const result = shoppingItemsData.toggleItem(id);
      
      if (result && isMobile) {
        try {
          persistItemsToStorage(shoppingItemsData.items, true);
          
          setTimeout(() => {
            try {
              persistItemsToStorage(shoppingItemsData.items, true);
            } catch (err) {
              logger.error("[ERROR] Mobile toggle item backup save failed:", err);
            }
          }, 300);
        } catch (error) {
          logger.error("[ERROR] Enhanced toggle item mobile save failed:", error);
        }
      }
      
      return result;
    } catch (error) {
      logger.error("[ERROR] Failed to toggle item status:", error);
      return null;
    }
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
