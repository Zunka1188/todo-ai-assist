
import React from 'react';

interface EmptyStateProps {
  searchTerm: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  searchTerm, 
  icon,
  title, 
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[40vh]" role="status">
      {icon && <div className="mb-4">{icon}</div>}
      <p className="text-muted-foreground mb-2">{title || "No items found"}</p>
      <p className="text-sm text-muted-foreground">
        {description || (searchTerm ? "Try a different search term" : "Add an item to get started")}
      </p>
      {actionLabel && onAction && (
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90" 
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
