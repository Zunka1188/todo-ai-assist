
import React, { useState, useEffect, memo } from 'react';
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
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
        imageUrl: itemData.imageUrl || null,
        notes: itemData.notes || '',
        repeatOption: itemData.repeatOption || 'none',
        category: itemData.category || '',
        dateToPurchase: '',
        completed: false
      };
      
      console.log("[DEBUG] ShoppingList - Structured item to add:", JSON.stringify(newItem, null, 2));
      
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

  const confirmDeleteItem = async () => {
    if (!itemToDelete || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
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
    } catch (error) {
      console.error("[ERROR] ShoppingList - Error during item deletion:", error);
      toast({
        title: "Error",
        description: "Failed to delete item due to an error",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
      setIsDeleting(false);
    }
  };
  
  const cancelDeleteItem = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const renderItemGrid = (items: any[]) => {
    if (items.length === 0) return null;
    
    return (
      <div 
        className={cn(
          "grid gap-2 md:gap-3 p-4",
          // Improved responsive grid - 2 columns on mobile, 4 on tablets, 6 on desktop
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
          "shopping-item-grid"
        )}
        role="list"
        aria-label={items[0]?.completed ? "Purchased items" : "Shopping items"}
      >
        {items.map(item => (
          <div key={item.id} className="flex justify-center">
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

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <ScrollArea 
          className="h-[calc(100vh-280px)] overflow-y-auto touch-auto" 
          style={{ WebkitOverflowScrolling: 'touch' }}
          tabIndex={0}
          role="region"
          aria-label="Shopping list items"
        >
          <div className="pb-16">
            {notPurchasedItems.length > 0 && renderItemGrid(notPurchasedItems)}
            
            {purchasedItems.length > 0 && (
              <div className="mt-4">
                <Separator className="mb-4" />
                <h3 className="text-lg font-medium mb-4 px-4" id="purchased-heading">
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
          if (!isOpen && !isDeleting) {
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
            <AlertDialogCancel onClick={cancelDeleteItem} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default memo(ShoppingList);
