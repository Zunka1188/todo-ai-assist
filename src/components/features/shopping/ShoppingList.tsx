
import React, { useState, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import ShoppingItemButton from './ShoppingItemButton';
import EditItemDialog from './EditItemDialog';
import ImagePreviewDialog from './ImagePreviewDialog';
import { useShoppingItems, useCategoriesManager, ShoppingItem } from './useShoppingItems';

interface ShoppingListProps {
  searchTerm?: string;
  filterMode: 'one-off' | 'weekly' | 'monthly' | 'all';
  onEditItem?: (id: string, name: string, item: ShoppingItem) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({
  searchTerm = '',
  filterMode,
  onEditItem
}) => {
  const {
    notPurchasedItems,
    purchasedItems,
    toggleItem,
    removeItem,
    updateItem
  } = useShoppingItems(filterMode, searchTerm);

  const { categories } = useCategoriesManager();
  
  const [isPurchasedSectionCollapsed, setIsPurchasedSectionCollapsed] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ShoppingItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { isMobile, isIOS } = useIsMobile();
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const purchasedSectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const scrollToPurchasedSection = () => {
    if (purchasedSectionRef.current) {
      if (isPurchasedSectionCollapsed) {
        setIsPurchasedSectionCollapsed(false);
        const timeout = isMobile ? 400 : 250;
        setTimeout(() => {
          scrollToSection();
        }, timeout);
      } else {
        scrollToSection();
      }
    } else {
      console.log('Purchase section ref not found');
    }
  };

  const scrollToSection = () => {
    if (!purchasedSectionRef.current) return;
    try {
      if (viewportRef.current) {
        const sectionPosition = purchasedSectionRef.current.getBoundingClientRect();
        const viewportPosition = viewportRef.current.getBoundingClientRect();
        const relativeTop = sectionPosition.top - viewportPosition.top;
        const offset = isIOS ? 60 : 40;
        viewportRef.current.scrollBy({
          top: relativeTop - offset,
          behavior: 'smooth'
        });
        console.log('Scrolling using viewport ref, position:', relativeTop);
      } else if (listContainerRef.current) {
        const container = listContainerRef.current;
        const section = purchasedSectionRef.current;
        const topPos = section.offsetTop - container.offsetTop;
        container.scrollTo({
          top: topPos - 40,
          behavior: 'smooth'
        });
        console.log('Scrolling using container ref, position:', topPos);
      } else {
        purchasedSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        console.log('Scrolling using scrollIntoView');
      }
    } catch (error) {
      console.error('Error scrolling to section:', error);
      try {
        if (purchasedSectionRef.current) {
          const yOffset = -40;
          const y = purchasedSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({
            top: y,
            behavior: 'smooth'
          });
          console.log('Scrolling using window.scrollTo');
        }
      } catch (e) {
        console.error('All scrolling methods failed:', e);
      }
    }
  };

  const handleEditItem = (item: ShoppingItem) => {
    if (onEditItem) {
      onEditItem(item.id, item.name, item);
      return;
    }
    setItemToEdit(item);
    setIsEditItemDialogOpen(true);
  };

  const handleSaveEditedItem = (updatedItem: ShoppingItem, imageFile: File | null) => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          const newImageUrl = e.target.result as string;
          updateItem(updatedItem.id, {
            ...updatedItem,
            imageUrl: newImageUrl
          });
          toast({
            description: `Updated "${updatedItem.name}"`
          });
        }
      };
      reader.readAsDataURL(imageFile);
    } else {
      updateItem(updatedItem.id, updatedItem);
      toast({
        description: `Updated "${updatedItem.name}"`
      });
    }
  };

  const handleToggleItem = (id: string) => {
    const result = toggleItem(id);
    if (result) {
      toast({
        description: `Moved "${result.item.name}" to ${result.completed ? 'Purchased' : 'Not Purchased'}`
      });
    }
  };

  const handleRemoveItem = (id: string) => {
    const item = removeItem(id);
    if (item) {
      toast({
        description: `Removed ${item.name}`
      });
    }
  };

  const togglePurchasedSection = () => {
    setIsPurchasedSectionCollapsed(!isPurchasedSectionCollapsed);
  };

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  return (
    <div className="space-y-4" ref={listContainerRef}>
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        
        {purchasedItems.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 flex items-center gap-1" 
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                scrollToPurchasedSection();
              }}
            >
              <ShoppingCart size={12} />
              <span className="text-xs">Go to Purchased</span>
            </Button>
          </div>
        )}
      </div>

      <ScrollArea 
        className="h-[calc(100vh-320px)] pr-4 shopping-items-scroll-area" 
        scrollRef={viewportRef}
      >
        <div className="mb-4">
          <h3 className="text-xs font-medium mb-3 text-muted-foreground">
            Not Purchased ({notPurchasedItems.length})
          </h3>
          
          <AnimatePresence>
            {notPurchasedItems.length === 0 ? (
              <div className="text-center py-3 text-muted-foreground text-sm">
                No items to purchase. Add some new items!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {notPurchasedItems.map(item => (
                  <motion.div 
                    key={`not-purchased-${item.id}`} 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ShoppingItemButton
                      completed={false}
                      name={item.name}
                      quantity={item.amount}
                      notes={item.notes}
                      repeatOption={item.repeatOption}
                      imageUrl={item.imageUrl}
                      onClick={() => handleToggleItem(item.id)}
                      onEdit={() => handleEditItem(item)}
                      onDelete={() => handleRemoveItem(item.id)}
                      onImagePreview={() => item.imageUrl && handleImagePreview(item.imageUrl)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {purchasedItems.length > 0 && (
          <div ref={purchasedSectionRef} className="mt-8 mb-4">
            <div 
              className="flex items-center justify-between mb-3 cursor-pointer" 
              onClick={togglePurchasedSection}
            >
              <h3 className="text-xs font-medium text-muted-foreground">
                Purchased ({purchasedItems.length})
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={cn(
                    "h-4 w-4 transition-transform", 
                    !isPurchasedSectionCollapsed && "transform rotate-180"
                  )}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </Button>
            </div>
            
            {!isPurchasedSectionCollapsed && (
              <AnimatePresence>
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {purchasedItems.map(item => (
                      <motion.div 
                        key={`purchased-${item.id}`} 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ShoppingItemButton 
                          completed={true} 
                          name={item.name} 
                          quantity={item.amount} 
                          notes={item.notes} 
                          repeatOption={item.repeatOption} 
                          imageUrl={item.imageUrl} 
                          onClick={() => handleToggleItem(item.id)}
                          onEdit={() => handleEditItem(item)}
                          onDelete={() => handleRemoveItem(item.id)}
                          onImagePreview={() => item.imageUrl && handleImagePreview(item.imageUrl)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </ScrollArea>

      <EditItemDialog 
        isOpen={isEditItemDialogOpen}
        onClose={() => setIsEditItemDialogOpen(false)}
        item={itemToEdit}
        categories={categories.filter(c => c !== 'All')}
        onSave={handleSaveEditedItem}
      />
      
      <ImagePreviewDialog 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />
    </div>
  );
};

export default ShoppingList;
