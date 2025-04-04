
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: { name: string, category: string, image?: string | null }) => void;
}

const CATEGORIES = [
  'Groceries',
  'Household',
  'Personal Care',
  'Electronics',
  'Clothing',
  'Other'
];

const AddItemDialog: React.FC<AddItemDialogProps> = ({ open, onOpenChange, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Item name required",
        description: "Please enter a name for your item",
        variant: "destructive",
      });
      return;
    }
    
    onSave({ name, category, image });
    resetForm();
    onOpenChange(false);
  };
  
  const resetForm = () => {
    setName('');
    setCategory('Groceries');
    setImage(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleTakePhoto = async () => {
    // In real implementation, this would use device camera
    toast({
      title: "Camera capture",
      description: "This feature will be implemented with native camera integration",
    });
    
    // For demonstration, we'll navigate to scan page in mobile
    if (isMobile) {
      onOpenChange(false);
      // Set session storage to indicate returning to shopping after scan
      sessionStorage.setItem('returnToAfterScan', 'shopping');
      sessionStorage.setItem('scanAction', 'addShoppingItem');
      window.location.href = '/scan';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Shopping Item</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input 
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              className="col-span-3"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="item-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Item Image (Optional)</Label>
            
            {image ? (
              <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                <img 
                  src={image} 
                  alt="Item preview" 
                  className="w-full h-full object-contain"
                />
                <Button 
                  size="icon"
                  variant="destructive" 
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setImage(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleTakePhoto}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  <span>Take Photo</span>
                </Button>
                
                <div className="relative flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload Image</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim() || loading}>
            {loading ? "Saving..." : "Save Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
