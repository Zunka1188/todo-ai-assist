
import { useCallback } from 'react';
import { useShoppingItemsContext } from '../ShoppingItemsContext';

interface ShoppingItemOperationsProps {
  readOnly?: boolean;
  onEditItem?: (id: string, name?: string, item?: any) => void;
}

interface SaveItemFromCaptureParams {
  id: string;
  capturedText: string;
}

export const useShoppingItemOperations = ({ readOnly, onEditItem }: ShoppingItemOperationsProps) => {
  const { toggleItem, updateItem, removeItem } = useShoppingItemsContext();
  
  const handleToggleItemCompletion = useCallback((itemId: string) => {
    if (readOnly) return;
    toggleItem(itemId);
  }, [readOnly, toggleItem]);
  
  const handleDeleteItem = useCallback((itemId: string) => {
    if (readOnly) return;
    removeItem(itemId);
  }, [readOnly, removeItem]);
  
  const handleSaveItem = useCallback((updatedItem: any) => {
    if (readOnly) return true;
    
    try {
      // Handle external edit callback if provided
      if (onEditItem && updatedItem.id) {
        onEditItem(updatedItem.id, updatedItem.name, updatedItem);
      }
      
      // Update in context
      if (updatedItem.id) {
        updateItem(updatedItem.id, updatedItem);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving item:", error);
      return false;
    }
  }, [readOnly, updateItem, onEditItem]);
  
  // This function now accepts a single object parameter with id and capturedText properties
  const handleSaveItemFromCapture = useCallback((params: SaveItemFromCaptureParams) => {
    if (readOnly) return false;
    
    try {
      // Extract the necessary fields from the params
      const { id, capturedText } = params;
      
      if (id && capturedText) {
        updateItem(id, { notes: capturedText });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving captured text:", error);
      return false;
    }
  }, [readOnly, updateItem]);
  
  return {
    handleToggleItemCompletion,
    handleDeleteItem,
    handleSaveItem,
    handleSaveItemFromCapture
  };
};
