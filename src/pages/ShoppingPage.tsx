
import React, { useState, useEffect, useCallback } from 'react';
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
import { Users, Loader2 } from 'lucide-react';
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

// Function to compress images before upload
const compressImage = async (imageFile: File) => {
  try {
    // Basic compression technique - you may want to use a library like browser-image-compression
    const MAX_SIZE = 1024 * 1024; // 1 MB
    
    if (imageFile.size <= MAX_SIZE) {
      return imageFile; // Already small enough
    }
    
    // Create a new canvas to resize the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create an image element
    const img = document.createElement('img');
    
    // Create a promise to handle the async operation
    return new Promise<File>((resolve, reject) => {
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          // Max dimensions for compressed image
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
          
          // Set canvas dimensions to new size
          canvas.width = width;
          canvas.height = height;
          
          // Draw the resized image on the canvas
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert canvas to blob and then to File
          canvas.toBlob(blob => {
            if (blob) {
              const newFile = new File([blob], imageFile.name, {
                type: imageFile.type,
                lastModified: Date.now()
              });
              resolve(newFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, imageFile.type, 0.7); // Quality set to 0.7
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      
      // Load the image from the file
      const reader = new FileReader();
      reader.onload = (e) => img.src = e.target?.result as string;
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(imageFile);
    });
  } catch (error) {
    console.error('Image compression error:', error);
    return imageFile; // Return original file if compression fails
  }
};

// Function to upload images to the server
const uploadImage = async (imageFile: File) => {
  try {
    // First compress the image
    const compressedImage = await compressImage(imageFile);
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('image', compressedImage);
    
    // Upload to the server
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    // Parse the response to get the image URL
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error; // Rethrow to handle in the calling function
  }
};

const ShoppingPageContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
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
  
  const { addItem, updateItem, removeItem, updateFilterMode } = useShoppingItemsContext();
  
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['one-off', 'weekly', 'monthly', 'all'];
  const defaultTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'one-off';

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Memoized toast function to prevent unnecessary re-renders
  const memoizedToast = useCallback(toast, [toast]);

  const storeInvitationStatus = useCallback((isReadOnly: boolean) => {
    localStorage.setItem('shoppingInviteAccepted', 'true');
    localStorage.setItem('shoppingReadOnlyMode', isReadOnly ? 'true' : 'false');
  }, []);

  useEffect(() => {
    const storedInviteAccepted = localStorage.getItem('shoppingInviteAccepted');
    const storedReadOnlyMode = localStorage.getItem('shoppingReadOnlyMode');
    
    if (storedInviteAccepted === 'true') {
      setIsReadOnlyMode(storedReadOnlyMode === 'true');
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
        const storedLinks = localStorage.getItem('shoppingInviteLinks');
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
            setIsReadOnlyMode(isReadOnly);
            storeInvitationStatus(isReadOnly);
            
            memoizedToast({
              title: isReadOnly ? "View-only Access" : "Invitation Accepted",
              description: isReadOnly 
                ? "You can view but not modify this shopping list" 
                : "You've joined a shared shopping list"
            });
          } else {
            memoizedToast({
              title: "Invalid Invitation",
              description: "This shopping list invitation is invalid or has been revoked.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("[ERROR] Error processing invitation:", error);
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

  const handleSaveItem = async (item: any) => {
    if (isReadOnlyMode) {
      memoizedToast({
        title: "Read-only Mode",
        description: "You don't have permission to add items to this shared list.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setIsProcessing(true);
      console.log('[DEBUG] ShoppingPage - Adding item with data:', JSON.stringify(item, null, 2));
      
      let imageUrl = null;
      if (item.file && item.file instanceof File) {
        try {
          imageUrl = await uploadImage(item.file);
        } catch (error) {
          memoizedToast({
            title: "Image Upload Failed",
            description: "Failed to upload image, but we'll continue adding the item.",
            variant: "destructive"
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
          description: `${item.name} has been added to your shopping list.`
        });
        
        setIsProcessing(false);
        return true;
      } else {
        memoizedToast({
          title: "Failed to Add Item",
          description: "The item could not be added to your shopping list.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("[ERROR] ShoppingPage - Error adding item:", error);
      memoizedToast({
        title: "Error",
        description: "Failed to add item to list",
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
    return false;
  }

  const handleUpdateItem = async (updatedItem: any) => {
    if (isReadOnlyMode) {
      memoizedToast({
        title: "Read-only Mode",
        description: "You don't have permission to update items in this shared list.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      setIsProcessing(true);
      if (!editItem || !editItem.id) return false;
      
      console.log("[DEBUG] ShoppingPage - Updating item:", JSON.stringify(updatedItem, null, 2));
      
      let imageUrl = null;
      if (updatedItem.file && updatedItem.file instanceof File) {
        try {
          imageUrl = await uploadImage(updatedItem.file);
        } catch (error) {
          memoizedToast({
            title: "Image Upload Failed",
            description: "Failed to upload image, but we'll continue updating the item.",
            variant: "destructive"
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
          description: `${updatedItem.name} has been updated.`
        });
        setIsProcessing(false);
        return true;
      }
    } catch (error) {
      console.error("[ERROR] ShoppingPage - Error updating item:", error);
      memoizedToast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
    return false;
  }

  const handleDeleteItem = (id: string) => {
    if (isReadOnlyMode) {
      memoizedToast({
        title: "Read-only Mode",
        description: "You don't have permission to delete items in this shared list.",
        variant: "destructive"
      });
      return;
    }
    
    setItemToDeleteId(id);
    setShowConfirmDialog(true);
  };

  const confirmDeleteItem = () => {
    if (!itemToDeleteId) return;
    
    const result = removeItem(itemToDeleteId);
    setShowConfirmDialog(false);
    
    if (result) {
      memoizedToast({
        title: "Item Deleted",
        description: "The item has been removed from your shopping list."
      });
    } else {
      memoizedToast({
        title: "Error",
        description: "Failed to delete the item.",
        variant: "destructive"
      });
    }
    
    setItemToDeleteId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Shopping List"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddItem={() => {
          if (isReadOnlyMode) {
            memoizedToast({
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
                memoizedToast({
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
          <TabsTrigger value="one-off" className="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis">
            {isMobile ? "One-off" : "One-off Items"}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-sm">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="text-sm">Monthly</TabsTrigger>
          <TabsTrigger value="all" className="text-sm">{isMobile ? "All" : "All Items"}</TabsTrigger>
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

      <AddItemDialog 
        open={showAddDialog}
        onOpenChange={(open) => {
          console.log("[DEBUG] ShoppingPage - AddItemDialog onOpenChange called with value:", open);
          setShowAddDialog(open);
        }}
        onSave={handleSaveItem}
      />

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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const ShoppingPage: React.FC = () => {
  return (
    <ShoppingItemsProvider>
      <ShoppingPageContent />
    </ShoppingItemsProvider>
  );
};

export default ShoppingPage;
