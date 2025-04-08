
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
import { Button } from '@/components/ui/button';
import { ChefHat, Dumbbell, FileArchive, Plane, Calendar, FileText, Shirt } from 'lucide-react';
import { getCategoryIcon } from '@/components/features/documents/utils/iconHelpers';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useDebugMode } from '@/hooks/useDebugMode';
import ErrorBoundary from '@/components/ui/error-boundary';

const DocumentsPageContent = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const { enabled: debugEnabled, logProps, logEvent, logApiRequest, logApiResponse } = useDebugMode();
  
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
  
  const [rawSearchTerm, setRawSearchTerm] = useState('');
  const searchTerm = useDebounce(rawSearchTerm, 300); // Debounce search input by 300ms
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentCategory>('style');
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);
  const [fullScreenPreviewItem, setFullScreenPreviewItem] = useState<DocumentItem | DocumentFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      if (debugEnabled) logApiRequest('/api/documents', 'POST', item);
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
      
      if (debugEnabled) logApiResponse('/api/documents', 200, { success: true, item });
    } catch (error) {
      console.error("Error handling document:", error);
      if (debugEnabled) logApiResponse('/api/documents', 500, { error });
      
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
      if (debugEnabled) logApiRequest('/api/documents/' + id, 'DELETE');
      
      handleDeleteItem(id);
      
      toast({
        title: "Document Deleted",
        description: "The document has been removed successfully.",
        role: "status",
        "aria-live": "polite"
      });
      
      if (debugEnabled) logApiResponse('/api/documents/' + id, 200, { success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      if (debugEnabled) logApiResponse('/api/documents/' + id, 500, { error });
      
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

      <Tabs defaultValue="style" value={activeTab} onValueChange={value => setActiveTab(value as DocumentCategory)} className="w-full">
        <TabsList className="grid grid-cols-7 w-full mb-4">
          <TabsTrigger value="style" className="flex items-center gap-2">
            <Shirt className="h-4 w-4" />
            <span className={isMobile ? "sr-only" : ""}>Style</span>
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            <span className={isMobile ? "sr-only" : ""}>Recipes</span>
          </TabsTrigger>
          <TabsTrigger value="travel" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            <span className={isMobile ? "sr-only" : ""}>Travel</span>
          </TabsTrigger>
          <TabsTrigger value="fitness" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className={isMobile ? "sr-only" : ""}>Fitness</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className={isMobile ? "sr-only" : ""}>Events</span>
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className={isMobile ? "sr-only" : ""}>Other</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileArchive className="h-4 w-4" />
            <span className={isMobile ? "sr-only" : ""}>Files</span>
          </TabsTrigger>
        </TabsList>

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
      </Tabs>

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

// Wrap DocumentsPageContent with ErrorBoundary for robust error handling
const DocumentsPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <DocumentsPageContent />
    </ErrorBoundary>
  );
};

export default DocumentsPage;
