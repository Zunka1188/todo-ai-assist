
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/ui/search-input';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageHeaderProps {
  title: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onAddItem?: () => void;
  addItemLabel?: string;
  showBackButton?: boolean;
  backTo?: string;
  showSearch?: boolean;
  showAddButton?: boolean;
  className?: string;
  rightContent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  searchTerm = '',
  onSearchChange,
  onAddItem,
  addItemLabel = '+ Add Item',
  showBackButton = true,
  backTo = '/',
  showSearch = true,
  showAddButton = true,
  className = '',
  rightContent,
}) => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  const textClass = theme === 'dark' ? 'text-white' : 'text-foreground';
  
  return (
    <div className={cn('mb-4 flex flex-col gap-4', className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Link to={backTo} className="p-1 rounded-md hover:bg-secondary touch-manipulation">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <h1 className={cn(
            isMobile ? "text-[20px] font-bold" : "text-2xl font-bold", // 20px for mobile headings
            textClass
          )}>
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {rightContent}
          {showAddButton && onAddItem && (
            <Button 
              onClick={onAddItem}
              className="shrink-0"
            >
              {addItemLabel}
            </Button>
          )}
        </div>
      </div>
      {showSearch && onSearchChange && (
        <SearchInput 
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={`Search ${title.toLowerCase()}`}
          className="w-full"
        />
      )}
    </div>
  );
};

export default PageHeader;
