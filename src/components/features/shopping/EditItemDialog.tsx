
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: (updatedItem: any) => boolean | void;
  onDelete?: (id: string) => void;
}

const EditItemDialog = ({ isOpen, onClose, item, onSave, onDelete }: EditItemDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    notes: '',
    repeatOption: 'none',
    imageUrl: '',
    file: null as File | null,
  });
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [formModified, setFormModified] = useState(false);
  const { isMobile } = useIsMobile();
  
  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        name: item.name || '',
        amount: item.amount || '',
        notes: item.notes || '',
        repeatOption: item.repeatOption || 'none',
        imageUrl: item.imageUrl || '',
        file: null,
      });
      setFormModified(false);
    }
  }, [item, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormModified(true);
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, repeatOption: value }));
    setFormModified(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setFormModified(true);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = onSave({
        ...formData,
        id: item?.id
      });
      
      if (result !== false) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!item?.id || !onDelete) return;
    
    setIsDeleting(true);
    try {
      onDelete(item.id);
      onClose();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCancel = () => {
    if (formModified) {
      setShowCancelAlert(true);
    } else {
      onClose();
    }
  };

  // Form fields to be used in both Dialog and Drawer
  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Item name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Quantity</Label>
        <Input
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="e.g. 2 lbs, 1 carton"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="repeatOption">Recurring Item</Label>
        <Select
          value={formData.repeatOption}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">One-time purchase</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
        />
        {formData.imageUrl && !formData.file && (
          <div className="mt-2">
            <img 
              src={formData.imageUrl} 
              alt="Item preview" 
              className="max-h-20 rounded-md" 
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional details"
          rows={3}
        />
      </div>
    </div>
  );
  
  return (
    <>
      {/* Use Drawer for mobile and Dialog for desktop */}
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit Item</DrawerTitle>
            </DrawerHeader>
            
            <form onSubmit={handleSubmit} className="px-4 pt-2">
              <ScrollArea className="h-[50vh] overflow-y-auto">
                {formFields}
              </ScrollArea>
              
              <DrawerFooter className="flex flex-col gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || isDeleting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={isSubmitting || isDeleting}
                  className="w-full"
                >
                  Cancel
                </Button>
                
                {onDelete && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                    className="w-full flex items-center justify-center gap-1"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </Button>
                )}
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {formFields}
              
              <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex justify-start">
                  {onDelete && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={isSubmitting || isDeleting}
                      className="flex items-center gap-1"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting || isDeleting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isDeleting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Alert Dialog for unsaved changes */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you cancel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel className="mt-0 sm:mt-0">Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditItemDialog;
