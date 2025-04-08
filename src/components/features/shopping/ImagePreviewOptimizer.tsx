
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { compressImage, getReadableFileSize } from './utils/imageUtils';

interface ImagePreviewOptimizerProps {
  file: File | null;
  onOptimized: (dataUrl: string) => void;
  onCancel: () => void;
  open: boolean;
}

const ImagePreviewOptimizer: React.FC<ImagePreviewOptimizerProps> = ({
  file,
  onOptimized,
  onCancel,
  open
}) => {
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [optimizedPreview, setOptimizedPreview] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [originalSize, setOriginalSize] = useState<string>('');
  const [optimizedSize, setOptimizedSize] = useState<string>('');
  
  useEffect(() => {
    if (!file || !open) return;
    
    // Create preview of original file
    const objectUrl = URL.createObjectURL(file);
    setOriginalPreview(objectUrl);
    setOriginalSize(getReadableFileSize(file.size));
    
    // Start optimization
    setIsOptimizing(true);
    compressImage(file)
      .then(dataUrl => {
        setOptimizedPreview(dataUrl);
        // Approximate size calculation (base64 is ~33% larger than binary)
        const approximateSize = dataUrl.length * 0.75;
        setOptimizedSize(getReadableFileSize(approximateSize));
        setIsOptimizing(false);
      })
      .catch(error => {
        console.error("[ERROR] Image optimization failed:", error);
        setIsOptimizing(false);
        // If optimization fails, still allow using original
        const originalDataUrl = objectUrl;
        setOptimizedPreview(originalDataUrl);
        setOptimizedSize(originalSize);
      });
    
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, open]);
  
  const handleUseOptimized = () => {
    if (optimizedPreview) {
      onOptimized(optimizedPreview);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Optimize Image</h3>
          
          {isOptimizing ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Optimizing your image...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Original</p>
                  {originalPreview && (
                    <div className="relative aspect-square w-full overflow-hidden rounded border">
                      <img src={originalPreview} alt="Original" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{originalSize}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Optimized</p>
                  {optimizedPreview && (
                    <div className="relative aspect-square w-full overflow-hidden rounded border">
                      <img src={optimizedPreview} alt="Optimized" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{optimizedSize}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={onCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleUseOptimized}>
                  <Check className="mr-2 h-4 w-4" />
                  Use Optimized
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewOptimizer;
