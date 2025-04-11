
import { useState, useCallback } from 'react';

export const useShoppingDialogs = (filterMode: 'all' | 'one-off' | 'weekly' | 'monthly') => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  
  const handleImagePreview = useCallback((item: any) => {
    setSelectedItem(item);
    setIsImagePreviewOpen(true);
  }, []);
  
  const handleCloseImageDialog = useCallback(() => {
    setIsImagePreviewOpen(false);
    setSelectedItem(null);
  }, []);
  
  const handleOpenEditDialog = useCallback((itemId: string, item?: any) => {
    setItemToEdit(item || { id: itemId });
    setIsEditDialogOpen(true);
  }, []);
  
  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setTimeout(() => setItemToEdit(null), 300); // Clear after animation
  }, []);
  
  return {
    selectedItem,
    itemToEdit,
    isImagePreviewOpen,
    isEditDialogOpen,
    handleImagePreview,
    handleCloseImageDialog,
    handleOpenEditDialog,
    handleCloseEditDialog
  };
};
