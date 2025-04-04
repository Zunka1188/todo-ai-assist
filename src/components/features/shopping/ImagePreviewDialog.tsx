
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Plus, Edit, Pencil } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ImagePreviewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
  onSaveItem?: (itemData: any) => boolean;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({ imageUrl, onClose, onSaveItem }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemBrand, setItemBrand] = useState('');
  const [itemNotes, setItemNotes] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [repeatOption, setRepeatOption] = useState<'none' | 'weekly' | 'monthly'>('none');
  
  // Reset form when dialog opens or closes
  useEffect(() => {
    if (imageUrl) {
      // Simulate AI detection of brands in the image (for demo purposes)
      const detectedBrands = [
        'Yankee Candle', 'Apple', 'Samsung', 'Nike', 'Coca-Cola', 
        'Pepsi', 'Nestle', 'Amazon', 'Microsoft', 'Google'
      ];
      
      // Randomly select a brand for testing (in a real app, this would be AI-based)
      const randomDetectedBrand = 
        detectedBrands[Math.floor(Math.random() * detectedBrands.length)];
      
      setItemName(`${randomDetectedBrand} Product`);
      setItemBrand(randomDetectedBrand);
      setItemNotes('');
      setItemQuantity('1');
      setRepeatOption('none');
    } else {
      setEditMode(false);
    }
  }, [imageUrl]);
  
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

  const handleSaveItem = () => {
    if (onSaveItem && imageUrl) {
      const success = onSaveItem({
        name: itemName,
        brand: itemBrand,
        notes: itemNotes,
        amount: itemQuantity,
        repeatOption: repeatOption,
        file: imageUrl
      });
      
      if (success) {
        onClose();
      }
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  if (!imageUrl) return null;
  
  return (
    <Dialog 
      open={!!imageUrl} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-3xl p-0" preventNavigateOnClose={true}>
        <div className="relative w-full h-full max-h-[80vh] flex flex-col">
          <div className="flex-grow flex items-center justify-center overflow-hidden">
            <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
          </div>
          
          {editMode ? (
            <div className="p-4 border-t bg-background">
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Enter item name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="item-quantity">Quantity</Label>
                    <Input
                      id="item-quantity"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      placeholder="How many?"
                    />
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
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="item-notes">Notes</Label>
                  <Textarea
                    id="item-notes"
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    placeholder="Add any notes here..."
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={toggleEditMode}>Cancel</Button>
                  <Button onClick={handleSaveItem}>Save to Shopping List</Button>
                </div>
              </div>
            </div>
          ) : (
            <DialogFooter className="p-4 bg-background border-t flex justify-between items-center">
              <div className="flex-1">
                <Button onClick={toggleEditMode} variant="outline" className="mr-2">
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button onClick={onClose} variant="outline">Close</Button>
              </div>
              
              <Button onClick={handleSaveItem} className="flex-grow-0">
                <Plus className="h-4 w-4 mr-1" /> Add to List
              </Button>
            </DialogFooter>
          )}
        </div>
        
        {/* Close Button in the top right */}
        <Button 
          onClick={onClose}
          variant="ghost" 
          size="icon"
          className="absolute right-2 top-2 rounded-full h-8 w-8 p-0 bg-background/80 hover:bg-background/90"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
