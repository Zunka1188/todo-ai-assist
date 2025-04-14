
import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { SortOption, ShoppingItem, useShoppingItems } from './useShoppingItems';
import { logger } from '@/utils/logger';
import useErrorHandler from '@/hooks/useErrorHandler';

interface ShoppingItemsContextProps {
  notPurchasedItems: ShoppingItem[];
  purchasedItems: ShoppingItem[];
  isLoading: boolean;
  addItem: (newItem: any) => any;
  toggleItem: (id: string) => any;
  updateItem: (id: string, updatedData: Partial<ShoppingItem>) => any;
  removeItem: (id: string) => any;
  updateSearchTerm: (term: string) => void;
  updateFilterMode: (mode: 'all' | 'one-off' | 'weekly' | 'monthly') => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  handleItemSelect: (id: string) => void;
  deleteSelectedItems: () => number;
}

const ShoppingItemsContext = createContext<ShoppingItemsContextProps | undefined>(undefined);

interface ShoppingItemsProviderProps {
  children: ReactNode;
  onError?: (error: Error | string) => void;
}

export const ShoppingItemsProvider: React.FC<ShoppingItemsProviderProps> = ({ 
  children,
  onError
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'one-off' | 'weekly' | 'monthly'>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const { handleError } = useErrorHandler();
  
  const {
    notPurchasedItems,
    purchasedItems,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    sortOption,
    setSortOption,
    selectedItems,
    setSelectedItems,
    handleItemSelect,
    deleteSelectedItems
  } = useShoppingItems(filterMode, searchTerm);
  
  const handleErrorWrapper = useCallback((error: unknown, context?: string) => {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[ShoppingItemsContext] ${context || 'Error'}: ${message}`);
    
    if (onError) {
      onError(error instanceof Error ? error : new Error(message));
    } else {
      handleError(message);
    }
  }, [onError, handleError]);
  
  const safeAddItem = useCallback((newItem: any) => {
    try {
      return addItem(newItem);
    } catch (error) {
      handleErrorWrapper(error, 'Failed to add item');
      return null;
    }
  }, [addItem, handleErrorWrapper]);
  
  const safeToggleItem = useCallback((id: string) => {
    try {
      return toggleItem(id);
    } catch (error) {
      handleErrorWrapper(error, `Failed to toggle item ${id}`);
      return null;
    }
  }, [toggleItem, handleErrorWrapper]);
  
  const safeUpdateItem = useCallback((id: string, updatedData: Partial<ShoppingItem>) => {
    try {
      return updateItem(id, updatedData);
    } catch (error) {
      handleErrorWrapper(error, `Failed to update item ${id}`);
      return null;
    }
  }, [updateItem, handleErrorWrapper]);
  
  const safeRemoveItem = useCallback((id: string) => {
    try {
      return removeItem(id);
    } catch (error) {
      handleErrorWrapper(error, `Failed to remove item ${id}`);
      return null;
    }
  }, [removeItem, handleErrorWrapper]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  const updateFilterMode = useCallback((mode: 'all' | 'one-off' | 'weekly' | 'monthly') => {
    setFilterMode(mode);
  }, []);
  
  const contextValue = {
    notPurchasedItems,
    purchasedItems,
    isLoading,
    addItem: safeAddItem,
    toggleItem: safeToggleItem,
    updateItem: safeUpdateItem,
    removeItem: safeRemoveItem,
    updateSearchTerm,
    updateFilterMode,
    sortOption,
    setSortOption,
    selectedItems,
    setSelectedItems,
    handleItemSelect,
    deleteSelectedItems
  };

  return (
    <ShoppingItemsContext.Provider value={contextValue}>
      {children}
    </ShoppingItemsContext.Provider>
  );
};

export const useShoppingItemsContext = (): ShoppingItemsContextProps => {
  const context = useContext(ShoppingItemsContext);
  
  if (!context) {
    throw new Error('useShoppingItemsContext must be used within a ShoppingItemsProvider');
  }
  
  return context;
};
