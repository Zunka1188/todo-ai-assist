
import React from 'react';
import { Maximize2, Pencil, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilePreview from './FilePreview';
import { DocumentFile } from './types';
import { getCategoryIcon, getFileTypeIcon } from './utils/iconHelpers';
import { useIsMobile } from '@/hooks/use-mobile';
import ShareButton from '@/components/features/shared/ShareButton';

interface DocumentListItemProps {
  document: DocumentFile;
  onEdit: () => void;
  onDelete: () => void;
  onFullScreen: () => void;
}

const DocumentListItem: React.FC<DocumentListItemProps> = ({ 
  document, 
  onEdit, 
  onDelete, 
  onFullScreen 
}) => {
  const { isMobile } = useIsMobile();
  
  // Format ISO date string to European format (DD/MM/YYYY)
  const formatDateEuropean = (dateString: string): string => {
    const date = new Date(dateString);
    // Ensure we don't display future dates
    const today = new Date();
    const dateToUse = date > today ? today : date;
    
    const day = dateToUse.getDate().toString().padStart(2, '0');
    const month = (dateToUse.getMonth() + 1).toString().padStart(2, '0');
    const year = dateToUse.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const handleItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onFullScreen();
  };

  return (
    <div 
      className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleItemClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${document.title}`}
    >
      <div className="flex items-start">
        <div className="mr-4 shrink-0 w-12">
          {document.category && getCategoryIcon(document.category)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{document.title}</h3>
              <div className="text-sm text-muted-foreground mt-1">
                Category: {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {formatDateEuropean(document.date)}
              </div>
            </div>
            <div className="flex space-x-2 ml-2">
              {/* Full screen button */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={(e) => {
                  e.stopPropagation();
                  onFullScreen();
                }}
                aria-label="View full screen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              
              {/* Share button with enhanced sharing options */}
              <ShareButton
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title={`Check out this file: ${document.title}`}
                fileUrl={document.fileUrl}
                onClick={(e) => e.stopPropagation()}
                showOptions={true}
                aria-label="Share document"
              >
                <Share2 className="h-4 w-4" />
              </ShareButton>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label="Edit document"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={`h-8 w-8 ${isMobile ? "text-destructive hover:bg-destructive/10" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* File preview */}
      {document.fileUrl && (
        <div className="mt-3">
          <FilePreview 
            file={document.fileUrl}
            fileName={document.title}
            fileType={document.fileType}
            className="h-32 w-full"
          />
        </div>
      )}
    </div>
  );
};

export default DocumentListItem;
