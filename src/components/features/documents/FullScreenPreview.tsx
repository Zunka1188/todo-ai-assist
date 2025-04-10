
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, X } from "lucide-react";
import FilePreview from './FilePreview';
import { DocumentItem, DocumentFile } from './types';

interface FullScreenPreviewProps {
  item: DocumentItem | DocumentFile | null;
  onClose: () => void;
  onDownload?: (fileUrl?: string, fileName?: string) => void;
  readOnly?: boolean;
  extraActions?: React.ReactNode;
  additionalContent?: React.ReactNode;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  item,
  onClose,
  onDownload,
  readOnly = true,
  extraActions,
  additionalContent,
}) => {
  if (!item) return null;

  // Check if item is a DocumentFile or DocumentItem using type guard
  const isDocumentFile = 'fileUrl' in item;
  
  // Determine fileUrl, fileName and fileType based on item type
  let fileUrl: string | null | undefined;
  let fileName: string;
  let fileType: string | undefined;
  
  if (isDocumentFile) {
    // Handle DocumentFile type
    const docFile = item as DocumentFile;
    fileUrl = docFile.fileUrl;
    fileName = docFile.title;
    fileType = docFile.fileType;
  } else {
    // Handle DocumentItem type
    const docItem = item as DocumentItem;
    fileUrl = docItem.type === 'image' ? docItem.content : docItem.file;
    fileName = docItem.fileName || docItem.title;
    fileType = docItem.fileType || docItem.type;
  }

  const handleDownload = () => {
    if (onDownload && fileUrl) {
      onDownload(fileUrl, fileName);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="line-clamp-1 mr-8">{item.title}</DialogTitle>
          <div className="flex items-center gap-2">
            {!readOnly && onDownload && fileUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
            )}
            {!readOnly && (
              <Button
                variant="outline"
                size="icon"
                aria-label="Share"
                className="rounded-full"
              >
                <Share className="h-4 w-4" />
              </Button>
            )}
            {extraActions}
            <DialogClose asChild>
              <Button
                variant="ghost" 
                size="icon"
                aria-label="Close"
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="relative min-h-0 flex-1 overflow-auto">
            <FilePreview
              fileUrl={fileUrl}
              fileType={fileType as string}
              fileName={fileName}
              className="w-full h-full object-contain"
              file={fileUrl || ""} // Ensure file prop is always provided with a non-null value
            />
          </div>
          
          {additionalContent}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenPreview;
