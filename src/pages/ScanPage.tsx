
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import ScanningOptions from '@/components/features/scanning/ScanningOptions';
import { Button } from '@/components/ui/button';
import ScreenSelection from '@/components/features/scanning/ScreenSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import FileUploader from '@/components/features/scanning/FileUploader';

const ScanPage = () => {
  const navigate = useNavigate();
  const [showScreenSelection, setShowScreenSelection] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const { isMobile } = useIsMobile();
  const [preferredMode, setPreferredMode] = useState<string | undefined>(undefined);

  // Get return destination from session storage if available
  const returnDestination = sessionStorage.getItem('returnToAfterScan');

  // Check if we need to initialize camera right away (e.g., from a direct scan action)
  useEffect(() => {
    const directScanAction = sessionStorage.getItem('scanAction');
    if (directScanAction) {
      console.log("Direct scan action detected:", directScanAction);
      // We'll leave the scanAction in sessionStorage for now
      // It will be consumed by ScanningOptions component
    }

    // Check if there's a preferred scan mode in session storage
    const mode = sessionStorage.getItem('preferredScanMode');
    if (mode) {
      setPreferredMode(mode);
      console.log("Using preferred scan mode from session storage:", mode);
      
      // Important: We're not initializing the camera automatically here anymore
      // This ensures the user sees the three buttons first
    }
  }, []);

  const goBack = () => {
    if (showScreenSelection) {
      setShowScreenSelection(false);
    } else if (showFileUploader) {
      setShowFileUploader(false);
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
    setShowFileUploader(false);
    
    // Process the uploaded file result here
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label={returnDestination ? `Go back to ${returnDestination}` : "Go back to home"}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title={
            showScreenSelection ? "Screen Selection" : 
            showFileUploader ? "Upload File" : 
            "Smart Scanner"
          } 
          className="py-0"
        />
      </div>
      
      <div className="flex-1">
        {showScreenSelection ? (
          <ScreenSelection onClose={() => setShowScreenSelection(false)} />
        ) : showFileUploader ? (
          <FileUploader 
            onClose={() => setShowFileUploader(false)}
            onSaveSuccess={handleFileUploadSuccess}
          />
        ) : (
          <ScanningOptions 
            onScreenSelectionClick={() => setShowScreenSelection(false)}
            preferredMode={preferredMode}
            noAutomaticActivation={true} // Always keep this as true to prevent automatic camera activation
            onFileUpload={() => setShowFileUploader(true)} // Add file upload handler
          />
        )}
      </div>
    </div>
  );
};

export default ScanPage;
