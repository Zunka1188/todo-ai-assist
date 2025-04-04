
import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, Upload, Camera, X, Plus, File, Paperclip, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import FilePreview, { getFileTypeFromName } from '../documents/FilePreview';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageAnalysisModal from '../documents/ImageAnalysisModal';
import { AnalysisResult } from '@/utils/imageAnalysis';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface ItemData {
  id?: string;
  name: string;
  notes?: string;
  amount?: string;
  price?: string;
  file?: string | null;
  fileName?: string;
  fileType?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
}

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: ItemData) => void;
  editItem?: ItemData | null;
  isEditing?: boolean;
}

const AddItemDialog = ({ open, onOpenChange, onSave, editItem = null, isEditing = false }: AddItemDialogProps) => {
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [imageOptionsOpen, setImageOptionsOpen] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [repeatOption, setRepeatOption] = useState<'none' | 'weekly' | 'monthly'>('none');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editItem && open) {
      setName(editItem.name || '');
      setNotes(editItem.notes || '');
      setAmount(editItem.amount || '');
      setPrice(editItem.price || '');
      setFile(editItem.file || null);
      setFileName(editItem.fileName || '');
      setFileType(editItem.fileType || '');
      setRepeatOption(editItem.repeatOption || 'none');
    } else if (!editItem && open) {
      resetForm();
    }
  }, [editItem, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setIsUploading(true);
    setFileName(selectedFile.name);
    const detectedFileType = getFileTypeFromName(selectedFile.name);
    setFileType(detectedFileType);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFile(event.target.result as string);
        setIsUploading(false);
        
        if (['image', 'pdf', 'document'].includes(detectedFileType)) {
          setShowAnalysisModal(true);
        }
      }
    };
    reader.readAsDataURL(selectedFile);
    
    setImageOptionsOpen(false);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
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
          setFile(imageData);
          setFileName("camera_capture_" + new Date().toISOString().substring(0, 10) + ".jpg");
          setFileType('image');
          
          stream.getTracks().forEach(track => track.stop());
          
          setShowAnalysisModal(true);
        }
      };
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    if (name.trim() === '' && !file) {
      return;
    }
    
    const itemData: ItemData = {
      ...(editItem?.id ? { id: editItem.id } : {}),
      name: name.trim() || (fileName ? fileName : 'Untitled Item'),
      notes,
      amount,
      price,
      file,
      fileName: fileName || undefined,
      fileType: fileType || undefined,
      repeatOption
    };
    
    onSave(itemData);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setNotes('');
    setAmount('');
    setPrice('');
    setFile(null);
    setFileName('');
    setFileType('');
    setImageOptionsOpen(false);
    setFullScreenPreview(false);
    setRepeatOption('none');
  };

  const clearFile = () => {
    setFile(null);
    setFileName('');
    setFileType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const toggleFullScreenPreview = () => {
    setFullScreenPreview(!fullScreenPreview);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    if (result.title) setName(result.title);
    if (result.description) setNotes(result.description);
    if (result.price) setPrice(result.price);
    
    setShowAnalysisModal(false);
    
    toast({
      title: "AI Analysis Complete",
      description: "We've pre-filled the form based on your file",
    });
  };

  const FileSourceOptions = () => {
    if (isMobile) {
      return (
        <Sheet open={imageOptionsOpen} onOpenChange={setImageOptionsOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageOptionsOpen(true)}
              className="flex-1"
            >
              <Paperclip className="mr-2 h-4 w-4" />
              {file ? "Change File" : "Add File"}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto pb-8" preventNavigateOnClose={true}>
            <SheetHeader className="mb-4">
              <SheetTitle>Choose File Source</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => {
                  fileInputRef.current?.click();
                  setImageOptionsOpen(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Upload className="h-4 w-4" /> Upload File
              </Button>
              <Button 
                onClick={() => {
                  cameraInputRef.current?.click();
                  setImageOptionsOpen(false);
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
            >
              <Paperclip className="mr-2 h-4 w-4" />
              {file ? "Change File" : "Add File"}
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
                onClick={() => cameraInputRef.current?.click()}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Camera className="h-4 w-4" /> Take Photo
              </Button>
              <Button variant="ghost" className="w-full mt-2">Cancel</Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
  };

  if (fullScreenPreview && file && fileType === 'image') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="p-4 flex justify-between items-center bg-black/80">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white" 
            onClick={toggleFullScreenPreview}
          >
            <Minimize2 className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <img 
            src={file} 
            alt="Full screen preview" 
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    );
  }

  // The main content of our dialog that both the desktop Dialog and mobile Drawer will use
  const dialogContent = (
    <>
      <div className={cn("space-y-4", isMobile && "pb-4")}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              placeholder="Enter item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center h-10"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload File
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center h-10"
                  disabled={isUploading}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported files: images, PDFs, documents, spreadsheets, and more
              </p>
              
              <Input
                id="file"
                type="file"
                accept="*/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {file && (
              <div className="relative mt-2">
                <FilePreview 
                  file={file}
                  fileName={fileName}
                  fileType={fileType}
                  className="max-h-32 w-full"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {fileType === 'image' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={toggleFullScreenPreview}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Quantity</Label>
              <Input
                id="amount"
                placeholder="e.g., 2 boxes"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 9.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="repeat-option">Repeat</Label>
            <Select 
              value={repeatOption} 
              onValueChange={(value) => setRepeatOption(value as 'none' | 'weekly' | 'monthly')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (One-off)</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes here"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
      </div>
    </>
  );

  // Render different UI for mobile vs. desktop
  return (
    <>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[85vh] overflow-hidden">
            <DrawerHeader className="px-4 py-2">
              <DrawerTitle>{isEditing ? "Edit Item" : "Add New Item"}</DrawerTitle>
            </DrawerHeader>
            
            <ScrollArea className="p-4 pt-0 flex-1 overflow-auto max-h-[60vh]" scrollRef={scrollRef}>
              {dialogContent}
            </ScrollArea>
            
            <DrawerFooter className="px-4 py-2 gap-2">
              <Button variant="outline" className="w-full" onClick={() => {
                resetForm();
                onOpenChange(false);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="w-full"
                disabled={name.trim() === '' && !file}
              >
                {isEditing ? "Save Changes" : "Add to Shopping List"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent 
            className="sm:max-w-md overflow-hidden max-h-[85vh] flex flex-col"
            preventNavigateOnClose={true}
          >
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>

            <ScrollArea className="flex-1 max-h-[60vh] pr-4 overflow-y-auto" scrollRef={scrollRef}>
              {dialogContent}
            </ScrollArea>

            <DialogFooter className="mt-4 pt-2 border-t">
              <Button variant="outline" onClick={() => {
                resetForm();
                onOpenChange(false);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={name.trim() === '' && !file}
              >
                {isEditing ? "Save Changes" : "Add to Shopping List"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ImageAnalysisModal
        imageData={file}
        fileName={fileName}
        isOpen={showAnalysisModal}
        onAnalysisComplete={handleAnalysisComplete}
        onClose={() => setShowAnalysisModal(false)}
      />
    </>
  );
};

export default AddItemDialog;
