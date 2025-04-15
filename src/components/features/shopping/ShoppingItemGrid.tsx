
import React from 'react';
import ShoppingItemButton from './ShoppingItemButton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ShoppingItemGridProps {
  items: any[];
  onToggleItemCompletion: (id: string) => void;
  onEditItem: (id: string, item: any) => void;
  onImagePreview?: (item: any) => void;
  batchMode?: boolean;
  selectedItems?: string[];
  onItemSelect?: (id: string) => void;
  readOnly?: boolean;
  className?: string;
}

const ShoppingItemGrid: React.FC<ShoppingItemGridProps> = ({
  items,
  onToggleItemCompletion,
  onEditItem,
  onImagePreview,
  batchMode = false,
  selectedItems = [],
  onItemSelect,
  readOnly = false,
  className,
}) => {
  const { toast } = useToast();

  // Handle sharing an individual item
  const handleShareItem = (item: any) => {
    const shareUrl = `${window.location.origin}/shopping?item=${item.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Check out this item: ${item.name}`,
        text: item.notes ? `${item.name} - ${item.notes}` : item.name,
        url: shareUrl
      }).catch(err => console.error("Error sharing", err));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copied!",
          description: "Item link has been copied to clipboard"
        });
      });
    }
  };

  // Handle image preview click
  const handleItemImagePreview = (item: any) => {
    if (item.imageUrl && onImagePreview) {
      onImagePreview(item);
    }
  };

  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No items found</p>;
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {items.map((item) => (
        <ShoppingItemButton
          key={item.id}
          name={item.name}
          quantity={item.amount}
          completed={item.completed}
          repeatOption={item.repeatOption}
          imageUrl={item.imageUrl}
          notes={item.notes}
          onClick={batchMode ? 
            () => onItemSelect?.(item.id) : 
            () => onToggleItemCompletion(item.id)
          }
          onEdit={() => onEditItem(item.id, item)}
          onDelete={() => onEditItem(item.id, item)}
          onImagePreview={() => handleItemImagePreview(item)}
          onShare={() => handleShareItem(item)}
          readOnly={readOnly}
          data-checked={selectedItems.includes(item.id) ? "true" : "false"}
        />
      ))}
    </div>
  );
};

export default ShoppingItemGrid;
