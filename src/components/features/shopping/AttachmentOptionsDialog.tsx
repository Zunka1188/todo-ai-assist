
import React from 'react';
import { Upload, File } from 'lucide-react';
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
  onCameraCapture?: () => void;
  onFileUpload: () => void;
  onDocumentUpload: () => void;
  onManualEntry?: () => void;
  onTemplateBrowse?: () => void;
  onCalendarImport?: () => void;
  onCategorySelect?: () => void;
  title?: string;
}

const AttachmentOptionsDialog = ({
  open,
  onOpenChange,
  onCameraCapture,
  onFileUpload,
  onDocumentUpload,
  onManualEntry,
  onTemplateBrowse,
  onCalendarImport,
  onCategorySelect,
  title = "Add Item Options", 
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
            {onManualEntry && (
              <Button 
                onClick={() => {
                  onManualEntry();
                  onOpenChange(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <File className="h-4 w-4" /> Manual Entry
              </Button>
            )}

            {onTemplateBrowse && (
              <Button 
                onClick={() => {
                  onTemplateBrowse();
                  onOpenChange(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <File className="h-4 w-4" /> Browse Templates
              </Button>
            )}

            <Button 
              onClick={() => {
                onFileUpload();
                onOpenChange(false);
              }}
              className="w-full justify-start gap-3"
              variant="outline"
            >
              <Upload className="h-4 w-4" /> Upload File
            </Button>

            {onCalendarImport && (
              <Button 
                onClick={() => {
                  onCalendarImport();
                  onOpenChange(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <File className="h-4 w-4" /> Import from Calendar
              </Button>
            )}

            {onCategorySelect && (
              <Button 
                onClick={() => {
                  onCategorySelect();
                  onOpenChange(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <File className="h-4 w-4" /> Select by Category
              </Button>
            )}

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
            {onManualEntry && (
              <Button 
                onClick={() => {
                  onManualEntry();
                  onOpenChange(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <File className="h-4 w-4" /> Manual Entry
              </Button>
            )}

            {onTemplateBrowse && (
              <Button 
                onClick={() => {
                  onTemplateBrowse();
                  onOpenChange(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <File className="h-4 w-4" /> Browse Templates
              </Button>
            )}

            <Button 
              onClick={() => {
                onFileUpload();
                onOpenChange(false);
              }}
              className="w-full justify-start gap-3"
              variant="outline"
            >
              <Upload className="h-4 w-4" /> Upload File
            </Button>

            {onCalendarImport && (
              <Button 
                onClick={() => {
                  onCalendarImport();
                  onOpenChange(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <File className="h-4 w-4" /> Import from Calendar
              </Button>
            )}

            {onCategorySelect && (
              <Button 
                onClick={() => {
                  onCategorySelect();
                  onOpenChange(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <File className="h-4 w-4" /> Select by Category
              </Button>
            )}

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
