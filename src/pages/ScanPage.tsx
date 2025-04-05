
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import FileUploader from '@/components/features/scanning/FileUploader';

const ScanPage = () => {
  const navigate = useNavigate();
  const [showFileUploader, setShowFileUploader] = useState(false);
  const { isMobile } = useIsMobile();

  // Get return destination from session storage if available
  const returnDestination = sessionStorage.getItem('returnToAfterScan');

  const goBack = () => {
    if (showFileUploader) {
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
    } else {
      // Default fallback
      navigate('/');
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
          title={showFileUploader ? "Upload File" : "Smart Scanner"}
          className="py-0"
        />
      </div>
      
      <div className="flex-1">
        {showFileUploader ? (
          <FileUploader 
            onClose={() => setShowFileUploader(false)}
            onSaveSuccess={handleFileUploadSuccess}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="text-center mb-8">
              <p className="text-lg font-medium mb-2">Upload files for AI-powered recognition</p>
              <p className="text-sm text-muted-foreground">
                Let our AI analyze your documents, receipts, and more
              </p>
            </div>

            <Button 
              onClick={() => setShowFileUploader(true)} 
              size="lg"
              className="flex items-center gap-2 px-8 py-6 h-auto"
            >
              <Upload className="h-5 w-5" />
              Upload File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPage;
