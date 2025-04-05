
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ImageIcon, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ShoppingItem } from './useShoppingItems';

interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  onSave: (item: ShoppingItem, imageFile: File | null) => void;
}

const EditItemDialog: React.FC<EditItemDialogProps> = ({
  isOpen,
  onClose,
  item,
  onSave
}) => {
  const [editItemName, setEditItemName] = useState(item?.name || '');
  const [editItemAmount, setEditItemAmount] = useState(item?.amount || '');
  const [editItemImageUrl, setEditItemImageUrl] = useState(item?.imageUrl || '');
  const [editItemNotes, setEditItemNotes] = useState(item?.notes || '');
  const [editItemRepeatOption, setEditItemRepeatOption] = useState<'none' | 'weekly' | 'monthly'>(item?.repeatOption || 'none');
  const [editItemImage, setEditItemImage] = useState<File | null>(null);

  const editImageFileRef = useRef<HTMLInputElement>(null);
  const { isMobile } = useIsMobile();

  React.useEffect(() => {
    if (isOpen && item) {
      setEditItemName(item.name);
      setEditItemAmount(item.amount || '');
      setEditItemImageUrl(item.imageUrl || '');
      setEditItemNotes(item.notes || '');
      setEditItemRepeatOption(item.repeatOption || 'none');
      setEditItemImage(null);
    }
  }, [isOpen, item]);

  const handleSave = () => {
    if (!item || editItemName.trim() === '') return;
    
    const updatedItem: ShoppingItem = {
      ...item,
      name: editItemName,
      amount: editItemAmount || undefined,
      notes: editItemNotes || undefined,
      repeatOption: editItemRepeatOption
    };
    
    onSave(updatedItem, editItemImage);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditItemImage(file);
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setEditItemImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearEditImage = () => {
    setEditItemImage(null);
    setEditItemImageUrl('');
    if (editImageFileRef.current) {
      editImageFileRef.current.value = '';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Make changes to your shopping item here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-item-name">Name</Label>
              <Input
                id="edit-item-name"
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                placeholder="Item name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-item-amount">Amount/Quantity</Label>
              <Input
                id="edit-item-amount"
                value={editItemAmount}
                onChange={(e) => setEditItemAmount(e.target.value)}
                placeholder="e.g., 2 bags, 1 box"
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Repeat</Label>
              <RadioGroup 
                value={editItemRepeatOption} 
                onValueChange={(value) => setEditItemRepeatOption(value as 'none' | 'weekly' | 'monthly')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="edit-r-none" />
                  <Label htmlFor="edit-r-none">One-time purchase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="edit-r-weekly" />
                  <Label htmlFor="edit-r-weekly">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="edit-r-monthly" />
                  <Label htmlFor="edit-r-monthly">Monthly</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <Label>Image</Label>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => editImageFileRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {editItemImageUrl ? "Change Image" : "Upload File"}
                </Button>
                {editItemImageUrl && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={clearEditImage} 
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editItemImageUrl && (
                <div className="relative w-full h-32 mt-2 rounded-md overflow-hidden">
                  <img
                    src={editItemImageUrl}
                    alt="Item preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-item-notes">Notes</Label>
              <Textarea
                id="edit-item-notes"
                value={editItemNotes}
                onChange={(e) => setEditItemNotes(e.target.value)}
                placeholder="Optional notes about this item"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <input 
        ref={editImageFileRef} 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="hidden" 
      />
    </>
  );
};

export default EditItemDialog;
