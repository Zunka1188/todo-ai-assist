import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShoppingList from '@/components/features/shopping/ShoppingList';
import AddItemDialog from '@/components/features/shopping/AddItemDialog';
import EditItemDialog from '@/components/features/shopping/EditItemDialog';
import InviteDialog from '@/components/features/shopping/InviteDialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useShoppingItems } from '@/components/features/shopping/useShoppingItems';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import PageHeader from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import DirectAddItem from '@/components/features/shopping/DirectAddItem';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ShoppingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editItem, setEditItem] = useState<{ id: string, name?: string, item?: any } | null>(null);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { enabled: debugEnabled } = useDebugMode();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  // Create a separate instance of useShoppingItems to avoid state conflicts
  const { addItem } = useShoppingItems('all', '');
  
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['one-off', 'weekly', 'monthly', 'all'];
  const defaultTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'one-off';

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const newTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'one-off';
    console.log(`[DEBUG] ShoppingPage - URL tab param changed to: ${tabFromUrl}, setting active tab to: ${newTab}`);
    setActiveTab(newTab);
  }, [location.search, tabFromUrl]);

  // Check for invitation parameter and read-only mode
  useEffect(() => {
    const inviteParam = searchParams.get('invite');
    const modeParam = searchParams.get('mode');
    
    if (inviteParam) {
      // Verify if the invite link is still valid
      try {
        const storedLinks = localStorage.getItem('shoppingInviteLinks');
        if (storedLinks) {
          const links = JSON.parse(storedLinks);
          const matchingLink = links.find((link: any) => 
            link.id === inviteParam && link.isActive
          );
          
          if (matchingLink) {
            // Check if the link has expired
            if (matchingLink.expiresAt && new Date(matchingLink.expiresAt) < new Date()) {
              toast({
                title: "Invitation Expired",
                description: "This shopping list invitation has expired.",
                variant: "destructive"
              });
              return;
            }
            
            // Set read-only mode if specified
            setIsReadOnlyMode(modeParam === 'readonly');
            
            toast({
              title: isReadOnlyMode ? "View-only Access" : "Invitation Accepted",
              description: isReadOnlyMode 
                ? "You can view but not modify this shopping list" 
                : "You've joined a shared shopping list"
            });
          } else {
            toast({
              title: "Invalid Invitation",
              description: "This shopping list invitation is invalid or has been revoked.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("[ERROR] Error processing invitation:", error);
      }
      
      // Keep the tab parameter but remove the invitation parameters
      const newUrl = `${window.location.pathname}?tab=${activeTab}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, toast, activeTab]);

  const handleTabChange = (value: string) => {
    console.log(`[DEBUG] ShoppingPage - Tab changed to: ${value}`);
    setActiveTab(value);
    navigate(`/shopping?tab=${value}`, { replace: true });
  };

  const handleEditItem = (id: string, name?: string, item?: any) => {
    // Prevent editing in read-only mode
    if (isReadOnlyMode) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to edit items in this shared list.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("[DEBUG] ShoppingPage - Editing item:", id, name, item);
    setEditItem({ id, name, item });
  }

  const handleCloseEditDialog = () => {
    setEditItem(null);
  }

  const handleSaveItem = (item: any) => {
    // Prevent adding items in read-only mode
    if (isReadOnlyMode) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to add items to this shared list.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      console.log('[DEBUG] ShoppingPage - Adding item with data:', JSON.stringify(item, null, 2));
      
      // Make sure all required fields are included
      const itemToAdd = {
        name: item.name || 'Unnamed Item',
        amount: item.amount || '',
        price: item.price || '',
        // Use imageUrl from the item, falling back to file if needed
        imageUrl: item.imageUrl || item.file || null,
        notes: item.notes || '',
        repeatOption: item.repeatOption || 'none',
        category: item.category || '',
        dateToPurchase: item.dateToPurchase || '',
        completed: false // Always explicitly set completed to false
      };
      
      console.log('[DEBUG] ShoppingPage - Properly structured item to add:', JSON.stringify(itemToAdd, null, 2));
      
      // Call addItem with the structured data
      const result = addItem(itemToAdd);
      console.log('[DEBUG] ShoppingPage - Add item result:', result);
      
      if (result) {
        // Navigate to the appropriate tab if needed
        const targetTab = itemToAdd.repeatOption === 'weekly' 
          ? 'weekly' 
          : itemToAdd.repeatOption === 'monthly' 
            ? 'monthly' 
            : 'one-off';
            
        if (activeTab !== targetTab && activeTab !== 'all') {
          navigate(`/shopping?tab=${targetTab}`, { replace: true });
        }
        
        toast({
          title: "Item Added",
          description: `${item.name} has been added to your shopping list.`
        });
        
        return true;
      }
    } catch (error) {
      console.error("[ERROR] ShoppingPage - Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item to list",
        variant: "destructive"
      });
    }
    return false;
  }

  const handleUpdateItem = (updatedItem: any, imageFile: File | null) => {
    // Prevent updating in read-only mode
    if (isReadOnlyMode) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to update items in this shared list.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      if (!editItem || !editItem.id) return false;
      
      console.log("[DEBUG] ShoppingPage - Updating item:", JSON.stringify(updatedItem, null, 2));
      
      const itemData = {
        name: updatedItem.name,
        amount: updatedItem.amount,
        // Use imageUrl for consistency
        imageUrl: updatedItem.imageUrl || updatedItem.file || null,
        notes: updatedItem.notes,
        repeatOption: updatedItem.repeatOption || 'none',
        // Always preserve the completed state, don't override it during edit
        completed: editItem.item?.completed
      };
      
      // Update the existing item
      const result = addItem({
        ...itemData,
        id: editItem.id // Pass the ID to ensure it updates rather than creates new
      });
      
      if (result) {
        toast({
          title: "Item Updated",
          description: `${updatedItem.name} has been updated.`
        });
        return true;
      }
    } catch (error) {
      console.error("[ERROR] ShoppingPage - Error updating item:", error);
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
      <PageHeader 
        title="Shopping List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddItem={() => {
          if (isReadOnlyMode) {
            toast({
              title: "Read-only Mode",
              description: "You don't have permission to add items to this shared list.",
              variant: "destructive"
            });
            return;
          }
          console.log("[DEBUG] ShoppingPage - Add button clicked, setting showAddDialog to true");
          setShowAddDialog(true);
        }}
        addItemLabel="Add Item"
        showAddButton={!isReadOnlyMode}
        rightContent={
          <Button
            onClick={() => {
              if (isReadOnlyMode) {
                toast({
                  title: "Read-only Mode",
                  description: "You don't have permission to share this list further.",
                  variant: "destructive"
                });
                return;
              }
              setShowInviteDialog(true);
            }}
            size={isMobile ? "sm" : "default"}
            variant="secondary"
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            {isMobile ? "" : "Invite"}
          </Button>
        }
      />

      {isReadOnlyMode && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-xs">
          You are viewing this shopping list in read-only mode. You cannot add, edit, or mark items as completed.
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="one-off">One-off</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <div className={cn("pb-16", isMobile ? "pb-20" : "")}>
          <TabsContent value="all">
            <ShoppingList 
              searchTerm={searchTerm}
              filterMode="all"
              onEditItem={handleEditItem}
              readOnly={isReadOnlyMode}
            />
          </TabsContent>
          <TabsContent value="one-off">
            <ShoppingList 
              searchTerm={searchTerm}
              filterMode="one-off"
              onEditItem={handleEditItem}
              readOnly={isReadOnlyMode}
            />
          </TabsContent>
          <TabsContent value="weekly">
            <ShoppingList 
              searchTerm={searchTerm}
              filterMode="weekly"
              onEditItem={handleEditItem}
              readOnly={isReadOnlyMode}
            />
          </TabsContent>
          <TabsContent value="monthly">
            <ShoppingList 
              searchTerm={searchTerm}
              filterMode="monthly"
              onEditItem={handleEditItem}
              readOnly={isReadOnlyMode}
            />
          </TabsContent>
        </div>
      </Tabs>

      {debugEnabled && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-200 text-black p-1 text-xs z-50 opacity-80">
          <div>Tab from URL: "{tabFromUrl}", Active Tab: "{activeTab}"</div>
          <div>Current URL: {location.pathname}{location.search}</div>
          <div>Read-only: {isReadOnlyMode ? "Yes" : "No"}</div>
        </div>
      )}

      {/* Control dialog visibility directly with open prop */}
      <AddItemDialog 
        open={showAddDialog}
        onOpenChange={(open) => {
          console.log("[DEBUG] ShoppingPage - AddItemDialog onOpenChange called with value:", open);
          setShowAddDialog(open);
        }}
        onSave={handleSaveItem}
      />

      {/* Invite Dialog */}
      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      {editItem && editItem.item && (
        <EditItemDialog 
          isOpen={true}
          onClose={handleCloseEditDialog}
          onSave={handleUpdateItem}
          item={editItem.item}
        />
      )}

      {debugEnabled && <DirectAddItem />}
    </div>
  );
};

export default ShoppingPage;
