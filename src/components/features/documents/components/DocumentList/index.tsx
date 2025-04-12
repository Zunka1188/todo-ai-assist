
import React, { memo, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentFile, ViewMode } from '../../types';
import { useIsMobile } from '@/hooks/use-mobile';
import DocumentListItem from './DocumentListItem';
import DocumentTableView from '../../DocumentTableView';
import FullScreenPreview from '../../FullScreenPreview';
import AddDocumentDialog from '../../AddDocumentDialog';
import EmptyState from './EmptyState';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: DocumentFile[];
  onAddDocument: (document: any) => void;
  onEditDocument: (document: DocumentFile) => void;
  onDeleteDocument: (id: string) => void;
  onDownload?: (fileUrl?: string, fileName?: string) => void;
  searchTerm?: string;
  categories?: string[];
  viewMode?: ViewMode;
  showAddButton?: boolean;
  isLoading?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  onDownload,
  searchTerm = '',
  categories = [],
  viewMode = 'table',
  showAddButton = true,
  isLoading = false
}) => {
  const { isMobile } = useIsMobile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [fullScreenItem, setFullScreenItem] = useState<DocumentFile | null>(null);
  const [editingItem, setEditingItem] = useState<DocumentFile | null>(null);
  
  const handleAddDocument = (item: any) => {
    onAddDocument(item);
    setIsAddDialogOpen(false);
    setEditingItem(null);
  };

  const handleOpenAddDialog = (e: React.MouseEvent, doc: DocumentFile | null = null) => {
    e.preventDefault();
    setEditingItem(doc);
    setIsAddDialogOpen(true);
  };

  // Handle dialog closure without navigation
  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const handleFullScreenClose = () => {
    setFullScreenItem(null);
  };

  // Directly handle the edit action by opening the dialog with the document
  const handleEditDocument = (doc: DocumentFile) => {
    handleOpenAddDialog(new MouseEvent('click') as unknown as React.MouseEvent, doc);
  };

  const handleDownload = (fileUrl?: string, fileName?: string) => {
    if (onDownload) {
      onDownload(fileUrl, fileName);
    }
  };

  const handleViewFullScreen = (doc: DocumentFile) => {
    setFullScreenItem(doc);
  };

  if (documents.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col">
        {showAddButton && (
          <div className="flex justify-end mb-4">
            <Button 
              onClick={(e) => handleOpenAddDialog(e)} 
              className="bg-todo-purple hover:bg-todo-purple/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add Item
            </Button>
          </div>
        )}
        
        <EmptyState 
          onAddItem={(e) => handleOpenAddDialog(e)} 
          showAddButton={showAddButton} 
        />
        
        <AddDocumentDialog
          open={isAddDialogOpen}
          onOpenChange={handleDialogOpenChange}
          onAdd={handleAddDocument}
          categories={categories}
          currentCategory="files"
          isEditing={false}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", isLoading ? "opacity-60 pointer-events-none" : "")}>
      {showAddButton && (
        <div className="flex justify-end mb-4">
          <Button 
            onClick={(e) => handleOpenAddDialog(e)} 
            className="bg-todo-purple hover:bg-todo-purple/90 text-white"
            aria-label="Add Document"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Add Item
          </Button>
        </div>
      )}
      
      {documents.length === 0 && searchTerm ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No matching documents</h3>
          <p className="text-muted-foreground mt-1">
            No documents match your search criteria. Try a different search or clear filters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <DocumentTableView 
          documents={documents}
          onEdit={handleEditDocument}
          onDelete={onDeleteDocument}
          onFullScreen={handleViewFullScreen}
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <DocumentListItem 
              key={doc.id}
              document={doc}
              onEdit={() => handleEditDocument(doc)}
              onDelete={() => onDeleteDocument(doc.id)}
              onFullScreen={() => handleViewFullScreen(doc)}
            />
          ))}
        </div>
      )}

      <AddDocumentDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onAdd={handleAddDocument}
        categories={categories}
        currentCategory="files"
        isEditing={!!editingItem}
        editItem={editingItem ? {
          id: editingItem.id,
          title: editingItem.title,
          category: editingItem.category,
          date: editingItem.date,
          description: '',
          tags: [], 
          addedDate: new Date().toISOString().split('T')[0],
          file: editingItem.fileUrl,
          fileName: editingItem.title,
          fileType: editingItem.fileType
        } : null}
      />
      
      {fullScreenItem && (
        <FullScreenPreview
          item={fullScreenItem}
          onClose={handleFullScreenClose}
          onDownload={handleDownload}
          readOnly={false}
        />
      )}
    </div>
  );
};

export default memo(DocumentList);
