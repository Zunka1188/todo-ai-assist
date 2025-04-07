
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Share2, Pencil, Trash2, Download } from 'lucide-react';
import { DocumentFile, DocumentItem } from './types';
import FilePreview from './FilePreview';
import ShareButton from '@/components/features/shared/ShareButton';

interface FullScreenPreviewProps {
  item: DocumentItem | DocumentFile | null;
  onClose: () => void;
  onEdit?: (item: DocumentItem | DocumentFile) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ 
  item, 
  onClose,
  onEdit,
  onDelete,
  readOnly = false
}) => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  if (!item) return null;
  
  // Determine if we're dealing with a DocumentItem or DocumentFile
  const isDocumentItem = 'type' in item;
  
  // Get the file URL or content to display
  const fileUrl = isDocumentItem 
    ? (item.type === 'image' ? item.content : item.file) 
    : item.fileUrl;
  
  // Document type, either from the DocumentItem or DocumentFile
  const fileType = isDocumentItem 
    ? (item.type === 'image' ? 'image' : item.fileType || 'unknown')
    : item.fileType;
    
  // Title of the document
  const title = item.title;
  
  const handleDownload = () => {
    if (!fileUrl) return;
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="p-0 max-w-4xl flex items-center justify-center" 
        style={{ 
          minHeight: '50vh', 
          maxHeight: '90vh'
        }}
      >
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium truncate">{title}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <FilePreview 
              file={fileUrl || ''} 
              fileName={title}
              fileType={fileType}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
          
          {/* Action buttons */}
          <div className="p-4 border-t flex justify-between">
            <div className="flex gap-2">
              <ShareButton
                title={`Check out: ${title}`}
                text={title}
                fileUrl={fileUrl || undefined}
                itemId={item.id}
                itemType="document"
                variant="outline"
                size="sm"
                showOptions={true}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </ShareButton>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="flex gap-2">
              {!readOnly && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    if (onEdit) onEdit(item);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              
              {!readOnly && onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (onDelete) onDelete(item.id);
                    onClose();
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenPreview;
