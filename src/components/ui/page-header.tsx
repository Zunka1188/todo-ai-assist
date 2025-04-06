
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import SearchInput from './search-input';
import { Button } from './button';
import { Plus, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  showAddButton?: boolean;
  onAddItem?: () => void;
  addItemLabel?: string;
  className?: string;
  extraActions?: React.ReactNode;
  rightContent?: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
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
  rightContent,
  showBackButton = true,
  backTo = '/'
}) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  
  return (
    <div className={cn("flex flex-col space-y-2 mb-6", className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(backTo)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {extraActions}
          {rightContent}
          
          {showAddButton && onAddItem && (
            <Button 
              onClick={onAddItem} 
              size={isMobile ? "sm" : "default"}
              className="bg-todo-purple hover:bg-todo-purple/90 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              {isMobile ? (addItemLabel.length > 10 ? 'Add' : addItemLabel.replace('+ ', '')) : addItemLabel}
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
