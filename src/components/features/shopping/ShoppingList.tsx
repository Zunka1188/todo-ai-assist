import React, { useState, memo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ImagePreviewDialog from './ImagePreviewDialog';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useShoppingItemsContext } from './ShoppingItemsContext';
import ShoppingItemCard from './ShoppingItemCard';
import { Loader2 } from 'lucide-react';
import EditItemDialog from './EditItemDialog';

import './shoppingList.css';

type ShoppingListProps = {
  searchTerm?: string;
  filterMode?: 'all' | 'one-off' | 'weekly' | 'monthly';
  className?: string;
  onEditItem?: (id: string, name?: string, item?: any) => void;
  readOnly?: boolean;
};

const ShoppingList = ({
  searchTerm = '',
  filterMode = 'all',
  className,
  onEditItem,
  readOnly = false
}: ShoppingListProps) => {
  const { 
    notPurchasedItems, 
    purchasedItems, 
    removeItem, 
    toggleItem, 
    addItem,
    updateSearchTerm,
    updateFilterMode,
    isLoading 
  } = useShoppingItemsContext();
  
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    updateSearchTerm(searchTerm);
    updateFilterMode(filterMode);
  }, [searchTerm, filterMode, updateSearchTerm, updateFilterMode]);
  
  const handleImagePreview = (item: any) => {
    setSelectedItem(item);
  };
  
  const handleCloseImageDialog = () => {
    setSelectedItem(null);
  };

  const handleOpenEditDialog = (itemId: string, item: any) => {
    if (readOnly) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to edit items in this shared list.",
        variant: "destructive"
      });
      return;
    }
    
    setItemToEdit(item);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setItemToEdit(null);
    setIsEditDialogOpen(false);
  };

  const handleSaveItem = (updatedItem: any) => {
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
  };

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

  const handleSaveItemFromCapture = (itemData: any) => {
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
        
        const targetTab = newItem.repeatOption === 'weekly' 
          ? 'weekly' 
          : newItem.repeatOption === 'monthly' 
            ? 'monthly' 
            : 'one-off';
            
        if (filterMode !== targetTab && filterMode !== 'all') {
          navigate(`/shopping?tab=${targetTab}`, { replace: true });
        }
        
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
  };

  const handleToggleItemCompletion = useCallback((itemId: string) => {
    if (readOnly) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to mark items as completed.",
        variant: "destructive"
      });
      return;
    }
    
    const allItems = [...notPurchasedItems, ...purchasedItems];
    const itemToToggle = allItems.find(item => item.id === itemId);
    
    if (itemToToggle) {
      const updatedItems = allItems.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      
      const result = toggleItem(itemId);
      
      if (!result) {
        console.error("Failed to toggle item completion");
        toast({
          title: "Error",
          description: "Failed to update item status",
          variant: "destructive"
        });
      }
    }
  }, [notPurchasedItems, purchasedItems, readOnly, toast, toggleItem]);

  const renderItemGrid = (items: any[]) => {
    if (items.length === 0) return null;
    
    return (
      <div 
        className="shopping-item-grid"
        role="list"
        aria-label={items[0]?.completed ? "Purchased items" : "Shopping items"}
      >
        {items.map(item => (
          <div key={item.id} className="shopping-item-wrapper">
            <ShoppingItemCard
              id={item.id}
              name={item.name}
              completed={item.completed}
              quantity={item.amount}
              repeatOption={item.repeatOption}
              imageUrl={item.imageUrl}
              notes={item.notes}
              onClick={() => handleToggleItemCompletion(item.id)}
              onEdit={() => handleOpenEditDialog(item.id, item)}
              onImagePreview={() => handleImagePreview(item)}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-12 min-h-[30vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn('w-full min-h-[60vh] shopping-list-container', className)}>
      {notPurchasedItems.length === 0 && purchasedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[40vh]" role="status">
          <p className="text-muted-foreground mb-2">No items found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "Try a different search term" : "Add an item to get started"}
          </p>
        </div>
      ) : (
        <ScrollArea 
          className="h-[calc(100vh-280px)] overflow-y-auto touch-auto px-0" 
          style={{ WebkitOverflowScrolling: 'touch' }}
          tabIndex={0}
          role="region"
          aria-label="Shopping list items"
        >
          <div className="pb-16">
            {notPurchasedItems.length > 0 && renderItemGrid(notPurchasedItems)}
            
            {purchasedItems.length > 0 && (
              <div className="mt-6">
                <Separator className="mb-4" />
                <h3 className="text-lg font-medium mb-4 px-0" id="purchased-heading">
                  {isMobile ? 'Purchased' : 'Purchased Items'}
                </h3>
                {renderItemGrid(purchasedItems)}
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <ImagePreviewDialog 
        imageUrl={selectedItem?.imageUrl || null}
        item={selectedItem}
        onClose={handleCloseImageDialog}
        onSaveItem={handleSaveItemFromCapture}
        onEdit={() => {
          handleCloseImageDialog();
          if (selectedItem) {
            handleOpenEditDialog(selectedItem.id, selectedItem);
          }
        }}
        readOnly={readOnly}
      />
      
      {itemToEdit && (
        <EditItemDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          item={itemToEdit}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  );
};

export default memo(ShoppingList);
