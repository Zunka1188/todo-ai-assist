
import React, { useEffect } from 'react';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import ShoppingPageContent from '@/components/features/shopping/ShoppingPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { setupCrossBrowserSync } from '@/services/shoppingService';
import { useToast } from '@/components/ui/use-toast';

const ShoppingPage: React.FC = () => {
  const { toast } = useToast();

  // Add synchronization mechanism that will detect if the user is on mobile
  useEffect(() => {
    // Check if this is likely a mobile device accessing the app
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Display a toast message for mobile users to explain potential data differences
    if (isMobileDevice) {
      // Wait a moment to ensure the page has loaded
      const timeoutId = setTimeout(() => {
        toast({
          title: "Mobile Device Detected",
          description: "Your shopping items are stored locally on this device. Items may differ from your desktop.",
          duration: 6000
        });
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
    
    return undefined;
  }, [toast]);

  return (
    <ErrorBoundary>
      <ShoppingItemsProvider>
        <ShoppingPageContent />
      </ShoppingItemsProvider>
    </ErrorBoundary>
  );
};

export default ShoppingPage;
