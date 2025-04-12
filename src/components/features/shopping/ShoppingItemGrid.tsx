
import React from 'react';
import ShoppingItemCard from './ShoppingItemCard';
import ContentGrid from '@/components/ui/content-grid';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShoppingItemGridProps {
  items: any[];
  onToggleItemCompletion: (id: string) => void;
  onEditItem: (id: string, item: any) => void;
  onImagePreview: (item: any) => void;
  readOnly?: boolean;
}

const ShoppingItemGrid: React.FC<ShoppingItemGridProps> = ({ 
  items, 
  onToggleItemCompletion, 
  onEditItem, 
  onImagePreview,
  readOnly = false
}) => {
  const { isMobile } = useIsMobile();

  return (
    <ContentGrid
      itemCount={items.length}
      columns={{
        default: 1,
        sm: isMobile ? 1 : 2,
        md: 3,
        lg: 4
      }}
      gap="md"
      emptyState={{
        title: "No items",
        description: "There are no items in this category"
      }}
    >
      {items.map(item => (
        <ShoppingItemCard
          key={item.id}
          item={item}
          onToggle={() => onToggleItemCompletion(item.id)}
          onEdit={() => onEditItem(item.id, item)}
          onImagePreview={() => onImagePreview(item)}
          readOnly={readOnly}
        />
      ))}
    </ContentGrid>
  );
};

export default ShoppingItemGrid;
