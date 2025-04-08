
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddOrUpdateItem = async (item: any, editingItem: DocumentItem | null = null) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      if (debugEnabled) logApiRequest('/api/documents', 'POST', item);
      setIsLoading(true);
      
      // If the item has a file that needs uploading, this would happen here
      
      addOrUpdateItem(item, editingItem);
      
      if (debugEnabled) logApiResponse('/api/documents', 200, { success: true, item });
    } catch (error) {
      console.error("Error handling document:", error);
      if (debugEnabled) logApiResponse('/api/documents', 500, { error });
      throw error;
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      if (debugEnabled) logApiRequest('/api/documents/' + id, 'DELETE');
      
      deleteItem(id);
      
      if (debugEnabled) logApiResponse('/api/documents/' + id, 200, { success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      if (debugEnabled) logApiResponse('/api/documents/' + id, 500, { error });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddOrUpdateFile = async (file: any, isEditing = false) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      if (debugEnabled) logApiRequest('/api/files', isEditing ? 'PUT' : 'POST', file);
      
      addOrUpdateFile(file, isEditing);
      
      if (debugEnabled) logApiResponse('/api/files', 200, { success: true, file });
    } catch (error) {
      console.error("Error handling file:", error);
      if (debugEnabled) logApiResponse('/api/files', 500, { error });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFile = (id: string) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      if (debugEnabled) logApiRequest('/api/files/' + id, 'DELETE');
      
      deleteFile(id);
      
      if (debugEnabled) logApiResponse('/api/files/' + id, 200, { success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      if (debugEnabled) logApiResponse('/api/files/' + id, 500, { error });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    if (!fileUrl) return;
    
    try {
      // Create an anchor element and use it to download the file
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (debugEnabled) logApiResponse('/api/files/download', 200, { success: true });
    } catch (error) {
      console.error("Error downloading file:", error);
      if (debugEnabled) logApiResponse('/api/files/download', 500, { error });
      throw error;
    }
  };

  return {
    handleAddOrUpdateItem,
    handleDeleteItem,
    handleAddOrUpdateFile,
    handleDeleteFile,
    handleDownloadFile,
    isProcessing
  };
}
