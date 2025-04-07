import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ShoppingItemButton from './ShoppingItemButton';
import { useShoppingItems } from './useShoppingItems';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ImagePreviewDialog from './ImagePreviewDialog';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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
    removeItem: deleteItem, 
    toggleItem: toggleItemCompletion, 
    addItem 
  } = useShoppingItems(filterMode, searchTerm);
  
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  console.log(`[DEBUG] ShoppingList - ${filterMode} items:`, 
    "Unpurchased:", notPurchasedItems.length, 
    "Purchased:", purchasedItems.length);
  
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
          variant: "destructive"
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
        imageUrl: itemData.file || null,
        notes: itemData.notes || '',
        repeatOption: itemData.repeatOption || 'none',
        category: itemData.category || '',
        dateToPurchase: '',
        completed: false // Always explicitly set completed to false
      };
      
      console.log("[DEBUG] ShoppingList - Structured item to add:", JSON.stringify(newItem, null, 2));
      
      const result = addItem(newItem);
      console.log("[DEBUG] ShoppingList - Called addItem function, result:", result);
      
      if (result) {
        toast({
          title: "Item Added",
          description: `${itemData.name} has been added to your shopping list.`,
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
        });
      }
    } catch (error) {
      console.error("[ERROR] ShoppingList - Error adding item to shopping list:", error);
      toast({
        title: "Error",
        description: "Error adding item to shopping list: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
    
    return false;
  };

  const handleToggleItemCompletion = (itemId: string) => {
    if (readOnly) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to mark items as completed.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("[DEBUG] ShoppingList - Toggling completion for item ID:", itemId);
    const result = toggleItemCompletion(itemId);
    
    if (result) {
      console.log("[DEBUG] ShoppingList - Toggle result:", result.completed ? "Completed" : "Uncompleted", result.item);
    } else {
      console.error("[ERROR] ShoppingList - Failed to toggle item completion");
    }
  };

  const renderShoppingItemsGrid = (items: any[]) => (
    <div className={cn(
      "grid",
      isMobile 
        ? "grid-cols-2 gap-2 px-1" // Using 2 columns on mobile for better sizing
        : "grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-2"
    )}>
      {items.map((item) => (
        <div key={item.id} className="w-full">
          <ShoppingItemButton
            name={item.name}
            completed={item.completed}
            quantity={item.amount}
            repeatOption={item.repeatOption}
            imageUrl={item.imageUrl}
            notes={item.notes}
            onClick={() => handleToggleItemCompletion(item.id)}
            onDelete={() => {
              if (readOnly) {
                toast({
                  title: "Read-only Mode",
                  description: "You don't have permission to delete items in this shared list.",
                  variant: "destructive"
                });
                return;
              }
              deleteItem(item.id);
            }}
            onEdit={() => onEditItem && onEditItem(item.id, item.name, item)}
            onImagePreview={() => handleImagePreview(item)}
            readOnly={readOnly}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {notPurchasedItems.length === 0 && purchasedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <p className="text-muted-foreground mb-2">No items found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "Try a different search term" : "Add an item to get started"}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-280px)] overflow-y-auto touch-auto" style={{
          WebkitOverflowScrolling: 'touch'
        }}>
          <div className={cn(
            "pb-16",
            isMobile ? "mb-8" : ""
          )}>
            {notPurchasedItems.length > 0 && renderShoppingItemsGrid(notPurchasedItems)}
            
            {purchasedItems.length > 0 && (
              <div className="mt-6 mb-8">
                <Separator className="mb-4" />
                <h3 className="text-lg font-medium mb-4 px-1">{isMobile ? 'Purchased' : 'Purchased Items'}</h3>
                {renderShoppingItemsGrid(purchasedItems)}
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
              variant: "destructive"
            });
            return;
          }
          if (selectedItem) {
            deleteItem(selectedItem.id);
          }
          handleCloseImageDialog();
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

export default ShoppingList;
