
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
import ShoppingListErrorBoundary from './ShoppingListErrorBoundary';

import './shoppingList.css';

type ShoppingListProps = {
  searchTerm?: string;
  filterMode?: 'all' | 'one-off' | 'weekly' | 'monthly';
  className?: string;
  onEditItem?: (id: string, name?: string, item?: any) => void;
  readOnly?: boolean;
};

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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implementation for file change handling
    console.log("File change detected");
  };
  
  const clearEditImage = () => {
    // Implementation for clearing edit image
    console.log("Clearing edit image");
  };
  
  const clearImage = () => {
    // Implementation for clearing image
    console.log("Clearing image");
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
    <ShoppingListErrorBoundary>
      <div className={cn('w-full min-h-[60vh] shopping-list-container', className)}>
        <ShoppingListContent
          notPurchasedItems={notPurchasedItems}
          purchasedItems={purchasedItems}
          searchTerm={searchTerm}
          onToggleItemCompletion={handleToggleItemCompletion}
          onEditItem={handleOpenEditDialog}
          onImagePreview={handleImagePreview}
          readOnly={readOnly}
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
          readOnly={readOnly}
        />
        
        {itemToEdit && (
          <EditItemDialog
            isOpen={isEditDialogOpen}
            onClose={handleCloseEditDialog}
            item={itemToEdit}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
          />
        )}
      </div>
    </ShoppingListErrorBoundary>
  );
};

export default memo(ShoppingList);
