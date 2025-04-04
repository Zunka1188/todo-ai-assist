
import React from 'react';
import { File } from 'lucide-react';

// Define the props for DocumentList
interface DocumentListProps {
  searchTerm?: string;
  categories?: string[];
}

const DocumentList: React.FC<DocumentListProps> = ({ searchTerm = '', categories = [] }) => {
  // Mock data - in a real app, this would come from a database or API
  const documents = [
    { id: '1', title: 'Resume', category: 'Personal', date: '2025-03-15' },
    { id: '2', title: 'Project Plan', category: 'Work', date: '2025-03-20' },
    { id: '3', title: 'Vacation Itinerary', category: 'Travel', date: '2025-03-25' },
    { id: '4', title: 'Lease Agreement', category: 'Legal', date: '2025-03-10' },
    { id: '5', title: 'Budget Spreadsheet', category: 'Finance', date: '2025-03-05' },
  ];

  // Filter documents based on search term
  const filteredDocuments = searchTerm 
    ? documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : documents;

  if (filteredDocuments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <File className="h-12 w-12 text-muted-foreground opacity-30" />
        <h3 className="mt-4 text-lg font-medium">No documents found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {searchTerm ? 'Try a different search term' : 'Add your first document to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredDocuments.map((doc) => (
        <div 
          key={doc.id}
          className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{doc.title}</h3>
              <div className="text-sm text-muted-foreground mt-1">
                Category: {doc.category}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {doc.date}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
