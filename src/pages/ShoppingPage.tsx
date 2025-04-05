
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShoppingList from '@/components/features/shopping/ShoppingList';
import AddItemDialog from '@/components/features/shopping/AddItemDialog';
import EditItemDialog from '@/components/features/shopping/EditItemDialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useShoppingItems } from '@/components/features/shopping/useShoppingItems';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import PageHeader from '@/components/ui/page-header';
import { useCategoriesManager } from '@/components/features/shopping/useCategoriesManager';

const ShoppingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<{ id: string, name?: string, item?: any } | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { enabled: debugEnabled } = useDebugMode();
  const { toast } = useToast();
  const { updateItem, addItem } = useShoppingItems('all', '');
  const { isMobile } = useIsMobile();
  const { categories } = useCategoriesManager();
  
  // Get the tab from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  // Updated valid tabs order - "All" moved to the end
  const validTabs = ['one-off', 'weekly', 'monthly', 'all'];
  const defaultTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'one-off'; // Default changed to one-off
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync tab with URL when URL changes
  useEffect(() => {
    const newTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'one-off'; // Default changed to one-off
    console.log(`URL tab param changed to: ${tabFromUrl}, setting active tab to: ${newTab}`);
    setActiveTab(newTab);
  }, [location.search, tabFromUrl]);

  // When tab changes, update the URL
  const handleTabChange = (value: string) => {
    console.log(`Tab changed to: ${value}`);
    setActiveTab(value);
    navigate(`/shopping?tab=${value}`, { replace: true });
  };

  const handleEditItem = (id: string, name?: string, item?: any) => {
    setEditItem({ id, name, item });
  }

  const handleCloseEditDialog = () => {
    setEditItem(null);
  }

  // Handler for saving items
  const handleSaveItem = (item: any) => {
    try {
      const result = addItem({
        name: item.name,
        amount: item.amount,
        price: item.price,
        imageUrl: item.file,
        notes: item.notes,
        repeatOption: item.repeatOption || 'none',
        category: item.category || categories[0]
      });

      if (result) {
        toast({
          title: "Item Added",
          description: `${item.name} has been added to your shopping list.`
        });
        return true;
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item to list",
        variant: "destructive"
      });
    }
    return false;
  }

  // Handler for updating items
  const handleUpdateItem = (updatedItem: any, imageFile: File | null) => {
    try {
      if (!editItem || !editItem.id) return false;
      
      // Prepare the data for update
      const itemData = {
        name: updatedItem.name,
        amount: updatedItem.amount,
        imageUrl: updatedItem.imageUrl,
        notes: updatedItem.notes,
        repeatOption: updatedItem.repeatOption || 'none',
        category: updatedItem.category
      };
      
      const result = updateItem(editItem.id, itemData);
      
      if (result) {
        toast({
          title: "Item Updated",
          description: `${updatedItem.name} has been updated.`
        });
        return true;
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
    return false;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Using our new PageHeader component */}
      <PageHeader 
        title="Shopping List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddItem={() => setShowAddDialog(true)}
        addItemLabel="+ Add Item"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="one-off">One-off</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ShoppingList 
            searchTerm={searchTerm}
            filterMode="all"
            onEditItem={handleEditItem}
          />
        </TabsContent>
        <TabsContent value="one-off">
          <ShoppingList 
            searchTerm={searchTerm}
            filterMode="one-off"
            onEditItem={handleEditItem}
          />
        </TabsContent>
        <TabsContent value="weekly">
          <ShoppingList 
            searchTerm={searchTerm}
            filterMode="weekly"
            onEditItem={handleEditItem}
          />
        </TabsContent>
        <TabsContent value="monthly">
          <ShoppingList 
            searchTerm={searchTerm}
            filterMode="monthly"
            onEditItem={handleEditItem}
          />
        </TabsContent>
      </Tabs>

      {/* Current URL Debugging Info (only shown in debug mode) */}
      {debugEnabled && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-200 text-black p-1 text-xs z-50 opacity-80">
          <div>Tab from URL: "{tabFromUrl}", Active Tab: "{activeTab}"</div>
          <div>Current URL: {location.pathname}{location.search}</div>
        </div>
      )}

      {/* Add Item Dialog */}
      {showAddDialog && (
        <AddItemDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
          onSave={handleSaveItem}
        />
      )}

      {/* Edit Item Dialog - now using the proper EditItemDialog component */}
      {editItem && editItem.item && (
        <EditItemDialog 
          isOpen={true}
          onClose={handleCloseEditDialog}
          onSave={handleUpdateItem}
          item={editItem.item}
          categories={categories.filter(c => c !== 'All')}
        />
      )}
    </div>
  );
};

export default ShoppingPage;
