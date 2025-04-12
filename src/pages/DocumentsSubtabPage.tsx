import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  ArrowLeft, 
  File, 
  FileBox, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  Plus, 
  Receipt, 
  Upload 
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import AppHeader from '@/components/layout/AppHeader';
import DocumentList from '@/components/features/documents/DocumentList';
import DocumentTableView from '@/components/features/documents/DocumentTableView';
import AddDocumentDialog from '@/components/features/documents/AddDocumentDialog';
import { useDocuments } from '@/hooks/useDocuments';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDocumentActions } from '@/hooks/useDocumentActions';
import { useDocumentClassification } from '@/hooks/useDocumentClassification';
import ImageAnalysisModal from '@/components/features/documents/ImageAnalysisModal';
import { AnalysisResult } from '@/utils/imageAnalysis';
import { DocumentCategory, DocumentFile, DocumentItem } from '@/components/features/documents/types';
import ResponsiveContainer from '@/components/ui/responsive-container';

export type DocumentTab = 'all' | 'receipts' | 'images' | 'forms' | 'other';

const documentCategories = [
  { id: 'all', label: 'All', icon: FileBox },
  { id: 'receipts', label: 'Receipts', icon: Receipt },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'forms', label: 'Forms', icon: FileText },
  { id: 'other', label: 'Other', icon: File },
];

interface AddDocDialogItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  addedDate: string;
  description?: string;
  file?: string | null;
  fileName?: string;
  fileType?: string;
  type?: string;
  content?: string;
}

const DocumentsSubtabPage = () => {
  
  const { subtab } = useParams<{ subtab: DocumentTab }>();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  
  const [activeTab, setActiveTab] = useState<DocumentTab>((subtab || 'all') as DocumentTab);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentMetadata, setCurrentMetadata] = useState<any>(null);
  
  const { 
    categoryItems, 
    files, 
    filterDocuments, 
    handleAddOrUpdateItem, 
    handleDeleteItem, 
    CATEGORIES 
  } = useDocuments();
  
  const {
    handleAddOrUpdateItem: handleAddOrUpdateItemAction,
    handleDeleteItem: handleDeleteItemAction,
    handleDownloadFile
  } = useDocumentActions({ setIsLoading });
  
  const { classifyDocument } = useDocumentClassification();
  
  
  useEffect(() => {
    if (subtab !== activeTab && activeTab) {
      navigate(`/documents/${activeTab}`);
    }
  }, [activeTab, subtab, navigate]);
  
  useEffect(() => {
    if (subtab && documentCategories.some(cat => cat.id === subtab)) {
      setActiveTab(subtab as DocumentTab);
    } else {
      setActiveTab('all');
    }
  }, [subtab]);
  
  const filteredDocuments = filterDocuments(categoryItems, activeTab as DocumentCategory, '');
  
  const handleTabChange = useCallback((tab: DocumentTab) => {
    setActiveTab(tab);
  }, []);
  
  const handleViewModeToggle = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);
  
  const handleAddClick = useCallback(() => {
    setAddDialogOpen(true);
  }, []);
  
  const handleDocumentAction = useCallback((doc: DocumentFile) => {
    console.log('Document action:', doc);
  }, []);
  
  const handleShareDocument = useCallback((doc: DocumentFile) => {
    console.log('Share document:', doc);
  }, []);
  
  const handleDownloadDocument = useCallback((doc: DocumentFile) => {
    if (doc.fileUrl) {
      handleDownloadFile(doc.fileUrl, doc.title || 'document');
    }
  }, [handleDownloadFile]);
  
  const handleDeleteDocument = useCallback((id: string) => {
    handleDeleteItemAction(id);
  }, [handleDeleteItemAction]);
  
  const addDocument = async (fileUrl: string, metadata: any) => {
    try {
      await handleAddOrUpdateItemAction({
        ...metadata,
        file: fileUrl,
        fileName: metadata.fileName,
        fileType: metadata.fileType
      });
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };
  
  const handleAddDocumentSubmit = useCallback(async (file: File, metadata: any) => {
    try {
      setUploadInProgress(true);
      setCurrentFile(file);
      setCurrentMetadata(metadata);
      
      if (file.type.startsWith('image/')) {
        setAnalysisModalOpen(true);
        return;
      }
      
      const fileDataUrl = URL.createObjectURL(file);
      const type = await classifyDocument(fileDataUrl, file.name);
      const fileUrl = URL.createObjectURL(file);
      await addDocument(fileUrl, { 
        ...metadata, 
        type,
        fileName: file.name,
        fileType: file.type 
      });
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding document:', error);
    } finally {
      setUploadInProgress(false);
    }
  }, [classifyDocument]);
  
  const handleAnalysisComplete = useCallback(async (result: AnalysisResult) => {
    try {
      if (currentFile && currentMetadata) {
        const fileUrl = URL.createObjectURL(currentFile);
        await addDocument(fileUrl, { 
          ...currentMetadata,
          ...result,
          fileName: currentFile.name,
          fileType: currentFile.type 
        });
      }
      
      setAnalysisModalOpen(false);
      setAddDialogOpen(false);
      setCurrentFile(null);
      setCurrentMetadata(null);
    } catch (error) {
      console.error('Error processing analysis results:', error);
    }
  }, [currentFile, currentMetadata]);
  
  const handleBackClick = useCallback(() => {
    navigate('/documents');
  }, [navigate]);
  
  const handleAddDocumentWrapper = useCallback((item: AddDocDialogItem) => {
    console.log("Document item received:", item);
    
    const documentItem: DocumentItem = {
      id: item.id,
      title: item.title,
      category: item.category as DocumentCategory,
      type: (item.type as 'image' | 'note') || 'note',
      content: item.content || item.description || '',
      tags: item.tags || [],
      date: new Date(item.date),
      addedDate: new Date(item.addedDate),
      file: item.file || null,
      fileName: item.fileName,
      fileType: item.fileType
    };
    
    handleAddOrUpdateItem(documentItem);
  }, [handleAddOrUpdateItem]);

  

  if (isLoading) {
    return (
      <PageLayout maxWidth="full">
        <div className="flex justify-center items-center h-[70vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout maxWidth="full">
        <div className="flex justify-center items-center h-[70vh]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  const convertToDocumentFiles = (items: DocumentItem[]): DocumentFile[] => {
    return items.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      date: item.date.toISOString(),
      fileType: item.fileType || item.type,
      fileUrl: item.file || (item.type === 'image' ? item.content : undefined)
    }));
  };
  
  const documentFiles = convertToDocumentFiles(filteredDocuments);
  
  return (
    <PageLayout maxWidth="full">
      <AppHeader
        title={`Documents - ${documentCategories.find(cat => cat.id === activeTab)?.label || 'All'}`}
        className="mb-4"
        actions={
          <Button
            onClick={handleAddClick}
            className="ml-auto"
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="mr-1 h-4 w-4" />
            {isMobile ? "Add" : "Add Document"}
          </Button>
        }
      />

      <div className="mb-6">
        <DocumentTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      
      <TabsContent value={activeTab} className="m-0 p-0">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <Upload className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {activeTab === 'all'
                ? "You haven't added any documents yet. Add your first document to get started."
                : `No ${activeTab} found. Add a document or switch to a different category.`}
            </p>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </div>
        ) : (
          <ResponsiveContainer
            direction="column"
            gap="md"
            className="w-full"
            mobileFullWidth={true}
          >
            {viewMode === 'grid' ? (
              <DocumentList
                documents={documentFiles}
                onEditDocument={handleDocumentAction}
                onDeleteDocument={handleDeleteDocument}
                onAddDocument={handleAddClick}
                onDownload={handleDownloadFile}
              />
            ) : (
              <DocumentTableView
                documents={documentFiles}
                onEdit={handleDocumentAction}
                onDelete={handleDeleteDocument}
                onFullScreen={() => {}}
              />
            )}
          </ResponsiveContainer>
        )}
      </TabsContent>
      
      <AddDocumentDialog
        open={addDialogOpen}
        onOpenChange={(open) => setAddDialogOpen(open)}
        onAdd={handleAddDocumentWrapper}
        categories={CATEGORIES as string[]}
        currentCategory={getValidCategory(activeTab)}
        isEditing={false}
        editItem={null}
      />
      
      <ImageAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
        imageData={currentFile ? URL.createObjectURL(currentFile) : null}
      />
    </PageLayout>
  );
};

interface DocumentTabsProps {
  activeTab: DocumentTab;
  onTabChange: (tab: DocumentTab) => void;
}

const DocumentTabs: React.FC<DocumentTabsProps> = ({ activeTab, onTabChange }) => (
  <Tabs defaultValue={activeTab} value={activeTab} onValueChange={onTabChange} className="w-full">
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
