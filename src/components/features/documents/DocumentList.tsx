
import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddDocumentDialog from './AddDocumentDialog';
import { DocumentFile, DocumentCategory } from './types';
import { getFileTypeIcon } from './utils/iconHelpers';
import DocumentListItem from './DocumentListItem';
import DocumentTableView from './DocumentTableView';
import FullScreenPreview from './FullScreenPreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: DocumentFile[];
  onAddDocument: (document: any) => void;
  onEditDocument: (document: DocumentFile) => void;
  onDeleteDocument: (id: string) => void;
  onDownload?: (fileUrl?: string, fileName?: string) => void;
  searchTerm?: string;
  categories?: DocumentCategory[];
  viewMode?: 'grid' | 'table';
  showAddButton?: boolean;
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
  showAddButton = true
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
    console.log("Opening full screen preview for:", doc);
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
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-6 w-20 h-20 flex items-center justify-center">
            {getFileTypeIcon('unknown')}
          </div>
          <h3 className={cn("mt-4 text-lg font-medium", isMobile ? "text-[0.95rem]" : "")}>No documents found</h3>
          <p className={cn("text-sm text-muted-foreground mt-1", isMobile ? "text-[0.8rem]" : "")}>
            Add your first document to get started
          </p>
        </div>
        <AddDocumentDialog
          open={isAddDialogOpen}
          onOpenChange={handleDialogOpenChange}
          onAdd={handleAddDocument}
          categories={categories as string[]}
          currentCategory="files"
          isEditing={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
      
      {viewMode === 'table' ? (
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
        categories={categories as string[]}
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

export default DocumentList;
