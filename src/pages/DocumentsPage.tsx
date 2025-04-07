
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { toast } from 'sonner';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useIsMobile();
  
  // Fetch documents data
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
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Extract tab from URL or use default
  const getInitialTab = useCallback((): DocumentCategory => {
    // Check if the path is like /documents/style or similar
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (CATEGORIES.includes(lastPart as DocumentCategory)) {
      return lastPart as DocumentCategory;
    }
    return 'style'; // Default tab
  }, [location.pathname, CATEGORIES]);
  
  const [activeTab, setActiveTab] = useState<DocumentCategory>(() => getInitialTab());
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);
  const [fullScreenPreviewItem, setFullScreenPreviewItem] = useState<DocumentItem | DocumentFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update activeTab when location changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [getInitialTab]);

  // Use this variable without recalculating it on every render
  const currentCategory = activeTab;

  // Update URL when tab changes - this is a callback to prevent recreating on every render
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as DocumentCategory);
    navigate(`/documents/${value}`, { replace: true });
  }, [navigate]);

  // Open add dialog with optional item to edit
  const handleOpenAddDialog = useCallback((editing: DocumentItem | null = null) => {
    setEditingItem(editing);
    setIsAddDialogOpen(true);
  }, []);

  // Open file uploader
  const handleOpenFileUploader = useCallback(() => {
    setEditingItem(null);
    setIsAddDialogOpen(true);
  }, []);

  // Handle adding or updating an item
  const handleAddItem = useCallback((item: any) => {
    try {
      setIsLoading(true);
      handleAddOrUpdateItem(item, editingItem);
      setIsAddDialogOpen(false);
      setEditingItem(null);
      
      toast.success(
        editingItem ? "Document Updated" : "Document Added",
        { 
          description: `${item.title} has been ${editingItem ? 'updated' : 'added'} successfully.` 
        }
      );
    } catch (error) {
      console.error("Error handling document:", error);
      toast.error(
        "Error", 
        { 
          description: "Failed to process document. Please try again."
        }
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleAddOrUpdateItem, editingItem]);

  // Handle deleting an item with confirmation toast
  const handleDeleteItemWithConfirmation = useCallback((id: string) => {
    try {
      handleDeleteItem(id);
      toast.success(
        "Document Deleted", 
        { 
          description: "The document has been removed successfully."
        }
      );
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(
        "Error", 
        { 
          description: "Failed to delete document. Please try again."
        }
      );
    }
  }, [handleDeleteItem]);

  // Open full screen preview for an item
  const handleViewFullScreen = useCallback((item: DocumentItem | DocumentFile) => {
    setFullScreenPreviewItem(item);
  }, []);

  // Filter items based on current tab and search term
  const filteredItems = filterDocuments(categoryItems, activeTab, searchTerm);
  const filteredFiles = filterFiles(files, searchTerm);

  // Handle dialog close
  const handleDialogClose = useCallback((open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      // Reset editing state if dialog is closed
      setEditingItem(null);
    }
  }, []);

  // Handle full screen preview close
  const handleFullScreenClose = useCallback(() => {
    setFullScreenPreviewItem(null);
  }, []);

  // If we have no documents at all, render a fallback UI
  if (!categoryItems?.length && !files?.length) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <PageHeader
          title="Documents"
          showAddButton={true}
          onAddItem={handleOpenFileUploader}
          addItemLabel="+ Add Document"
        />
        <div className="text-center mt-12">
          <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Documents Found</h2>
          <p className="text-muted-foreground mb-6">
            Add your first document to get started
          </p>
          <button 
            onClick={handleOpenFileUploader}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Add Your First Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Documents"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={true}
        onAddItem={handleOpenFileUploader}
        addItemLabel="+ Add Item"
      />

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
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

      {isAddDialogOpen && (
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
      )}

      {fullScreenPreviewItem && (
        <FullScreenPreview
          item={fullScreenPreviewItem}
          onClose={handleFullScreenClose}
        />
      )}
    </div>
  );
};

export default DocumentsPage;
