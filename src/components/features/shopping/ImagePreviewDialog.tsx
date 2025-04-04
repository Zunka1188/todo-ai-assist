
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogClose, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Image Preview</DialogTitle>
        </DialogHeader>
        <div className="aspect-auto w-full max-h-[70vh] overflow-hidden flex items-center justify-center">
          <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
