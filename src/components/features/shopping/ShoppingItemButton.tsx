
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ShoppingItemButtonProps {
  completed: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

const ShoppingItemButton = ({ completed, onClick, className }: ShoppingItemButtonProps) => {
  return (
    <Button
      type="button"
      variant={completed ? "completed" : "active"} // Using semantic variants for better readability
      size="sm"
      className={cn(
        "flex items-center justify-center gap-2 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {completed ? (
        <>
          <Check size={16} />
          <span>Purchased</span>
        </>
      ) : (
        <span>Mark as Purchased</span>
      )}
    </Button>
  );
};

export default ShoppingItemButton;
