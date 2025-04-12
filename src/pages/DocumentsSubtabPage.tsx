
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  File, 
  FileBox, 
  FileText, 
  Image as ImageIcon, 
  Receipt 
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import AppHeader from '@/components/layout/AppHeader';
import DocumentList from '@/components/features/documents/components/DocumentList';
import AddDocumentDialog from '@/components/features/documents/AddDocumentDialog';
import ImageAnalysisModal from '@/components/features/documents/ImageAnalysisModal';
import { DocumentCategory } from '@/components/features/documents/types';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { useDocumentManagement } from '@/components/features/documents/hooks/useDocumentManagement';
import DocumentErrorBoundary from '@/components/features/documents/components/DocumentErrorBoundary';
import ErrorFallback from '@/components/features/documents/components/ErrorFallback';
import LoadingState from '@/components/features/documents/components/LoadingState';

export type DocumentTab = 'all' | 'receipts' | 'images' | 'forms' | 'other';

interface DocumentTabsProps {
  activeTab: DocumentTab;
  onTabChange: (tab: DocumentTab) => void;
}

const documentCategories = [
  { id: 'all', label: 'All', icon: FileBox },
  { id: 'receipts', label: 'Receipts', icon: Receipt },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'forms', label: 'Forms', icon: FileText },
  { id: 'other', label: 'Other', icon: File },
];

const getValidCategory = (tab: DocumentTab): DocumentCategory => {
  if (tab === 'all') return 'style';
  return tab as DocumentCategory;
};

const DocumentsSubtabPage: React.FC = () => {
  const { subtab } = useParams<{ subtab: DocumentTab }>();
  const navigate = useNavigate();

  const {
    viewMode,
    currentCategory,
    isLoading,
    error,
    isAddDialogOpen,
    isEditDialogOpen,
    isImageAnalysisOpen,
    isFullScreenPreviewOpen,
    currentFile,
    
    documents,
    categories,
    
    setCurrentCategory,
    openAddDocumentDialog,
    closeDocumentDialog,
    handleAddDocument,
    deleteDocument,
    handleAnalysisComplete,
    handleDownloadFile,
    clearErrors,
    
    convertToDocumentFiles
  } = useDocumentManagement({
    initialCategory: subtab ? getValidCategory(subtab as DocumentTab) : 'all',
    initialViewMode: 'grid'
  });
  
  useEffect(() => {
    if (subtab && documentCategories.some(cat => cat.id === subtab)) {
      setCurrentCategory(getValidCategory(subtab as DocumentTab));
    } else {
      navigate('/documents/all');
    }
  }, [subtab, setCurrentCategory, navigate]);

  const handleTabChange = (tab: DocumentTab) => {
    navigate(`/documents/${tab}`);
  };
  
  if (error) {
    return (
      <PageLayout maxWidth="full">
        <ErrorFallback 
          error={error} 
          resetError={clearErrors} 
        />
      </PageLayout>
    );
  }
  
  if (isLoading && !documents.length) {
    return (
      <PageLayout maxWidth="full">
        <LoadingState size="large" />
      </PageLayout>
    );
  }
  
  return (
    <DocumentErrorBoundary context="DocumentsSubtabPage">
      <PageLayout maxWidth="full">
        <AppHeader
          title={`Documents - ${documentCategories.find(cat => cat.id === subtab)?.label || 'All'}`}
          className="mb-4"
          actions={
            <DocumentHeaderActions onAddClick={openAddDocumentDialog} />
          }
        />

        <div className="mb-6">
          <DocumentTabs
            activeTab={subtab as DocumentTab || 'all'}
            onTabChange={handleTabChange}
          />
        </div>
        
        <ResponsiveContainer
          direction="column"
          gap="md"
          className="w-full"
          mobileFullWidth={true}
        >
          <DocumentList
            documents={documents}
            onEditDocument={openAddDocumentDialog}
            onDeleteDocument={deleteDocument}
            onAddDocument={handleAddDocument}
            onDownload={handleDownloadFile}
            categories={categories as string[]}
            viewMode="grid"
          />
        </ResponsiveContainer>
        
        <AddDocumentDialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeDocumentDialog();
          }}
          onAdd={handleAddDocument}
          categories={categories as string[]}
          currentCategory={getValidCategory(subtab as DocumentTab)}
          isEditing={isEditDialogOpen}
          editItem={null}
        />
        
        {isImageAnalysisOpen && currentFile && (
          <ImageAnalysisModal
            isOpen={isImageAnalysisOpen}
            onClose={() => clearErrors()}
            onAnalysisComplete={handleAnalysisComplete}
            imageData={URL.createObjectURL(currentFile)}
          />
        )}
      </PageLayout>
    </DocumentErrorBoundary>
  );
};

const DocumentHeaderActions: React.FC<{ onAddClick: () => void }> = ({ onAddClick }) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={onAddClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center text-sm font-medium"
      >
        <File className="h-4 w-4 mr-2" />
        Add Document
      </button>
    </div>
  );
};

const DocumentTabs: React.FC<DocumentTabsProps> = ({ activeTab, onTabChange }) => (
  <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => onTabChange(value as DocumentTab)} className="w-full">
    <TabsList className="grid grid-cols-5 w-full">
      {documentCategories.map(category => (
        <TabsTrigger key={category.id} value={category.id} className="flex flex-col items-center justify-center p-2">
          <category.icon className="h-5 w-5 mb-1" />
          <span>{category.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
);

export default DocumentsSubtabPage;
