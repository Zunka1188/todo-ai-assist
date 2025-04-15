
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Maximize2, ImageIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ImagePreviewOptimizer from './ImagePreviewOptimizer';

interface FormFieldsProps {
  formData: {
    name: string;
    amount: string;
    notes: string;
    repeatOption: string;
    imageUrl: string;
    file: File | null;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (value: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleFileInput: () => void;
  toggleFullScreenPreview: () => void;
  showFileInput: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  handleChange,
  handleSelectChange,
  handleFileChange,
  toggleFileInput,
  toggleFullScreenPreview,
  showFileInput
}) => {
  const { isMobile } = useIsMobile();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(formData.imageUrl || null);
  
  // Handle file selection and generate preview
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
    
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Reset image preview if formData.imageUrl changes
  React.useEffect(() => {
    if (!formData.file) {
      setImagePreviewUrl(formData.imageUrl || null);
    }
  }, [formData.imageUrl, formData.file]);

  return (
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
          <SelectContent className="z-50 bg-background border">
            <SelectItem value="none">One-time purchase</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="image">Image</Label>
          {isMobile && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={toggleFileInput} 
              className="text-xs"
            >
              {showFileInput ? 'Hide' : 'Change Image'}
            </Button>
          )}
        </div>
        
        {(!isMobile || showFileInput) && (
          <Input
            id="image"
            type="file"
            onChange={handleImageSelection}
            accept="image/*"
          />
        )}
        
        {imagePreviewUrl && (
          <div className="mt-2 relative">
            <div className="max-h-32 rounded-md overflow-hidden">
              <ImagePreviewOptimizer
                imageUrl={imagePreviewUrl}
                alt="Item preview"
                className="w-full object-cover"
                previewable={true}
                onPreview={toggleFullScreenPreview}
              />
            </div>
            
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute top-1 right-1 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
              onClick={toggleFullScreenPreview}
              aria-label="View fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {!imagePreviewUrl && (
          <div className="mt-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 flex justify-center">
            <div className="text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">No image selected</p>
            </div>
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
};

export default FormFields;
