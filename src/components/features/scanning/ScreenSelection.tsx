import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Crop, Calendar, List, FileText, Receipt, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface ScreenSelectionProps {
  onSelectionComplete?: (selection: { x: number, y: number, width: number, height: number }) => void;
  onClose?: () => void;
}

type DetectionResult = {
  type: 'invitation' | 'receipt' | 'product' | 'document' | 'unknown';
  confidence: number;
  data?: Record<string, any>;
}

const ScreenSelection: React.FC<ScreenSelectionProps> = ({ onSelectionComplete, onClose }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionComplete, setSelectionComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [showCorrectionOptions, setShowCorrectionOptions] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm({
    defaultValues: {
      detectedType: '',
      title: '',
      date: '',
      time: '',
      location: '',
    }
  });

  const startSelection = () => {
    setIsSelecting(true);
    toast({
      title: "Screen Selection",
      description: "Drag to select area of screen for AI processing",
    });
    
    // Simulating selection for now
    setTimeout(() => {
      setIsSelecting(false);
      setSelectionComplete(true);
      
      if (onSelectionComplete) {
        onSelectionComplete({ x: 0, y: 0, width: 300, height: 200 });
      }
      
      toast({
        title: "Selection Complete",
        description: "Processing selected area...",
      });
      
      // Start AI processing once selection is complete
      processSelection();
    }, 2000);
  };
  
  const processSelection = () => {
    setProcessing(true);
    
    // Simulate AI processing with timeout
    setTimeout(() => {
      // Simulate random detection result
      const types: Array<DetectionResult['type']> = ['invitation', 'receipt', 'product', 'document', 'unknown'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const confidence = 0.7 + (Math.random() * 0.25); // Random confidence between 70% and 95%
      
      let mockData = {};
      
      // Create realistic mock data based on the type
      if (randomType === 'invitation') {
        mockData = {
          title: "Company Quarterly Review",
          date: "2025-06-20",
          time: "14:00 PM",
          location: "Main Conference Room",
          organizer: "John Smith"
        };
        
        // Pre-fill the form with detected data
        form.reset({
          detectedType: randomType,
          title: "Company Quarterly Review",
          date: "2025-06-20",
          time: "14:00 PM",
          location: "Main Conference Room",
        });
      } else if (randomType === 'receipt') {
        mockData = {
          store: "Super Market",
          date: "2025-04-03",
          total: "$45.32",
          items: [
            { name: "Oranges", price: "$3.99" },
            { name: "Cereal", price: "$4.50" },
            { name: "Yogurt", price: "$2.29" }
          ]
        };
      } else if (randomType === 'product') {
        mockData = {
          name: "Organic Mixed Berries",
          price: "$7.99",
          category: "Fruits"
        };
      }
      
      const result: DetectionResult = {
        type: randomType,
        confidence,
        data: mockData
      };
      
      setDetectionResult(result);
      setProcessing(false);
      
      // Low confidence for invitation type should show correction options
      if (randomType === 'invitation' && confidence < 0.85) {
        setShowCorrectionOptions(true);
      }
      
      toast({
        title: "Analysis Complete",
        description: `Detected: ${result.type} (${Math.round(result.confidence * 100)}% confidence)`,
      });
    }, 1500);
  };
  
  const handleSuggestedAction = () => {
    if (!detectionResult) return;
    
    if (showCorrectionOptions && detectionResult.type === 'invitation') {
      // If we're correcting an invitation, use the form data
      const formData = form.getValues();
      
      toast({
        title: "Adding to Calendar",
        description: `Event: ${formData.title} on ${formData.date} at ${formData.time}`,
      });
      
      setTimeout(() => navigate('/calendar'), 1000);
    } else {
      // Otherwise use the detected type to navigate
      switch (detectionResult.type) {
        case 'invitation':
          navigate('/calendar');
          break;
        case 'receipt':
          navigate('/spending');
          break;
        case 'product':
          navigate('/shopping');
          break;
        case 'document':
          navigate('/documents');
          break;
        default:
          toast({
            title: "No specific action",
            description: "Could not determine appropriate action for this item.",
          });
      }
    }
  };
  
  const handleTypeChange = (value: string) => {
    if (detectionResult) {
      setDetectionResult({
        ...detectionResult,
        type: value as DetectionResult['type']
      });
      
      // Show correction form for invitation
      setShowCorrectionOptions(value === 'invitation');
    }
  };
  
  const getActionText = () => {
    if (!detectionResult) return "";
    
    switch (detectionResult.type) {
      case 'invitation':
        return "Add to Calendar";
      case 'receipt':
        return "Save to Receipts";
      case 'product':
        return "Add to Shopping List";
      case 'document':
        return "Save to Documents";
      default:
        return "Save Item";
    }
  };
  
  const getActionIcon = () => {
    if (!detectionResult) return null;
    
    switch (detectionResult.type) {
      case 'invitation':
        return <Calendar className="mr-2 h-4 w-4" />;
      case 'receipt':
        return <Receipt className="mr-2 h-4 w-4" />;
      case 'product':
        return <List className="mr-2 h-4 w-4" />;
      case 'document':
        return <FileText className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const resetSelection = () => {
    setSelectionComplete(false);
    setDetectionResult(null);
    setProcessing(false);
    setShowCorrectionOptions(false);
  };

  return (
    <div className="space-y-4">
      {!selectionComplete ? (
        <div className="p-4 border border-dashed border-todo-purple/30 rounded-xl">
          <div className="text-center space-y-4">
            <Crop className="mx-auto h-12 w-12 text-todo-purple" />
            
            <div>
              <h3 className="font-medium">Screen Selection Tool</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select any area of your screen for AI processing without taking a screenshot
              </p>
            </div>
            
            <Button 
              onClick={startSelection}
              disabled={isSelecting}
              className="bg-todo-purple text-white"
            >
              {isSelecting ? "Selecting..." : "Start Selection"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 border border-todo-purple/10 bg-todo-purple/5 rounded-xl">
            <div className="text-center">
              <h3 className="font-medium">Area Selected</h3>
              <div className="bg-gray-200 w-full h-40 mt-2 rounded-lg flex items-center justify-center text-gray-500">
                <p className="text-sm">Selected Screen Area (Preview)</p>
              </div>
            </div>
          </div>
          
          {processing ? (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 className="h-8 w-8 text-todo-purple animate-spin mb-2" />
              <p className="text-center text-muted-foreground">
                Analyzing selection with AI...
              </p>
            </div>
          ) : detectionResult ? (
            <div className="bg-white rounded-lg border p-4 space-y-3">
              <div className="flex items-center">
                <div className={cn(
                  "mr-3 p-2 rounded-full",
                  detectionResult.type === 'invitation' && "bg-todo-purple/10",
                  detectionResult.type === 'receipt' && "bg-green-100",
                  detectionResult.type === 'product' && "bg-blue-100",
                  detectionResult.type === 'document' && "bg-amber-100",
                  detectionResult.type === 'unknown' && "bg-gray-100",
                )}>
                  {detectionResult.type === 'invitation' && <Calendar className="h-5 w-5 text-todo-purple" />}
                  {detectionResult.type === 'receipt' && <Receipt className="h-5 w-5 text-green-600" />}
                  {detectionResult.type === 'product' && <List className="h-5 w-5 text-blue-600" />}
                  {detectionResult.type === 'document' && <FileText className="h-5 w-5 text-amber-600" />}
                  {detectionResult.type === 'unknown' && <FileText className="h-5 w-5 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Detected: {detectionResult.type.charAt(0).toUpperCase() + detectionResult.type.slice(1)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {Math.round(detectionResult.confidence * 100)}%
                  </p>
                </div>
                
                <Select defaultValue={detectionResult.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invitation">Invitation</SelectItem>
                    <SelectItem value="receipt">Receipt</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {detectionResult.data && Object.keys(detectionResult.data).length > 0 && !showCorrectionOptions && (
                <div className="text-sm bg-gray-50 rounded-md p-3 space-y-1">
                  {Object.entries(detectionResult.data).map(([key, value]) => {
                    // Handle nested objects like items array in receipt
                    if (Array.isArray(value)) {
                      return (
                        <div key={key}>
                          <span className="font-medium">{key}: </span>
                          <span>{value.length} items</span>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={key}>
                        <span className="font-medium">{key}: </span>
                        <span>{value as string}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {showCorrectionOptions && detectionResult.type === 'invitation' && (
                <Form {...form}>
                  <div className="space-y-3 bg-gray-50 rounded-md p-3">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <input 
                              {...field}
                              className="w-full p-2 rounded border border-gray-300"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <input 
                              {...field}
                              className="w-full p-2 rounded border border-gray-300"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <input 
                              {...field}
                              className="w-full p-2 rounded border border-gray-300"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <input 
                              {...field}
                              className="w-full p-2 rounded border border-gray-300"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </Form>
              )}
              
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleSuggestedAction}
                  className="flex-1 bg-todo-purple hover:bg-todo-purple/90"
                >
                  {getActionIcon()}
                  {getActionText()}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetSelection}
                  className="flex-1"
                >
                  New Selection
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ScreenSelection;
