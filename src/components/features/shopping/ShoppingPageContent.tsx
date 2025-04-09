
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/use-toast';
import { useShoppingItemsContext } from './ShoppingItemsContext';
import { compressImage } from '@/utils/imageProcessing';
import ShoppingPageHeader from './ShoppingPageHeader';
import ShoppingTabsSection from './ShoppingTabsSection';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import AddItemDialog from './AddItemDialog';
import EditItemDialog from './EditItemDialog';
import InviteDialog from './InviteDialog';
import { setupMobilePersistence } from '@/services/shoppingService';

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
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  const { 
    addItem, 
    updateItem, 
    removeItem, 
    updateFilterMode, 
    isLoading: itemsLoading, 
    notPurchasedItems, 
    purchasedItems 
  } = useShoppingItemsContext();

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

  const handleSaveItem = (item: any): boolean | void => {
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
      
      if (item.file && item.file instanceof File) {
        uploadImage(item.file)
          .then(url => {
            proceedWithSave(item, url);
          })
          .catch(error => {
            memoizedToast({
              title: "Image Upload Failed",
              description: "Failed to upload image, but we'll continue adding the item.",
              variant: "destructive",
              role: "alert",
              "aria-live": "assertive"
            });
            proceedWithSave(item, null);
          });
          
        return true;
      } else {
        proceedWithSave(item, item.imageUrl);
        return true;
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
      setIsProcessing(false);
      return false;
    }
  }
  
  const proceedWithSave = (item: any, imageUrl: string | null) => {
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
      
      // Enhanced mobile persistence - extra forced sync with multiple attempts
      if (isMobile) {
        try {
          // Special handling for mobile - explicit persist with multiple attempts
          const allItems = [...notPurchasedItems, ...purchasedItems];
          if (result && !allItems.find(i => i.id === result.id)) {
            allItems.push(result);
          }
          
          // First attempt - immediate
          localStorage.setItem('shoppingItems', JSON.stringify(allItems));
          
          // Secondary attempts with timeouts for better reliability
          setTimeout(() => {
            try {
              localStorage.setItem('shoppingItems', JSON.stringify(allItems));
              console.log('[DEBUG] ShoppingPage - Secondary mobile sync attempt');
            } catch (err) {
              console.error('[ERROR] ShoppingPage - Failed secondary mobile sync:', err);
            }
          }, 100);
          
          // Final attempt with longer timeout
          setTimeout(() => {
            try {
              localStorage.setItem('shoppingItems', JSON.stringify(allItems));
              console.log('[DEBUG] ShoppingPage - Final mobile sync attempt');
            } catch (err) {
              console.error('[ERROR] ShoppingPage - Failed final mobile sync:', err);
            }
          }, 500);
          
          console.log('[DEBUG] ShoppingPage - Forced multiple mobile syncs after add');
        } catch (err) {
          console.error('[ERROR] ShoppingPage - Failed to force mobile sync:', err);
          // Last resort attempt
          try {
            setTimeout(() => {
              const allItems = [...notPurchasedItems, ...purchasedItems];
              localStorage.setItem('shoppingItems', JSON.stringify(allItems));
            }, 1000);
          } catch (finalErr) {
            console.error('[ERROR] ShoppingPage - All sync attempts failed:', finalErr);
          }
        }
      }
      
      memoizedToast({
        title: "Item Added",
        description: `${item.name} has been added to your shopping list.`,
        role: "status",
        "aria-live": "polite"
      });
      
      setShowAddDialog(false);
    } else {
      memoizedToast({
        title: "Failed to Add Item",
        description: "The item could not be added to your shopping list.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
    
    setIsProcessing(false);
  }

  const handleUpdateItem = (updatedItem: any): boolean | void => {
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
      
      if (updatedItem.file && updatedItem.file instanceof File) {
        uploadImage(updatedItem.file)
          .then(url => {
            proceedWithUpdate(updatedItem, url);
          })
          .catch(error => {
            memoizedToast({
              title: "Image Upload Failed",
              description: "Failed to upload image, but we'll continue updating the item.",
              variant: "destructive",
              role: "alert",
              "aria-live": "assertive"
            });
            proceedWithUpdate(updatedItem, updatedItem.imageUrl);
          });
          
        return true;
      } else {
        proceedWithUpdate(updatedItem, updatedItem.imageUrl);
        return true;
      }
    } catch (error) {
      console.error("[ERROR] ShoppingPage - Error updating item:", error);
      memoizedToast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      setIsProcessing(false);
      return false;
    }
  }
  
  const proceedWithUpdate = (updatedItem: any, imageUrl: string | null) => {
    const itemData = {
      name: updatedItem.name,
      amount: updatedItem.amount,
      imageUrl: imageUrl,
      notes: updatedItem.notes,
      repeatOption: updatedItem.repeatOption || 'none',
      completed: editItem?.item?.completed
    };
    
    const result = updateItem(editItem!.id, itemData);
    
    if (result) {
      memoizedToast({
        title: "Item Updated",
        description: `${updatedItem.name} has been updated.`,
        role: "status",
        "aria-live": "polite"
      });
      setEditItem(null);
    } else {
      memoizedToast({
        title: "Update Failed",
        description: "Failed to update the item.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
    
    setIsProcessing(false);
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

  const confirmDeleteItem = () => {
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

  useEffect(() => {
    // Set up mobile-specific persistence handling
    const cleanupMobilePersistence = isMobile ? setupMobilePersistence() : undefined;
    
    // Force an immediate sync for mobile devices
    if (isMobile) {
      const allItems = [...notPurchasedItems, ...purchasedItems];
      try {
        localStorage.setItem('shoppingItems', JSON.stringify(allItems));
        console.log('[DEBUG] ShoppingPage - Initial forced mobile sync on mount');
      } catch (err) {
        console.error('[ERROR] ShoppingPage - Failed initial mobile sync:', err);
      }
    }
    
    return () => {
      if (cleanupMobilePersistence) {
        cleanupMobilePersistence();
      }
    };
  }, [isMobile, notPurchasedItems, purchasedItems]);

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
      <ShoppingPageHeader 
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
        onOpenInviteDialog={() => {
          console.log("[DEBUG] ShoppingPage - Share button clicked, setting showInviteDialog to true");
          setShowInviteDialog(true);
        }}
        showAddButton={!isReadOnlyMode}
      />
      
      <ShoppingTabsSection 
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        searchTerm={searchTerm}
        onEditItem={handleEditItem}
        readOnly={isReadOnlyMode}
      />
      
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={handleSaveItem}
      />
      
      <EditItemDialog
        isOpen={!!editItem}
        onClose={handleCloseEditDialog}
        item={editItem?.item}
        onSave={handleUpdateItem}
      />
      
      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
      
      <ConfirmDeleteDialog
        open={showConfirmDialog}
        isProcessing={isProcessing}
        onOpenChange={setShowConfirmDialog}
        onConfirm={confirmDeleteItem}
        onCancel={cancelDeleteItem}
      />
    </div>
  );
};

export default ShoppingPageContent;
