
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useShoppingItems, SortOption } from './useShoppingItems';
import { logger } from '@/utils/logger';

// Define the context type
interface ShoppingItemsContextType {
  notPurchasedItems: any[];
  purchasedItems: any[];
  isLoading: boolean;
  addItem: (item: any) => any;
  toggleItem: (id: string) => any;
  removeItem: (id: string) => any;
  updateItem: (id: string, updatedData: any) => any;
  updateSearchTerm: (term: string) => void;
  updateFilterMode: (mode: 'all' | 'one-off' | 'weekly' | 'monthly') => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  selectedItems: string[];
  handleItemSelect: (id: string) => void;
  deleteSelectedItems: () => number;
}

const ShoppingItemsContext = createContext<ShoppingItemsContextType | undefined>(undefined);

interface ShoppingItemsProviderProps {
  children: React.ReactNode;
  onError?: (error: Error | string) => void;
}

export const ShoppingItemsProvider: React.FC<ShoppingItemsProviderProps> = ({ 
  children,
  onError 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'one-off' | 'weekly' | 'monthly'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Use the custom hook for shopping items management
  const {
    notPurchasedItems,
    purchasedItems,
    sortOption,
    setSortOption,
    addItem,
    toggleItem,
    removeItem,
    updateItem,
    selectedItems,
    handleItemSelect,
    deleteSelectedItems,
  } = useShoppingItems(filterMode, searchTerm);

  // Handle search term updates
  const updateSearchTerm = useCallback((term: string) => {
    try {
      setSearchTerm(term);
    } catch (error) {
      logger.error('[ShoppingItemsContext] Error updating search term:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Handle filter mode updates
  const updateFilterMode = useCallback((mode: 'all' | 'one-off' | 'weekly' | 'monthly') => {
    try {
      setFilterMode(mode);
    } catch (error) {
      logger.error('[ShoppingItemsContext] Error updating filter mode:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Set loading state
  useEffect(() => {
    // Simulate loading completion after initial render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Wrap API methods to handle errors
  const safeAddItem = useCallback((item: any) => {
    try {
      return addItem(item);
    } catch (error) {
      logger.error('[ShoppingItemsContext] Error adding item:', error);
      onError?.(error as Error);
      return null;
    }
  }, [addItem, onError]);

  const safeToggleItem = useCallback((id: string) => {
    try {
      return toggleItem(id);
    } catch (error) {
      logger.error('[ShoppingItemsContext] Error toggling item:', error);
      onError?.(error as Error);
      return null;
    }
  }, [toggleItem, onError]);

  const safeRemoveItem = useCallback((id: string) => {
    try {
      return removeItem(id);
    } catch (error) {
      logger.error('[ShoppingItemsContext] Error removing item:', error);
      onError?.(error as Error);
      return null;
    }
  }, [removeItem, onError]);

  const safeUpdateItem = useCallback((id: string, updatedData: any) => {
    try {
      return updateItem(id, updatedData);
    } catch (error) {
      logger.error('[ShoppingItemsContext] Error updating item:', error);
      onError?.(error as Error);
      return null;
    }
  }, [updateItem, onError]);

  const value = {
    notPurchasedItems,
    purchasedItems,
    isLoading,
    addItem: safeAddItem,
    toggleItem: safeToggleItem,
    removeItem: safeRemoveItem,
    updateItem: safeUpdateItem,
    updateSearchTerm,
    updateFilterMode,
    sortOption,
    setSortOption,
    selectedItems,
    handleItemSelect,
    deleteSelectedItems,
  };

  return (
    <ShoppingItemsContext.Provider value={value}>
      {children}
    </ShoppingItemsContext.Provider>
  );
};

// Custom hook to use the shopping items context
export const useShoppingItemsContext = () => {
  const context = useContext(ShoppingItemsContext);
  if (context === undefined) {
    throw new Error('useShoppingItemsContext must be used within a ShoppingItemsProvider');
  }
  return context;
};
