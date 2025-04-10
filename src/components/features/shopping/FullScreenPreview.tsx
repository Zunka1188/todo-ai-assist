
import React from 'react';
import { Button } from '@/components/ui/button';
import { Minimize2, X } from 'lucide-react';

interface FullScreenPreviewProps {
  imageUrl: string;
  onClose: () => void;
  onToggle: () => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ 
  imageUrl, 
  onClose, 
  onToggle 
}) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-black/80">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white" 
          onClick={onToggle}
        >
          <Minimize2 className="h-6 w-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white" 
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <img 
          src={imageUrl} 
          alt="Full screen preview" 
          className="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default FullScreenPreview;
