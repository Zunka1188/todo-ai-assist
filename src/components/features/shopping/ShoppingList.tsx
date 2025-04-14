
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
import BatchOperationsToolbar from './BatchOperationsToolbar';
import { Button } from '@/components/ui/button';
import { Eye, Check, Trash, X } from 'lucide-react';

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
    setSortOption,
    selectedItems,
    setSelectedItems,
    handleItemSelect,
    deleteSelectedItems
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
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [imagePreviewZoom, setImagePreviewZoom] = useState(1);
  
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
  
  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    if (isBatchMode) {
      // Clear selections when exiting batch mode
      setSelectedItems([]);
    }
  };
  
  const handleMarkSelectedAsCompleted = () => {
    selectedItems.forEach((id) => {
      handleToggleItemCompletion(id);
    });
    setSelectedItems([]);
  };
  
  const handleDeleteSelected = () => {
    deleteSelectedItems();
  };
  
  const handleImageZoomIn = () => {
    setImagePreviewZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleImageZoomOut = () => {
    setImagePreviewZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleImageZoomReset = () => {
    setImagePreviewZoom(1);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ShoppingListErrorBoundary>
      <div className={cn('w-full min-h-[60vh] shopping-list-container', className)}>
        {isBatchMode && (
          <BatchOperationsToolbar
            selectedCount={selectedItems.length}
            onMarkCompleted={handleMarkSelectedAsCompleted}
            onDelete={handleDeleteSelected}
            onCancel={toggleBatchMode}
          />
        )}
        
        {!isBatchMode && !readOnly && (
          <div className="mb-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleBatchMode}
              className="text-xs"
            >
              Select Items
            </Button>
          </div>
        )}
        
        <ShoppingListContent
          notPurchasedItems={notPurchasedItems}
          purchasedItems={purchasedItems}
          searchTerm={searchTerm}
          onToggleItemCompletion={handleToggleItemCompletion}
          onEditItem={handleOpenEditDialog}
          onImagePreview={handleImagePreview}
          readOnly={readOnly}
          batchMode={isBatchMode}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
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
          zoom={imagePreviewZoom}
          onZoomIn={handleImageZoomIn}
          onZoomOut={handleImageZoomOut}
          onZoomReset={handleImageZoomReset}
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
