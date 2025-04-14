import React, { useState } from 'react';
import { useShoppingItemsContext } from './ShoppingItemsContext';
import ShoppingItemGrid from './ShoppingItemGrid';
import EditItemDialog from './EditItemDialog';
import { Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionDivider from '@/components/ui/section-divider';

interface ShoppingListProps {
  searchTerm?: string;
  filterMode?: 'all' | 'one-off' | 'weekly' | 'monthly';
  onImagePreview?: (item: any) => void;
  readOnly?: boolean;
  onEditItem?: (id: string, name?: string, item?: any) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ 
  searchTerm = '',
  filterMode = 'all',
  onImagePreview = () => {},
  readOnly = false,
  onEditItem
}) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { 
    notPurchasedItems, 
    purchasedItems, 
    toggleItem,
    updateItem,
    selectedItems,
    handleItemSelect,
    deleteSelectedItems
  } = useShoppingItemsContext();

  const handleToggleCompletion = (id: string) => {
    toggleItem(id);
  };

  const handleEdit = (id: string, item: any) => {
    if (onEditItem) {
      onEditItem(id, item?.name, item);
      return;
    }
    
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (editedItem: any): boolean => {
    if (editingItem) {
      updateItem(editingItem.id, editedItem);
      setIsEditDialogOpen(false);
      return true;
    }
    return false;
  };

  const handleDeleteSelected = () => {
    const deletedCount = deleteSelectedItems();
    console.log(`Deleted ${deletedCount} items`);
  };

  const handleImagePreview = (item: any) => {
    onImagePreview(item);
  };

  const isBatchModeActive = selectedItems.length > 0;
  
  return (
    <div className="w-full space-y-6">
      {/* Batch actions bar */}
      {isBatchModeActive && !readOnly && (
        <div className="bg-muted p-2 rounded-md flex items-center justify-between sticky top-0 z-10">
          <div className="text-sm font-medium">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteSelected}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                selectedItems.forEach(id => toggleItem(id));
              }}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as purchased
            </Button>
          </div>
        </div>
      )}
      
      {/* Not purchased items */}
      {notPurchasedItems.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-3">Shopping List</h2>
          <ShoppingItemGrid 
            items={notPurchasedItems}
            onToggleItemCompletion={handleToggleCompletion}
            onEditItem={handleEdit}
            onImagePreview={handleImagePreview}
            readOnly={readOnly}
            batchMode={isBatchModeActive}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelect}
          />
        </div>
      )}
      
      {/* Purchased items */}
      {purchasedItems.length > 0 && (
        <div>
          {notPurchasedItems.length > 0 && <SectionDivider />}
          <h2 className="text-lg font-medium mb-3 text-muted-foreground">Purchased Items</h2>
          <ShoppingItemGrid 
            items={purchasedItems}
            onToggleItemCompletion={handleToggleCompletion}
            onEditItem={handleEdit}
            onImagePreview={handleImagePreview}
            className="opacity-70"
            readOnly={readOnly}
            batchMode={isBatchModeActive}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelect}
          />
        </div>
      )}

      <EditItemDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        item={editingItem}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ShoppingList;
