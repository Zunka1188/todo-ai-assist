
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({ imageUrl, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle back navigation and prevent default behavior
  useEffect(() => {
    if (!imageUrl) return;
    
    const handlePopState = (e: PopStateEvent) => {
      // Prevent the default navigation behavior
      e.preventDefault();
      // Close the dialog
      onClose();
      // Push the current path back to history to maintain correct state
      navigate(location.pathname, { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [imageUrl, onClose, navigate, location.pathname]);

  if (!imageUrl) return null;
  
  return (
    <Dialog 
      open={!!imageUrl} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-3xl p-0" preventNavigateOnClose={true}>
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
