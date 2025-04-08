
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddDocumentDialog from '@/components/features/documents/AddDocumentDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentItemsList from '@/components/features/documents/DocumentItemsList';
import FullScreenPreview from '@/components/features/documents/FullScreenPreview';
import { DocumentCategory, DocumentItem, DocumentFile } from '@/components/features/documents/types';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentList from '@/components/features/documents/DocumentList';
import PageHeader from '@/components/ui/page-header';
import { ChefHat, Dumbbell, FileArchive, Plane, Calendar, FileText, Shirt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useDocumentActions } from '@/hooks/useDocumentActions';
import { DocumentTabs } from './DocumentTabs';

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

  const { 
    handleAddOrUpdateItem, 
    handleDeleteItem, 
    handleAddOrUpdateFile,
    handleDeleteFile 
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

  const handleAddItem = (item: any) => {
    try {
      setIsLoading(true);
      handleAddOrUpdateItem(item, editingItem);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItemWithConfirmation = (id: string) => {
    try {
      handleDeleteItem(id);
      
      toast({
        title: "Document Deleted",
        description: "The document has been removed successfully.",
        role: "status",
        "aria-live": "polite"
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
        role: "alert",
        "aria-live": "assertive"
      });
    }
  };

  const handleViewFullScreen = (item: DocumentItem | DocumentFile) => {
    if (debugEnabled) logEvent('viewFullScreen', { item });
    setFullScreenPreviewItem(item);
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
            onDelete={handleDeleteItemWithConfirmation}
            onViewImage={handleViewFullScreen}
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
            onDeleteDocument={handleDeleteFile}
            searchTerm={searchTerm} 
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
      />

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
