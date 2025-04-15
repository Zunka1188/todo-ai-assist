
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Minimize2, X, Loader2 } from 'lucide-react';

interface FullScreenPreviewProps {
  imageUrl: string;
  onClose: () => void;
  onToggle: () => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ 
  imageUrl, 
  onClose, 
  onToggle 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset loading state when a new image is provided
    setIsLoading(true);
    setHasError(false);
    
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    img.src = imageUrl;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-black/80">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white" 
          onClick={onToggle}
        >
          <Minimize2 className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white" 
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto">
        {isLoading && (
          <div className="text-white flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <span>Loading image...</span>
          </div>
        )}
        
        {!isLoading && hasError && (
          <div className="text-white flex flex-col items-center">
            <span className="text-xl">Failed to load image</span>
          </div>
        )}
        
        {!isLoading && !hasError && (
          <img 
            src={imageUrl} 
            alt="Full screen preview" 
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
};

export default FullScreenPreview;
