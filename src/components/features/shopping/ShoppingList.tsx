
import React, { memo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useShoppingItemsContext } from './ShoppingItemsContext';
import { useShoppingItemOperations } from './hooks/useShoppingItemOperations';
import { useShoppingDialogs } from './hooks/useShoppingDialogs';
import LoadingState from './LoadingState';
import ShoppingListContent from './ShoppingListContent';
import ImagePreviewDialog from './ImagePreviewDialog';
import EditItemDialog from './EditItemDialog';

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
    isLoading 
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
  
  useEffect(() => {
    updateSearchTerm(searchTerm);
    updateFilterMode(filterMode);
  }, [searchTerm, filterMode, updateSearchTerm, updateFilterMode]);
  
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
      />

      <ImagePreviewDialog 
        imageUrl={selectedItem?.imageUrl || null}
        item={selectedItem}
        onClose={handleCloseImageDialog}
        onSaveItem={(item) => {
          // Adapt the call to match the new function signature
          if (selectedItem) {
            return handleSaveItemFromCapture({
              id: selectedItem.id,
              capturedText: item
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
  );
};

export default memo(ShoppingList);
