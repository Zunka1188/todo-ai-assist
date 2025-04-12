
import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import ContentGrid from '@/components/ui/content-grid';
import HeaderActions from '@/components/ui/header-actions';
import SearchInput from '@/components/ui/search-input';
import DocumentList from './DocumentList';
import { useDocuments } from './hooks/useDocuments';

interface DocumentsPageContentProps {
  activeTab: string;
  initialSearch?: string;
}

const DocumentsPageContent: React.FC<DocumentsPageContentProps> = ({
  activeTab,
  initialSearch = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const {
    documents,
    filteredDocuments,
    isLoading,
    error,
    addDocument,
    editDocument,
    deleteDocument,
    downloadDocument,
    filterDocuments,
  } = useDocuments();
  
  // Update filtered documents when search term changes
  useEffect(() => {
    filterDocuments(searchTerm, activeTab);
  }, [searchTerm, activeTab, filterDocuments]);
  
  const headerActions = {
    primaryAction: {
      icon: Plus,
      label: "Add Document",
      shortLabel: "Add",
      onClick: () => setIsAddDialogOpen(true)
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div className="w-full sm:max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search documents..."
          />
        </div>
        <HeaderActions {...headerActions} />
      </div>
      
      <DocumentList
        documents={filteredDocuments}
        onAddDocument={addDocument}
        onEditDocument={editDocument}
        onDeleteDocument={deleteDocument}
        onDownload={downloadDocument}
        searchTerm={searchTerm}
        viewMode="table"
        showAddButton={false}
      />
    </div>
  );
};

export default DocumentsPageContent;
