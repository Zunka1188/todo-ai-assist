
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Image } from 'lucide-react';

interface ShoppingItemCardProps {
  id: string;
  name: string;
  completed: boolean;
  quantity?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  imageUrl?: string | null;
  notes?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onImagePreview?: () => void;
  readOnly?: boolean;
}

const ShoppingItemCard: React.FC<ShoppingItemCardProps> = ({
  id,
  name,
  completed,
  quantity,
  repeatOption,
  imageUrl,
  notes,
  onClick,
  onEdit,
  onImagePreview,
  readOnly = false
}) => {
  return (
    <div 
      className={cn(
        "relative p-3 border rounded-lg bg-card shadow-sm transition-all",
        completed ? "opacity-70" : "opacity-100",
        "hover:shadow-md cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={cn(
            "font-medium text-sm",
            completed ? "line-through text-muted-foreground" : ""
          )}>
            {name}
          </h4>
          
          {quantity && (
            <p className="text-xs text-muted-foreground mt-1">
              Qty: {quantity}
            </p>
          )}
          
          {notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {notes}
            </p>
          )}
        </div>
        
        {imageUrl && (
          <div 
            className="w-10 h-10 rounded bg-muted flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (onImagePreview) onImagePreview();
            }}
          >
            <Image className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-2">
        {repeatOption && repeatOption !== 'none' && (
          <Badge variant="outline" className="text-xs">
            {repeatOption}
          </Badge>
        )}
        
        <div className="flex ml-auto space-x-1">
          {!readOnly && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              className="text-xs text-blue-500 hover:text-blue-700"
              aria-label="Edit item"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingItemCard;
