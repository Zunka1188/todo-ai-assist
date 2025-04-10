
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddDocumentDialog from '@/components/features/documents/AddDocumentDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import DocumentItemsList from '@/components/features/documents/DocumentItemsList';
import FullScreenPreview from '@/components/features/documents/FullScreenPreview';
import { DocumentCategory, DocumentItem, DocumentFile } from '@/components/features/documents/types';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentList from '@/components/features/documents/DocumentList';
import PageHeader from '@/components/ui/page-header';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useDocumentActions } from '@/hooks/useDocumentActions';
import { DocumentTabs } from './DocumentTabs';
import { extractTextFromImage } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2, FileSearch } from "lucide-react";

const DocumentsPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const { enabled: debugEnabled, logProps, logEvent } = useDebugMode();
  
  const {
    categoryItems,
    files,
    filterDocuments,
    filterFiles,
    formatDateRelative,
    CATEGORIES
  } = useDocuments();
  
  const [rawSearchTerm, setRawSearchTerm] = useState('');
  const searchTerm = useDebounce(rawSearchTerm, 300); // Debounce search input by 300ms
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentCategory>('style');
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);
  const [fullScreenPreviewItem, setFullScreenPreviewItem] = useState<DocumentItem | DocumentFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);

  const { 
    handleAddOrUpdateItem, 
    handleDeleteItem, 
    handleAddOrUpdateFile,
    handleDeleteFile,
    handleDownloadFile,
    isProcessing
  } = useDocumentActions({ setIsLoading });

  // Log component props when debug mode is enabled
  if (debugEnabled) {
    logProps('DocumentsPage', { 
      activeTab, 
      searchTerm, 
      isAddDialogOpen, 
      editingItem, 
      categoryItemsCount: categoryItems.length, 
      filesCount: files.length 
    });
  }

  const currentCategory = activeTab;

  const handleOpenAddDialog = (editing: DocumentItem | null = null) => {
    if (debugEnabled) logEvent('openAddDialog', { editing });
    setEditingItem(editing);
    setIsAddDialogOpen(true);
  };

  const handleOpenFileUploader = () => {
    if (debugEnabled) logEvent('openFileUploader');
    setEditingItem(null);
    setIsAddDialogOpen(true);
  };

  const handleRunOcr = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    try {
      setIsOcrProcessing(true);
      setOcrText(null);
      
      const extractedText = await extractTextFromImage(imageUrl);
      setOcrText(extractedText);
      
      toast({
        title: "OCR Completed",
        description: "Text has been extracted from the image",
        role: "status",
        "aria-live": "polite"
      });
    } catch (error) {
      console.error("OCR processing error:", error);
      toast({
        title: "OCR Failed",
        description: "Failed to extract text from the image",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleAddItem = async (item: any) => {
    try {
      await handleAddOrUpdateItem(item, editingItem);
      setIsAddDialogOpen(false);
      setEditingItem(null);
      
      toast({
        title: editingItem ? "Document Updated" : "Document Added",
        description: `${item.title} has been ${editingItem ? 'updated' : 'added'} successfully.`,
        role: "status",
        "aria-live": "polite"
      });
    } catch (error) {
      console.error("Error handling document:", error);
      
      toast({
        title: "Error",
        description: "Failed to process document. Please try again.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  };

  const confirmDeleteItem = (id: string) => {
    if (debugEnabled) logEvent('confirmDeleteItem', { id });
    setItemToDelete(id);
    setFileToDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteFile = (id: string) => {
    if (debugEnabled) logEvent('confirmDeleteFile', { id });
    setFileToDelete(id);
    setItemToDelete(null);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = () => {
    try {
      if (itemToDelete) {
        handleDeleteItem(itemToDelete);
        
        toast({
          title: "Document Deleted",
          description: "The document has been removed successfully.",
          role: "status",
          "aria-live": "polite"
        });
      } else if (fileToDelete) {
        handleDeleteFile(fileToDelete);
        
        toast({
          title: "File Deleted",
          description: "The file has been removed successfully.",
          role: "status",
          "aria-live": "polite"
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      setFileToDelete(null);
    }
  };

  const handleViewFullScreen = (item: DocumentItem | DocumentFile) => {
    if (debugEnabled) logEvent('viewFullScreen', { item });
    setFullScreenPreviewItem(item);
    setOcrText(null); // Reset OCR text when viewing a new item
  };

  const handleDownload = (fileUrl?: string, fileName?: string) => {
    if (!fileUrl) {
      toast({
        title: "Download Failed",
        description: "No file URL provided for download",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
      return;
    }

    try {
      handleDownloadFile(fileUrl, fileName || 'document');
      
      toast({
        title: "Download Started",
        description: `${fileName || 'Document'} is being downloaded`,
        role: "status",
        "aria-live": "polite"
      });
    } catch (error) {
      console.error("Error downloading:", error);
      
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  };

  const filteredItems = filterDocuments(categoryItems, activeTab, searchTerm);
  const filteredFiles = filterFiles(files, searchTerm);

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      // Reset editing state if dialog is closed
      setEditingItem(null);
    }
  };

  const handleFullScreenClose = () => {
    setFullScreenPreviewItem(null);
    setOcrText(null); // Clear OCR text when closing preview
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Documents"
        searchTerm={rawSearchTerm}
        onSearchChange={setRawSearchTerm}
        showAddButton={true}
        onAddItem={handleOpenFileUploader}
        addItemLabel="+ Add Item"
      />

      <DocumentTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobile={isMobile}
      />

      {activeTab !== 'files' ? (
        <TabsContent value={activeTab}>
          <DocumentItemsList 
            items={filteredItems}
            onEdit={handleOpenAddDialog}
            onDelete={confirmDeleteItem}
            onViewImage={handleViewFullScreen}
            onDownload={handleDownload}
            formatDateRelative={formatDateRelative}
          />
        </TabsContent>
      ) : (
        <TabsContent value="files">
          <DocumentList 
            documents={filteredFiles}
            onAddDocument={handleAddOrUpdateFile}
            onEditDocument={(doc) => {
              handleViewFullScreen(doc);
            }}
            onDeleteDocument={confirmDeleteFile}
            onDownload={handleDownload}
            categories={CATEGORIES} 
            viewMode="table"
            showAddButton={false}
          />
        </TabsContent>
      )}

      <AddDocumentDialog 
        open={isAddDialogOpen} 
        onOpenChange={handleDialogClose} 
        onAdd={handleAddItem} 
        categories={CATEGORIES as string[]} 
        currentCategory={currentCategory} 
        isEditing={!!editingItem} 
        editItem={editingItem ? {
          id: editingItem.id,
          title: editingItem.title,
          description: editingItem.content,
          category: editingItem.category,
          tags: editingItem.tags || [],
          date: editingItem.date.toISOString().split('T')[0],
          addedDate: editingItem.addedDate.toISOString().split('T')[0],
          file: editingItem.type === 'image' ? editingItem.content : editingItem.file || null,
          fileName: editingItem.fileName || "",
          fileType: editingItem.fileType || ""
        } : null} 
      />

      <FullScreenPreview
        item={fullScreenPreviewItem}
        onClose={handleFullScreenClose}
        onDownload={handleDownload}
        extraActions={
          fullScreenPreviewItem && 
          (fullScreenPreviewItem as DocumentFile).fileType === 'image' ? (
            <button 
              onClick={() => handleRunOcr((fullScreenPreviewItem as DocumentFile).fileUrl || '')}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              disabled={isOcrProcessing}
            >
              {isOcrProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileSearch className="h-4 w-4" />
                  <span>Extract Text (OCR)</span>
                </>
              )}
            </button>
          ) : null
        }
        additionalContent={
          ocrText ? (
            <div className="mt-4 p-4 bg-muted rounded-md max-h-64 overflow-auto">
              <h3 className="font-medium mb-2">Extracted Text:</h3>
              <p className="whitespace-pre-wrap">{ocrText}</p>
            </div>
          ) : null
        }
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirmed}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {debugEnabled && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-200 text-black p-1 text-xs z-50 opacity-80">
          <div>Active Tab: "{activeTab}", Items: {filteredItems.length}, Files: {filteredFiles.length}</div>
          <div>Search Term: "{searchTerm}", Editing Item: {editingItem ? editingItem.id : 'none'}</div>
          <div>Debug Mode: Enabled (Shift+Ctrl+D to disable)</div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPageContent;
