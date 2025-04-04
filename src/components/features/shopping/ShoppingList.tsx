
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ShoppingItemButton from './ShoppingItemButton';
import { useShoppingItems } from './useShoppingItems';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { removeItem: deleteItem, toggleItem: toggleItemCompletion } = shoppingItemsContext;
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();
  
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
  
  const handleImagePreview = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageDialogOpen(true);
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
          <div className={`shopping-items-grid grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-4 gap-4'} pb-8`}>
            {filteredItems.map((item) => (
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
        </ScrollArea>
      )}

      {/* Image Preview Dialog */}
      <AlertDialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <AlertDialogContent className="max-w-4xl p-0">
          <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
            {selectedImageUrl && (
              <img 
                src={selectedImageUrl} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShoppingList;
