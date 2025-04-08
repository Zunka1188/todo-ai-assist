
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Share2, Pencil, Trash2, Download } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import ShareButton from '@/components/features/shared/ShareButton';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
  onSaveItem?: (itemData: any) => boolean;
  item?: any;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({ 
  imageUrl, 
  onClose, 
  onSaveItem,
  item,
  onEdit,
  onDelete,
  readOnly = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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

  const handleDownload = () => {
    if (!imageUrl) return;
    
    // Create a more descriptive filename using item name if available
    const filename = item?.name 
      ? `shopping-item-${item.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
      : `shopping-item-${Date.now()}`;
    
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Provide feedback that download started
    toast({
      title: "Download Started",
      description: "Your image is being downloaded",
    });
  };

  if (!imageUrl) return null;
  
  return (
    <>
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
          
          {/* Action buttons */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {/* Share button */}
            <ShareButton
              title="Check out this image"
              text={item?.name || "Shopping item"}
              fileUrl={imageUrl}
              variant="secondary"
              className="bg-background/80 hover:bg-background/90"
              size="icon"
              showOptions={true}
            >
              <Share2 className="h-4 w-4" />
            </ShareButton>
            
            {/* Download button */}
            <Button
              onClick={handleDownload}
              variant="secondary" 
              size="icon"
              className="bg-background/80 hover:bg-background/90"
              title="Download image"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {/* Edit button */}
            {onEdit && !readOnly && (
              <Button
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                variant="secondary" 
                size="icon"
                className="bg-background/80 hover:bg-background/90"
                title="Edit item"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            
            {/* Delete button */}
            {onDelete && !readOnly && (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive" 
                size="icon"
                className="bg-destructive/80 hover:bg-destructive/90"
                title="Delete item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Close Button in the top right */}
          <Button 
            onClick={onClose}
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-2 rounded-full h-8 w-8 p-0 bg-background/80 hover:bg-background/90"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this item from your shopping list.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowDeleteConfirm(false);
                onClose();
                if (onDelete) onDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ImagePreviewDialog;
