import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Camera, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: (item: any) => void;
  onDelete?: (id: string) => void;
  onClearImage: () => void;
  isImageLoading?: boolean;
}

const EditItemDialog: React.FC<EditItemDialogProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
  onDelete,
  onClearImage,
  isImageLoading = false,
}) => {
  const [name, setName] = useState(item?.name || '');
  const [amount, setAmount] = useState(item?.amount || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [repeatOption, setRepeatOption] = useState(item?.repeatOption || 'none');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...item,
        name,
        amount,
        notes,
        repeatOption,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item?.id ? 'Edit Item' : 'Add Item'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repeat">Repeat</Label>
            <Select value={repeatOption} onValueChange={setRepeatOption}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {item?.imageUrl && (
            <div className="relative">
              <img
                src={item.imageUrl}
                alt={name}
                className="w-full h-48 object-cover rounded-md"
              />
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Spinner size="lg" />
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={onClearImage}
                disabled={isImageLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {onDelete && item?.id && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(item.id);
                  onClose();
                }}
                disabled={isSaving || isImageLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving || isImageLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name || isSaving || isImageLoading}>
              {isSaving ? <Spinner size="sm" /> : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
