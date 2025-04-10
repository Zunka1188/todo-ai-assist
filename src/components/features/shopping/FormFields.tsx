
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
            onChange={handleFileChange}
            accept="image/*"
          />
        )}
        
        {formData.imageUrl && !formData.file && (
          <div className="mt-2 relative">
            <div className="max-h-20 rounded-md overflow-hidden">
              <img 
                src={formData.imageUrl} 
                alt="Item preview" 
                className="w-full object-cover" 
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
