
import React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Image, Edit, Info, ShoppingCart } from 'lucide-react';

interface ShoppingItemCardProps {
  item: any;
  onToggleCompletion: () => void;
  onEdit: () => void;
  onImagePreview?: () => void;
  className?: string;
  readOnly?: boolean;
  batchMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const ShoppingItemCard: React.FC<ShoppingItemCardProps> = ({
  item,
  onToggleCompletion,
  onEdit,
  onImagePreview,
  className,
  readOnly = false,
  batchMode = false,
  isSelected = false,
  onSelect = () => {}
}) => {
  const hasImage = item.imageUrl && item.imageUrl !== '';
  
  const handleCardClick = (e: React.MouseEvent) => {
    if (batchMode) {
      onSelect();
    } else if (!readOnly) {
      onEdit();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!batchMode) {
      onToggleCompletion();
    }
  };

  const handleBatchCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 h-auto", 
        item.completed ? "opacity-70 bg-muted" : "bg-card",
        batchMode && isSelected ? "border-primary ring-2 ring-primary ring-opacity-30" : "",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Batch mode checkbox or regular completion checkbox */}
          {batchMode ? (
            <Checkbox 
              checked={isSelected}
              onClick={handleBatchCheckboxClick}
              className="mt-1"
              data-testid="shopping-batch-checkbox"
            />
          ) : (
            <Checkbox 
              checked={item.completed}
              onClick={handleCheckboxClick}
              className="mt-1"
              data-testid="shopping-item-checkbox"
              disabled={readOnly}
            />
          )}

          <div className="flex-1 min-w-0">
            {/* Item name and details */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className={cn(
                "text-base font-medium leading-tight truncate max-w-[80%]", 
                item.completed && "line-through opacity-70"
              )}>
                {item.name}
              </h4>
              
              {item.repeatOption && item.repeatOption !== 'none' && (
                <Badge variant="outline" className="text-xs">
                  {item.repeatOption}
                </Badge>
              )}
            </div>
            
            {/* Amount and notes */}
            <div className="mt-1">
              {item.amount && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Qty:</span> {item.amount}
                </p>
              )}
              
              {item.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {item.notes}
                </p>
              )}
            </div>
            
            {/* Action buttons */}
            {!batchMode && !readOnly && (
              <div className="flex gap-1 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="h-3.5 w-3.5 mr-1 opacity-70" />
                  Edit
                </Button>
                
                {hasImage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onImagePreview) onImagePreview();
                    }}
                  >
                    <Image className="h-3.5 w-3.5 mr-1 opacity-70" />
                    View
                  </Button>
                )}
              </div>
            )}
            
            {/* Image thumbnail */}
            {hasImage && (
              <div 
                className="mt-2 h-16 w-16 rounded-md bg-cover bg-center cursor-pointer overflow-hidden border"
                style={{ 
                  backgroundImage: `url(${item.imageUrl})` 
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onImagePreview) onImagePreview();
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShoppingItemCard;
