
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { DocumentItem, DocumentFile } from './types';
import FilePreview from './FilePreview';

interface FullScreenPreviewProps {
  item: DocumentItem | DocumentFile | null;
  onClose: () => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ item, onClose }) => {
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

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
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
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="py-4">
          <FilePreview
            fileUrl={fileUrl}
            fileType={fileType}
            fileName={
              isDocumentItem 
                ? (item.fileName || item.title) 
                : (isDocumentFile ? item.title : '')
            }
            className="max-h-[70vh] w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenPreview;
