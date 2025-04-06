
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Share2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import ShareButton from '@/components/features/shared/ShareButton';

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
  onSaveItem?: (itemData: any) => boolean;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({ 
  imageUrl, 
  onClose, 
  onSaveItem
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
      <DialogContent 
        className="max-w-3xl p-0 flex items-center justify-center" 
        preventNavigateOnClose={true}
        style={{ 
          minHeight: '50vh', 
          maxHeight: '90vh',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="max-w-full max-h-[80vh] object-contain" 
          />
        </div>
        
        <div className="absolute top-4 left-4 flex gap-2">
          <ShareButton
            title="Check out this image"
            fileUrl={imageUrl}
            variant="secondary"
            className="bg-background/80 hover:bg-background/90"
            size="icon"
            showOptions={true}
          >
            <Share2 className="h-4 w-4" />
          </ShareButton>
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
