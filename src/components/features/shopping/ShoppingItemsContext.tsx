
import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';
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

export const ShoppingItemsProvider: React.FC<ShoppingItemsProviderProps> = ({
  children,
  defaultFilterMode = 'all',
  defaultSearchTerm = '',
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>(defaultFilterMode);
  const [searchTerm, setSearchTerm] = useState<string>(defaultSearchTerm);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
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
  React.useEffect(() => {
    try {
      setIsLoading(true);
      const storedItems = loadItems();
      if (storedItems.length > 0) {
        // Only update if we have items to prevent unnecessary re-renders
        shoppingItemsData.setItems(storedItems);
      }
      setIsLoading(false);
    } catch (err) {
      console.error("[ERROR] ShoppingItemsContext - Failed to load items:", err);
      setError(err instanceof Error ? err : new Error("Failed to load shopping items"));
      setIsLoading(false);
    }
  }, [shoppingItemsData.setItems]);
  
  // Save items to localStorage whenever they change
  React.useEffect(() => {
    if (!isLoading && shoppingItemsData.items.length > 0) {
      saveItems(shoppingItemsData.items);
    }
  }, [shoppingItemsData.items, isLoading]);
  
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
