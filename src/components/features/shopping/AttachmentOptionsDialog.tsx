
import React from 'react';
import { Camera, Upload, File } from 'lucide-react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface AttachmentOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCameraCapture: () => void;
  onFileUpload: () => void;
  onDocumentUpload: () => void;
  title?: string; // Added for customization
}

const AttachmentOptionsDialog = ({
  open,
  onOpenChange,
  onCameraCapture,
  onFileUpload,
  onDocumentUpload,
  title = "Add Item Options", // Default title
}: AttachmentOptionsDialogProps) => {
  const { isMobile } = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => {
                onFileUpload();
                onOpenChange(false);
              }}
              className="w-full justify-start gap-3"
              variant="outline"
            >
              <Upload className="h-4 w-4" /> Attach Image
            </Button>
            <Button 
              onClick={() => {
                onDocumentUpload();
                onOpenChange(false);
              }}
              className="w-full justify-start gap-3"
              variant="outline"
            >
              <File className="h-4 w-4" /> Attach Document
            </Button>
            <Button 
              onClick={() => {
                onCameraCapture();
                onOpenChange(false);
              }}
              className="w-full justify-start gap-3"
              variant="outline"
            >
              <Camera className="h-4 w-4" /> Take a Picture
            </Button>
            <SheetClose asChild>
              <Button variant="ghost" className="w-full mt-2">Cancel</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    );
  } else {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-3 py-4">
            <Button 
              onClick={() => {
                onFileUpload();
                onOpenChange(false);
              }}
              className="w-full justify-start gap-3"
              variant="outline"
            >
              <Upload className="h-4 w-4" /> Attach Image
            </Button>
            <Button 
              onClick={() => {
                onDocumentUpload();
                onOpenChange(false);
              }}
              className="w-full justify-start gap-3"
              variant="outline"
            >
              <File className="h-4 w-4" /> Attach Document
            </Button>
            <Button 
              onClick={() => {
                onCameraCapture();
                onOpenChange(false);
              }}
              className="w-full justify-start gap-3"
              variant="outline"
            >
              <Camera className="h-4 w-4" /> Take a Picture
            </Button>
            <Button variant="ghost" className="w-full mt-2" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
};

export default AttachmentOptionsDialog;
