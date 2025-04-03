
import React from 'react';
import { Camera, Upload, List, Calendar, Receipt, Crop, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScanOption {
  icon: React.ElementType;
  label: string;
  description: string;
  action: () => void;
}

const ScanningOptions: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const showToast = (message: string) => {
    toast({
      title: "Scan Processing",
      description: message,
    });
  };

  const scanOptions: ScanOption[] = [
    {
      icon: Camera,
      label: "Camera Scan",
      description: "Scan products, documents, or receipts",
      action: () => showToast("Camera activated for scanning...")
    },
    {
      icon: Upload,
      label: "Upload Image",
      description: "Select an image from your gallery",
      action: () => showToast("Please select an image to upload...")
    },
    {
      icon: Crop,
      label: "Screen Selection",
      description: "Select part of screen for processing",
      action: () => showToast("Screen selection tool activated...")
    },
    {
      icon: Image,
      label: "Screenshot Detection",
      description: "Auto-detect and process screenshots",
      action: () => showToast("Screenshot detection activated...")
    },
    {
      icon: List,
      label: "Add to Shopping List",
      description: "Scan and add items to your list",
      action: () => showToast("Ready to add items to shopping list...")
    },
    {
      icon: Calendar,
      label: "Add to Calendar",
      description: "Extract event details from a scan",
      action: () => showToast("Ready to scan and add events to calendar...")
    },
    {
      icon: Receipt,
      label: "Scan Receipt",
      description: "Extract and save receipt information",
      action: () => showToast("Ready to scan and process receipts...")
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scanOptions.map((option, index) => {
        const Icon = option.icon;
        return (
          <button
            key={index}
            onClick={option.action}
            className={cn(
              "metallic-card flex items-center p-4 rounded-xl transition-all duration-300",
              "hover:shadow-lg hover:-translate-y-0.5"
            )}
          >
            <div className="bg-todo-purple bg-opacity-10 p-3 rounded-full mr-4">
              <Icon className="text-todo-purple" size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-todo-black">{option.label}</h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ScanningOptions;
