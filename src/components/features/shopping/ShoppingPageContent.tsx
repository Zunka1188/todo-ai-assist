
import React, { useState, useEffect } from 'react';
import { useShoppingItemsContext } from './ShoppingItemsContext';
import { useLayout } from '@/hooks/use-layout';
import PageHeader from '@/components/ui/page-header';
import ShoppingList from './ShoppingList';
import AddItemDialog from './AddItemDialog';
import FilterButtons from '@/components/features/shopping/FilterButtons';  // Fixed import path with absolute import
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

const ShoppingPageContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'one-off' | 'weekly' | 'monthly'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { isMobile } = useIsMobile();
  const layout = useLayout();
  const { addItem, isLoading } = useShoppingItemsContext();
  
  // Remove spacing property as it doesn't exist in the OptionsType
  const { containerClass, contentClass } = layout;
  
  const handleSaveItem = (item: any): boolean => {
    const result = addItem(item);
    if (result) {
      setIsAddDialogOpen(false);
      return true;
    }
    return false;
  };
  
  return (
    <div className={containerClass}>
      <PageHeader
        title="Shopping List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={true}
        onAddItem={() => setIsAddDialogOpen(true)}
        addItemLabel="+ Add Item"
      />
      
      <div className="mb-4">
        <FilterButtons
          activeFilter={filterMode}
          onFilterChange={setFilterMode}
        />
      </div>
      
      <div className={contentClass}>
        <ShoppingList
          searchTerm={searchTerm}
          filterMode={filterMode}
        />
      </div>

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default ShoppingPageContent;
