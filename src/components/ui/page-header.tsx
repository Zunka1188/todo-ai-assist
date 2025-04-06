
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import SearchInput from './search-input';
import { Button } from './button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  showAddButton?: boolean;
  onAddItem?: () => void;
  addItemLabel?: string;
  className?: string;
  extraActions?: React.ReactNode;
  rightContent?: React.ReactNode; // Added this property
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  searchTerm,
  onSearchChange,
  showAddButton = true,
  onAddItem,
  addItemLabel = 'Add New',
  className,
  extraActions,
  rightContent // Added this parameter
}) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div className={cn("flex flex-col space-y-2 mb-6", className)}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        
        <div className="flex items-center gap-2">
          {extraActions}
          {rightContent} {/* Render the rightContent if provided */}
          
          {showAddButton && onAddItem && (
            <Button 
              onClick={onAddItem} 
              size={isMobile ? "sm" : "default"}
              className="bg-todo-purple hover:bg-todo-purple/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isMobile && addItemLabel.length > 10 ? '+' : addItemLabel}
            </Button>
          )}
        </div>
      </div>

      {onSearchChange && (
        <div className="w-full sm:max-w-sm">
          <SearchInput
            value={searchTerm || ''}
            onChange={(value) => onSearchChange(value)}
            placeholder={`Search ${title.toLowerCase()}...`}
          />
        </div>
      )}
    </div>
  );
};

export default PageHeader;
