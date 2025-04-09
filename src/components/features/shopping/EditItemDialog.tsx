
import React, { useState, useRef, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ShoppingItem } from './useShoppingItems';

interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  onSave: (item: ShoppingItem, imageFile: File | null) => boolean | void;
}

const EditItemDialog: React.FC<EditItemDialogProps> = ({
  isOpen,
  onClose,
  item,
  onSave
}) => {
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [repeatOption, setRepeatOption] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [editItemImage, setEditItemImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update form when item changes
  useEffect(() => {
    if (isOpen && item) {
      setName(item.name || '');
      setNotes(item.notes || '');
      setAmount(item.amount || '');
      setFile(item.imageUrl || null);
      setRepeatOption(item.repeatOption || 'none');
      setEditItemImage(null);
      setIsSaving(false);
      
      if (item.imageUrl) {
        // Extract filename from URL if possible
        const urlParts = item.imageUrl.split('/');
        setFileName(urlParts[urlParts.length - 1] || '');
        setFileType(item.imageUrl.includes('image') ? 'image' : 'unknown');
      }
    }
  }, [isOpen, item]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setIsUploading(true);
    setFileName(selectedFile.name);
    const detectedFileType = getFileTypeFromName(selectedFile.name);
    setFileType(detectedFileType);
    setEditItemImage(selectedFile);
    
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
    reader.onerror = () => {
      toast({
        title: "File Error",
        description: "Failed to read the selected file.",
        variant: "destructive"
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = async () => {
    if (!item) return;
    if (name.trim() === '' && !file) {
      toast({
        title: "Input Required",
        description: "Please enter an item name or add an image.",
        variant: "destructive"
      });
      return;
    }
    
    // Prevent double-saving
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      console.log("[DEBUG] EditItemDialog - Saving with option:", repeatOption);
      
      const updatedItem: ShoppingItem = {
        ...item,
        name: name.trim() || (fileName ? fileName : 'Untitled Item'),
        notes,
        amount,
        imageUrl: file,
        repeatOption
      };
      
      const result = await onSave(updatedItem, editItemImage);
      
      // Only close if save was successful or didn't return a value (assuming success)
      if (result !== false) {
        onClose();
        
        toast({
          title: "Item Updated",
          description: `${updatedItem.name} has been updated.`,
        });
      }
    } catch (error) {
      console.error("[ERROR] EditItemDialog - Error saving item:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName('');
    setFileType('');
    setEditItemImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleFullScreenPreview = () => {
    setFullScreenPreview(!fullScreenPreview);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    if (result.title) setName(result.title);
    if (result.description) setNotes(result.description);
    
    setShowAnalysisModal(false);
    
    toast({
      title: "AI Analysis Complete",
      description: "We've pre-filled the form based on your file",
    });
  };

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
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <div className="space-y-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center h-10"
                disabled={isUploading || isSaving}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload File
              </Button>
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
                disabled={isSaving}
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
                      disabled={isSaving}
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
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Quantity</Label>
            <Input
              id="amount"
              placeholder="e.g., 2 boxes"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSaving}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="repeat-option">Repeat</Label>
            <Select 
              value={repeatOption} 
              onValueChange={(value) => {
                console.log("[DEBUG] EditItemDialog - Repeat option selected:", value);
                setRepeatOption(value as 'none' | 'weekly' | 'monthly');
              }}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent 
                position={isMobile ? "popper" : "item-aligned"}
                className={isMobile ? "w-[calc(100vw-2rem)]" : ""}
                onCloseAutoFocus={(e) => {
                  if (isMobile) {
                    // Prevent the drawer from closing when selecting an option
                    e.preventDefault();
                  }
                }}
              >
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
              disabled={isSaving}
            />
          </div>
        </div>
      </div>
    </>
  );

  if (fullScreenPreview && file && fileType === 'image') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="p-4 flex justify-between items-center bg-black/80">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white" 
            onClick={toggleFullScreenPreview}
            disabled={isSaving}
          >
            <Minimize2 className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white" 
            onClick={onClose}
            disabled={isSaving}
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

  if (isMobile) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={(open) => {
          if (!open && !isSaving) onClose();
        }}>
          <DrawerContent className="max-h-[90vh] overflow-hidden">
            <DrawerHeader className="px-4 py-2">
              <DrawerTitle>Edit Item</DrawerTitle>
            </DrawerHeader>
            
            <ScrollArea 
              className="p-4 pt-0 flex-1 overflow-auto max-h-[65vh]" 
              scrollRef={scrollRef}
              style={{ WebkitOverflowScrolling: 'touch', paddingBottom: '100px' }}
            >
              {dialogContent}
              <div className="h-16"></div>
            </ScrollArea>
            
            <DrawerFooter className="px-4 py-2 gap-2 border-t mt-auto">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="w-full"
                disabled={isSaving || (name.trim() === '' && !file)}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        
        <ImageAnalysisModal
          imageData={file}
          fileName={fileName}
          isOpen={showAnalysisModal}
          onAnalysisComplete={handleAnalysisComplete}
          onClose={() => setShowAnalysisModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}>
        <DialogContent 
          className="sm:max-w-md overflow-hidden max-h-[85vh] flex flex-col"
          preventNavigateOnClose={true}
        >
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Make changes to your shopping item here.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[60vh] pr-4 overflow-y-auto" scrollRef={scrollRef}>
            {dialogContent}
          </ScrollArea>

          <DialogFooter className="mt-4 pt-2 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || (name.trim() === '' && !file)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
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

export default EditItemDialog;
