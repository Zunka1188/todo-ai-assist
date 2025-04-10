
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useShoppingDialogs = (filterMode: string) => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemToEdit, setItemToEdit] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleImagePreview = useCallback((item: any) => {
    setSelectedItem(item);
  }, []);
  
  const handleCloseImageDialog = useCallback(() => {
    setSelectedItem(null);
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
    handleImagePreview,
    handleCloseImageDialog,
    handleOpenEditDialog,
    handleCloseEditDialog,
    handleTabChange
  };
};
