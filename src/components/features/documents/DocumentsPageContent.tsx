
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import HeaderActions from '@/components/ui/header-actions';
import SearchInput from '@/components/ui/search-input';
import DocumentList from './DocumentList';
import { useDocuments } from '@/hooks/useDocuments';

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
  
  // Create convenience functions to match expected props in DocumentList
  const addDocument = handleAddOrUpdateItem;
  const editDocument = handleAddOrUpdateItem;
  const deleteDocument = handleDeleteItem;
  const downloadDocument = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filtered documents based on active tab and search term
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);

  // Update filtered documents when search term changes
  useEffect(() => {
    const filtered = files.filter(file => 
      activeTab === 'style' ? file.category === 'style' :
      activeTab === 'shared' ? ['work', 'shared', 'other'].includes(file.category) :
      activeTab === 'templates' ? ['templates', 'events'].includes(file.category) :
      true
    ).filter(file =>
      searchTerm === '' || file.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredDocuments(filtered);
  }, [searchTerm, activeTab, files]);
  
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
