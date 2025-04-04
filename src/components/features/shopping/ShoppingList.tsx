
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import ShoppingItemButton from './ShoppingItemButton';
import { useShoppingItems } from './useShoppingItems';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const navigate = useNavigate();
  const location = useLocation();
  
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
    setIsImageDialogOpen(true);
  };
  
  // Handle dialog close with navigation protection
  const handleDialogClose = () => {
    setIsImageDialogOpen(false);
    setSelectedImageUrl(null);
  };

  // Handle back navigation
  React.useEffect(() => {
    const handlePopState = () => {
      // If dialog is open, close it and prevent navigation
      if (isImageDialogOpen) {
        handleDialogClose();
        // We need to push the current path again to maintain correct history
        navigate(location.pathname, { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isImageDialogOpen, navigate, location.pathname]);

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

      {/* Improved Image Preview Dialog with Close Button */}
      <AlertDialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <AlertDialogContent className="max-w-4xl p-0">
          <div className="relative w-full h-full max-h-[80vh] flex flex-col">
            <div className="flex-grow flex items-center justify-center overflow-hidden">
              {selectedImageUrl && (
                <img 
                  src={selectedImageUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            <AlertDialogFooter className="p-4 bg-background border-t">
              <Button onClick={handleDialogClose} className="ml-auto">
                Close
              </Button>
            </AlertDialogFooter>
          </div>
          
          {/* Close Button in the top right */}
          <Button 
            onClick={handleDialogClose}
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-2 rounded-full h-8 w-8 p-0 bg-background/80 hover:bg-background/90"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShoppingList;
