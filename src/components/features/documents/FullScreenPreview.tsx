
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilePreview from './FilePreview';
import { DocumentFile, DocumentItem } from './types';

interface FullScreenPreviewProps {
  item: DocumentFile | DocumentItem | null;
  onClose: () => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ 
  item, 
  onClose
}) => {
  if (!item) return null;

  // Handle different item types (DocumentFile vs DocumentItem)
  const getFileUrl = () => {
    if ('fileUrl' in item) return item.fileUrl;
    if ('file' in item) return item.file;
    if ('content' in item && item.type === 'image') return item.content;
    return null;
  };

  const getTitle = () => {
    return item.title;
  };

  const getFileType = () => {
    if ('fileType' in item) return item.fileType;
    if ('type' in item) return item.type;
    return undefined;
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-background/10 backdrop-blur-sm">
        <div className="text-white font-medium">{getTitle()}</div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <FilePreview
          file={getFileUrl()}
          fileName={getTitle()}
          fileType={getFileType()}
          className="max-w-full max-h-full"
        />
      </div>
    </div>
  );
};

export default FullScreenPreview;
