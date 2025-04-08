import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Plus, FileText, Image, Tag, ChefHat, Plane, Dumbbell, Shirt, X, Maximize2, Minimize2, Camera, FileArchive, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/layout/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import FullScreenPreview from '@/components/features/documents/FullScreenPreview';
import DocumentList from '@/components/features/documents/DocumentList';
import DocumentTabs from '@/components/features/documents/DocumentTabs';
import DocumentsPageContent from '@/components/features/documents/DocumentsPageContent';
import { useDocuments } from '@/hooks/useDocuments';
import ImageAnalysisModal from '@/components/features/documents/ImageAnalysisModal';
import { AnalysisResult } from '@/utils/imageAnalysis';
import ShareButton from '@/components/features/shared/ShareButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Define document categories
const documentCategories = [
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'style', label: 'Style', icon: Tag },
  { id: 'recipes', label: 'Recipes', icon: ChefHat },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'other', label: 'Other', icon: Shirt },
];

// Mock data for documents
const mockDocuments = [
  { id: '1', title: 'Document 1', category: 'files', type: 'pdf' },
  { id: '2', title: 'Image 1', category: 'style', type: 'image' },
  { id: '3', title: 'Recipe 1', category: 'recipes', type: 'pdf' },
  { id: '4', title: 'Travel Plan 1', category: 'travel', type: 'pdf' },
  { id: '5', title: 'Workout 1', category: 'fitness', type: 'pdf' },
  { id: '6', title: 'Other 1', category: 'other', type: 'pdf' },
];

// Define a local type for document categories if needed
type DocumentTab = 'files' | 'style' | 'recipes' | 'travel' | 'fitness' | 'other';

const DocumentsSubtabPage = () => {
  const navigate = useNavigate();
  const { subtab } = useParams<{ subtab: string }>();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<DocumentTab>('files');
  const [isGridView, setIsGridView] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isImageAnalysisModalOpen, setIsImageAnalysisModalOpen] = useState(false);
	const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharedLink, setSharedLink] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    // Set active tab based on URL parameter if available
    if (subtab) {
      const validTab = ['other', 'style', 'recipes', 'travel', 'fitness', 'files'].includes(subtab) 
        ? subtab as DocumentTab 
        : 'style';
      setActiveTab(validTab);
    }
  }, [subtab]);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleAddItem = () => {
    // Open file input dialog
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsDialogOpen(true);
      setDialogContent(`Do you want to upload ${file.name}?`);
    }
  };

  const handleConfirmUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      // Simulate successful upload
      toast({
        title: "Upload Successful",
        description: `${uploadedFile.name} has been uploaded successfully.`,
      });
    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadError(error.message || 'Upload failed. Please try again.');
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || 'Upload failed. Please try again.',
      });
    } finally {
      setIsUploading(false);
      setIsDialogOpen(false);
      setUploadedFile(null);
    }
  };

  const handleCancelUpload = () => {
    setIsDialogOpen(false);
    setUploadedFile(null);
  };

  const handleDocumentClick = (document: any) => {
    setSelectedDocument(document);
    if (document.type === 'image') {
      setFullScreenImage(document.url);
    }
  };

  const handleClosePreview = () => {
    setFullScreenImage(null);
    setSelectedDocument(null);
  };

  const handleToggleGridView = () => {
    setIsGridView(!isGridView);
  };

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleAnalyzeImage = async (imageUrl: string) => {
    setIsImageAnalysisModalOpen(true);
  };

  const handleShare = async (documentId: string) => {
    // Simulate generating a shareable link
    const link = `https://example.com/shared/${documentId}`;
    setSharedLink(link);
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setSharedLink('');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* File input for handling uploads */}
      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {/* App Header */}
      <AppHeader title="Documents" onBack={handleBackClick} />

      {/* Search and Add Section */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="relative flex-grow">
          <Input
            type="search"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 rounded-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <Button onClick={handleAddItem} className="ml-4 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Document Tabs */}
      <DocumentTabs
        categories={documentCategories}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <DocumentsPageContent
        documents={mockDocuments}
        activeTab={activeTab}
        searchTerm={searchTerm}
        isGridView={isGridView}
        isFullScreen={isFullScreen}
        selectedDocument={selectedDocument}
        onDocumentClick={handleDocumentClick}
        onToggleGridView={handleToggleGridView}
        onToggleFullScreen={handleToggleFullScreen}
        onAnalyzeImage={handleAnalyzeImage}
        onShare={handleShare}
      />

      {/* Full Screen Preview */}
      {fullScreenImage && (
        <FullScreenPreview
          item={{
            id: selectedDocument?.id,
            title: selectedDocument?.title,
            type: selectedDocument?.type,
            content: fullScreenImage,
            fileName: selectedDocument?.title
          }}
          onClose={handleClosePreview}
          readOnly={false}
        />
      )}

      {/* Image Analysis Modal */}
      <ImageAnalysisModal
        isOpen={isImageAnalysisModalOpen}
        onClose={() => setIsImageAnalysisModalOpen(false)}
        imageUrl={fullScreenImage || ''}
        setAnalysisResult={setAnalysisResult}
      />

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Here is the shareable link for the document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="link" className="text-right">
                Shareable Link
              </label>
              <Input
                type="text"
                id="link"
                value={sharedLink}
                readOnly
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleCloseShareModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Upload</DialogTitle>
            <DialogDescription>
              {dialogContent}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCancelUpload}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleConfirmUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsSubtabPage;
