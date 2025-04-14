
import React from 'react';
import { cn } from '@/lib/utils';
import ShoppingItemCard from './ShoppingItemCard';
import { useIsMobile } from '@/hooks/use-mobile';
import ContentGrid from '@/components/ui/content-grid';
 
interface ShoppingItemGridProps {
  items: any[];
  onToggleItemCompletion: (itemId: string) => void;
  onEditItem: (itemId: string, item: any) => void;
  onImagePreview: (item: any) => void;
  className?: string;
  readOnly?: boolean;
  batchMode?: boolean;
  selectedItems?: string[];
  onItemSelect?: (itemId: string) => void;
}
 
const ShoppingItemGrid: React.FC<ShoppingItemGridProps> = ({
  items,
  onToggleItemCompletion,
  onEditItem,
  onImagePreview,
  className,
  readOnly = false,
  batchMode = false,
  selectedItems = [],
  onItemSelect = () => {}
}) => {
  const { isMobile } = useIsMobile();
  
  return (
    <ContentGrid 
      className={cn('gap-3', className)}
      columns={{ 
        default: 1, 
        sm: isMobile ? 1 : 2 
      }}
      itemCount={items.length}
    >
      {items.map((item) => (
        <ShoppingItemCard
          key={item.id}
          item={item}
          onToggleCompletion={() => onToggleItemCompletion(item.id)}
          onEdit={() => onEditItem(item.id, item)}
          onImagePreview={() => onImagePreview(item)}
          readOnly={readOnly}
          batchMode={batchMode}
          isSelected={selectedItems.includes(item.id)}
          onSelect={() => onItemSelect(item.id)}
        />
      ))}
    </ContentGrid>
  );
};
 
export default ShoppingItemGrid;
