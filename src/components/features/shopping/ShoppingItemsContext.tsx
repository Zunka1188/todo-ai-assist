
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useShoppingItems, ShoppingItem, SortOption } from './useShoppingItems';

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
  
  // Enhanced context value with the additional methods
  const contextValue: ShoppingItemsContextValue = {
    ...shoppingItemsData,
    filterMode,
    searchTerm,
    updateFilterMode,
    updateSearchTerm
  };
  
  return (
    <ShoppingItemsContext.Provider value={contextValue}>
      {children}
    </ShoppingItemsContext.Provider>
  );
};
