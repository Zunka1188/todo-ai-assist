
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ShoppingItemGrid from './ShoppingItemGrid';
import EmptyState from './EmptyState';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShoppingListContentProps {
  notPurchasedItems: any[];
  purchasedItems: any[];
  searchTerm: string;
  onToggleItemCompletion: (itemId: string) => void;
  onEditItem: (itemId: string, item: any) => void;
  onImagePreview: (item: any) => void;
  readOnly: boolean;
}

const ShoppingListContent: React.FC<ShoppingListContentProps> = ({
  notPurchasedItems,
  purchasedItems,
  searchTerm,
  onToggleItemCompletion,
  onEditItem,
  onImagePreview,
  readOnly
}) => {
  const { isMobile } = useIsMobile();
  
  if (notPurchasedItems.length === 0 && purchasedItems.length === 0) {
    return <EmptyState searchTerm={searchTerm} />;
  }

  return (
    <ScrollArea 
      className="h-[calc(100vh-280px)] overflow-y-auto touch-auto px-0" 
      style={{ WebkitOverflowScrolling: 'touch' }}
      tabIndex={0}
      role="region"
      aria-label="Shopping list items"
    >
      <div className="pb-16">
        {notPurchasedItems.length > 0 && (
          <ShoppingItemGrid 
            items={notPurchasedItems}
            onToggleItemCompletion={onToggleItemCompletion}
            onEditItem={onEditItem}
            onImagePreview={onImagePreview}
            readOnly={readOnly}
          />
        )}
        
        {purchasedItems.length > 0 && (
          <div className="mt-6">
            <Separator className="mb-4" />
            <h3 className="text-lg font-medium mb-4 px-0" id="purchased-heading">
              {isMobile ? 'Purchased' : 'Purchased Items'}
            </h3>
            <ShoppingItemGrid 
              items={purchasedItems}
              onToggleItemCompletion={onToggleItemCompletion}
              onEditItem={onEditItem}
              onImagePreview={onImagePreview}
              readOnly={readOnly}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ShoppingListContent;
