
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Trash2, X } from 'lucide-react';

interface BatchOperationsToolbarProps {
  selectedCount: number;
  onMarkCompleted: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

const BatchOperationsToolbar: React.FC<BatchOperationsToolbarProps> = ({
  selectedCount,
  onMarkCompleted,
  onDelete,
  onCancel
}) => {
  return (
    <div className="bg-primary/10 rounded-md p-3 mb-4 flex flex-wrap gap-2 items-center justify-between animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1"
          onClick={onMarkCompleted}
          disabled={selectedCount === 0}
        >
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline">Mark Completed</span>
          <span className="inline sm:hidden">Complete</span>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="text-xs flex items-center gap-1"
          onClick={onDelete}
          disabled={selectedCount === 0}
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete Selected</span>
          <span className="inline sm:hidden">Delete</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cancel</span>
        </Button>
      </div>
    </div>
  );
};

export default BatchOperationsToolbar;
