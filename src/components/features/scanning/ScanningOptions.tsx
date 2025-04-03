
import React from 'react';
import { Camera, Upload, List, Calendar, Receipt, Crop, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import ScanToCalendar from './ScanToCalendar';
import CameraCaptureWithAI from './CameraCaptureWithAI';
import ScreenshotDetection from './ScreenshotDetection';

interface ScanningOptionsProps {
  onScreenSelectionClick?: () => void;
}

interface ScanOption {
  icon: React.ElementType;
  label: string;
  description: string;
  action: () => void;
}

const ScanningOptions: React.FC<ScanningOptionsProps> = ({ onScreenSelectionClick }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showScanToCalendar, setShowScanToCalendar] = React.useState(false);
  const [showSmartScan, setShowSmartScan] = React.useState(false);
  const [showScreenshotDetection, setShowScreenshotDetection] = React.useState(false);

  const showToast = (message: string) => {
    toast({
      title: "Scan Processing",
      description: message,
    });
  };

  const handleScanToCalendar = () => {
    setShowScanToCalendar(true);
  };

  const handleSmartScan = () => {
    setShowSmartScan(true);
  };

  const handleScreenSelection = () => {
    if (onScreenSelectionClick) {
      onScreenSelectionClick();
    } else {
      showToast("Screen selection tool activated...");
    }
  };

  const handleScreenshotDetection = () => {
    setShowScreenshotDetection(true);
  };

  const scanOptions: ScanOption[] = [
    {
      icon: Camera,
      label: "Smart Scan",
      description: "Auto-recognize and suggest actions",
      action: handleSmartScan
    },
    {
      icon: Upload,
      label: "Upload Image",
      description: "Select an image from your gallery",
      action: () => navigate('/upload')
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
      action: handleScreenSelection
    },
    {
      icon: Image,
      label: "Screenshot Detection",
      description: "Auto-detect and process screenshots",
      action: handleScreenshotDetection
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
      action: () => navigate('/spending')
    }
  ];

  return (
    <>
      {showSmartScan ? (
        <CameraCaptureWithAI onClose={() => setShowSmartScan(false)} />
      ) : showScanToCalendar ? (
        <ScanToCalendar onClose={() => setShowScanToCalendar(false)} />
      ) : showScreenshotDetection ? (
        <ScreenshotDetection onClose={() => setShowScreenshotDetection(false)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scanOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={index}
                onClick={option.action}
                className={cn(
                  "metallic-card flex items-center p-4 rounded-xl transition-all duration-300",
                  "hover:shadow-lg active:scale-95 touch-action-manipulation"
                )}
              >
                <div className="bg-todo-purple bg-opacity-10 p-3 rounded-full mr-4 flex-shrink-0 flex items-center justify-center" style={{minWidth: "46px", minHeight: "46px"}}>
                  <Icon className="text-todo-purple" size={isMobile ? 20 : 24} />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h3 className="font-medium text-todo-black text-base truncate">{option.label}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{option.description}</p>
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
