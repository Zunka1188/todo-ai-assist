
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Paperclip, X, Upload, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import FilePreview, { getFileTypeFromName } from '../../documents/FilePreview';

export interface FileAttachment {
  id: string;
  name: string;
  fileContent: string;
  fileType: string;
}

interface FileAttachmentFieldProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  maxFiles?: number;
}

export const FileAttachmentField: React.FC<FileAttachmentFieldProps> = ({
  attachments,
  onAttachmentsChange,
  maxFiles = 5,
}) => {
  const { isMobile } = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [attachmentOptionsOpen, setAttachmentOptionsOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (attachments.length >= maxFiles) {
      return;
    }
    
    const fileName = selectedFile.name;
    const fileType = getFileTypeFromName(fileName);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAttachment = {
          id: Date.now().toString(),
          name: fileName,
          fileContent: event.target.result as string,
          fileType,
        };
        
        onAttachmentsChange([...attachments, newAttachment]);
      }
    };
    reader.readAsDataURL(selectedFile);
    
    // Reset the input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Close the options dialog if open
    setAttachmentOptionsOpen(false);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      
      const canvas = document.createElement('canvas');
      
      video.onloadedmetadata = () => {
        video.play();
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = canvas.toDataURL('image/jpeg');
          const fileName = `camera_capture_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
          
          const newAttachment = {
            id: Date.now().toString(),
            name: fileName,
            fileContent: imageData,
            fileType: 'image',
          };
          
          onAttachmentsChange([...attachments, newAttachment]);
          
          // Stop camera stream
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      setAttachmentOptionsOpen(false);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(attachment => attachment.id !== id);
    onAttachmentsChange(updatedAttachments);
  };

  const AttachmentOptions = () => {
    if (isMobile) {
      return (
        <Sheet open={attachmentOptionsOpen} onOpenChange={setAttachmentOptionsOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAttachmentOptionsOpen(true)}
              disabled={attachments.length >= maxFiles}
              className="gap-2"
            >
              <Paperclip size={16} />
              Add Attachment
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>Choose Attachment Source</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Upload className="h-4 w-4" /> Upload File
              </Button>
              <Button 
                onClick={() => cameraInputRef.current?.click()}
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={attachments.length >= maxFiles}
              className="gap-2"
            >
              <Paperclip size={16} />
              Add Attachment
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-xs">
            <div className="flex flex-col space-y-3 py-2">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Upload className="h-4 w-4" /> Upload File
              </Button>
              <Button 
                onClick={() => handleCameraCapture()}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Camera className="h-4 w-4" /> Take a Picture
              </Button>
              <Button variant="ghost" className="w-full mt-2">Cancel</Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <Label>Attachments</Label>
        
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="*/*"
        />
        <Input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          capture="environment"
        />
        
        <AttachmentOptions />
        
        {attachments.length > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            {attachments.length} of {maxFiles} attachments used
          </div>
        )}
      </div>
      
      {attachments.length > 0 && (
        <div className="space-y-2 mt-2">
          {attachments.map(attachment => (
            <div key={attachment.id} className="flex items-center gap-2 border rounded-md p-2">
              <div className="w-10 h-10 flex-shrink-0">
                <FilePreview 
                  file={attachment.fileContent}
                  fileName={attachment.name}
                  fileType={attachment.fileType}
                  className="w-10 h-10"
                />
              </div>
              
              <div className="flex-1 truncate text-sm">
                {attachment.name}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={() => handleRemoveAttachment(attachment.id)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileAttachmentField;
