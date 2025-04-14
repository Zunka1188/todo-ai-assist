
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Maximize2, Download, Share2 } from 'lucide-react';
import ImagePreviewOptimizer from '../shopping/ImagePreviewOptimizer';

interface DocumentViewerProps {
  documentUrl: string;
  documentName: string;
  documentType: string;
  onFullscreen?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  documentName,
  documentType,
  onFullscreen,
  onDownload,
  onShare
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isImage = documentType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(documentUrl);
  const isPdf = documentType === 'application/pdf' || documentUrl.endsWith('.pdf');

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.error(`Failed to load document: ${documentUrl}`);
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="p-3 bg-muted/30 flex justify-between items-center border-b">
        <h3 className="text-sm font-medium truncate" title={documentName}>
          {documentName}
        </h3>
        <div className="flex gap-1">
          {onFullscreen && (
            <Button variant="ghost" size="icon" onClick={onFullscreen} className="h-8 w-8">
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Fullscreen</span>
            </Button>
          )}
          {onDownload && (
            <Button variant="ghost" size="icon" onClick={onDownload} className="h-8 w-8">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          )}
          {onShare && (
            <Button variant="ghost" size="icon" onClick={onShare} className="h-8 w-8">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative flex-grow min-h-[300px] bg-muted/20">
        {isImage ? (
          <ImagePreviewOptimizer
            imageUrl={documentUrl}
            alt={documentName}
            className="w-full h-full object-contain"
            onLoad={handleLoad}
            onError={handleError}
            previewable={!!onFullscreen}
            onPreview={onFullscreen}
            loading="lazy"
          />
        ) : isPdf ? (
          <iframe 
            src={documentUrl} 
            title={documentName}
            className="w-full h-full"
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError as any}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Preview not available</p>
          </div>
        )}
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DocumentViewer;
