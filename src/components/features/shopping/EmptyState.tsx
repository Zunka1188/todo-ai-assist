
import React from 'react';

interface EmptyStateProps {
  searchTerm: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchTerm }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[40vh]" role="status">
      <p className="text-muted-foreground mb-2">No items found</p>
      <p className="text-sm text-muted-foreground">
        {searchTerm ? "Try a different search term" : "Add an item to get started"}
      </p>
    </div>
  );
};

export default EmptyState;
