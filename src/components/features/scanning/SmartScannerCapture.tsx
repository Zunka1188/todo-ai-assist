
import React, { useState } from 'react';
import { AIDetectionMode } from '@/services/aiDetectionService';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';

interface SmartScannerCaptureProps {
  preferredMode?: AIDetectionMode;
  onSaveSuccess?: (data: any) => void;
  onClose?: () => void;
}

const SmartScannerCapture: React.FC<SmartScannerCaptureProps> = ({
  preferredMode = 'auto',
  onSaveSuccess,
  onClose
}) => {
  const [processing, setProcessing] = useState(false);
  
  const handleCapture = () => {
    setProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setProcessing(false);
      if (onSaveSuccess) {
        onSaveSuccess({
          title: `AI Scan (${preferredMode})`,
          description: "Item detected with AI scanner",
          date: new Date(),
          file: null,
          itemType: preferredMode === 'auto' ? 'document' : preferredMode
        });
      }
    }, 1000);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        if (onSaveSuccess) {
          onSaveSuccess({
            title: file.name,
            description: "Uploaded file",
            date: new Date(),
            file: reader.result,
            itemType: preferredMode === 'auto' ? 'document' : preferredMode
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {onClose && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">AI Smart Scanner</h3>
        <p className="text-sm text-muted-foreground">
          {preferredMode === 'auto' 
            ? 'Automatically detect content type' 
            : `Optimized for ${preferredMode} detection`}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 mt-4">
        <Button 
          className="flex items-center gap-2" 
          onClick={handleCapture}
          disabled={processing}
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
        
        <label className="flex">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleUpload} 
            disabled={processing}
          />
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            disabled={processing}
            asChild
          >
            <span>
              <Upload className="h-4 w-4" />
              Upload Image
            </span>
          </Button>
        </label>
      </div>
      
      {processing && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Processing...</p>
        </div>
      )}
    </div>
  );
};

export default SmartScannerCapture;
