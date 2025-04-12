
import React from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  onAddItem: (e: React.MouseEvent) => void;
  showAddButton?: boolean;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  onAddItem, 
  showAddButton = true,
  message = "Add your first document to get started"
}) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-muted p-6 w-20 h-20 flex items-center justify-center">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className={cn("mt-4 text-lg font-medium", isMobile ? "text-[0.95rem]" : "")}>
        No documents found
      </h3>
      <p className={cn("text-sm text-muted-foreground mt-1", isMobile ? "text-[0.8rem]" : "")}>
        {message}
      </p>
      
      {showAddButton && (
        <Button 
          onClick={onAddItem} 
          className="mt-6 bg-primary hover:bg-primary/90"
          size={isMobile ? "sm" : "default"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
