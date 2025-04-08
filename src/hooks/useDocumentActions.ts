
import { useState } from 'react';
import { DocumentItem } from '@/components/features/documents/types';
import { useDocuments } from './useDocuments';
import { useDebugMode } from './useDebugMode';

interface UseDocumentActionsProps {
  setIsLoading: (loading: boolean) => void;
}

export function useDocumentActions({ setIsLoading }: UseDocumentActionsProps) {
  const { handleAddOrUpdateItem: addOrUpdateItem, 
          handleDeleteItem: deleteItem,
          handleAddOrUpdateFile: addOrUpdateFile,
          handleDeleteFile: deleteFile } = useDocuments();
  
  const { enabled: debugEnabled, logApiRequest, logApiResponse } = useDebugMode();

  const handleAddOrUpdateItem = (item: any, editingItem: DocumentItem | null = null) => {
    try {
      if (debugEnabled) logApiRequest('/api/documents', 'POST', item);
      setIsLoading(true);
      
      addOrUpdateItem(item, editingItem);
      
      if (debugEnabled) logApiResponse('/api/documents', 200, { success: true, item });
    } catch (error) {
      console.error("Error handling document:", error);
      if (debugEnabled) logApiResponse('/api/documents', 500, { error });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    try {
      if (debugEnabled) logApiRequest('/api/documents/' + id, 'DELETE');
      
      deleteItem(id);
      
      if (debugEnabled) logApiResponse('/api/documents/' + id, 200, { success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      if (debugEnabled) logApiResponse('/api/documents/' + id, 500, { error });
      throw error;
    }
  };

  const handleAddOrUpdateFile = (file: any, isEditing = false) => {
    try {
      if (debugEnabled) logApiRequest('/api/files', isEditing ? 'PUT' : 'POST', file);
      
      addOrUpdateFile(file, isEditing);
      
      if (debugEnabled) logApiResponse('/api/files', 200, { success: true, file });
    } catch (error) {
      console.error("Error handling file:", error);
      if (debugEnabled) logApiResponse('/api/files', 500, { error });
      throw error;
    }
  };

  const handleDeleteFile = (id: string) => {
    try {
      if (debugEnabled) logApiRequest('/api/files/' + id, 'DELETE');
      
      deleteFile(id);
      
      if (debugEnabled) logApiResponse('/api/files/' + id, 200, { success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      if (debugEnabled) logApiResponse('/api/files/' + id, 500, { error });
      throw error;
    }
  };

  return {
    handleAddOrUpdateItem,
    handleDeleteItem,
    handleAddOrUpdateFile,
    handleDeleteFile
  };
}
