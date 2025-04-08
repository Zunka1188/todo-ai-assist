import React from 'react';
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Image as ImageIcon, Edit, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type ShoppingItemButtonProps = {
  name: string;
  completed: boolean;
  onClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onImagePreview?: () => void;
  quantity?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  imageUrl?: string | null;
  notes?: string;
  readOnly?: boolean;
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
  readOnly = false
}) => {
  return (
    <div className="group relative">
      <button
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
          completed ? "opacity-70 line-through" : "opacity-100",
        )}
        onClick={onClick}
        disabled={readOnly}
      >
        <div className="flex items-center">
          <Checkbox
            id={`item-${name}`}
            checked={completed}
            onCheckedChange={onClick}
            disabled={readOnly}
            aria-label={name}
          />
          <label
            htmlFor={`item-${name}`}
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
          <DropdownMenuContent align="end" className="w-40">
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
                <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500" aria-label="Delete">
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
    </div>
  );
};

export default ShoppingItemButton;
