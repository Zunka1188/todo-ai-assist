
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { Image, Upload, Camera, X } from 'lucide-react';
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

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: { name: string, category: string, image?: string | null }) => void;
}

const AddItemDialog = ({ open, onOpenChange, onSave }: AddItemDialogProps) => {
  const { isMobile } = useIsMobile();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState('');
  const [dateToPurchase, setDateToPurchase] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [imageOptionsOpen, setImageOptionsOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Generate preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    // Close the image options sheet if open
    setImageOptionsOpen(false);
  };

  const handleSave = () => {
    if ((activeTab === 'text' && name.trim() === '') || 
        (activeTab === 'image' && !imageFile)) {
      return;
    }
    
    const itemData = {
      name: name || (imageFile ? imageFile.name : 'Untitled Item'),
      category,
      image: previewUrl
    };
    
    onSave(itemData);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setCategory('Groceries');
    setAmount('');
    setDateToPurchase('');
    setPrice('');
    setImageFile(null);
    setPreviewUrl(null);
    setActiveTab('text');
    setImageOptionsOpen(false);
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const ImageSourceOptions = () => {
    // For mobile, use a Sheet component
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
              <Image className="mr-2 h-4 w-4" />
              {previewUrl ? "Change Image" : "Attach Image"}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>Choose Image Source</SheetTitle>
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
                <Upload className="h-4 w-4" /> Upload from Device
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
      // For desktop, use a dropdown/alert dialog
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
            >
              <Image className="mr-2 h-4 w-4" />
              {previewUrl ? "Change Image" : "Attach Image"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-xs">
            <div className="flex flex-col space-y-3 py-2">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Upload className="h-4 w-4" /> Upload from Device
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

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as 'text' | 'image')} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="text">Text Item</TabsTrigger>
            <TabsTrigger value="image">Image Item</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
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
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Household">Household</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (Optional)</Label>
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
              
              {/* Optional image for text items with new image selection options */}
              <div className="grid gap-2">
                <Label htmlFor="image">Attach Image (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
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
                  
                  <ImageSourceOptions />
                  
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearImage}
                      className="p-2"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {previewUrl && (
                  <div className="mt-2 relative rounded-lg overflow-hidden border">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-32 mx-auto object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Upload Image</Label>
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent transition-colors",
                    previewUrl ? "border-primary/50" : "border-muted-foreground/30"
                  )}
                  onClick={() => setImageOptionsOpen(true)}
                >
                  <Input
                    type="file"
                    accept="image/*"
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
                  
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-64 mx-auto object-contain rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        className="absolute top-0 right-0 h-8 w-8 translate-x-1/2 -translate-y-1/2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click to upload or take a picture</p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG or GIF files supported
                      </p>
                    </div>
                  )}
                </div>

                {/* Image source selection sheet/dialog for the image tab */}
                <Sheet open={imageOptionsOpen} onOpenChange={setImageOptionsOpen}>
                  <SheetContent side="bottom" className={cn("h-auto pb-8", !isMobile && "max-w-sm mx-auto")}>
                    <SheetHeader className="mb-4">
                      <SheetTitle>Choose Image Source</SheetTitle>
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
                        <Upload className="h-4 w-4" /> Upload from Device
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
                      <Button variant="ghost" className="w-full mt-2" onClick={() => setImageOptionsOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="imageName">Item Name (Optional)</Label>
                <Input
                  id="imageName"
                  placeholder="Enter a name for this item"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If left blank, the image filename will be used
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="imageCategory">Category</Label>
                <select
                  id="imageCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Household">Household</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
            disabled={(activeTab === 'text' && !name.trim()) || (activeTab === 'image' && !previewUrl)}
          >
            Add to Shopping List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
