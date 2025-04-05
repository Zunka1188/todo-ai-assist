
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/ui/search-input';

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
}) => {
  return (
    <div className={`mb-4 flex flex-col gap-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Link to={backTo} className="p-1 rounded-md hover:bg-secondary touch-manipulation">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {showAddButton && onAddItem && (
          <Button 
            onClick={onAddItem}
            className="shrink-0"
          >
            {addItemLabel}
          </Button>
        )}
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
