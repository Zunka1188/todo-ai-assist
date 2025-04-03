
import React from 'react';
import { Camera, Upload, List, Calendar, Receipt, Crop, Image, Bell } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import ScanToCalendar from './ScanToCalendar';

interface ScanOption {
  icon: React.ElementType;
  label: string;
  description: string;
  action: () => void;
}

const ScanningOptions: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showScanToCalendar, setShowScanToCalendar] = React.useState(false);

  const showToast = (message: string) => {
    toast({
      title: "Scan Processing",
      description: message,
    });
  };

  const handleScanToCalendar = () => {
    setShowScanToCalendar(true);
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
      icon: Calendar,
      label: "Scan to Calendar",
      description: "Extract event details from invitation",
      action: handleScanToCalendar
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
      action: () => navigate('/shopping')
    },
    {
      icon: Receipt,
      label: "Scan Receipt",
      description: "Extract and save receipt information",
      action: () => showToast("Ready to scan and process receipts...")
    }
  ];

  return (
    <>
      {showScanToCalendar ? (
        <ScanToCalendar onClose={() => setShowScanToCalendar(false)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {scanOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={index}
                onClick={option.action}
                className={cn(
                  "metallic-card flex items-center p-3 sm:p-4 rounded-xl transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-0.5"
                )}
              >
                <div className="bg-todo-purple bg-opacity-10 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                  <Icon className="text-todo-purple" size={isMobile ? 20 : 24} />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-medium text-todo-black text-sm sm:text-base truncate">{option.label}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

export default ScanningOptions;
