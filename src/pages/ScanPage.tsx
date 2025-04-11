
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Camera } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import FileUploader from '@/components/features/scanning/FileUploader';
import ScanningOptions from '@/components/features/scanning/ScanningOptions';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const ScanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showScanningOptions, setShowScanningOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get return destination from session storage if available
  const returnDestination = sessionStorage.getItem('returnToAfterScan');
  const preferredScanMode = sessionStorage.getItem('preferredScanMode');
  
  useEffect(() => {
    // Auto activate scanning options if we're directly navigating to this page
    if (!showFileUploader) {
      setShowScanningOptions(true);
    }
  }, []);

  const goBack = () => {
    if (showFileUploader || showScanningOptions) {
      setShowFileUploader(false);
      setShowScanningOptions(false);
    } else if (returnDestination) {
      // Clear the session storage
      sessionStorage.removeItem('returnToAfterScan');
      sessionStorage.removeItem('scanAction');
      sessionStorage.removeItem('preferredScanMode');
      // Navigate to the return destination
      navigate(`/${returnDestination}`);
    } else {
      navigate('/');
    }
  };

  const handleFileUploadSuccess = (data: any) => {
    setIsProcessing(true);
    setShowFileUploader(false);
    
    // Show success toast
    toast({
      title: "Upload Successful",
      description: "Your file has been processed",
    });
    
    setTimeout(() => {
      setIsProcessing(false);
      // Process the uploaded file result here
      if (data.addToShoppingList) {
        navigate('/shopping');
      } else if (data.addToCalendar) {
        navigate('/calendar');
      } else if (data.saveToSpending) {
        navigate('/spending');
      } else if (data.saveToDocuments || data.itemType === 'document') {
        navigate('/documents');
      } else {
        // Default fallback
        navigate('/');
      }
    }, 500);
  };

  const handleScanningSuccess = (data: any) => {
    setIsProcessing(true);
    setShowScanningOptions(false);
    
    // Show success toast
    toast({
      title: "Scan Successful",
      description: data.message || "Your scan has been processed",
    });
    
    setTimeout(() => {
      setIsProcessing(false);
      // Navigate based on the scan result
      if (data.addToShoppingList) {
        navigate('/shopping');
      } else if (data.addToCalendar) {
        navigate('/calendar');
      } else if (data.saveToSpending) {
        navigate('/spending');
      } else if (data.saveToDocuments || data.itemType === 'document') {
        navigate('/documents');
      } else {
        // Default fallback
        navigate('/');
      }
    }, 500);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label={returnDestination ? `Go back to ${returnDestination}` : "Go back to home"}
          disabled={isProcessing}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title={showFileUploader ? "Upload File" : showScanningOptions ? "Smart Scanner" : "Scanner"}
          className="py-0"
        />
      </div>
      
      <div className="flex-1">
        {showFileUploader ? (
          <FileUploader 
            onClose={() => setShowFileUploader(false)}
            onSaveSuccess={handleFileUploadSuccess}
          />
        ) : showScanningOptions ? (
          <ScanningOptions
            onScreenSelectionClick={() => {}}
            preferredMode={preferredScanMode || undefined}
            noAutomaticActivation={false}
            onFileUpload={() => setShowFileUploader(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="text-center mb-8">
              <p className="text-lg font-medium mb-2">Choose a scanning option</p>
              <p className="text-sm text-muted-foreground">
                Let our AI analyze your documents, receipts, and more
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Button 
                onClick={() => setShowScanningOptions(true)} 
                size="lg"
                className="flex items-center gap-2 px-8 py-6 h-auto bg-primary"
              >
                <Camera className="h-5 w-5" />
                Smart Scan
              </Button>

              <Button 
                onClick={() => setShowFileUploader(true)} 
                size="lg"
                variant="outline"
                className="flex items-center gap-2 px-8 py-6 h-auto"
              >
                <Upload className="h-5 w-5" />
                Upload File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPage;
