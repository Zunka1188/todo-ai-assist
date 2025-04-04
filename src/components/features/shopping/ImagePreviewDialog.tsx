
import React from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
        <div className="relative w-full h-full max-h-[80vh] flex flex-col">
          <div className="flex-grow flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
          </div>
          <DialogFooter className="p-4 bg-background border-t">
            <Button onClick={onClose} variant="secondary">Close</Button>
          </DialogFooter>
        </div>
        
        {/* Close Button in the top right */}
        <Button 
          onClick={onClose}
          variant="ghost" 
          size="icon"
          className="absolute right-2 top-2 rounded-full h-8 w-8 p-0 bg-background/80 hover:bg-background/90"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
