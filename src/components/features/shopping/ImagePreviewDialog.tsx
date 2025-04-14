
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import useErrorHandler from '@/hooks/useErrorHandler';

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string;
  itemName?: string;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  open,
  onOpenChange,
  imageUrl,
  itemName = 'Item'
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const { handleError } = useErrorHandler();

  // Handle zoom actions
  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 25);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 25);
    }
  };

  // Handle rotation
  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  // Handle image copy
  const handleCopyImage = async () => {
    if (!imageUrl) return;
    
    try {
      // Fetch the image and copy to clipboard
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Chrome and modern browsers support copying images
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({
          [blob.type]: blob
        });
        await navigator.clipboard.write([item]);
        toast({
          title: "Image copied",
          description: "Image copied to clipboard"
        });
      } else {
        // Fallback for browsers that don't support copying images
        toast({
          title: "Cannot copy image",
          description: "Your browser doesn't support copying images",
          variant: "destructive"
        });
      }
    } catch (error) {
      handleError(`Failed to copy image: ${error instanceof Error ? error.message : String(error)}`, 'ImagePreview');
    }
  };

  // Handle image download
  const handleDownload = () => {
    if (!imageUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${itemName.replace(/\s+/g, '_').toLowerCase()}_image.jpg`;
      link.click();
    } catch (error) {
      handleError(`Failed to download image: ${error instanceof Error ? error.message : String(error)}`, 'ImagePreview');
    }
  };

  // Reset zoom and rotation when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      // Reset on close
      setZoomLevel(100);
      setRotation(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{itemName} Image</DialogTitle>
          <Button 
            className="absolute right-4 top-4" 
            size="sm" 
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="overflow-hidden relative">
          {imageUrl ? (
            <div className="flex justify-center min-h-[200px] items-center bg-black/5 rounded-md">
              <img 
                src={imageUrl} 
                alt={itemName}
                className="max-h-[60vh] object-contain transition-all duration-200"
                style={{ 
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                }}
              />
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center bg-muted rounded-md">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
        </div>
        
        {imageUrl && (
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                <ZoomIn className="h-4 w-4 mr-1" />
                {!isMobile && "Zoom In"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                <ZoomOut className="h-4 w-4 mr-1" />
                {!isMobile && "Zoom Out"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCcw className="h-4 w-4 mr-1" />
                {!isMobile && "Rotate"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyImage}>
                <Copy className="h-4 w-4 mr-1" />
                {!isMobile && "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                {!isMobile && "Download"}
              </Button>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
