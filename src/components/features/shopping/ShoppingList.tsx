
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ShoppingItemButton from './ShoppingItemButton';
import { useShoppingItems } from './useShoppingItems';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import ImagePreviewDialog from './ImagePreviewDialog';
import { useToast } from '@/components/ui/use-toast';

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
  const shoppingItemsContext = useShoppingItems(filterMode, searchTerm);
  const { removeItem: deleteItem, toggleItem: toggleItemCompletion, addItem } = shoppingItemsContext;
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  
  // Filter items based on search term and filter mode, but don't filter out completed items
  const filteredItems = shoppingItemsContext.items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Apply filter mode
    if (filterMode === 'all') return true;
    if (filterMode === 'one-off' && (!item.repeatOption || item.repeatOption === 'none')) return true;
    if (filterMode === 'weekly' && item.repeatOption === 'weekly') return true;
    if (filterMode === 'monthly' && item.repeatOption === 'monthly') return true;
    
    return false;
  });
  
  // Separate unpurchased and purchased items
  const unpurchasedItems = filteredItems.filter(item => !item.completed);
  const purchasedItems = filteredItems.filter(item => item.completed);
  
  const handleImagePreview = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };
  
  const handleCloseImageDialog = () => {
    setSelectedImageUrl(null);
  };

  // New helper function to handle adding items from camera capture or uploads
  const handleSaveItemFromCapture = (itemData: any) => {
    try {
      // Ensure required fields are present
      if (!itemData.name) {
        itemData.name = "Unnamed Item";
      }
      
      // Add brand name to the item name if it was detected
      if (itemData.brand && !itemData.name.includes(itemData.brand)) {
        itemData.name = `${itemData.brand} ${itemData.name}`;
      }
      
      // Make sure category exists
      if (!itemData.category) {
        itemData.category = "Other";
      }
      
      // Create a new item for the shopping list
      const newItem = {
        name: itemData.name,
        category: itemData.category,
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
        return true;
      }
    } catch (error) {
      console.error("Error adding item to shopping list:", error);
      toast({
        title: "Error",
        description: "Failed to add item to shopping list. Please try again.",
        variant: "destructive",
      });
    }
    
    return false;
  };

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
          {unpurchasedItems.length > 0 && (
            <div className={`shopping-items-grid grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-4 gap-4'}`}>
              {unpurchasedItems.map((item) => (
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
          )}
          
          {/* Purchased Items Section - only show if there are purchased items */}
          {purchasedItems.length > 0 && (
            <div className="mt-6 mb-8">
              <Separator className="mb-4" />
              <h3 className="text-lg font-medium mb-4 px-1">{isMobile ? 'Purchased' : 'Purchased Items'}</h3>
              <div className={`shopping-items-grid grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-4 gap-4'}`}>
                {purchasedItems.map((item) => (
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
            </div>
          )}
        </ScrollArea>
      )}

      {/* Using the improved ImagePreviewDialog component */}
      <ImagePreviewDialog 
        imageUrl={selectedImageUrl}
        onClose={handleCloseImageDialog}
        onSaveItem={handleSaveItemFromCapture}
      />
    </div>
  );
};

export default ShoppingList;
