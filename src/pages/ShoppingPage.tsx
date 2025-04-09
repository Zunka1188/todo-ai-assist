import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShoppingList from '@/components/features/shopping/ShoppingList';
import AddItemDialog from '@/components/features/shopping/AddItemDialog';
import EditItemDialog from '@/components/features/shopping/EditItemDialog';
import InviteDialog from '@/components/features/shopping/InviteDialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDebugMode } from '@/hooks/useDebugMode';
import { ShoppingItemsProvider, useShoppingItemsContext } from '@/components/features/shopping/ShoppingItemsContext';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import PageHeader from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import DirectAddItem from '@/components/features/shopping/DirectAddItem';
import { Users, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { compressImage } from '@/utils/imageProcessing';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useDebounce } from '@/hooks/useDebounce';

const STORAGE_KEY_INVITE_ACCEPTED = 'shoppingInviteAccepted';
const STORAGE_KEY_READ_ONLY_MODE = 'shoppingReadOnlyMode';
const STORAGE_KEY_INVITE_LINKS = 'shoppingInviteLinks';

const uploadImage = async (imageFile: File) => {
  try {
    const compressedImage = await compressImage(imageFile);
    const formData = new FormData();
    formData.append('image', compressedImage);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const ShoppingPageContent: React.FC = () => {
  const [rawSearchTerm, setRawSearchTerm] = useState<string>('');
  const searchTerm = useDebounce(rawSearchTerm, 300);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editItem, setEditItem] = useState<{ id: string, name?: string, item?: any } | null>(null);
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { enabled: debugEnabled } = useDebugMode();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  const { addItem, updateItem, removeItem, updateFilterMode, isLoading: itemsLoading } = useShoppingItemsContext();

  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['one-off', 'weekly', 'monthly', 'all'];
  const defaultTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'one-off';

  const [activeTab, setActiveTab] = useState(defaultTab);

  const memoizedToast = useCallback(toast, [toast]);

  const storeInvitationStatus = useCallback((isReadOnly: boolean) => {
    localStorage.setItem(STORAGE_KEY_INVITE_ACCEPTED, 'true');
    localStorage.setItem(STORAGE_KEY_READ_ONLY_MODE, isReadOnly ? 'true' : 'false');
  }, []);

  useEffect(() => {
    const storedInviteAccepted = localStorage.getItem(STORAGE_KEY_INVITE_ACCEPTED);
    const storedReadOnlyMode = localStorage.getItem(STORAGE_KEY_READ_ONLY_MODE);
    
    if (storedInviteAccepted === 'true') {
      const newReadOnlyMode = storedReadOnlyMode === 'true';
      console.log(`[DEBUG] ShoppingPage - Setting read-only mode from localStorage: ${newReadOnlyMode}`);
      setIsReadOnlyMode(newReadOnlyMode);
    }
  }, []);

  useEffect(() => {
    const newTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'one-off';
    console.log(`[DEBUG] ShoppingPage - URL tab param changed to: ${tabFromUrl}, setting active tab to: ${newTab}`);
    setActiveTab(newTab);
    updateFilterMode(newTab as any);
  }, [location.search, tabFromUrl, updateFilterMode]);

  useEffect(() => {
    const inviteParam = searchParams.get('invite');
    const modeParam = searchParams.get('mode');
    
    if (inviteParam) {
      try {
        const storedLinks = localStorage.getItem(STORAGE_KEY_INVITE_LINKS);
        if (storedLinks) {
          const links = JSON.parse(storedLinks);
          const matchingLink = links.find((link: any) => 
            link.id === inviteParam && link.isActive
          );
          
          if (matchingLink) {
            if (matchingLink.expiresAt && new Date(matchingLink.expiresAt) < new Date()) {
              memoizedToast({
                title: "Invitation Expired",
                description: "This shopping list invitation has expired.",
                variant: "destructive"
              });
              return;
            }
            
            const isReadOnly = modeParam === 'readonly';
            console.log(`[DEBUG] ShoppingPage - Setting read-only mode from invitation: ${isReadOnly}`);
            setIsReadOnlyMode(isReadOnly);
            storeInvitationStatus(isReadOnly);
            
            memoizedToast({
              title: isReadOnly ? "View-only Access" : "Invitation Accepted",
              description: isReadOnly 
                ? "You can view but not modify this shopping list" 
                : "You've joined a shared shopping list",
              role: "status",
              "aria-live": "polite"
            });
          } else {
            memoizedToast({
              title: "Invalid Invitation",
              description: "This shopping list invitation is invalid or has been revoked.",
              variant: "destructive",
              role: "alert",
              "aria-live": "assertive"
            });
          }
        }
      } catch (error) {
        console.error("[ERROR] ShoppingPage - Error processing invitation:", error);
      }
      
      const newUrl = `${window.location.pathname}?tab=${activeTab}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search, memoizedToast, activeTab, storeInvitationStatus]);

  const handleTabChange = (value: string) => {
    console.log(`[DEBUG] ShoppingPage - Tab changed to: ${value}`);
    setActiveTab(value);
    updateFilterMode(value as any);
    navigate(`/shopping?tab=${value}`, { replace: true });
  };

  const handleEditItem = (id: string, name?: string, item?: any) => {
    if (isReadOnlyMode) {
      memoizedToast({
        title: "Read-only Mode",
        description: "You don't have permission to edit items in this shared list.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      return;
    }
    
    console.log("[DEBUG] ShoppingPage - Editing item:", id, name, item);
    setEditItem({ id, name, item });
  }

  const handleCloseEditDialog = () => {
    setEditItem(null);
  }

  const handleSaveItem = async (item: any) => {
    if (isReadOnlyMode) {
      memoizedToast({
        title: "Read-only Mode",
        description: "You don't have permission to add items to this shared list.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      return false;
    }
    
    if (isProcessing) {
      return false;
    }
    
    setIsProcessing(true);
    
    try {
      console.log('[DEBUG] ShoppingPage - Adding item with data:', JSON.stringify(item, null, 2));
      
      let imageUrl = null;
      if (item.file && item.file instanceof File) {
        try {
          imageUrl = await uploadImage(item.file);
        } catch (error) {
          memoizedToast({
            title: "Image Upload Failed",
            description: "Failed to upload image, but we'll continue adding the item.",
            variant: "destructive",
            role: "alert",
            "aria-live": "assertive"
          });
        }
      } else if (item.imageUrl) {
        imageUrl = item.imageUrl;
      }
      
      const itemToAdd = {
        name: item.name || 'Unnamed Item',
        amount: item.amount || '',
        price: item.price || '',
        imageUrl: imageUrl,
        notes: item.notes || '',
        repeatOption: item.repeatOption || 'none',
        category: item.category || '',
        dateToPurchase: item.dateToPurchase || '',
        completed: false
      };
      
      console.log('[DEBUG] ShoppingPage - Properly structured item to add:', JSON.stringify(itemToAdd, null, 2));
      
      const result = addItem(itemToAdd);
      console.log('[DEBUG] ShoppingPage - Add item result:', result);
      
      if (result) {
        const targetTab = itemToAdd.repeatOption === 'weekly' 
          ? 'weekly' 
          : itemToAdd.repeatOption === 'monthly' 
            ? 'monthly' 
            : 'one-off';
            
        if (activeTab !== targetTab && activeTab !== 'all') {
          navigate(`/shopping?tab=${targetTab}`, { replace: true });
        }
        
        memoizedToast({
          title: "Item Added",
          description: `${item.name} has been added to your shopping list.`,
          role: "status",
          "aria-live": "polite"
        });
        
        return true;
      } else {
        memoizedToast({
          title: "Failed to Add Item",
          description: "The item could not be added to your shopping list.",
          variant: "destructive",
          role: "alert",
          "aria-live": "assertive"
        });
        return false;
      }
    } catch (error) {
      console.error("[ERROR] ShoppingPage - Error adding item:", error);
      memoizedToast({
        title: "Error",
        description: "Failed to add item to list",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }

  const handleUpdateItem = async (updatedItem: any) => {
    if (isReadOnlyMode) {
      memoizedToast({
        title: "Read-only Mode",
        description: "You don't have permission to update items in this shared list.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      return false;
    }
    
    if (!editItem || !editItem.id || isProcessing) return false;
    
    setIsProcessing(true);
    
    try {
      console.log("[DEBUG] ShoppingPage - Updating item:", JSON.stringify(updatedItem, null, 2));
      
      let imageUrl = null;
      if (updatedItem.file && updatedItem.file instanceof File) {
        try {
          imageUrl = await uploadImage(updatedItem.file);
        } catch (error) {
          memoizedToast({
            title: "Image Upload Failed",
            description: "Failed to upload image, but we'll continue updating the item.",
            variant: "destructive",
            role: "alert",
            "aria-live": "assertive"
          });
        }
      } else if (updatedItem.imageUrl) {
        imageUrl = updatedItem.imageUrl;
      }
      
      const itemData = {
        name: updatedItem.name,
        amount: updatedItem.amount,
        imageUrl: imageUrl,
        notes: updatedItem.notes,
        repeatOption: updatedItem.repeatOption || 'none',
        completed: editItem.item?.completed
      };
      
      const result = updateItem(editItem.id, itemData);
      
      if (result) {
        memoizedToast({
          title: "Item Updated",
          description: `${updatedItem.name} has been updated.`,
          role: "status",
          "aria-live": "polite"
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("[ERROR] ShoppingPage - Error updating item:", error);
      memoizedToast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }

  const handleDeleteItem = (id: string) => {
    if (isReadOnlyMode) {
      memoizedToast({
        title: "Read-only Mode",
        description: "You don't have permission to delete items in this shared list.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      return;
    }
    
    console.log("[DEBUG] ShoppingPage - Preparing to delete item ID:", id);
    setItemToDeleteId(id);
    setShowConfirmDialog(true);
  };

  const confirmDeleteItem = async () => {
    if (isProcessing || !itemToDeleteId) {
      console.log("[DEBUG] ShoppingPage - Prevented duplicate delete execution or missing itemToDeleteId");
      return;
    }
    
    console.log("[DEBUG] ShoppingPage - Confirming deletion of item ID:", itemToDeleteId);
    setIsProcessing(true);
    
    try {
      const result = removeItem(itemToDeleteId);
      
      if (result) {
        memoizedToast({
          title: "Item Deleted",
          description: "The item has been removed from your shopping list.",
          role: "status",
          "aria-live": "polite"
        });
      } else {
        memoizedToast({
          title: "Error",
          description: "Failed to delete the item.",
          variant: "destructive",
          role: "alert",
          "aria-live": "assertive"
        });
      }
    } catch (error) {
      console.error("[ERROR] ShoppingPage - Error deleting item:", error);
      memoizedToast({
        title: "Error",
        description: "Failed to delete the item.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    } finally {
      setShowConfirmDialog(false);
      setItemToDeleteId(null);
      setIsProcessing(false);
    }
  };

  const cancelDeleteItem = () => {
    console.log("[DEBUG] ShoppingPage - Delete operation canceled");
    setShowConfirmDialog(false);
    setItemToDeleteId(null);
  };

  const MemoizedShoppingList = useMemo(() => (
    <ShoppingList 
      searchTerm={searchTerm}
      filterMode={activeTab as any}
      onEditItem={handleEditItem}
      readOnly={isReadOnlyMode}
    />
  ), [searchTerm, activeTab, handleEditItem, isReadOnlyMode]);

  if (itemsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your shopping list...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Shopping List"
        searchTerm={rawSearchTerm}
        onSearchChange={setRawSearchTerm}
        onAddItem={() => {
          if (isReadOnlyMode) {
            memoizedToast({
              title: "Read-only Mode",
              description: "You don't have permission to add items to this shared list.",
              variant: "destructive",
              role: "alert",
              "aria-live": "assertive"
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
                memoizedToast({
                  title: "Read-only Mode",
                  description: "You don't have permission to share this list further.",
                  variant: "destructive",
                  role: "alert",
                  "aria-live": "assertive"
                });
                return;
              }
              setShowInviteDialog(true);
            }}
            size={isMobile ? "sm" : "default"}
            variant="secondary"
            className="flex items-center gap-1"
            aria-label="Invite others to your shopping list"
            disabled={isProcessing}
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            {isMobile ? "" : "Invite"}
          </Button>
        }
      />

      {isReadOnlyMode && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-xs md:text-sm" role="status">
          <div className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>You are viewing this shopping list in read-only mode. You cannot add, edit, or mark items as completed.</span>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList 
          className={cn(
            "w-full grid mb-6 gap-1",
            "grid-cols-2 sm:grid-cols-4",
          )}
          role="tablist" 
          aria-label="Shopping list categories"
        >
          <TabsTrigger 
            value="one-off" 
            className="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis px-1 h-12 md:h-10"
            aria-controls={`tabpanel-one-off`}
          >
            {isMobile ? "One-off" : "One-off Items"}
          </TabsTrigger>
          <TabsTrigger 
            value="weekly" 
            className="text-sm px-1 h-12 md:h-10"
            aria-controls={`tabpanel-weekly`}
          >
            Weekly
          </TabsTrigger>
          <TabsTrigger 
            value="monthly" 
            className="text-sm px-1 h-12 md:h-10"
            aria-controls={`tabpanel-monthly`}
          >
            Monthly
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="text-sm px-1 h-12 md:h-10"
            aria-controls={`tabpanel-all`}
          >
            {isMobile ? "All" : "All Items"}
          </TabsTrigger>
        </TabsList>
        
        <div className={cn("pb-16", isMobile ? "pb-20" : "")}>
          <TabsContent value="all" id="tabpanel-all" role="tabpanel" aria-labelledby="tab-all">
            {MemoizedShoppingList}
          </TabsContent>
          <TabsContent value="one-off" id="tabpanel-one-off" role="tabpanel" aria-labelledby="tab-one-off">
            {MemoizedShoppingList}
          </TabsContent>
          <TabsContent value="weekly" id="tabpanel-weekly" role="tabpanel" aria-labelledby="tab-weekly">
            {MemoizedShoppingList}
          </TabsContent>
          <TabsContent value="monthly" id="tabpanel-monthly" role="tabpanel" aria-labelledby="tab-monthly">
            {MemoizedShoppingList}
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

      <AddItemDialog 
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open && !isProcessing) {
            console.log("[DEBUG] ShoppingPage - AddItemDialog onOpenChange called with value:", open);
            setShowAddDialog(open);
          }
        }}
        onSave={handleSaveItem}
      />

      <InviteDialog
        open={showInviteDialog}
        onOpenChange={(open) => {
          if (!open && !isProcessing) {
            setShowInviteDialog(open);
          }
        }}
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

      <AlertDialog 
        open={showConfirmDialog} 
        onOpenChange={(open) => {
          if (!open && !isProcessing) {
            cancelDeleteItem();
          }
          setShowConfirmDialog(open);
        }}
      >
        <AlertDialogContent aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <AlertDialogHeader>
            <AlertDialogTitle id="alert-dialog-title">Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription id="alert-dialog-description">
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={cancelDeleteItem}
              disabled={isProcessing}
              aria-label="Cancel deletion"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteItem}
              disabled={isProcessing}
              aria-label="Confirm deletion"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const ShoppingPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <ShoppingItemsProvider>
        <ShoppingPageContent />
      </ShoppingItemsProvider>
    </ErrorBoundary>
  );
};

export default ShoppingPage;
