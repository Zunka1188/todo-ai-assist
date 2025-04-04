
import React from 'react';
import { Check, Trash, Image as ImageIcon, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';

interface ShoppingItemProps {
  id: string;
  name: string;
  image?: string | null;
  checked?: boolean;
  category?: string;
  onCheck?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ShoppingItem: React.FC<ShoppingItemProps> = ({
  id,
  name,
  image,
  checked = false,
  category,
  onCheck,
  onDelete
}) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg mb-2",
      "border border-border",
      checked ? "bg-muted" : "bg-card",
      theme === 'dark' && "border-border/50"
    )}>
      <div className="flex items-center flex-1 min-w-0">
        {image ? (
          <div className="h-12 w-12 rounded overflow-hidden bg-muted mr-3 flex-shrink-0">
            <img 
              src={image} 
              alt={name} 
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded bg-primary/10 mr-3 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium truncate",
            checked ? "line-through text-muted-foreground" : "",
            theme === 'light' ? "text-foreground" : "text-white"
          )}>
            {name}
          </p>
          {category && (
            <span className="text-xs text-muted-foreground">
              {category}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center ml-2">
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
