
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Maximize2, Download, Share2 } from 'lucide-react';
import ImagePreviewOptimizer from './ImagePreviewOptimizer';
import FullScreenPreview from './FullScreenPreview';

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null | undefined;
  itemName?: string;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  open,
  onOpenChange,
  imageUrl,
  itemName
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  const handleClose = () => {
    onOpenChange(false);
    setIsFullScreen(false);
  };
  
  const handleShareImage = () => {
    if (!imageUrl) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Item Image: ${itemName || 'Shopping Item'}`,
        text: `Check out this image of ${itemName || 'my shopping item'}`,
        url: imageUrl
      }).catch(err => console.error("Error sharing image:", err));
    } else {
      navigator.clipboard.writeText(imageUrl).then(() => {
        alert("Image URL copied to clipboard!");
      });
    }
  };
  
  const handleDownload = () => {
    if (!imageUrl) return;
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${itemName || 'shopping-item'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // If in full screen mode, render the full screen component
  if (open && isFullScreen && imageUrl) {
    return (
      <FullScreenPreview
        imageUrl={imageUrl}
        onClose={handleClose}
        onToggle={toggleFullScreen}
      />
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <div className="flex flex-col gap-4 py-4">
          <div className="text-lg font-medium">
            {itemName || 'Item'} Image
          </div>
          
          <div className="relative max-h-80 overflow-hidden rounded-lg">
            {imageUrl ? (
              <ImagePreviewOptimizer
                imageUrl={imageUrl}
                alt={itemName || 'Shopping item'}
                className="w-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-40 bg-muted">
                No image available
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          {imageUrl && (
            <div className="flex gap-2 mr-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareImage}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            {imageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullScreen}
                className="flex items-center gap-2"
              >
                <Maximize2 className="h-4 w-4" />
                Full Screen
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
