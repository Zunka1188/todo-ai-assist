
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useShoppingDialogs = (filterMode: string) => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const navigate = useNavigate();

  const handleImagePreview = useCallback((item: any) => {
    setSelectedItem(item);
    setIsImagePreviewOpen(true);
  }, []);
  
  const handleCloseImageDialog = useCallback(() => {
    setSelectedItem(null);
    setIsImagePreviewOpen(false);
  }, []);

  const handleOpenEditDialog = useCallback((itemId: string, item: any) => {
    setItemToEdit(item);
    setIsEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setItemToEdit(null);
    setIsEditDialogOpen(false);
  }, []);

  const handleTabChange = useCallback((newTab: string) => {
    navigate(`/shopping?tab=${newTab}`, { replace: true });
  }, [navigate]);

  return {
    selectedItem,
    setSelectedItem,
    itemToEdit,
    setItemToEdit,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isImagePreviewOpen,
    setIsImagePreviewOpen,
    handleImagePreview,
    handleCloseImageDialog,
    handleOpenEditDialog,
    handleCloseEditDialog,
    handleTabChange
  };
};
