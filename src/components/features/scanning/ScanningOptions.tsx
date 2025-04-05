import React, { useState, useEffect } from 'react';
import { Camera, ScanBarcode, Upload, Calendar, FileText, Scan, ShoppingBag, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import ScanToCalendar from './ScanToCalendar';
import EnhancedCameraCapture from './EnhancedCameraCapture';
import ScreenshotDetection from './ScreenshotDetection';
import FileUploader from './FileUploader';
import BarcodeScannerCapture from './BarcodeScannerCapture';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { Button } from '@/components/ui/button';

interface ScanningOptionsProps {
  onScreenSelectionClick?: () => void;
  preferredMode?: string;
}

const ScanningOptions: React.FC<ScanningOptionsProps> = ({ 
  onScreenSelectionClick,
  preferredMode 
}) => {
  const { toast } = useToast();
  const { isMobile, hasCamera } = useIsMobile();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [showSmartScan, setShowSmartScan] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

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

  useEffect(() => {
    if (preferredMode) {
      if (preferredMode === 'barcode') {
        handleBarcodeScan();
      } else {
        handleTakePhoto(preferredMode);
      }
    }
  }, [preferredMode]);

  const handleSaveSuccess = (data: any) => {
    console.log("Item processed successfully:", data);
    
    toast({
      title: "Item Processed Successfully",
      description: data.title ? `'${data.title}' has been saved.` : "Item has been processed.",
      variant: "default",
    });
    
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

  const handleTakePhoto = (mode?: string) => {
    if (mode) {
      sessionStorage.setItem('preferredScanMode', mode);
    }
    setShowSmartScan(true);
  };

  const handleBarcodeScan = () => {
    setShowBarcodeScanner(true);
  };
  
  const handleUploadFile = () => {
    setShowFileUploader(true);
  };

  return (
    <>
      {showSmartScan ? (
        <EnhancedCameraCapture 
          onClose={() => setShowSmartScan(false)} 
          onSaveSuccess={handleSaveSuccess}
          preferredMode={sessionStorage.getItem('preferredScanMode') || undefined}
        />
      ) : showBarcodeScanner ? (
        <BarcodeScannerCapture 
          onClose={() => setShowBarcodeScanner(false)} 
          onSaveSuccess={handleSaveSuccess} 
        />
      ) : showFileUploader ? (
        <FileUploader
          onClose={() => setShowFileUploader(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      ) : (
        <div className="flex flex-col h-full">
          <div className={cn(
            "flex-1 overflow-auto",
            theme === 'light' ? "text-foreground" : "text-white"
          )}>
            <div className="flex flex-col items-center text-center p-6 space-y-2 mb-6">
              <div className="bg-primary bg-opacity-10 p-4 rounded-full mb-2">
                <Scan className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Smart Scanner</h3>
              <p className="text-muted-foreground max-w-md">
                Scan documents, receipts, products and more with our advanced AI recognition
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4 mb-8 px-4">
              <Button 
                onClick={() => handleTakePhoto()}
                className="w-full max-w-md bg-primary hover:bg-primary/90 h-14 text-lg"
                disabled={!hasCamera}
              >
                <Camera className="h-5 w-5 mr-3" />
                Take a Photo
              </Button>

              <Button 
                onClick={handleBarcodeScan}
                className="w-full max-w-md bg-secondary hover:bg-secondary/90 h-14 text-lg"
                disabled={!hasCamera}
              >
                <ScanBarcode className="h-5 w-5 mr-3" />
                Scan Barcode
              </Button>

              <Button 
                onClick={handleUploadFile}
                className="w-full max-w-md bg-accent hover:bg-accent/90 h-14 text-lg"
              >
                <Upload className="h-5 w-5 mr-3" />
                Upload File
              </Button>
            </div>
            
            <ResponsiveContainer className="mb-6">
              <div className="flex flex-col space-y-4">
                <h4 className="font-medium text-lg">Quick Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button 
                    variant="outline"
                    className="flex items-center justify-start border-dashed border-primary/30 h-auto py-3"
                    onClick={() => handleTakePhoto('shopping')}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <span className="block">Scan Shopping Item</span>
                      <span className="text-xs text-muted-foreground">Add to shopping list</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex items-center justify-start border-dashed border-primary/30 h-auto py-3"
                    onClick={() => handleTakePhoto('document')}
                  >
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <span className="block">Scan Document</span>
                      <span className="text-xs text-muted-foreground">Save to documents</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex items-center justify-start border-dashed border-primary/30 h-auto py-3"
                    onClick={() => handleTakePhoto('invitation')}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <span className="block">Scan Invitation</span>
                      <span className="text-xs text-muted-foreground">Add to calendar</span>
                    </div>
                  </Button>
                </div>
              </div>
            </ResponsiveContainer>
            
            <ResponsiveContainer className="mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border dark:border-gray-700">
                <h4 className="font-medium text-foreground dark:text-white mb-3">File Types Supported</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Image className="h-4 w-4 mr-2 text-primary" />
                    <span>Images (.jpg, .png, etc)</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <span>Documents (.pdf, .docx)</span>
                  </div>
                  <div className="flex items-center">
                    <ScanBarcode className="h-4 w-4 mr-2 text-primary" />
                    <span>QR & Barcodes</span>
                  </div>
                </div>
              </div>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default ScanningOptions;
