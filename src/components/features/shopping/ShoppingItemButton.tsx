
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Repeat, MoreVertical, Maximize2, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

interface ShoppingItemButtonProps {
  completed: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  quantity?: string;
  notes?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  name?: string;
  imageUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onImagePreview?: () => void;
}

const ShoppingItemButton = ({ 
  completed, 
  onClick, 
  className,
  quantity,
  notes,
  repeatOption,
  name,
  imageUrl,
  onEdit,
  onDelete,
  onImagePreview
}: ShoppingItemButtonProps) => {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (imageUrl) {
      e.stopPropagation();
      if (onImagePreview) {
        onImagePreview();
      } else {
        setImagePreviewOpen(true);
      }
    }
  };
  
  return (
    <div className={cn(
      "flex flex-col border-2 rounded-md overflow-hidden shadow-md w-full h-full",
      theme === 'dark' ? "border-zinc-700 bg-zinc-900" : "border-gray-200 bg-white"
    )}>
      {/* Header with item name */}
      <div className={cn(
        "border-b px-3 flex items-center justify-center",
        theme === 'dark' ? "border-zinc-700" : "border-gray-200",
        isMobile ? "h-6" : "h-10"
      )}>
        <h3 className={cn(
          "font-bold whitespace-nowrap overflow-hidden text-ellipsis text-center w-full",
          theme === 'dark' ? "text-zinc-100" : "text-gray-800",
          isMobile ? "text-xs" : "text-sm"
        )}>
          {name || "Unnamed Product"}
        </h3>
      </div>
      
      {/* Content area with image and details */}
      <div className="flex w-full">
        {/* Image area */}
        <div 
          className={cn(
            "flex-shrink-0 cursor-pointer",
            isMobile ? "w-[45px] h-[45px]" : "w-[80px] h-[80px]"
          )}
          onClick={handleImageClick}
          aria-label={imageUrl ? "View image" : "No image available"}
        >
          {imageUrl ? (
            <div 
              className={cn(
                "w-full h-full bg-cover bg-center",
                theme === 'dark' ? "border-zinc-700" : "border-gray-200"
              )}
              style={{ backgroundImage: `url(${imageUrl})` }}
              aria-hidden="true"
            />
          ) : (
            <div className={cn(
              "w-full h-full flex items-center justify-center",
              theme === 'dark' ? "bg-zinc-800" : "bg-gray-200"
            )} aria-hidden="true">
              <span className={cn(
                isMobile ? "text-xs" : "text-sm",
                theme === 'dark' ? "text-zinc-500" : "text-gray-500"
              )}>No image</span>
            </div>
          )}
        </div>
        
        {/* Details area */}
        <div className={cn(
          "flex flex-col justify-center h-full w-full relative",
          isMobile ? "h-[45px]" : "h-[80px]"
        )}>
          {/* Dropdown menu for actions */}
          {(onEdit || onDelete) && (
            <div className="absolute top-1 right-1 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      isMobile ? "h-6 w-6 p-0" : "h-8 w-8 p-0",
                      theme === 'dark' ? "text-zinc-400" : ""
                    )}
                  >
                    <MoreVertical className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                    <span className="sr-only">Actions menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  className={cn(
                    "z-50 min-w-[150px] shadow-md",
                    theme === 'dark' ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"
                  )}
                >
                  {imageUrl && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        if (onImagePreview) {
                          onImagePreview();
                        } else {
                          setImagePreviewOpen(true);
                        }
                      }}
                      className={theme === 'dark' ? "text-zinc-200 hover:bg-zinc-700" : ""}
                    >
                      <Maximize2 className="mr-2 h-4 w-4" />
                      View Image
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        onEdit();
                      }}
                      className={theme === 'dark' ? "text-zinc-200 hover:bg-zinc-700" : ""}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete();
                      }}
                      className={theme === 'dark' ? "text-zinc-200 hover:bg-zinc-700" : ""}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* Quantity display */}
          <div className={cn(
            "flex items-center",
            isMobile ? "h-[22px] pl-2 pr-5" : "h-[30px] pl-3 pr-5"
          )}>
            {quantity && (
              <div className={cn(
                "flex items-center",
                isMobile ? "text-xs" : "text-sm",
                "font-semibold",
                theme === 'dark' ? "text-zinc-100" : "text-gray-800"
              )}>
                <span>{quantity}</span>
              </div>
            )}
          </div>
          
          {/* Repeat option display */}
          <div className={cn(
            "flex items-center",
            isMobile ? "h-[22px] pl-2" : "h-[30px] pl-3"
          )}>
            {repeatOption && repeatOption !== 'none' && (
              <div className={cn(
                "flex items-center",
                isMobile ? "text-xs" : "text-sm",
                theme === 'dark' ? "text-zinc-200" : "text-gray-700"
              )}>
                <Repeat size={isMobile ? 10 : 14} className="mr-1" />
                <span>{repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action button at the bottom */}
      <button
        onClick={onClick}
        className={cn(
          "mt-auto flex items-center justify-center w-full border-t",
          theme === 'dark' ? "border-zinc-700" : "border-gray-200",
          "text-white font-semibold transition-colors",
          isMobile ? "h-[22px] text-xs" : "h-[32px] text-sm",
          completed 
            ? "bg-gray-500 hover:bg-gray-600" 
            : "bg-green-600 hover:bg-green-700",
        )}
        aria-label={completed ? "Mark as not purchased" : "Mark as purchased"}
      >
        {completed ? (
          <>
            <Check size={isMobile ? 14 : 16} className="mr-2" />
            <span>Purchased</span>
          </>
        ) : (
          <span>Purchase</span>
        )}
      </button>

      {/* Image preview dialog */}
      {!onImagePreview && (
        <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
          <DialogContent className={cn(
            "max-w-4xl p-0 overflow-hidden",
            theme === 'dark' ? "bg-zinc-900 border-zinc-700" : "bg-white"
          )}>
            <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={name || "Product image"} 
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ShoppingItemButton;
