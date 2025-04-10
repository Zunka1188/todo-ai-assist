
import React from 'react';
import ShoppingItemCard from './ShoppingItemCard';

interface ShoppingItemGridProps {
  items: any[];
  onToggleItemCompletion: (itemId: string) => void;
  onEditItem: (itemId: string, item: any) => void;
  onImagePreview: (item: any) => void;
  readOnly: boolean;
}

const ShoppingItemGrid: React.FC<ShoppingItemGridProps> = ({
  items,
  onToggleItemCompletion,
  onEditItem,
  onImagePreview,
  readOnly
}) => {
  if (items.length === 0) return null;
  
  return (
    <div 
      className="shopping-item-grid"
      role="list"
      aria-label={items[0]?.completed ? "Purchased items" : "Shopping items"}
    >
      {items.map(item => (
        <div key={item.id} className="shopping-item-wrapper">
          <ShoppingItemCard
            id={item.id}
            name={item.name}
            completed={item.completed}
            quantity={item.amount}
            repeatOption={item.repeatOption}
            imageUrl={item.imageUrl}
            notes={item.notes}
            onClick={() => onToggleItemCompletion(item.id)}
            onEdit={() => onEditItem(item.id, item)}
            onImagePreview={() => onImagePreview(item)}
            readOnly={readOnly}
          />
        </div>
      ))}
    </div>
  );
};

export default ShoppingItemGrid;
