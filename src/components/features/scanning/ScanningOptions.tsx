
import React, { useState } from 'react';
import { Camera, Upload, List, Calendar, Receipt, Crop, Image, FileText, Scan } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import ScanToCalendar from './ScanToCalendar';
import EnhancedCameraCapture from './EnhancedCameraCapture';
import ScreenshotDetection from './ScreenshotDetection';

interface ScanningOptionsProps {
  onScreenSelectionClick?: () => void;
}

interface ScanOption {
  icon: React.ElementType;
  label: string;
  description: string;
  action: () => void;
  highlight?: boolean;
}

const ScanningOptions: React.FC<ScanningOptionsProps> = ({ onScreenSelectionClick }) => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  const [showScanToCalendar, setShowScanToCalendar] = useState(false);
  const [showSmartScan, setShowSmartScan] = useState(false);
  const [showScreenshotDetection, setShowScreenshotDetection] = useState(false);

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

  const handleSaveSuccess = (data: any) => {
    console.log("Item saved successfully:", data);
    
    // Show success toast with more specific detail
    toast({
      title: "Item Processed Successfully",
      description: `'${data.title}' has been saved and categorized.`,
      variant: "default",
    });
    
    // Navigate based on item type or user selection
    if (data.addToShoppingList) {
      navigate('/shopping');
    } else if (data.addToCalendar) {
      navigate('/calendar');
    } else if (data.saveToSpending) {
      navigate('/spending');
    } else if (data.saveToDocuments || data.itemType === 'document') {
      navigate('/documents');
    }
  };

  const scanOptions: ScanOption[] = [
    {
      icon: Camera,
      label: "Smart Scan",
      description: "Auto-recognize items and suggested actions",
      action: handleSmartScan,
      highlight: true
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
    },
    {
      icon: FileText,
      label: "Document Scanner",
      description: "Scan and digitize physical documents",
      action: () => {
        setShowSmartScan(true);
        // Pre-select document mode
        sessionStorage.setItem('preferredScanMode', 'document');
      }
    }
  ];

  return (
    <>
      {showSmartScan ? (
        <EnhancedCameraCapture 
          onClose={() => setShowSmartScan(false)} 
          onSaveSuccess={handleSaveSuccess}
          preferredMode={sessionStorage.getItem('preferredScanMode') || undefined}
        />
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
                  "hover:shadow-lg active:scale-95 touch-action-manipulation",
                  option.highlight && "ring-2 ring-todo-purple ring-opacity-50"
                )}
              >
                <div className={cn(
                  "bg-todo-purple bg-opacity-10 p-3 rounded-full mr-4 flex-shrink-0 flex items-center justify-center",
                  option.highlight && "bg-opacity-20"
                )} style={{minWidth: "46px", minHeight: "46px"}}>
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
