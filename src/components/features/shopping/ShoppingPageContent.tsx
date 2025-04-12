
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import HeaderActions from '@/components/ui/header-actions';
import { useShoppingItemsContext } from './ShoppingItemsContext';
import ShoppingList from './ShoppingList';
import AddItemDialog from './AddItemDialog';
import FilterButtons from './FilterButtons';
import { useIsMobile } from '@/hooks/use-mobile';
import SearchInput from '@/components/ui/search-input';

const ShoppingPageContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'one-off' | 'weekly' | 'monthly'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();
  const { addItem, isLoading, updateSearchTerm, updateFilterMode } = useShoppingItemsContext();
  
  // Update context when filter changes
  useEffect(() => {
    updateFilterMode(filterMode);
  }, [filterMode, updateFilterMode]);
  
  // Update context when search changes
  useEffect(() => {
    updateSearchTerm(searchTerm);
  }, [searchTerm, updateSearchTerm]);
  
  const handleSaveItem = (item: any): boolean => {
    const result = addItem(item);
    if (result) {
      setIsAddDialogOpen(false);
      return true;
    }
    return false;
  };

  const headerActions = {
    primaryAction: {
      icon: Plus,
      label: "Add Item",
      shortLabel: "Add",
      onClick: () => setIsAddDialogOpen(true)
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div className="w-full sm:max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search shopping items..."
          />
        </div>
        <HeaderActions {...headerActions} />
      </div>
      
      <div className="mb-4">
        <FilterButtons
          activeFilter={filterMode}
          onFilterChange={setFilterMode}
        />
      </div>
      
      <ShoppingList
        searchTerm={searchTerm}
        filterMode={filterMode}
      />

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default ShoppingPageContent;
