
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, RefreshCw } from 'lucide-react';

interface ShoppingItemButtonProps {
  completed: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const ShoppingItemButton = ({ completed, onClick, className }: ShoppingItemButtonProps) => {
  return (
    <Button
      type="button"
      variant={completed ? "completed" : "active"} // Using semantic variants
      size="sm"
      className={cn(
        "flex items-center justify-center gap-2 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {completed ? (
        <>
          <RefreshCw size={16} />
          <span>Bring Back</span>
        </>
      ) : (
        <>
          <Check size={16} />
          <span>Mark as Purchased</span>
        </>
      )}
    </Button>
  );
};

export default ShoppingItemButton;
