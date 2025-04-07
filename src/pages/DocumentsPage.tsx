
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
import { toast } from 'sonner';

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentCategory>('style');
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);
  const [fullScreenPreviewItem, setFullScreenPreviewItem] = useState<DocumentItem | DocumentFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentCategory = activeTab;

  const handleOpenAddDialog = (editing: DocumentItem | null = null) => {
    setEditingItem(editing);
    setIsAddDialogOpen(true);
  };

  const handleOpenFileUploader = () => {
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
        description: `${item.title} has been ${editingItem ? 'updated' : 'added'} successfully.`
      });
    } catch (error) {
      console.error("Error handling document:", error);
      toast({
        title: "Error",
        description: "Failed to process document. Please try again.",
        variant: "destructive"
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
        description: "The document has been removed successfully."
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewFullScreen = (item: DocumentItem | DocumentFile) => {
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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={true}
        onAddItem={handleOpenFileUploader}
        addItemLabel="+ Add Item"
      />

      <Tabs defaultValue="style" value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentCategory)} className="w-full">
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
