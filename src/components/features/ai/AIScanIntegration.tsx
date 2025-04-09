
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, FileText, Calendar, Upload, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

import SmartScannerCapture from '../scanning/SmartScannerCapture';
import { AIDetectionMode } from '@/services/aiDetectionService';

interface AIScanIntegrationProps {
  initialMode?: AIDetectionMode;
}

const AIScanIntegration: React.FC<AIScanIntegrationProps> = ({
  initialMode = 'auto'
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AIDetectionMode>(initialMode);
  
  const handleScanSuccess = (result: any) => {
    setIsOpen(false);
    
    // Navigate based on item type or user selections
    if (result.addToShoppingList || result.itemType === 'product') {
      navigate('/shopping');
      toast({
        title: "Added to Shopping List",
        description: `${result.title} has been added to your shopping list.`
      });
    } else if (result.addToCalendar || result.itemType === 'invitation') {
      navigate('/calendar');
      toast({
        title: "Added to Calendar",
        description: `Event "${result.title}" has been added to your calendar.`
      });
    } else if (result.saveToDocuments || result.itemType === 'document') {
      navigate('/documents');
      toast({
        title: "Added to Documents",
        description: `Document "${result.title}" has been saved.`
      });
    } else {
      toast({
        title: "Item Saved",
        description: `${result.title} has been saved successfully.`
      });
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-todo-purple hover:bg-todo-purple/90 text-white"
        size={isMobile ? "sm" : "default"}
      >
        <Camera className="mr-2 h-4 w-4" />
        Smart Scan
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AI Smart Scanner</DialogTitle>
            <DialogDescription>
              Upload or capture an image for AI analysis
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as AIDetectionMode)} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="auto" className="text-xs">
                Auto Detect
              </TabsTrigger>
              <TabsTrigger value="shopping" className="text-xs">
                <ShoppingBag className="h-3 w-3 mr-1" />
                Shopping
              </TabsTrigger>
              <TabsTrigger value="document" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Document
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Event
              </TabsTrigger>
            </TabsList>

            <TabsContent value={mode}>
              <SmartScannerCapture 
                preferredMode={mode}
                onSaveSuccess={handleScanSuccess}
                onClose={() => setIsOpen(false)}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIScanIntegration;
