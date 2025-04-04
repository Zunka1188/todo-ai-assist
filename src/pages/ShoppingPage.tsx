
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchInput from '@/components/ui/search-input';
import ShoppingList from '@/components/features/shopping/ShoppingList';
import AddItemDialog from '@/components/features/shopping/AddItemDialog';
import EditItemDialog from '@/components/features/shopping/EditItemDialog';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import DirectAddItem from '@/components/features/shopping/DirectAddItem'; // Import our test component
import { useDebugMode } from '@/hooks/useDebugMode'; // Import debug hook

const ShoppingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<{ id: string, name?: string, item?: any } | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { enabled: debugEnabled } = useDebugMode();
  
  // Get the tab from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['all', 'one-off', 'weekly', 'monthly'];
  const defaultTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'all';
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync tab with URL when URL changes
  useEffect(() => {
    const newTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'all';
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

  return (
    <div className="container mx-auto">
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Shopping List</h1>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="shrink-0"
          >
            + Add Item
          </Button>
        </div>
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search items"
          className="w-full"
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="one-off">One-off</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
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

      {/* Direct Add Test Component */}
      <DirectAddItem />

      {showAddDialog && (
        <AddItemDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
          onSave={() => {}} // Implement this based on your logic
        />
      )}

      {editItem && (
        <EditItemDialog 
          isOpen={true}
          onClose={handleCloseEditDialog}
          item={editItem.item}
          categories={[]}
          onSave={() => {}} // Implement this based on your logic
        />
      )}
    </div>
  );
};

export default ShoppingPage;
