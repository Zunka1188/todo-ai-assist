import React, { useState, useRef } from 'react';
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
import { Image, Upload, Camera, X, Plus, File, Paperclip } from 'lucide-react';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const predefinedCategories = ["Other", "Style", "Recipes", "Travel", "Fitness", "Files"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFileName(selectedFile.name);
    const detectedFileType = getFileTypeFromName(selectedFile.name);
    setFileType(detectedFileType);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFile(event.target.result as string);
      }
    };
    reader.readAsDataURL(selectedFile);
    
    setImageOptionsOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", isMobile && "w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category (Optional)</Label>
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
              <Label htmlFor="file">File Attachment (Optional)</Label>
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
                
                <FileSourceOptions />
                
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
                <div className="mt-2">
                  <FilePreview 
                    file={file}
                    fileName={fileName}
                    fileType={fileType}
                    className="max-h-32"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Quantity (Optional)</Label>
                <Input
                  id="amount"
                  placeholder="e.g., 2 boxes"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Price (Optional)</Label>
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
              <Label htmlFor="date">Purchase By (Optional)</Label>
              <Input
                id="date"
                type="date"
                value={dateToPurchase}
                onChange={(e) => setDateToPurchase(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
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
  );
};

export default AddItemDialog;
