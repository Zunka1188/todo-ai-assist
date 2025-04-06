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

  const currentCategory = activeTab;

  const handleOpenAddDialog = (editing: DocumentItem | null = null) => {
    setEditingItem(editing);
    setIsAddDialogOpen(true);
  };

  const handleAddItem = (item: any) => {
    handleAddOrUpdateItem(item, editingItem);
    setIsAddDialogOpen(false);
    setEditingItem(null);
  };

  const handleViewFullScreen = (item: DocumentItem | DocumentFile) => {
    setFullScreenPreviewItem(item);
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'style':
        return <Shirt className="h-4 w-4" />;
      case 'recipes':
        return <ChefHat className="h-4 w-4" />;
      case 'travel':
        return <Plane className="h-4 w-4" />;
      case 'fitness':
        return <Dumbbell className="h-4 w-4" />;
      case 'work':
        return <Calendar className="h-4 w-4" />;
      case 'files':
        return <FileArchive className="h-4 w-4" />;
      case 'other':
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredItems = filterDocuments(categoryItems, activeTab, searchTerm);
  const filteredFiles = filterFiles(files, searchTerm);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Documents"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={true}
        onAddItem={() => handleOpenAddDialog()}
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
          <TabsTrigger value="work" className="flex items-center gap-2">
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
              onDelete={handleDeleteItem}
              onViewImage={(item) => handleViewFullScreen(item as DocumentItem)}
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
              categories={CATEGORIES as DocumentCategory[]} 
              viewMode="table"
              showAddButton={false}
            />
          </TabsContent>
        )}
      </Tabs>

      <AddDocumentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
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
        onClose={() => setFullScreenPreviewItem(null)}
      />
    </div>
  );
};

export default DocumentsPage;
