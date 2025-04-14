
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Trash, ZoomIn, ZoomOut, RotateCw, Download, CopyCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  item?: any;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onSaveItem?: (capturedText?: string) => boolean;
  readOnly?: boolean;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  imageUrl,
  item,
  onClose,
  onDelete,
  onEdit,
  onSaveItem,
  readOnly = false,
  zoom = 1,
  onZoomIn = () => {},
  onZoomOut = () => {},
  onZoomReset = () => {},
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedText, setCapturedText] = useState<string>('');
  const itemName = item?.name || 'Image';

  // Function to handle image download
  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${itemName.replace(/\s+/g, '-').toLowerCase()}-image.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image downloaded",
      description: "The image has been saved to your device",
      duration: 3000,
    });
  };
  
  // Function to copy image to clipboard
  const copyImageToClipboard = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      toast({
        title: "Image copied",
        description: "The image has been copied to clipboard",
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy image:', error);
      toast({
        title: "Copy failed",
        description: "Could not copy the image to clipboard",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[90vh] h-auto overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">{itemName}</DialogTitle>
          
          {/* Zoom controls */}
          <div className="flex items-center gap-2 mt-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Zoom out</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs px-2 h-8"
              onClick={onZoomReset}
            >
              {Math.round(zoom * 100)}%
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom in</span>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="relative overflow-auto max-h-[60vh] flex items-center justify-center p-2">
          {imageUrl ? (
            <div 
              className="relative"
              style={{
                overflow: 'auto',
                maxHeight: '60vh',
              }}
            >
              <img
                src={imageUrl}
                alt={itemName}
                className="object-contain transition-transform"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                  transitionProperty: 'transform',
                  transitionDuration: '150ms',
                }}
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        <DialogFooter className={cn("flex-col sm:flex-row sm:justify-between gap-2", isAnalyzing && "opacity-50 pointer-events-none")}>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
              disabled={!imageUrl || isAnalyzing}
              className="flex-1 text-xs"
            >
              <Download className="mr-1 h-3.5 w-3.5" />
              Download
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyImageToClipboard}
              disabled={!imageUrl || isAnalyzing}
              className="flex-1 text-xs"
            >
              <CopyCheck className="mr-1 h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
          
          <div className="flex flex-1 sm:flex-none gap-2 justify-end">
            {onEdit && !readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                disabled={isAnalyzing}
                className="text-xs"
              >
                <Edit className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
            )}
            
            {onDelete && !readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={isAnalyzing}
                className="text-xs text-destructive hover:text-destructive"
              >
                <Trash className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
