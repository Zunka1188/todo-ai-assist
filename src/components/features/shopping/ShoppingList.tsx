
import React, { useState, useEffect, memo, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ImagePreviewDialog from './ImagePreviewDialog';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useShoppingItemsContext } from './ShoppingItemsContext';
import ShoppingItemCard from './ShoppingItemCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  // Use context instead of direct hook
  const { 
    notPurchasedItems, 
    purchasedItems, 
    removeItem, 
    toggleItem, 
    addItem,
    updateSearchTerm,
    updateFilterMode 
  } = useShoppingItemsContext();
  
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Update context with props
  useEffect(() => {
    updateSearchTerm(searchTerm);
    updateFilterMode(filterMode);
  }, [searchTerm, filterMode, updateSearchTerm, updateFilterMode]);
  
  useEffect(() => {
    console.log(`[DEBUG] ShoppingList - ${filterMode} items:`, 
      "Unpurchased:", notPurchasedItems.length, 
      "Purchased:", purchasedItems.length);
  }, [notPurchasedItems.length, purchasedItems.length, filterMode]);
  
  const handleImagePreview = (item: any) => {
    console.log("[DEBUG] ShoppingList - Opening image preview for:", item.name);
    setSelectedItem(item);
  };
  
  const handleCloseImageDialog = () => {
    setSelectedItem(null);
  };

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
      
      console.log("[DEBUG] ShoppingList - Handling save from capture:", JSON.stringify(itemData, null, 2));
      
      if (!itemData.name) {
        console.warn("[WARN] Name is missing, setting default name");
        itemData.name = "Unnamed Item";
      }
      
      if (itemData.brand && !itemData.name.includes(itemData.brand)) {
        itemData.name = `${itemData.brand} ${itemData.name}`;
      }
      
      const newItem = {
        name: itemData.name,
        amount: itemData.amount || '1', 
        price: itemData.price || '',
        imageUrl: itemData.imageUrl || null, // Use imageUrl instead of file
        notes: itemData.notes || '',
        repeatOption: itemData.repeatOption || 'none',
        category: itemData.category || '',
        dateToPurchase: '',
        completed: false // Always explicitly set completed to false
      };
      
      console.log("[DEBUG] ShoppingList - Structured item to add:", JSON.stringify(newItem, null, 2));
      
      // Call addItem from context
      const result = addItem(newItem);
      console.log("[DEBUG] ShoppingList - Called addItem function, result:", result);
      
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
      console.error("[ERROR] ShoppingList - Error adding item to shopping list:", error);
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

  const handleToggleItemCompletion = (itemId: string) => {
    if (readOnly) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to mark items as completed.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      return;
    }
    
    console.log("[DEBUG] ShoppingList - Toggling completion for item ID:", itemId);
    const result = toggleItem(itemId);
    
    if (result) {
      console.log("[DEBUG] ShoppingList - Toggle result:", result.completed ? "Completed" : "Uncompleted", result.item);
    } else {
      console.error("[ERROR] ShoppingList - Failed to toggle item completion");
    }
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    if (readOnly) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to delete items in this shared list.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      return;
    }
    
    setItemToDelete({id: itemId, name: itemName});
    setShowDeleteDialog(true);
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    
    const result = removeItem(itemToDelete.id);
    if (result) {
      toast({
        title: "Item Deleted",
        description: `${itemToDelete.name} has been removed from your list.`,
        role: "status",
        "aria-live": "polite"
      });
    } else {
      console.error("[ERROR] ShoppingList - Failed to delete item");
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
    
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };
  
  const cancelDeleteItem = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  // Helper function to render a grid of shopping items
  const renderItemGrid = (items: any[]) => {
    if (items.length === 0) return null;
    
    return (
      <div 
        className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        )}
        role="list"
        aria-label={items[0]?.completed ? "Purchased items" : "Shopping items"}
      >
        {items.map(item => (
          <div key={item.id} className="aspect-square">
            <ShoppingItemCard
              id={item.id}
              name={item.name}
              completed={item.completed}
              quantity={item.amount}
              repeatOption={item.repeatOption}
              imageUrl={item.imageUrl}
              notes={item.notes}
              onClick={() => handleToggleItemCompletion(item.id)}
              onDelete={() => handleDeleteItem(item.id, item.name)}
              onEdit={() => onEditItem && onEditItem(item.id, item.name, item)}
              onImagePreview={() => handleImagePreview(item)}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {notPurchasedItems.length === 0 && purchasedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 text-center" role="status">
          <p className="text-muted-foreground mb-2">No items found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "Try a different search term" : "Add an item to get started"}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)] overflow-y-auto touch-auto" style={{
          WebkitOverflowScrolling: 'touch'
        }}
        tabIndex={0}
        role="region"
        aria-label="Shopping list items"
        >
          <div className={cn(
            "pb-16",
            isMobile ? "mb-8 px-2" : "px-4"
          )}>
            {notPurchasedItems.length > 0 && renderItemGrid(notPurchasedItems)}
            
            {purchasedItems.length > 0 && (
              <div className="mt-6 mb-8">
                <Separator className="mb-4" />
                <h3 className="text-lg font-medium mb-4" id="purchased-heading">
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
          if (selectedItem && onEditItem) {
            onEditItem(selectedItem.id, selectedItem.name, selectedItem);
          }
        }}
        onDelete={() => {
          if (readOnly) {
            toast({
              title: "Read-only Mode",
              description: "You don't have permission to delete items in this shared list.",
              variant: "destructive",
              role: "alert",
              "aria-live": "assertive"
            });
            return;
          }
          if (selectedItem) {
            handleDeleteItem(selectedItem.id, selectedItem.name);
          }
          handleCloseImageDialog();
        }}
        readOnly={readOnly}
      />
      
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            cancelDeleteItem();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteItem}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Export the component wrapped in memo for better performance
export default memo(ShoppingList);
