
import React from 'react';
import { Check, Trash, Edit, ShoppingBag, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import ShoppingItemImage from './ShoppingItemImage';

interface ShoppingItemProps {
  id: string;
  name: string;
  image?: string | null;
  checked?: boolean;
  category?: string;
  onCheck?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onImageView?: (id: string) => void;
  quantity?: string; 
  notes?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
}

const ShoppingItem: React.FC<ShoppingItemProps> = ({
  id,
  name,
  image,
  checked = false,
  category,
  quantity,
  notes,
  repeatOption,
  onCheck,
  onDelete,
  onEdit,
  onImageView
}) => {
  const { theme } = useTheme();
  
  const handleImageClick = () => {
    if (image && onImageView) {
      onImageView(id);
    }
  };
  
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg mb-2",
      "border border-border",
      checked ? "bg-muted" : "bg-card",
      theme === 'dark' && "border-border/50"
    )}>
      <div className="flex items-center flex-1 min-w-0">
        <ShoppingItemImage
          imageUrl={image}
          name={name}
          onClick={onImageView ? handleImageClick : undefined}
          className="mr-3"
        />
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium truncate",
            checked ? "line-through text-muted-foreground" : "",
            theme === 'light' ? "text-foreground" : "text-white"
          )}>
            {name}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <span className="text-xs text-muted-foreground">
                {category}
              </span>
            )}
            {quantity && (
              <span className="text-xs text-muted-foreground">
                {quantity}
              </span>
            )}
            {repeatOption && repeatOption !== 'none' && (
              <span className="text-xs text-muted-foreground">
                {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center ml-2">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(id)}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            aria-label="Edit item"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCheck?.(id)}
          className="h-8 w-8"
          aria-label={checked ? "Mark as not purchased" : "Mark as purchased"}
        >
          <div className={cn(
            "h-5 w-5 rounded-full border flex items-center justify-center",
            checked ? "bg-primary border-primary" : "border-primary"
          )}>
            {checked && <Check className="h-3 w-3 text-white" />}
          </div>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete?.(id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete item"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ShoppingItem;
