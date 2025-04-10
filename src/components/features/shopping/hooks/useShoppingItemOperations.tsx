
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useShoppingItemsContext } from '../ShoppingItemsContext';

interface UseShoppingItemOperationsProps {
  readOnly?: boolean;
  onEditItem?: (id: string, name?: string, item?: any) => void;
}

export const useShoppingItemOperations = ({
  readOnly = false,
  onEditItem
}: UseShoppingItemOperationsProps) => {
  const { removeItem, toggleItem, addItem } = useShoppingItemsContext();
  const { toast } = useToast();

  const handleToggleItemCompletion = useCallback((itemId: string) => {
    if (readOnly) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to mark items as completed.",
        variant: "destructive"
      });
      return;
    }
    
    const result = toggleItem(itemId);
    
    if (!result) {
      console.error("Failed to toggle item completion");
      toast({
        title: "Error",
        description: "Failed to update item status",
        variant: "destructive"
      });
    }
  }, [readOnly, toast, toggleItem]);

  const handleDeleteItem = useCallback((itemId: string) => {
    if (readOnly) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to delete items in this shared list.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const result = removeItem(itemId);
      if (result) {
        toast({
          title: "Item Deleted",
          description: `Item has been removed from your list.`
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to delete item",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item due to an error",
        variant: "destructive"
      });
      return false;
    }
  }, [readOnly, removeItem, toast]);

  const handleSaveItem = useCallback((updatedItem: any) => {
    try {
      if (onEditItem) {
        onEditItem(updatedItem.id, updatedItem.name, updatedItem);
      }
      return true;
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: "Error",
        description: "Failed to save item changes",
        variant: "destructive"
      });
      return false;
    }
  }, [onEditItem, toast]);

  const handleSaveItemFromCapture = useCallback((itemData: any) => {
    try {
      if (readOnly) {
        toast({
          title: "Read-only Mode",
          description: "You don't have permission to add items in this shared list.",
          variant: "destructive",
          role: "alert",
          "aria-live": "assertive"
        });
        return false;
      }
      
      if (!itemData.name) {
        console.warn("Name is missing, setting default name");
        itemData.name = "Unnamed Item";
      }
      
      if (itemData.brand && !itemData.name.includes(itemData.brand)) {
        itemData.name = `${itemData.brand} ${itemData.name}`;
      }
      
      const newItem = {
        name: itemData.name,
        amount: itemData.amount || '1', 
        price: itemData.price || '',
        imageUrl: itemData.imageUrl || null,
        notes: itemData.notes || '',
        repeatOption: itemData.repeatOption || 'none',
        category: itemData.category || '',
        dateToPurchase: '',
        completed: false
      };
      
      const result = addItem(newItem);
      
      if (result) {
        toast({
          title: "Item Added",
          description: `${itemData.name} has been added to your shopping list.`,
          role: "status",
          "aria-live": "polite"
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to shopping list",
          variant: "destructive",
          role: "alert",
          "aria-live": "assertive"
        });
      }
    } catch (error) {
      console.error("Error adding item to shopping list:", error);
      toast({
        title: "Error",
        description: "Error adding item to shopping list: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
    
    return false;
  }, [readOnly, addItem, toast]);

  return {
    handleToggleItemCompletion,
    handleDeleteItem,
    handleSaveItem,
    handleSaveItemFromCapture
  };
};
