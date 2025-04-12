
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentActions } from '@/hooks/useDocumentActions';
import { useDocuments } from '@/hooks/useDocuments';
import { useDocumentClassification } from '@/hooks/useDocumentClassification';
import { 
  DocumentCategory, 
  DocumentFile, 
  DocumentItem,
  DocumentFilters,
  ViewMode,
  AddDocDialogItem
} from '../types';
import { logger } from '@/utils/logger';

interface UseDocumentManagementOptions {
  initialCategory?: DocumentCategory | 'all';
  initialViewMode?: ViewMode;
  initialSearchTerm?: string;
}

export function useDocumentManagement({
  initialCategory = 'all',
  initialViewMode = 'grid',
  initialSearchTerm = '',
}: UseDocumentManagementOptions = {}) {
  // Base document operations from useDocuments
  const {
    categoryItems,
    files,
    filterDocuments,
    filterFiles,
    handleAddOrUpdateItem,
    handleDeleteItem,
    handleAddOrUpdateFile,
    handleDeleteFile,
    formatDateRelative,
    CATEGORIES
  } = useDocuments();

  // State for UI
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [currentCategory, setCurrentCategory] = useState<DocumentCategory | 'all'>(initialCategory);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentFile | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentFile | null>(null);
  const [isFullScreenPreviewOpen, setIsFullScreenPreviewOpen] = useState(false);
  const [isImageAnalysisOpen, setIsImageAnalysisOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentMetadata, setCurrentMetadata] = useState<Record<string, any> | null>(null);

  // Get document actions with loading handling
  const { 
    handleAddOrUpdateItem: handleAddOrUpdateItemAction,
    handleDeleteItem: handleDeleteItemAction,
    handleAddOrUpdateFile: handleAddOrUpdateFileAction,
    handleDeleteFile: handleDeleteFileAction,
    handleDownloadFile,
  } = useDocumentActions({ setIsLoading });

  const { classifyDocument } = useDocumentClassification();
  const { toast } = useToast();

  // Filter documents based on current filters
  const filteredDocuments = useMemo(() => {
    if (currentCategory === 'all') {
      return filterFiles(files, searchTerm);
    }
    return filterFiles(
      files.filter(file => file.category === currentCategory),
      searchTerm
    );
  }, [files, currentCategory, searchTerm, filterFiles]);

  // Convert document items to document files format
  const convertToDocumentFiles = useCallback((items: DocumentItem[]): DocumentFile[] => {
    return items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      date: item.date.toISOString(),
      fileType: item.fileType || item.type,
      fileUrl: item.file || (item.type === 'image' ? item.content : undefined)
    }));
  }, []);

  // Document operations
  const openAddDocumentDialog = useCallback(() => {
    setEditingDocument(null);
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(true);
  }, []);

  const openEditDocumentDialog = useCallback((document: DocumentFile) => {
    setEditingDocument(document);
    setIsAddDialogOpen(true);
    setIsEditDialogOpen(true);
  }, []);

  const closeDocumentDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingDocument(null);
  }, []);

  const openFullScreenPreview = useCallback((document: DocumentFile) => {
    setSelectedDocument(document);
    setIsFullScreenPreviewOpen(true);
  }, []);

  const closeFullScreenPreview = useCallback(() => {
    setIsFullScreenPreviewOpen(false);
    setSelectedDocument(null);
  }, []);

  const deleteDocument = useCallback((id: string) => {
    try {
      handleDeleteItemAction(id);
      toast({
        title: "Document deleted",
        description: "The document has been successfully removed",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete document";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [handleDeleteItemAction, toast]);

  const handleAddDocument = useCallback(async (documentData: AddDocDialogItem) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await handleAddOrUpdateItemAction(documentData);
      closeDocumentDialog();
      
      toast({
        title: isEditDialogOpen ? "Document updated" : "Document added",
        description: `"${documentData.title}" has been ${isEditDialogOpen ? 'updated' : 'added'} successfully`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save document";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [handleAddOrUpdateItemAction, isEditDialogOpen, closeDocumentDialog, toast]);

  const handleFileUpload = useCallback(async (file: File, metadata: Record<string, any>) => {
    try {
      setIsLoading(true);
      setCurrentFile(file);
      setCurrentMetadata(metadata);
      
      if (file.type.startsWith('image/')) {
        setIsImageAnalysisOpen(true);
        return;
      }
      
      const fileDataUrl = URL.createObjectURL(file);
      const type = await classifyDocument(fileDataUrl, file.name);
      const fileUrl = URL.createObjectURL(file);
      
      await handleAddOrUpdateItemAction({
        ...metadata,
        file: fileUrl,
        fileName: file.name,
        fileType: file.type,
        type
      });
      
      closeDocumentDialog();
      toast({
        title: "File uploaded",
        description: `"${file.name}" has been uploaded successfully`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload file";
      setError(errorMessage);
      logger.error('[DocumentManagement]', errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [classifyDocument, handleAddOrUpdateItemAction, closeDocumentDialog, toast]);

  const handleAnalysisComplete = useCallback(async (result: any) => {
    try {
      if (currentFile && currentMetadata) {
        const fileUrl = URL.createObjectURL(currentFile);
        await handleAddOrUpdateItemAction({
          ...currentMetadata,
          ...result,
          fileName: currentFile.name,
          fileType: currentFile.type,
          file: fileUrl
        });
      }
      
      setIsImageAnalysisOpen(false);
      closeDocumentDialog();
      setCurrentFile(null);
      setCurrentMetadata(null);
      
      toast({
        title: "File processed",
        description: "The image has been analyzed and saved successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process analysis results";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [currentFile, currentMetadata, handleAddOrUpdateItemAction, closeDocumentDialog, toast]);

  const clearErrors = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    viewMode,
    searchTerm,
    currentCategory,
    isLoading,
    error,
    isAddDialogOpen,
    isEditDialogOpen,
    editingDocument,
    selectedDocument,
    isFullScreenPreviewOpen,
    isImageAnalysisOpen,
    currentFile,
    
    // Data
    documents: filteredDocuments,
    categoryItems,
    allFiles: files,
    categories: CATEGORIES,
    
    // Actions
    setViewMode,
    setSearchTerm,
    setCurrentCategory,
    openAddDocumentDialog,
    openEditDocumentDialog,
    closeDocumentDialog,
    openFullScreenPreview,
    closeFullScreenPreview,
    handleAddDocument,
    deleteDocument,
    handleFileUpload,
    handleAnalysisComplete,
    handleDownloadFile,
    clearErrors,
    
    // Utilities
    convertToDocumentFiles,
    formatDateRelative,
  };
}
