import React from 'react';

interface DocumentListProps {
  searchTerm: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ searchTerm }) => {
  // This is a placeholder. The actual implementation would filter documents
  // based on searchTerm and render them
  return (
    <div className="space-y-4 px-2">
      <div className="text-sm text-muted-foreground">
        {searchTerm ? `Showing results for "${searchTerm}"` : 'All documents'}
      </div>
      <div className="text-center p-8 text-muted-foreground">
        No documents found. Add your first document!
      </div>
    </div>
  );
};

export default DocumentList;
