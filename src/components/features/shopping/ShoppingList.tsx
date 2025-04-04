
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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Filter items based on search term (filtering is now handled in the hook)
  const filteredItems = items;
  
  // Separate unpurchased and purchased items
  const unpurchasedItems = filteredItems.filter(item => !item.completed);
  const purchasedItems = filteredItems.filter(item => item.completed);
  
  const handleImagePreview = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };
  
  const handleCloseImageDialog = () => {
    setSelectedImageUrl(null);
  };

  // Handle adding items from camera capture or uploads
  const handleSaveItemFromCapture = (itemData: any) => {
    try {
      console.log("ShoppingList - Handling save from capture:", itemData);
      
      // Ensure required fields are present
      if (!itemData.name) {
        console.warn("Name is missing, setting default name");
        itemData.name = "Unnamed Item";
      }
      
      // Add brand name to the item name if it was detected
      if (itemData.brand && !itemData.name.includes(itemData.brand)) {
        itemData.name = `${itemData.brand} ${itemData.name}`;
      }
      
      // Create a new item for the shopping list
      const newItem = {
        name: itemData.name,
        amount: itemData.amount || '1', 
        price: itemData.price,
        imageUrl: itemData.file || null,
        notes: itemData.notes,
        repeatOption: itemData.repeatOption || 'none',
      };
      
      // Add to shopping list
      const added = addItem(newItem);
      
      if (added) {
        toast({
          title: "Item Added",
          description: `${itemData.name} has been added to your shopping list.`,
        });
        
        // Force an update to the appropriate tab based on repeatOption
        const targetTab = newItem.repeatOption === 'weekly' 
          ? 'weekly' 
          : newItem.repeatOption === 'monthly' 
            ? 'monthly' 
            : 'one-off';
            
        // Navigate if needed
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
      console.error("Error adding item to shopping list:", error);
      toast({
        title: "Error",
        description: "Error adding item to shopping list: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
    
    return false;
  };

  // Shopping items grid renderer
  const renderShoppingItemsGrid = (items: any[]) => (
    <div className={cn(
      "shopping-items-grid grid",
      isMobile ? "grid-cols-2 sm:grid-cols-3 gap-2" : "grid-cols-3 lg:grid-cols-4 gap-4"
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
          onImagePreview={item.imageUrl ? () => handleImagePreview(item.imageUrl!) : undefined}
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
        <ScrollArea className="h-[calc(100vh-280px)]">
          {/* Unpurchased Items Section */}
          {unpurchasedItems.length > 0 && renderShoppingItemsGrid(unpurchasedItems)}
          
          {/* Purchased Items Section - only show if there are purchased items */}
          {purchasedItems.length > 0 && (
            <div className="mt-6 mb-8">
              <Separator className="mb-4" />
              <h3 className="text-lg font-medium mb-4 px-1">{isMobile ? 'Purchased' : 'Purchased Items'}</h3>
              {renderShoppingItemsGrid(purchasedItems)}
            </div>
          )}
        </ScrollArea>
      )}

      {/* Image preview dialog */}
      <ImagePreviewDialog 
        imageUrl={selectedImageUrl}
        onClose={handleCloseImageDialog}
        onSaveItem={handleSaveItemFromCapture}
      />
    </div>
  );
};

export default ShoppingList;
