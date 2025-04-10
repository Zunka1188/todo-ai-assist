
import React, { useState, useEffect } from 'react';
import { Camera, Upload, Calendar, FileText, ShoppingBag, Image, PlusCircle, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import UnifiedScannerCapture from './UnifiedScannerCapture';
import ControlledScannerCapture from './ControlledScannerCapture';
import FileUploader from './FileUploader';
import SmartScannerCapture from './SmartScannerCapture';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AIDetectionMode } from '@/services/aiDetectionService';

interface ScanningOptionsProps {
  onScreenSelectionClick?: () => void;
  preferredMode?: string;
  noAutomaticActivation?: boolean;
  onFileUpload?: () => void;
}

const ScanningOptions: React.FC<ScanningOptionsProps> = ({ 
  onScreenSelectionClick,
  preferredMode,
  noAutomaticActivation = false,
  onFileUpload
}) => {
  const { toast } = useToast();
  const { isMobile, hasCamera } = useIsMobile();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [showScannerCapture, setShowScannerCapture] = useState(false);
  const [showControlledScanner, setShowControlledScanner] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showSmartScanner, setShowSmartScanner] = useState(false);
  const [currentScanMode, setCurrentScanMode] = useState<string | undefined>(preferredMode);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [manualCapture, setManualCapture] = useState<boolean>(true);
  const [smartScannerMode, setSmartScannerMode] = useState<AIDetectionMode>('auto');

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
    if (preferredMode && !noAutomaticActivation) {
      handleTakePhoto(preferredMode);
    }
  }, [preferredMode, noAutomaticActivation]);

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
    
    setShowSmartScanner(false);
    setShowScannerCapture(false);
    setShowControlledScanner(false);
    setShowFileUploader(false);
  };

  const handleTakePhoto = (mode?: string) => {
    setCurrentScanMode(mode);
    if (!isMobile) {
      setShowControlledScanner(true);
      setShowScannerCapture(false);
    } else {
      setShowScannerCapture(true);
      setShowControlledScanner(false);
    }
    
    toast({
      title: "Camera Ready",
      description: "Press the capture button when ready to take a photo.",
    });
  };
  
  const handleSmartScan = (mode: AIDetectionMode = 'auto') => {
    setSmartScannerMode(mode);
    setShowSmartScanner(true);
    setShowScannerCapture(false);
    setShowControlledScanner(false);
    setShowFileUploader(false);
    
    toast({
      title: "AI Scanner Active",
      description: "Take a photo or upload an image for AI analysis.",
    });
  };
  
  const handleUploadFile = () => {
    if (onFileUpload) {
      onFileUpload();
    } else {
      setShowFileUploader(true);
      setShowScannerCapture(false);
      setShowControlledScanner(false);
      setShowSmartScanner(false);
      
      toast({
        title: "File Upload",
        description: "Select an image file to scan for information.",
      });
    }
  };

  return (
    <>
      {showScannerCapture ? (
        <UnifiedScannerCapture 
          onClose={() => {
            setShowScannerCapture(false);
          }} 
          onCapture={handleSaveSuccess} 
          preferredMode={currentScanMode}
          manualCapture={manualCapture} 
          autoStart={false} 
        />
      ) : showControlledScanner ? (
        <ControlledScannerCapture
          onClose={() => setShowControlledScanner(false)}
          onSaveSuccess={handleSaveSuccess}
          preferredMode={currentScanMode}
          autoStart={false} 
        />
      ) : showFileUploader ? (
        <FileUploader
          onClose={() => setShowFileUploader(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      ) : showSmartScanner ? (
        <Dialog open={showSmartScanner} onOpenChange={setShowSmartScanner}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>AI Smart Scan</DialogTitle>
            </DialogHeader>
            <SmartScannerCapture
              preferredMode={smartScannerMode}
              onSaveSuccess={handleSaveSuccess}
              onClose={() => setShowSmartScanner(false)}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <div className="flex flex-col h-full">
          <div className={cn(
            "flex-1 overflow-auto",
            theme === 'light' ? "text-foreground" : "text-white"
          )}>
            <div className="flex justify-end mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSmartScan()} className="cursor-pointer">
                    <Brain className="h-4 w-4 mr-2 text-purple-500" />
                    Smart AI Scan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTakePhoto()} className="cursor-pointer">
                    <Camera className="h-4 w-4 mr-2" />
                    Take Picture
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleUploadFile} className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col items-center text-center p-6 space-y-2 mb-6">
              <div className="bg-primary bg-opacity-10 p-4 rounded-full mb-2">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Smart Scanner</h3>
              <p className="text-muted-foreground max-w-md">
                Choose how you want to scan: take a picture or upload a file
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4 mb-8 px-4">
              <Button 
                onClick={() => handleSmartScan()}
                className="w-full max-w-md bg-todo-purple hover:bg-todo-purple/90 h-14 text-lg"
              >
                <Brain className="h-5 w-5 mr-3 text-white" />
                Smart AI Scan
                <span className="text-xs ml-2 opacity-75">(Auto-detect content)</span>
              </Button>

              <Button 
                onClick={() => handleTakePhoto()}
                className="w-full max-w-md bg-primary hover:bg-primary/90 h-14 text-lg"
                disabled={!hasCamera}
              >
                <Camera className="h-5 w-5 mr-3" />
                Take Picture
                <span className="text-xs ml-2 opacity-75">(Manual Capture)</span>
              </Button>

              <Button 
                onClick={handleUploadFile}
                className="w-full max-w-md border border-primary/50 bg-transparent hover:bg-accent/20 h-14 text-lg"
              >
                <Upload className="h-5 w-5 mr-3" />
                Upload File
                <span className="text-xs ml-2 opacity-75">(Image or Document)</span>
              </Button>
            </div>
            
            <ResponsiveContainer className="mb-6">
              <div className="flex flex-col space-y-4">
                <h4 className="font-medium text-lg">AI Quick Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Button 
                    variant="outline"
                    className="flex items-center justify-start border-dashed border-primary/30 h-auto py-3"
                    onClick={() => handleSmartScan('shopping')}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <span className="block">Scan Shopping Item</span>
                      <span className="text-xs text-muted-foreground">Auto-detect products</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex items-center justify-start border-dashed border-primary/30 h-auto py-3"
                    onClick={() => handleSmartScan('document')}
                  >
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <span className="block">Scan Document</span>
                      <span className="text-xs text-muted-foreground">Extract text & data</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex items-center justify-start border-dashed border-primary/30 h-auto py-3"
                    onClick={() => handleSmartScan('calendar')}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <div className="text-left">
                      <span className="block">Scan Invitation</span>
                      <span className="text-xs text-muted-foreground">Parse event details</span>
                    </div>
                  </Button>
                </div>
              </div>
            </ResponsiveContainer>
            
            <ResponsiveContainer className="mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border dark:border-gray-700">
                <h4 className="font-medium text-foreground dark:text-white mb-3">AI Features</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2 text-primary" />
                    <span>Product recognition</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <span>Document text extraction</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span>Event detection</span>
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
