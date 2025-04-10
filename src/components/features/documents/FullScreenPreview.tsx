
import React from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentItem, DocumentFile } from './types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import FilePreview from './FilePreview';
import ShareButton from '@/components/features/shared/ShareButton';

interface FullScreenPreviewProps {
  item: DocumentItem | DocumentFile | null;
  onClose: () => void;
  onDownload?: (fileUrl?: string, fileName?: string) => void;
  readOnly?: boolean;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ item, onClose, onDownload, readOnly = false }) => {
  if (!item) return null;

  const isDocumentItem = 'type' in item;
  
  // Determine content URL based on item type
  const contentUrl = isDocumentItem 
    ? (item.type === 'image' ? item.content : item.file || '') 
    : (item.fileUrl || '');
  
  // Determine file name based on item type
  const fileName = isDocumentItem
    ? (item.fileName || item.title)
    : (item.title || 'document');
  
  // Determine if the item is viewable (image, pdf, etc.)
  const isViewable = isDocumentItem 
    ? (item.type === 'image' || (item.fileType && ['image', 'pdf'].includes(item.fileType)))
    : (item.fileType && ['image', 'pdf'].includes(item.fileType));

  const handleDownload = () => {
    if (onDownload) {
      onDownload(contentUrl, fileName);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black text-white">
        <DialogTitle className="sr-only">Preview: {fileName}</DialogTitle>
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <ShareButton
            variant="secondary"
            size="sm"
            className="bg-black/50 hover:bg-black/70 text-white"
            title={`Check out: ${fileName}`}
            text={fileName}
            fileUrl={contentUrl}
            showOptions={true}
            onDownload={handleDownload}
          >
            <Share2 className="h-4 w-4" />
          </ShareButton>
          
          {contentUrl && !readOnly && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-black/50 hover:bg-black/70 text-white"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center w-full h-full min-h-[70vh] bg-black p-4">
          {isViewable ? (
            isDocumentItem && item.type === 'image' ? (
              <img 
                src={item.content} 
                alt={item.title} 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <FilePreview
                file={contentUrl}
                fileName={fileName}
                fileType={isDocumentItem ? item.fileType : item.fileType}
                className="w-full h-full max-h-[80vh]"
              />
            )
          ) : (
            <div className="text-center p-8">
              <p className="mb-4">Preview not available for this file type</p>
              <Button onClick={handleDownload} className="bg-white text-black hover:bg-gray-200">
                <Download className="h-4 w-4 mr-2" />
                Download to view
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenPreview;
