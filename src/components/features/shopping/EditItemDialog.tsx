
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFileTypeFromName } from '../documents/FilePreview';

import FormFields from './FormFields';
import FullScreenPreview from './FullScreenPreview';
import EditItemFooter from './EditItemFooter';
import CancelConfirmDialog from './CancelConfirmDialog';

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
  const [showFileInput, setShowFileInput] = useState(false);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [fileType, setFileType] = useState('');

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
      
      // Detect file type for the image preview
      if (item.imageUrl) {
        const fileName = item.fileName || '';
        setFileType(fileName ? getFileTypeFromName(fileName) : 'image');
      }
      
      setFormModified(false);
      setShowFileInput(false);
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
      
      // Detect file type for new uploads
      const fileName = file.name || '';
      setFileType(getFileTypeFromName(fileName));
    }
  };

  const toggleFileInput = () => {
    setShowFileInput(!showFileInput);
  };
  
  const toggleFullScreenPreview = () => {
    setFullScreenPreview(!fullScreenPreview);
  };
  
  const handleForceCloseFullscreen = () => {
    setFullScreenPreview(false);
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

  // If in fullscreen preview mode, render that instead of the dialog
  if (fullScreenPreview && formData.imageUrl) {
    return (
      <FullScreenPreview 
        imageUrl={formData.imageUrl} 
        onClose={handleForceCloseFullscreen}
        onToggle={toggleFullScreenPreview}
      />
    );
  }

  // Mobile drawer or desktop dialog
  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit Item</DrawerTitle>
            </DrawerHeader>
            
            <form onSubmit={handleSubmit} className="px-4 pt-2">
              <ScrollArea className="h-[50vh] overflow-y-auto">
                <FormFields
                  formData={formData}
                  handleChange={handleChange}
                  handleSelectChange={handleSelectChange}
                  handleFileChange={handleFileChange}
                  toggleFileInput={toggleFileInput}
                  toggleFullScreenPreview={toggleFullScreenPreview}
                  showFileInput={showFileInput}
                />
              </ScrollArea>
              
              <DrawerFooter>
                <EditItemFooter
                  onSave={handleSubmit}
                  onCancel={handleCancel}
                  onDelete={onDelete ? handleDelete : undefined}
                  isSubmitting={isSubmitting}
                  isDeleting={isDeleting}
                  isMobile={true}
                />
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
              <FormFields
                formData={formData}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                handleFileChange={handleFileChange}
                toggleFileInput={toggleFileInput}
                toggleFullScreenPreview={toggleFullScreenPreview}
                showFileInput={showFileInput}
              />
              
              <DialogFooter>
                <EditItemFooter
                  onSave={handleSubmit}
                  onCancel={handleCancel}
                  onDelete={onDelete ? handleDelete : undefined}
                  isSubmitting={isSubmitting}
                  isDeleting={isDeleting}
                  isMobile={false}
                />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <CancelConfirmDialog
        isOpen={showCancelAlert} 
        onOpenChange={setShowCancelAlert}
        onConfirm={onClose}
      />
    </>
  );
};

export default EditItemDialog;
