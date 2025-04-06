
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
};

const ShoppingList = ({
  searchTerm = '',
  filterMode = 'all',
  className,
  onEditItem
}: ShoppingListProps) => {
  const { items, removeItem: deleteItem, toggleItem: toggleItemCompletion, addItem } = useShoppingItems(filterMode, searchTerm);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const filteredItems = items;
  
  const unpurchasedItems = filteredItems.filter(item => !item.completed);
  const purchasedItems = filteredItems.filter(item => item.completed);
  
  const handleImagePreview = (item: any) => {
    setSelectedItem(item);
  };
  
  const handleCloseImageDialog = () => {
    setSelectedItem(null);
  };

  const handleSaveItemFromCapture = (itemData: any) => {
    try {
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
      
      const added = addItem(newItem);
      console.log("[DEBUG] ShoppingList - Result from addItem:", added);
      
      if (added) {
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
          description: "Failed to add item to shopping list. Please try again.",
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

  const renderShoppingItemsGrid = (items: any[]) => (
    <div className={cn(
      "grid",
      isMobile 
        ? "grid-cols-3 gap-2 px-2"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-2"
    )}>
      {items.map((item) => (
        <ShoppingItemButton
          key={item.id}
          name={item.name}
          completed={item.completed}
          quantity={item.amount}
          repeatOption={item.repeatOption}
          imageUrl={item.imageUrl}
          notes={item.notes}
          onClick={() => toggleItemCompletion(item.id)}
          onDelete={() => deleteItem(item.id)}
          onEdit={() => onEditItem && onEditItem(item.id, item.name, item)}
          onImagePreview={() => handleImagePreview(item)}
        />
      ))}
    </div>
  );

  return (
    <div className={cn('w-full', className)}>
      {filteredItems.length === 0 ? (
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
            {unpurchasedItems.length > 0 && renderShoppingItemsGrid(unpurchasedItems)}
            
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
          if (selectedItem) {
            deleteItem(selectedItem.id);
          }
          handleCloseImageDialog();
        }}
      />
    </div>
  );
};

export default ShoppingList;
