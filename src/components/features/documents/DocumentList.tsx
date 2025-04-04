
import React, { useState } from 'react';
import { File, Plus, FileText, FileSpreadsheet, FileCode, Image, FileArchive, Maximize2, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddDocumentDialog from './AddDocumentDialog';
import FilePreview from './FilePreview';
import { getFileTypeFromName } from './FilePreview';
import { cn } from '@/lib/utils';

// Define the props for DocumentList
interface DocumentListProps {
  searchTerm?: string;
  categories?: string[];
}

// Document type interface
interface Document {
  id: string;
  title: string;
  category: string;
  date: string;
  fileType?: string;
  fileUrl?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ searchTerm = '', categories = [] }) => {
  // State for add document dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [fullScreenItem, setFullScreenItem] = useState<Document | null>(null);
  const [editingItem, setEditingItem] = useState<Document | null>(null);
  
  // Mock data - in a real app, this would come from a database or API
  const documents = [
    { id: '1', title: 'Resume', category: 'Personal', date: '2025-03-15', fileType: 'pdf', fileUrl: 'https://picsum.photos/id/24/400/300' },
    { id: '2', title: 'Project Plan', category: 'Work', date: '2025-03-20', fileType: 'word', fileUrl: 'https://picsum.photos/id/25/400/300' },
    { id: '3', title: 'Vacation Itinerary', category: 'Travel', date: '2025-03-25', fileType: 'text', fileUrl: 'https://picsum.photos/id/26/400/300' },
    { id: '4', title: 'Lease Agreement', category: 'Legal', date: '2025-03-10', fileType: 'pdf', fileUrl: 'https://picsum.photos/id/27/400/300' },
    { id: '5', title: 'Budget Spreadsheet', category: 'Finance', date: '2025-03-05', fileType: 'excel', fileUrl: 'https://picsum.photos/id/28/400/300' },
  ];

  // Filter documents based on search term
  const filteredDocuments = searchTerm 
    ? documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : documents;

  // Handle adding a new document
  const handleAddDocument = (item: any) => {
    // In a real app, this would add the document to the database
    console.log('Adding new document:', item);
    setIsAddDialogOpen(false);
  };

  // Handle editing a document
  const handleEditDocument = (doc: Document) => {
    setEditingItem(doc);
    setIsAddDialogOpen(true);
  };

  // Handle deleting a document
  const handleDeleteDocument = (id: string) => {
    // In a real app, this would delete the document from the database
    console.log('Deleting document:', id);
    // For now we'll just log it
  };

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'word':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-purple-500" />;
      case 'code':
        return <FileCode className="h-5 w-5 text-yellow-500" />;
      case 'archive':
        return <FileArchive className="h-5 w-5 text-gray-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  if (filteredDocuments.length === 0 && !searchTerm) {
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
          <File className="h-12 w-12 text-muted-foreground opacity-30" />
          <h3 className="mt-4 text-lg font-medium">No documents found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first document to get started
          </p>
        </div>
        <AddDocumentDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddDocument}
          categories={categories}
          currentCategory="files"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="bg-todo-purple hover:bg-todo-purple/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>
      
      <div className="space-y-3">
        {filteredDocuments.map((doc) => (
          <div 
            key={doc.id}
            className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start">
              <div className="mr-4 shrink-0 w-12">
                {getFileTypeIcon(doc.fileType || 'unknown')}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      Category: {doc.category}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {doc.date}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => setFullScreenItem(doc)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleEditDocument(doc)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* File preview */}
            {doc.fileUrl && (
              <div className="mt-3">
                <FilePreview 
                  file={doc.fileUrl}
                  fileName={doc.title}
                  fileType={doc.fileType}
                  className="h-32 w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add document dialog */}
      <AddDocumentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddDocument}
        categories={categories}
        currentCategory="files"
        editItem={editingItem ? {
          id: editingItem.id,
          title: editingItem.title,
          category: editingItem.category,
          date: editingItem.date,
        } : null}
      />
      
      {/* Full screen preview dialog */}
      {fullScreenItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-background/10 backdrop-blur-sm">
            <div className="text-white font-medium">{fullScreenItem.title}</div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setFullScreenItem(null)}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
          <div className="flex-1 flex items-center justify-center overflow-auto p-4">
            <FilePreview
              file={fullScreenItem.fileUrl || null}
              fileName={fullScreenItem.title}
              fileType={fullScreenItem.fileType}
              className="max-w-full max-h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
