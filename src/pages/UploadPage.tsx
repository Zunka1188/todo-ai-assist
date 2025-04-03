import React, { useState } from 'react';
import { Upload, ArrowLeft, Calendar, List, FileText, Receipt, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

type DetectionResult = {
  type: 'invitation' | 'receipt' | 'product' | 'document' | 'unknown';
  confidence: number;
  data?: Record<string, any>;
}

const UploadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [showCorrectionOptions, setShowCorrectionOptions] = useState(false);
  
  const form = useForm({
    defaultValues: {
      detectedType: '',
      title: '',
      date: '',
      time: '',
      location: '',
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Create a preview of the uploaded image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          processImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "File Selected",
        description: `Processing: ${file.name}`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Create a preview of the uploaded image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          processImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "File Dropped",
        description: `Processing: ${file.name}`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const processImage = async (imageDataURL: string) => {
    setProcessing(true);
    
    // In a real app, this would send the image to an AI service for analysis
    // For this demo, we'll simulate AI detection with random results
    setTimeout(() => {
      // Simulate AI processing
      const types: Array<DetectionResult['type']> = ['invitation', 'receipt', 'product', 'document', 'unknown'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const confidence = 0.7 + (Math.random() * 0.25); // Random confidence between 70% and 95%
      
      let mockData = {};
      
      // Create realistic mock data based on the type
      if (randomType === 'invitation') {
        mockData = {
          title: "Team Offsite Meeting",
          date: "2025-05-15",
          time: "10:00 AM",
          location: "Conference Room A, Building 2",
          organizer: "Sarah Johnson"
        };
        
        // Pre-fill the form with detected data
        form.reset({
          detectedType: randomType,
          title: "Team Offsite Meeting",
          date: "2025-05-15",
          time: "10:00 AM",
          location: "Conference Room A, Building 2",
        });
      } else if (randomType === 'receipt') {
        mockData = {
          store: "Green Grocers",
          date: "2025-04-03",
          total: "$67.89",
          items: [
            { name: "Apples", price: "$4.99" },
            { name: "Bread", price: "$3.50" },
            { name: "Milk", price: "$2.99" }
          ]
        };
      } else if (randomType === 'product') {
        mockData = {
          name: "Organic Avocados",
          price: "$5.99",
          category: "Groceries"
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

  const goBack = () => {
    navigate('/');
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

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title="Upload" 
          subtitle="Import images for AI processing"
          className="py-0"
        />
      </div>
      
      {!uploadedImage ? (
        <div
          className="border-2 border-dashed border-todo-purple/30 rounded-xl p-10 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-todo-purple bg-opacity-10 p-5 rounded-full">
              <Upload className="h-10 w-10 text-todo-purple" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground dark:text-white">Upload Files</h3>
              <p className="text-sm text-muted-foreground dark:text-gray-300 max-w-xs mx-auto">
                Drag and drop files here, or click to select files to upload for AI processing
              </p>
            </div>
            <label className="metallic-button cursor-pointer">
              Select Files
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
            <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-contain" />
          </div>
          
          {processing ? (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 className="h-8 w-8 text-todo-purple animate-spin mb-2" />
              <p className="text-center text-muted-foreground">
                Analyzing image with AI...
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
                  onClick={() => {
                    setUploadedImage(null);
                    setDetectionResult(null);
                    setShowCorrectionOptions(false);
                  }}
                  className="flex-1"
                >
                  Upload Another
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
        <h3 className="font-medium text-foreground dark:text-white mb-4">Supported File Types</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2 text-foreground dark:text-gray-300">
            <p>• Images (JPG, PNG, HEIC)</p>
            <p>• Documents (PDF)</p>
          </div>
          <div className="space-y-2 text-foreground dark:text-gray-300">
            <p>• Screenshots</p>
            <p>• Receipts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
