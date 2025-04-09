
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cpu, Zap, Camera, Github, Scale } from 'lucide-react';
import ProduceScanner from '@/components/features/produceRecognition/ProduceScanner';
import ScaleIntegration from '@/components/features/produceRecognition/ScaleIntegration';
import { RecognizedProduce } from '@/components/features/produceRecognition/ProduceScanner';
import RecognitionResults from '@/components/features/produceRecognition/RecognitionResults';
import EditProduceDialog from '@/components/features/produceRecognition/EditProduceDialog';

const ProduceRecognitionPage: React.FC = () => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedProduce | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const handleWeightChange = (newWeight: number | null) => {
    setWeight(newWeight);
    if (recognizedItem && newWeight) {
      setRecognizedItem({
        ...recognizedItem,
        weightGrams: newWeight
      });
    }
  };
  
  const handleEditItem = () => {
    setIsEditDialogOpen(true);
  };
  
  const handleSaveEdit = (editedItem: RecognizedProduce) => {
    setRecognizedItem(editedItem);
    toast({
      title: "Item Updated",
      description: `${editedItem.name} information has been updated.`
    });
  };
  
  const handleConfirmItem = () => {
    if (recognizedItem) {
      toast({
        title: "Item Confirmed",
        description: `${recognizedItem.name} has been confirmed and saved.`,
      });
      
      // Here you would typically send the data to your backend
      console.log("Item confirmed:", JSON.stringify({
        name: recognizedItem.name,
        confidence: recognizedItem.confidence,
        price: recognizedItem.price,
        weight: recognizedItem.weightGrams,
        nutritionData: recognizedItem.nutritionData
      }, null, 2));
      
      // Reset state after confirmation
      setRecognizedItem(null);
      setWeight(null);
    }
  };
  
  // Mock function to simulate scanning
  const handleStartScan = () => {
    setIsScanning(true);
    toast({
      title: "Scanning Started",
      description: "Place a produce item on the scale."
    });
    
    // Simulate scan completion
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };
  
  return (
    <div className="container max-w-4xl py-4">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Produce Recognition System</h1>
        <p className="text-muted-foreground">
          A computer vision-based system for identifying produce without barcodes
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <Tabs 
              defaultValue="scanner" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="scanner" className="flex items-center">
                  <Camera className="mr-2 h-4 w-4" />
                  Scanner
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center">
                  <Cpu className="mr-2 h-4 w-4" />
                  System Info
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="scanner" className="mt-4">
                {recognizedItem ? (
                  <RecognitionResults 
                    item={recognizedItem}
                    onEdit={handleEditItem}
                    onConfirm={handleConfirmItem}
                  />
                ) : (
                  <ProduceScanner />
                )}
              </TabsContent>
              
              <TabsContent value="system" className="mt-4">
                <div className="bg-card border rounded-lg p-4">
                  <h2 className="text-xl font-bold mb-4">System Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <Cpu className="h-5 w-5 mr-2" />
                        Model Information
                      </h3>
                      <div className="bg-background rounded border p-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm">Backend</div>
                          <div className="text-sm font-medium">ConvNeXt-Large</div>
                          
                          <div className="text-sm">Segmentation</div>
                          <div className="text-sm font-medium">SAM (Segment Anything)</div>
                          
                          <div className="text-sm">Inference Engine</div>
                          <div className="text-sm font-medium">TensorRT</div>
                          
                          <div className="text-sm">Last Updated</div>
                          <div className="text-sm font-medium">April 9, 2025</div>
                          
                          <div className="text-sm">Supported Items</div>
                          <div className="text-sm font-medium">150+ Produce Types</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <Scale className="h-5 w-5 mr-2" />
                        Hardware Configuration
                      </h3>
                      <div className="bg-background rounded border p-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm">Camera Module</div>
                          <div className="text-sm font-medium">Raspberry Pi Camera V2</div>
                          
                          <div className="text-sm">Scale Interface</div>
                          <div className="text-sm font-medium">USB-Serial (9600 baud)</div>
                          
                          <div className="text-sm">Computing Device</div>
                          <div className="text-sm font-medium">Raspberry Pi 4B (8GB)</div>
                          
                          <div className="text-sm">External GPU</div>
                          <div className="text-sm font-medium">Coral Edge TPU</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" className="flex items-center" asChild>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 h-4 w-4" />
                          View Source Code
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full md:w-1/3">
            <ScaleIntegration onWeightChange={handleWeightChange} />
          </div>
        </div>
      </div>
      
      <EditProduceDialog
        item={recognizedItem}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ProduceRecognitionPage;
