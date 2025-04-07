
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import FilePreview from './FilePreview';
import { DocumentItem, DocumentFile } from './types';
import ShareButton from '@/components/features/shared/ShareButton';
import { useToast } from '@/hooks/use-toast';

interface FullScreenPreviewProps {
  item: DocumentItem | DocumentFile | null;
  onClose: () => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ item, onClose }) => {
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!item) return null;

  const isDocumentItem = 'type' in item;
  
  const fileUrl = isDocumentItem 
    ? (item.type === 'image' ? item.content : item.file || '') 
    : (item.fileUrl || '');
    
  const fileType = isDocumentItem
    ? (item.type === 'image' ? 'image' : item.fileType || '')
    : (item.fileType || '');
    
  const title = item.title || 'Document Preview';
  
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // For data URLs or blob URLs, create a download link
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = title || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setIsLoading(false);
      
      toast({
        title: "Download Started",
        description: "Your file is being downloaded"
      });
    } catch (error) {
      console.error("Download error:", error);
      setIsLoading(false);
      toast({
        title: "Download Error",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold truncate max-w-[70%]">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden rounded-md border bg-background relative">
        <FilePreview 
          file={fileUrl} 
          fileName={isDocumentItem ? (item.fileName || title) : title} 
          fileType={fileType} 
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="flex justify-end space-x-2 mt-4">
        {fileUrl && !fileUrl.startsWith('data:') && (
          <>
            <Button variant="outline" size="sm" asChild>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
            </Button>
          </>
        )}
        <ShareButton 
          title={`Check out this ${fileType || 'document'}: ${title}`}
          text={isDocumentItem ? item.content || undefined : undefined}
          fileUrl={fileUrl}
          size="sm"
          variant="outline"
          className="gap-2"
          showOptions={true}
        >
          Share
        </ShareButton>
        <Button onClick={onClose} variant="default" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer 
        open={!!item} 
        onOpenChange={(open) => {
          if (!open) onClose();
        }} 
        shouldScaleBackground={false}
        dismissible={false}
      >
        <DrawerContent className="px-4 pb-6 pt-4 h-[85vh]">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog 
      open={!!item} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }} 
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[600px] p-6 max-h-[85vh]"
        preventNavigateOnClose={true}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenPreview;
