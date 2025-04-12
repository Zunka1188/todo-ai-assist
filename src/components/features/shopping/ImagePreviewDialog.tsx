import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export interface ImagePreviewDialogProps {
  imageUrl: string | null;
  item: any;
  onClose: () => void;
  onSaveItem: (capturedText: string) => boolean;
  onEdit: () => void;
  onDelete?: () => void;
  onClearImage: () => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  imageUrl,
  item,
  onClose,
  onSaveItem,
  onEdit,
  onDelete,
  onClearImage,
  readOnly = false,
  isLoading = false,
}) => {
  return (
    <Dialog open={!!imageUrl} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Spinner size="lg" />
            </div>
          )}
          
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={item?.name || 'Preview'} 
              className="w-full rounded-lg object-contain max-h-[70vh]"
            />
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
              <p className="text-muted-foreground">No image available</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {!readOnly && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearImage}
                disabled={!imageUrl || isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                disabled={isLoading}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
