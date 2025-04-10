
import React, { useState, useEffect } from 'react';
import { Loader2, ImageIcon } from 'lucide-react';

interface ImagePreviewOptimizerProps {
  imageUrl: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  onPreview?: () => void;
  previewable?: boolean;
}

/**
 * A component that optimizes image display with progressive loading and fallbacks
 */
const ImagePreviewOptimizer: React.FC<ImagePreviewOptimizerProps> = ({
  imageUrl,
  alt,
  className = '',
  onLoad,
  onError,
  onPreview,
  previewable = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setDisplayUrl(null);

    // Reset state when image URL changes
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    // Handle data URLs directly without preloading
    if (imageUrl.startsWith('data:')) {
      setDisplayUrl(imageUrl);
      setIsLoading(false);
      onLoad?.();
      return;
    }

    // Create a new image object to preload
    const img = new Image();
    
    img.onload = () => {
      setDisplayUrl(imageUrl);
      setIsLoading(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${imageUrl}`);
      setHasError(true);
      setIsLoading(false);
      onError?.();
    };
    
    img.src = imageUrl;

    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, onLoad, onError]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (hasError || !displayUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <ImageIcon className="h-8 w-8 text-gray-400" />
        <span className="text-sm text-gray-500 ml-2">Image not available</span>
      </div>
    );
  }

  const handleImageClick = () => {
    if (previewable && onPreview) {
      onPreview();
    }
  };

  return (
    <img
      src={displayUrl}
      alt={alt}
      className={`${className} ${previewable ? 'cursor-pointer' : ''}`}
      loading="lazy"
      onClick={handleImageClick}
      role={previewable ? "button" : undefined}
      aria-label={previewable ? `Preview ${alt}` : undefined}
    />
  );
};

export default ImagePreviewOptimizer;
