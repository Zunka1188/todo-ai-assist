
import React, { Suspense } from 'react';
import { Plus } from 'lucide-react';
import HeaderActions from '@/components/ui/header-actions';
import SearchInput from '@/components/ui/search-input';
import { lazy } from 'react';
import { useDocumentManagement } from './hooks/useDocumentManagement';
import DocumentErrorBoundary from './components/DocumentErrorBoundary';
import LoadingState from './components/LoadingState';
import ErrorFallback from './components/ErrorFallback';

// Lazy loaded components
const DocumentList = lazy(() => import('./components/DocumentList'));
const ImageAnalysisModal = lazy(() => import('./ImageAnalysisModal'));

interface DocumentsPageContentProps {
  activeTab: string;
  initialSearch?: string;
}

const DocumentsPageContent: React.FC<DocumentsPageContentProps> = ({
  activeTab,
  initialSearch = '',
}) => {
  const {
    // State
    viewMode,
    searchTerm,
    currentCategory,
    isLoading,
    error,
    isAddDialogOpen,
    isImageAnalysisOpen,
    currentFile,
    
    // Data
    documents,
    categories,
    
    // Actions
    setSearchTerm,
    openAddDocumentDialog,
    handleAddDocument,
    deleteDocument,
    handleAnalysisComplete,
    handleDownloadFile,
    clearErrors
  } = useDocumentManagement({
    initialCategory: mapTabToCategory(activeTab),
    initialSearchTerm: initialSearch,
    initialViewMode: 'table'
  });
  
  function mapTabToCategory(tab: string) {
    switch (tab) {
      case 'style':
        return 'style';
      case 'shared':
        return 'all'; // Show all categories for shared tab
      case 'templates':
        return 'events'; // Show events for templates tab
      default:
        return 'all';
    }
  }

  const headerActions = {
    primaryAction: {
      icon: Plus,
      label: "Add Document",
      shortLabel: "Add",
      onClick: openAddDocumentDialog
    }
  };
  
  if (error) {
    return (
      <ErrorFallback 
        error={error}
        resetError={clearErrors}
        title="Could not load documents"
        description="There was a problem loading your documents. Please try again."
      />
    );
  }
  
  return (
    <DocumentErrorBoundary context="DocumentsPageContent">
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
        
        <Suspense fallback={<LoadingState message="Loading document list..." />}>
          <DocumentList
            documents={documents}
            onAddDocument={handleAddDocument}
            onEditDocument={openAddDocumentDialog}
            onDeleteDocument={deleteDocument}
            onDownload={handleDownloadFile}
            searchTerm={searchTerm}
            viewMode="table"
            showAddButton={false}
            isLoading={isLoading}
            categories={categories}
          />
        </Suspense>
        
        <Suspense fallback={null}>
          {isImageAnalysisOpen && currentFile && (
            <ImageAnalysisModal
              isOpen={isImageAnalysisOpen}
              onClose={() => clearErrors()}
              onAnalysisComplete={handleAnalysisComplete}
              imageData={currentFile ? URL.createObjectURL(currentFile) : null}
            />
          )}
        </Suspense>
      </div>
    </DocumentErrorBoundary>
  );
};

export default DocumentsPageContent;
