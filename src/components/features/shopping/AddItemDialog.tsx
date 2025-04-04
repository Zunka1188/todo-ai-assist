
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
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageAnalysisModal from '../documents/ImageAnalysisModal';
import { AnalysisResult } from '@/utils/imageAnalysis';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: { 
    name: string, 
    category: string, 
    notes?: string, 
    amount?: string, 
    dateToPurchase?: string, 
    price?: string, 
    file?: string | null,
    fileName?: string,
    fileType?: string
  }) => void;
}

const AddItemDialog = ({ open, onOpenChange, onSave }: AddItemDialogProps) => {
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [dateToPurchase, setDateToPurchase] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [imageOptionsOpen, setImageOptionsOpen] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const predefinedCategories = ["Other", "Style", "Recipes", "Travel", "Fitness", "Files"];

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
        
        // Trigger AI analysis for images, PDFs and documents
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
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      
      // When video can play, capture a frame
      video.onloadedmetadata = () => {
        video.play();
        
        // Set canvas dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to image data
          const imageData = canvas.toDataURL('image/jpeg');
          setFile(imageData);
          setFileName("camera_capture_" + new Date().toISOString().substring(0, 10) + ".jpg");
          setFileType('image');
          
          // Stop camera stream
          stream.getTracks().forEach(track => track.stop());
          
          // Trigger AI analysis
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "custom") {
      setIsCustomCategory(true);
      setCategory('');
    } else {
      setIsCustomCategory(false);
      setCategory(value);
      setCustomCategory('');
    }
  };

  const handleSave = () => {
    if (name.trim() === '' && !file) {
      return;
    }
    
    const finalCategory = isCustomCategory ? customCategory : category;
    
    const itemData = {
      name: name.trim() || (fileName ? fileName : 'Untitled Item'),
      category: finalCategory || 'Other',
      notes,
      amount,
      dateToPurchase,
      price,
      file,
      fileName: fileName || undefined,
      fileType: fileType || undefined
    };
    
    onSave(itemData);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setCustomCategory('');
    setNotes('');
    setAmount('');
    setDateToPurchase('');
    setPrice('');
    setFile(null);
    setFileName('');
    setFileType('');
    setImageOptionsOpen(false);
    setIsCustomCategory(false);
    setFullScreenPreview(false);
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
    // Apply AI analysis results to form fields
    if (result.title) setName(result.title);
    
    // Match the category from analysis to one of our available categories
    if (result.category) {
      const lowerCaseCategory = result.category.toLowerCase();
      // Check if the category exists in our list
      const foundCategory = predefinedCategories.find(cat => 
        cat.toLowerCase() === lowerCaseCategory
      );
      if (foundCategory) {
        setCategory(foundCategory);
      }
    }
    
    if (result.description) setNotes(result.description);
    if (result.price) setPrice(result.price);
    
    // Close analysis modal
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
          <SheetContent side="bottom" className="h-auto pb-8">
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
                <Camera className="h-4 w-4" /> Take a Picture
              </Button>
              <Button variant="ghost" className="w-full mt-2">Cancel</Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
  };

  // If in full screen mode for image preview, show a simplified view
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("sm:max-w-md", isMobile && "w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto")}>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-10rem)]">
            <div className="space-y-4 pr-4">
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
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={isCustomCategory ? "custom" : category}
                    onChange={handleCategoryChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a category</option>
                    {predefinedCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="custom">Add custom category</option>
                  </select>
                  
                  {isCustomCategory && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter custom category"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="file">File Attachment</Label>
                  <div className="flex gap-2">
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
                    
                    {isUploading ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        disabled
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </Button>
                    ) : (
                      <FileSourceOptions />
                    )}
                    
                    {file && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearFile}
                        className="p-2"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {file && (
                    <div className="relative mt-2">
                      <FilePreview 
                        file={file}
                        fileName={fileName}
                        fileType={fileType}
                        className="max-h-32"
                      />
                      {fileType === 'image' && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                          onClick={toggleFullScreenPreview}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      )}
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
                  <Label htmlFor="date">Purchase By</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dateToPurchase}
                    onChange={(e) => setDateToPurchase(e.target.value)}
                  />
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
          </ScrollArea>

          <DialogFooter className={cn(isMobile && "flex-col gap-2")}>
            <Button 
              variant="outline" 
              className={cn(isMobile && "w-full")}
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className={cn(isMobile && "w-full")}
              disabled={name.trim() === '' && !file}
            >
              Add to Shopping List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
