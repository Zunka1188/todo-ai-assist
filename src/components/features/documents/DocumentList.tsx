
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddDocumentDialog from './AddDocumentDialog';
import { DocumentFile, DocumentCategory } from './types';
import { getCategoryIcon, getFileTypeIcon } from './utils/iconHelpers';
import DocumentListItem from './DocumentListItem';
import FullScreenPreview from './FullScreenPreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: DocumentFile[];
  onAddDocument: (document: any) => void;
  onEditDocument: (document: DocumentFile) => void;
  onDeleteDocument: (id: string) => void;
  searchTerm?: string;
  categories?: DocumentCategory[];
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  searchTerm = '', 
  categories = []
}) => {
  const { isMobile } = useIsMobile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [fullScreenItem, setFullScreenItem] = useState<DocumentFile | null>(null);
  const [editingItem, setEditingItem] = useState<DocumentFile | null>(null);
  
  const handleAddDocument = (item: any) => {
    onAddDocument(item);
    setIsAddDialogOpen(false);
  };

  const handleEditDocument = (doc: DocumentFile) => {
    setEditingItem(doc);
    setIsAddDialogOpen(true);
  };

  if (documents.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col">
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-todo-purple hover:bg-todo-purple/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          {getFileTypeIcon('unknown')}
          <h3 className={cn("mt-4 text-lg font-medium", isMobile ? "text-[0.95rem]" : "")}>No documents found</h3>
          <p className={cn("text-sm text-muted-foreground mt-1", isMobile ? "text-[0.8rem]" : "")}>
            Add your first document to get started
          </p>
        </div>
        <AddDocumentDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddDocument}
          categories={categories}
          currentCategory="other"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Removed the Add button here as it will be moved to DocumentsPage */}
      
      <div className="space-y-3">
        {documents.map((doc) => (
          <DocumentListItem 
            key={doc.id}
            document={doc}
            onEdit={() => handleEditDocument(doc)}
            onDelete={() => onDeleteDocument(doc.id)}
            onFullScreen={() => setFullScreenItem(doc)}
          />
        ))}
      </div>

      {/* Add document dialog */}
      <AddDocumentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddDocument}
        categories={categories}
        currentCategory="other"
        editItem={editingItem ? {
          id: editingItem.id,
          title: editingItem.title,
          category: editingItem.category,
          date: editingItem.date,
          tags: [], 
          addedDate: new Date().toISOString().split('T')[0],
        } : null}
      />
      
      {/* Full screen preview dialog */}
      <FullScreenPreview
        item={fullScreenItem}
        onClose={() => setFullScreenItem(null)}
      />
    </div>
  );
};

export default DocumentList;
