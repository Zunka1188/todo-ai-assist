
import React, { useState, useEffect } from 'react';
import { Camera, Upload, List, Calendar, Receipt, Crop, Image, FileText, Scan, ShoppingBag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import ScanToCalendar from './ScanToCalendar';
import EnhancedCameraCapture from './EnhancedCameraCapture';
import ScreenshotDetection from './ScreenshotDetection';
import { Button } from '@/components/ui/button';

interface ScanningOptionsProps {
  onScreenSelectionClick?: () => void;
  preferredMode?: string;
}

interface ScanOption {
  icon: React.ElementType;
  label: string;
  description: string;
  action: () => void;
  highlight?: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  mode?: string;
}

const ScanningOptions: React.FC<ScanningOptionsProps> = ({ 
  onScreenSelectionClick,
  preferredMode 
}) => {
  const { toast } = useToast();
  const { isMobile, hasCamera, isIOS, isAndroid, isTouchDevice } = useIsMobile();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showScanToCalendar, setShowScanToCalendar] = useState(false);
  const [showSmartScan, setShowSmartScan] = useState(false);
  const [showScreenshotDetection, setShowScreenshotDetection] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Check camera permission on component mount
  useEffect(() => {
    const checkPermission = async () => {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setHasCameraPermission(result.state === 'granted');
          
          result.addEventListener('change', () => {
            setHasCameraPermission(result.state === 'granted');
          });
        } catch (error) {
          console.log("Permission API not supported or other error", error);
          setHasCameraPermission(null);
        }
      }
    };
    
    if (hasCamera) {
      checkPermission();
    }
  }, [hasCamera]);

  // If there's a preferred mode, auto-trigger the appropriate action
  useEffect(() => {
    if (preferredMode) {
      const option = scanOptions.find(opt => opt.mode === preferredMode);
      if (option) {
        // Set a brief timeout to let the component render first
        setTimeout(() => option.action(), 100);
      }
    }
  }, [preferredMode]);

  const showToast = (message: string) => {
    toast({
      title: "Scan Processing",
      description: message,
    });
  };

  const handleScanToCalendar = () => {
    setShowScanToCalendar(true);
  };

  const handleSmartScan = (mode?: string) => {
    if (mode) {
      sessionStorage.setItem('preferredScanMode', mode);
    }
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
      description: data.title ? `'${data.title}' has been saved.` : "Item has been processed.",
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
      description: hasCamera ? 
        "Auto-recognize items and suggested actions" : 
        "Camera not available on this device",
      action: () => handleSmartScan(),
      highlight: true
    },
    {
      icon: ShoppingBag,
      label: "Scan Shopping Item",
      description: "Add products to your shopping list",
      action: () => handleSmartScan('shopping'),
      mode: 'shopping'
    },
    {
      icon: Calendar,
      label: "Scan to Calendar",
      description: "Extract event details from invitation",
      action: handleScanToCalendar,
      mode: 'calendar'
    },
    {
      icon: FileText,
      label: "Document Scanner",
      description: "Scan and digitize physical documents",
      action: () => handleSmartScan('document'),
      mode: 'document'
    },
    {
      icon: Upload,
      label: "Upload Image",
      description: "Select an image from your gallery",
      action: () => navigate('/upload')
    },
    {
      icon: Crop,
      label: "Screen Selection",
      description: "Select part of screen for processing",
      action: handleScreenSelection,
      desktopOnly: true
    },
    {
      icon: Image,
      label: "Screenshot Detection",
      description: "Auto-detect and process screenshots",
      action: handleScreenshotDetection
    },
    {
      icon: List,
      label: "Shopping List",
      description: "View and manage your shopping list",
      action: () => navigate('/shopping')
    },
    {
      icon: Receipt,
      label: "Scan Receipt",
      description: "Extract and save receipt information",
      action: () => handleSmartScan('receipt')
    }
  ];

  // Filter options based on device capabilities and preferred mode
  const filteredOptions = scanOptions.filter(option => {
    if (option.mobileOnly && !isMobile) return false;
    if (option.desktopOnly && isMobile) return false;
    if (option.icon === Camera && !hasCamera) return true; // Show but with different description
    if (preferredMode && option.mode && option.mode !== preferredMode) return false;
    return true;
  });

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
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
        )}>
          {filteredOptions.map((option, index) => {
            const Icon = option.icon;
            const isDisabled = option.icon === Camera && !hasCamera;
            
            return (
              <button
                key={index}
                onClick={option.action}
                disabled={isDisabled}
                className={cn(
                  "flex items-center p-4 rounded-xl transition-all duration-300",
                  "border border-border hover:border-primary/30",
                  "bg-card hover:shadow-lg active:scale-95 touch-action-manipulation",
                  option.highlight && !isDisabled && "ring-2 ring-primary ring-opacity-40",
                  isDisabled && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "bg-primary bg-opacity-10 p-3 rounded-full mr-4 flex-shrink-0 flex items-center justify-center",
                  option.highlight && !isDisabled && "bg-opacity-20"
                )} style={{minWidth: "46px", minHeight: "46px"}}>
                  <Icon className={cn(
                    "text-primary", 
                    isDisabled && "opacity-50"
                  )} size={isMobile ? 20 : 24} />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h3 className={cn(
                    "font-medium text-base truncate",
                    theme === 'light' ? "text-foreground" : "text-white"
                  )}>{option.label}</h3>
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
