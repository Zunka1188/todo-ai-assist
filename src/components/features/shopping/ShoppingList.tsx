import React, { memo, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useShoppingItemsContext } from './ShoppingItemsContext';
import { useShoppingItemOperations } from './hooks/useShoppingItemOperations';
import { useShoppingDialogs } from './hooks/useShoppingDialogs';
import LoadingState from './LoadingState';
import ShoppingListContent from './ShoppingListContent';
import ImagePreviewDialog from './ImagePreviewDialog';
import EditItemDialog from './EditItemDialog';
import { SortOption } from './useShoppingItems';
import { toast } from '@/components/ui/use-toast';

import './shoppingList.css';

type ShoppingListProps = {
  searchTerm?: string;
  filterMode?: 'all' | 'one-off' | 'weekly' | 'monthly';
  className?: string;
  onEditItem?: (id: string, name?: string, item?: any) => void;
  readOnly?: boolean;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ShoppingList = ({
  searchTerm = '',
  filterMode = 'all',
  className,
  onEditItem,
  readOnly = false
}: ShoppingListProps) => {
  
  const { 
    notPurchasedItems, 
    purchasedItems, 
    updateSearchTerm,
    updateFilterMode,
    isLoading,
    sortOption,
    setSortOption
  } = useShoppingItemsContext();
  
  const {
    selectedItem,
    itemToEdit,
    isEditDialogOpen,
    isImagePreviewOpen,
    handleImagePreview,
    handleCloseImageDialog,
    handleOpenEditDialog,
    handleCloseEditDialog
  } = useShoppingDialogs(filterMode);

  const {
    handleToggleItemCompletion,
    handleDeleteItem,
    handleSaveItem,
    handleSaveItemFromCapture
  } = useShoppingItemOperations({ readOnly, onEditItem });
  
  // File input references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newItemFileInputRef = useRef<HTMLInputElement>(null);
  
  // State for image options
  const [imageOptionsOpen, setImageOptionsOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, or WebP image.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setImageLoading(true);
      const optimizedImage = await optimizeImage(file);
      if (itemToEdit) {
        handleSaveItem({
          ...itemToEdit,
          imageUrl: optimizedImage
        });
      }
    } catch (error) {
      toast({
        title: 'Error uploading image',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const optimizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.src = e.target?.result as string;
          await new Promise(resolve => img.onload = resolve);

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');

          // Calculate new dimensions (max 1200px width/height)
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP for better compression
          const optimizedDataUrl = canvas.toDataURL('image/webp', 0.8);
          resolve(optimizedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const clearEditImage = () => {
    if (itemToEdit) {
      handleSaveItem({
        ...itemToEdit,
        imageUrl: null
      });
    }
  };
  
  const clearImage = () => {
    if (selectedItem) {
      handleSaveItem({
        ...selectedItem,
        imageUrl: null
      });
      handleCloseImageDialog();
    }
  };
  
  useEffect(() => {
    updateSearchTerm(searchTerm);
    updateFilterMode(filterMode);
  }, [searchTerm, filterMode, updateSearchTerm, updateFilterMode]);
  
  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className={cn('w-full min-h-[60vh] shopping-list-container', className)}>
      <ShoppingListContent
        notPurchasedItems={notPurchasedItems}
        purchasedItems={purchasedItems}
        searchTerm={searchTerm}
        onToggleItemCompletion={handleToggleItemCompletion}
        onEditItem={handleOpenEditDialog}
        onImagePreview={handleImagePreview}
        readOnly={readOnly}
        isImageLoading={imageLoading}
      />

      <ImagePreviewDialog 
        imageUrl={selectedItem?.imageUrl || null}
        item={selectedItem}
        onClose={handleCloseImageDialog}
        onSaveItem={(capturedText) => {
          if (selectedItem) {
            return handleSaveItemFromCapture({
              id: selectedItem.id,
              capturedText
            });
          }
          return false;
        }}
        onEdit={() => {
          handleCloseImageDialog();
          if (selectedItem) {
            handleOpenEditDialog(selectedItem.id, selectedItem);
          }
        }}
        onDelete={onEditItem ? undefined : () => {
          if (selectedItem) {
            handleDeleteItem(selectedItem.id);
            handleCloseImageDialog();
          }
        }}
        onClearImage={clearImage}
        readOnly={readOnly}
        isLoading={imageLoading}
      />
      
      {itemToEdit && (
        <EditItemDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          item={itemToEdit}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
          onClearImage={clearEditImage}
          isImageLoading={imageLoading}
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default memo(ShoppingList);
