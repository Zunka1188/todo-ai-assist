import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddDocumentDialog from '@/components/features/documents/AddDocumentDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentItemsList from '@/components/features/documents/DocumentItemsList';
import FullScreenPreview from '@/components/features/documents/FullScreenPreview';
import { DocumentCategory, DocumentItem } from '@/components/features/documents/types';
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
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const currentCategory = activeTab;

  const handleOpenAddDialog = (editing: DocumentItem | null = null) => {
    if (editing) {
      setEditingItem(editing);
    } else {
      setEditingItem(null);
    }
    setIsAddDialogOpen(true);
  };

  const handleAddItem = (item: any) => {
    handleAddOrUpdateItem(item, editingItem);
    setIsAddDialogOpen(false);
    setEditingItem(null);
  };

  const handleViewImage = (imageUrl: string) => {
    setFullScreenImage(imageUrl);
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
  const filteredFiles = filterFiles(files, searchTerm, CATEGORIES as DocumentCategory[]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Documents"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
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

        <TabsContent value="style">
          <div>
            <DocumentItemsList 
              items={filteredItems}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={handleViewImage}
              formatDateRelative={formatDateRelative}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="recipes">
          <div>
            <DocumentItemsList 
              items={filteredItems}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={handleViewImage}
              formatDateRelative={formatDateRelative}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="travel">
          <div>
            <DocumentItemsList 
              items={filteredItems}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={handleViewImage}
              formatDateRelative={formatDateRelative}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="fitness">
          <div>
            <DocumentItemsList 
              items={filteredItems}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={handleViewImage}
              formatDateRelative={formatDateRelative}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="work">
          <div>
            <DocumentItemsList 
              items={filteredItems}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={handleViewImage}
              formatDateRelative={formatDateRelative}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="other">
          <div>
            <DocumentItemsList 
              items={filteredItems}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={handleViewImage}
              formatDateRelative={formatDateRelative}
            />
          </div>
        </TabsContent>

        <TabsContent value="files">
          <div className="flex-1 overflow-auto">
            <DocumentList 
              documents={filteredFiles}
              onAddDocument={handleAddItem}
              onEditDocument={(doc) => {
                const editItem = {
                  id: doc.id,
                  title: doc.title,
                  category: doc.category,
                  date: new Date(doc.date),
                  tags: [],
                  type: 'note',
                  content: '',
                  addedDate: new Date()
                };
                handleOpenAddDialog(editItem as any);
              }}
              onDeleteDocument={handleDeleteFile}
              searchTerm={searchTerm} 
              categories={CATEGORIES as DocumentCategory[]} 
              viewMode="table"
            />
          </div>
        </TabsContent>
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
          tags: editingItem.tags,
          date: editingItem.date.toISOString().split('T')[0],
          addedDate: editingItem.addedDate.toISOString().split('T')[0],
          file: editingItem.type === 'image' ? editingItem.content : editingItem.file,
          fileName: editingItem.fileName,
          fileType: editingItem.fileType
        } : null} 
      />

      {fullScreenImage && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="p-4 flex justify-between items-center bg-black/80">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white" 
              onClick={() => setFullScreenImage(null)}
              aria-label="Close full screen view"
            >
              <svg 
                width="15" 
                height="15" 
                viewBox="0 0 15 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6"
              >
                <path 
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" 
                  fill="currentColor" 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                />
              </svg>
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <img 
              src={fullScreenImage} 
              alt="Full screen preview" 
              className="max-h-full max-w-full object-contain" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
