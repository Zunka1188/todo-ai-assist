import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import ImagePreviewOptimizer from './ImagePreviewOptimizer';

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  item: any;
  onClose: () => void;
  onSaveItem?: (capturedText: string) => boolean | void;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

const ImagePreviewDialog = ({ 
  imageUrl,
  item,
  onClose,
  onSaveItem,
  onEdit,
  onDelete,
  readOnly = false
}: ImagePreviewDialogProps) => {
  const { isMobile } = useIsMobile();
  
  if (!imageUrl && !item) return null;
  
  const dialogContent = (
    <>
      <div className="flex justify-center my-4">
        {imageUrl ? (
          <ImagePreviewOptimizer 
            imageUrl={imageUrl} 
            alt={item?.name || 'Item preview'} 
            className="max-h-[60vh] object-contain rounded-md"
            onError={() => console.error("Failed to load image in preview dialog")}
          />
        ) : (
          <div className="bg-muted h-48 w-full flex items-center justify-center rounded-md">
            <Eye className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
      </div>
      
      {item && (
        <div className="space-y-2 text-sm">
          {item.notes && (
            <p className="text-muted-foreground">{item.notes}</p>
          )}
          
          {item.amount && (
            <p><span className="font-medium">Quantity:</span> {item.amount}</p>
          )}
          
          {item.price && (
            <p><span className="font-medium">Price:</span> {item.price}</p>
          )}
          
          {item.repeatOption && item.repeatOption !== 'none' && (
            <p><span className="font-medium">Recurring:</span> {item.repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}</p>
          )}
        </div>
      )}
    </>
  );
  
  const footerButtons = (
    <>
      {!readOnly && onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
      
      {!readOnly && onDelete && (
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      )}
      
      <Button variant="default" size="sm" onClick={onClose}>
        Close
      </Button>
    </>
  );

  // Use either Dialog or Drawer based on device
  return isMobile ? (
    <Drawer open={!!imageUrl} onOpenChange={() => onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item?.name || 'Image Preview'}</DrawerTitle>
          <Button 
            className="absolute right-4 top-4" 
            size="icon" 
            variant="ghost" 
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>
        
        <div className="px-4 py-2">
          {dialogContent}
        </div>
        
        <DrawerFooter className="flex flex-row justify-end space-x-2">
          {footerButtons}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={!!imageUrl} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>{item?.name || 'Image Preview'}</DialogTitle>
        </DialogHeader>
        
        {dialogContent}
        
        <DialogFooter className="flex flex-row justify-end space-x-2">
          {footerButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
