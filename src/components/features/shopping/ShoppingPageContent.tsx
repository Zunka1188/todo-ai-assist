
import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import HeaderActions from '@/components/ui/header-actions';
import { useShoppingItemsContext } from './ShoppingItemsContext';
import ShoppingList from './ShoppingList';
import AddItemDialog from './AddItemDialog';
import FilterButtons from './FilterButtons';
import { useIsMobile } from '@/hooks/use-mobile';
import SearchInput from '@/components/ui/search-input';
import ResponsiveContainer from '@/components/ui/responsive-container';
import LoadingState from './LoadingState';
import EmptyState from '@/components/ui/empty-state';
import ContentGrid from '@/components/ui/content-grid';
import ShoppingTabsSection from './ShoppingTabsSection';

const ShoppingPageContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'one-off' | 'weekly' | 'monthly'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { isMobile } = useIsMobile();
  const { 
    addItem, 
    isLoading, 
    updateSearchTerm, 
    updateFilterMode, 
    notPurchasedItems, 
    purchasedItems 
  } = useShoppingItemsContext();
  
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilterMode(value as 'all' | 'one-off' | 'weekly' | 'monthly');
  };

  const headerActions = {
    primaryAction: {
      icon: Plus,
      label: "Add Item",
      shortLabel: "Add",
      onClick: () => setIsAddDialogOpen(true)
    }
  };
  
  // Show loading state when data is loading
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <ResponsiveContainer direction="column" gap="md" mobileFullWidth={true} className="w-full">
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
      
      {/* Always show the tabs section */}
      <div className="mb-4">
        <ShoppingTabsSection
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          searchTerm={searchTerm}
          readOnly={false}
        />
      </div>
      
      {/* Show empty state when there are no items and no search filter */}
      {notPurchasedItems.length === 0 && purchasedItems.length === 0 && !searchTerm && (
        <EmptyState 
          icon={<ShoppingBag />}
          title="Your shopping list is empty"
          description="Add items to your shopping list to get started"
          actionLabel="Add Item"
          onAction={() => setIsAddDialogOpen(true)}
          centered={true}
        />
      )}

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleSaveItem}
      />
    </ResponsiveContainer>
  );
};

export default ShoppingPageContent;
