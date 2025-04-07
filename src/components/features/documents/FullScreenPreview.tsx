
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { DocumentItem, DocumentFile } from './types';
import FilePreview from './FilePreview';
import { toast } from 'sonner';

interface FullScreenPreviewProps {
  item: DocumentItem | DocumentFile | null;
  onClose: () => void;
  readOnly?: boolean;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ 
  item, 
  onClose,
  readOnly = false
}) => {
  // Use local state to control the dialog
  const [isOpen, setIsOpen] = useState(Boolean(item));
  
  if (!item) return null;

  const isDocumentItem = 'content' in item;
  const isDocumentFile = 'fileUrl' in item;
  
  // Get the file URL based on item type
  let fileUrl = '';
  let fileType = '';
  let title = '';
  
  if (isDocumentItem) {
    fileUrl = item.type === 'image' ? item.content : item.file || '';
    fileType = item.fileType || (item.type === 'image' ? 'image' : 'note');
    title = item.title;
  } else if (isDocumentFile) {
    fileUrl = item.fileUrl || '';
    fileType = item.fileType || '';
    title = item.title;
  }
  
  const handleDownload = () => {
    if (!fileUrl) {
      toast.error("No file available to download");
      return;
    }
    
    try {
      // Create a new anchor element
      const downloadLink = window.document.createElement('a');
      downloadLink.href = fileUrl;
      downloadLink.download = title || 'document';
      window.document.body.appendChild(downloadLink);
      downloadLink.click();
      window.document.body.removeChild(downloadLink);
      
      toast.success(`Downloading: ${title}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) onClose();
  };

  return (
    <Dialog open={Boolean(item)} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preview of your document
          </DialogDescription>
          <Button
            className="absolute right-4 top-4"
            variant="ghost"
            size="icon"
            onClick={() => handleDialogChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="py-4">
          <FilePreview
            file={fileUrl}
            fileType={fileType}
            fileName={
              isDocumentItem 
                ? (item.fileName || item.title) 
                : (isDocumentFile ? item.title : '')
            }
            className="max-h-[70vh] w-full"
            fullScreen={true}
          />
        </div>
        
        <div className="flex justify-end mt-2">
          <Button
            onClick={handleDownload}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenPreview;
