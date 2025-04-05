
import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, Scan as ScanIcon, FileText, Calendar, ShoppingBag, PanelTop } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import ScanningOptions from '@/components/features/scanning/ScanningOptions';
import { Button } from '@/components/ui/button';
import ScreenSelection from '@/components/features/scanning/ScreenSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ScanPage = () => {
  const navigate = useNavigate();
  const [showScreenSelection, setShowScreenSelection] = useState(false);
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>("options");

  // Get return destination from session storage if available
  const returnDestination = sessionStorage.getItem('returnToAfterScan');

  const goBack = () => {
    if (showScreenSelection) {
      setShowScreenSelection(false);
    } else if (returnDestination) {
      // Clear the session storage
      sessionStorage.removeItem('returnToAfterScan');
      sessionStorage.removeItem('scanAction');
      // Navigate to the return destination
      navigate(`/${returnDestination}`);
    } else {
      navigate('/');
    }
  };

  const scanModeOptions = [
    { 
      id: 'smart', 
      icon: <ScanIcon className="h-5 w-5" />, 
      label: 'Smart Scan',
      description: 'Auto-detect content type'
    },
    { 
      id: 'shopping', 
      icon: <ShoppingBag className="h-5 w-5" />, 
      label: 'Shopping',
      description: 'Add items to shopping list'
    },
    { 
      id: 'calendar', 
      icon: <Calendar className="h-5 w-5" />, 
      label: 'Calendar',
      description: 'Add events to calendar'
    },
    { 
      id: 'document', 
      icon: <FileText className="h-5 w-5" />, 
      label: 'Document',
      description: 'Scan & store documents'
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-6 py-1 sm:py-4 h-full flex flex-col">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2 min-h-[44px] min-w-[44px]"
          aria-label={returnDestination ? `Go back to ${returnDestination}` : "Go back to home"}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title={showScreenSelection ? "Screen Selection" : "Scan"} 
          subtitle={showScreenSelection 
            ? "Select any part of the screen for processing" 
            : isMobile 
              ? "Scan and analyze items" 
              : "Automatically recognize items and take action"
          }
          className="py-0"
        />
      </div>

      <Tabs defaultValue="options" className="flex-1 flex flex-col">
        <div className="px-1">
          <TabsList className="grid grid-cols-4 mb-4">
            {scanModeOptions.map(option => (
              <TabsTrigger 
                key={option.id} 
                value={option.id === 'smart' ? 'options' : option.id}
                className="flex flex-col py-2 px-1 h-auto"
                onClick={() => setActiveTab(option.id === 'smart' ? 'options' : option.id)}
              >
                {option.icon}
                <span className="text-xs mt-1">{option.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="flex-1">
          {showScreenSelection ? (
            <ScreenSelection onClose={() => setShowScreenSelection(false)} />
          ) : (
            <>
              <TabsContent value="options" className="h-full mt-0 data-[state=active]:flex-1">
                <ScanningOptions 
                  onScreenSelectionClick={() => setShowScreenSelection(true)}
                  preferredMode={activeTab !== 'options' ? activeTab : undefined}
                />
              </TabsContent>
              
              <TabsContent value="shopping">
                <div className={cn(
                  "flex flex-col items-center justify-center text-center p-6 h-full",
                  theme === 'light' ? "text-foreground" : "text-white"
                )}>
                  <ShoppingBag className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Shopping List Scanner</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Point your camera at products or receipts to quickly add items to your shopping list
                  </p>
                  
                  <div className="flex gap-4">
                    <Button 
                      variant="default"
                      className="gap-2"
                      onClick={() => {
                        sessionStorage.setItem('preferredScanMode', 'shopping');
                        setActiveTab('options');
                      }}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Start Scanning</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/shopping')}
                    >
                      View Shopping List
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar">
                <div className={cn(
                  "flex flex-col items-center justify-center text-center p-6 h-full",
                  theme === 'light' ? "text-foreground" : "text-white"
                )}>
                  <Calendar className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Calendar Event Scanner</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Scan invitations or screenshots to automatically add events to your calendar
                  </p>
                  
                  <div className="flex gap-4">
                    <Button 
                      variant="default"
                      className="gap-2"
                      onClick={() => {
                        sessionStorage.setItem('preferredScanMode', 'invitation');
                        setActiveTab('options');
                      }}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Scan Invitation</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/calendar')}
                    >
                      View Calendar
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="document">
                <div className={cn(
                  "flex flex-col items-center justify-center text-center p-6 h-full",
                  theme === 'light' ? "text-foreground" : "text-white"
                )}>
                  <FileText className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Document Scanner</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Scan physical documents, receipts or important information to save digitally
                  </p>
                  
                  <div className="flex gap-4">
                    <Button 
                      variant="default"
                      className="gap-2"
                      onClick={() => {
                        sessionStorage.setItem('preferredScanMode', 'document');
                        setActiveTab('options');
                      }}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Scan Document</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/documents')}
                    >
                      View Documents
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default ScanPage;
