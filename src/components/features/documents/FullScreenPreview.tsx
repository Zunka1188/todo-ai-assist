
import React from 'react';
import { X, Download, ArrowLeft, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilePreview from './FilePreview';
import { DocumentFile, DocumentItem } from './types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface FullScreenPreviewProps {
  item: DocumentFile | DocumentItem | null;
  onClose: () => void;
  onEdit?: (item: DocumentFile | DocumentItem) => void;
  onDelete?: (id: string) => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ 
  item, 
  onClose,
  onEdit,
  onDelete
}) => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
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
  
  const fileUrl = getFileUrl();
  const fileType = getFileType();

  // Handle download
  const handleDownload = () => {
    if (fileUrl) {
      try {
        // Create a temporary anchor element
        const link = document.createElement('a');
        
        // Handle data URLs (typically for uploaded files)
        if (fileUrl.startsWith('data:')) {
          link.href = fileUrl;
          link.download = getTitle() || `download.${fileType || 'file'}`;
        } else {
          // For remote URLs, open in new tab for better cross-browser compatibility
          link.href = fileUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.download = getTitle() || `download.${fileType || 'file'}`;
        }
        
        // Add to DOM, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download started",
          description: `Downloading ${getTitle() || "file"}`,
        });
      } catch (error) {
        console.error("Download error:", error);
        toast({
          title: "Download failed",
          description: "There was a problem downloading the file.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Download failed",
        description: "No file available to download.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (onEdit && item) {
      onEdit(item);
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete && item) {
      onDelete(item.id);
      onClose();
      toast({
        title: "Item deleted",
        description: `${getTitle()} has been removed`,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-background/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-white font-medium">{getTitle()}</div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/30 hover:bg-white/20"
              onClick={handleEdit}
              aria-label="Edit item"
            >
              <Edit className="h-4 w-4 mr-2" />
              {!isMobile && "Edit"}
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/30 hover:bg-white/20"
              onClick={handleDelete}
              aria-label="Delete item"
            >
              <Trash className="h-4 w-4 mr-2" />
              {!isMobile && "Delete"}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white/30 hover:bg-white/20"
            onClick={handleDownload}
            aria-label="Download file"
          >
            <Download className="h-4 w-4 mr-2" />
            {!isMobile && "Download"}
          </Button>
          
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
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        {('content' in item && item.type === 'note') ? (
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-medium mb-4">{item.title}</h2>
            <p className="whitespace-pre-wrap">{item.content}</p>
            {item.tags && item.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span key={index} className="bg-muted px-2 py-1 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <FilePreview
            file={getFileUrl()}
            fileName={getTitle()}
            fileType={getFileType()}
            className="max-w-full max-h-full bg-white rounded-lg"
            fullScreen={true}
          />
        )}
      </div>
    </div>
  );
};

export default FullScreenPreview;
