
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Image as ImageIcon, Edit, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useIsMobile } from '@/hooks/use-mobile';

type ShoppingItemButtonProps = {
  name: string;
  completed: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | any) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onImagePreview?: () => void;
  quantity?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  imageUrl?: string | null;
  notes?: string;
  readOnly?: boolean;
  [key: string]: any; // Allow for additional props like ARIA attributes
}

const ShoppingItemButton: React.FC<ShoppingItemButtonProps> = ({
  name,
  completed,
  onClick,
  onEdit,
  onDelete,
  onImagePreview,
  quantity,
  repeatOption,
  imageUrl,
  notes,
  readOnly = false,
  ...rest
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isMobile } = useIsMobile();
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      setShowDeleteConfirm(false);
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error during item deletion:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleItemClick = (e: React.MouseEvent) => {
    if (isProcessing || readOnly) return;
    
    setIsProcessing(true);
    
    // Ensure we have proper timing for mobile devices
    setTimeout(() => {
      if (onClick) {
        onClick(e);
        console.log("Item click handler executed for:", name, "- Completed:", !completed);
      }
      setIsProcessing(false);
    }, isMobile ? 50 : 0); // Small delay for mobile
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent double triggers
    
    if (isProcessing || readOnly) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      if (onClick) {
        onClick(e);
        console.log("Checkbox click handler executed for:", name, "- Completed:", !completed);
      }
      setIsProcessing(false);
    }, isMobile ? 50 : 0);
  };

  return (
    <div className="group relative">
      <button
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
          completed ? "opacity-70 line-through" : "opacity-100",
        )}
        onClick={handleItemClick}
        disabled={isProcessing || readOnly}
        aria-busy={isProcessing}
        {...rest}
      >
        <div className="flex items-center">
          <Checkbox
            id={`item-${name}`}
            checked={completed}
            onCheckedChange={() => {
              if (!isProcessing && !readOnly) {
                // Create a synthetic mouse event or just call the handler directly
                if (onClick) {
                  onClick({} as any);
                  console.log("Checkbox click handler executed for:", name, "- Completed:", !completed);
                }
              }
            }}
            disabled={isProcessing || readOnly}
            aria-label={name}
          />
          <label
            htmlFor={`item-${name}`}
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            onClick={(e) => {
              // Help ensure click events propagate correctly on mobile
              if (isMobile) {
                e.preventDefault();
                handleCheckboxClick(e as unknown as React.MouseEvent);
              }
            }}
          >
            {name}
          </label>
        </div>
        {quantity && (
          <div className="text-xs text-muted-foreground">{quantity}</div>
        )}
      </button>

      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none focus:outline-none rounded-full p-1 hover:bg-secondary">
              <MoreHorizontal className="h-4 w-4" aria-label="Options" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 z-50 bg-background border">
            {imageUrl && (
              <DropdownMenuItem onClick={onImagePreview} aria-label="View Image">
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>View Image</span>
              </DropdownMenuItem>
            )}
            {imageUrl && <DropdownMenuSeparator />}
            {!readOnly && (
              <>
                <DropdownMenuItem onClick={onEdit} aria-label="Edit">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} className="text-red-500 focus:text-red-500" aria-label="Delete">
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
            {readOnly && (
              <DropdownMenuItem className="cursor-not-allowed" disabled>
                <Edit className="mr-2 h-4 w-4" />
                <span className="opacity-50">Edit (Read Only)</span>
              </DropdownMenuItem>
            )}
            {readOnly && (
              <DropdownMenuItem className="cursor-not-allowed" disabled>
                <Trash className="mr-2 h-4 w-4" />
                <span className="opacity-50">Delete (Read Only)</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {repeatOption && repeatOption !== 'none' && (
        <Badge
          variant="secondary"
          className="absolute bottom-1 left-1 pointer-events-none"
        >
          {repeatOption}
        </Badge>
      )}
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShoppingItemButton;
