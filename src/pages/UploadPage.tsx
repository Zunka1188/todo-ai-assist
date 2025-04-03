import React, { useState } from 'react';
import { Upload, ArrowLeft, Image, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DataRecognition, { RecognizedItem } from '@/components/features/scanning/DataRecognition';

const UploadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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
    setProgressValue(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    // In a real app, this would send the image to an AI service for analysis
    // For this demo, we'll simulate AI detection with random results
    setTimeout(() => {
      clearInterval(interval);
      setProgressValue(100);
      
      // Simulate AI processing
      const types = ['invitation', 'receipt', 'product', 'document', 'unknown'] as const;
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
          organizer: "Sarah Johnson",
          notes: "Quarterly team meeting. Bring your presentation materials."
        };
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
          category: "Groceries",
          description: "Fresh organic avocados, perfect for guacamole."
        };
      } else if (randomType === 'document') {
        mockData = {
          title: "Meeting Minutes",
          date: "2025-04-10",
          content: "Discussion about upcoming product launch and marketing strategy.",
          author: "John Smith"
        };
      }
      
      // Create mock extracted text
      const mockExtractedText = generateMockExtractedText(randomType);
      
      // Create mock detected objects
      const mockDetectedObjects = generateMockDetectedObjects(randomType);
      
      const result: RecognizedItem = {
        type: randomType,
        confidence,
        data: mockData,
        imageData: imageDataURL,
        extractedText: mockExtractedText,
        detectedObjects: mockDetectedObjects
      };
      
      setRecognizedItem(result);
      setProcessing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Detected: ${result.type} (${Math.round(result.confidence * 100)}% confidence)`,
      });
    }, 2000);
  };
  
  const generateMockExtractedText = (type: typeof types[number]): string => {
    switch (type) {
      case 'invitation':
        return `TEAM OFFSITE MEETING\nDate: May 15, 2025\nTime: 10:00 AM - 4:00 PM\nLocation: Conference Room A, Building 2\n\nOrganizer: Sarah Johnson\nsarah.j@company.com\n\nQuarterly team meeting. Bring your presentation materials.`;
      case 'receipt':
        return `GREEN GROCERS\n123 Main Street\nCity, State 12345\n\nDate: 04/03/2025\nTime: 14:35\n\nApples      $4.99\nBread       $3.50\nMilk        $2.99\n\nSubtotal    $11.48\nTax (8%)     $0.92\n\nTOTAL       $12.40\n\nTHANK YOU FOR SHOPPING!`;
      case 'product':
        return `Organic Avocados\n2 count package\n\nPrice: $5.99\nCategory: Groceries\n\nFresh organic avocados, perfect for guacamole.\n\nNutrition Facts:\nServing Size: 1 avocado\nCalories: 240\nTotal Fat: 22g`;
      case 'document':
        return `MEETING MINUTES\n\nDate: April 10, 2025\nSubject: Product Launch Planning\n\nAttendees:\n- John Smith (Chair)\n- Jane Doe\n- Alex Johnson\n\nDiscussion Items:\n1. Marketing strategy for Q2\n2. Budget allocation\n3. Timeline for upcoming product launch`;
      default:
        return `TEXT DETECTION\nThis is a sample of detected text\nThe AI system would extract\nall visible text from the image\nand format it appropriately.`;
    }
  };
  
  const generateMockDetectedObjects = (type: typeof types[number]) => {
    const objects = [];
    
    switch (type) {
      case 'product':
        objects.push(
          { name: "Avocado", confidence: 0.96 },
          { name: "Fruit", confidence: 0.92 },
          { name: "Food item", confidence: 0.88 }
        );
        break;
      case 'receipt':
        objects.push(
          { name: "Receipt", confidence: 0.97 },
          { name: "Document", confidence: 0.88 },
          { name: "Printed text", confidence: 0.95 }
        );
        break;
      case 'invitation':
        objects.push(
          { name: "Document", confidence: 0.92 },
          { name: "Calendar", confidence: 0.84 },
          { name: "Text", confidence: 0.96 }
        );
        break;
      case 'document':
        objects.push(
          { name: "Document", confidence: 0.98 },
          { name: "Paper", confidence: 0.93 },
          { name: "Text", confidence: 0.97 }
        );
        break;
      default:
        objects.push(
          { name: "Document", confidence: 0.82 },
          { name: "Object", confidence: 0.78 }
        );
    }
    
    return objects;
  };
  
  const handleSaveItem = (formData: any, originalItem: RecognizedItem) => {
    setIsSaving(true);
    
    // Simulate saving process
    setTimeout(() => {
      // Show appropriate message based on where it's being saved
      let savedLocation = "";
      if (formData.addToShoppingList) savedLocation = "Shopping List";
      else if (formData.addToCalendar) savedLocation = "Calendar";
      else if (formData.saveToSpending) savedLocation = "Receipts & Expenses";
      else if (formData.saveToDocuments) savedLocation = "Documents";
      else savedLocation = "your collection";
      
      // Show success message
      toast({
        title: "Item Saved Successfully",
        description: `"${formData.title}" has been saved to ${savedLocation}.`,
        variant: "default",
      });
      
      setIsSaving(false);
      
      // Navigate based on user selection
      navigateBasedOnFormData(formData);
    }, 1000);
  };
  
  const navigateBasedOnFormData = (formData: any) => {
    if (formData.addToShoppingList) {
      navigate('/shopping');
    } else if (formData.addToCalendar) {
      navigate('/calendar');
    } else if (formData.saveToSpending) {
      navigate('/spending');
    } else if (formData.saveToDocuments) {
      navigate('/documents');
    } else {
      // Default navigation based on item type
      switch (formData.itemType) {
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
          // Reset the page for another upload
          setUploadedImage(null);
          setRecognizedItem(null);
          break;
      }
    }
  };

  const goBack = () => {
    navigate('/');
  };
  
  const resetUpload = () => {
    setUploadedImage(null);
    setRecognizedItem(null);
    setProcessing(false);
  };

  // TypeScript definition for the types array - needed for the mock functions
  const types = ['invitation', 'receipt', 'product', 'document', 'unknown'] as const;

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
            
            {processing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
                <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                <p className="text-white mb-2">Analyzing image...</p>
                <div className="w-full max-w-xs">
                  <Progress value={progressValue} className="h-2 bg-gray-700" />
                </div>
              </div>
            )}
          </div>
          
          {processing ? (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 className="h-8 w-8 text-todo-purple animate-spin mb-2" />
              <p className="text-center text-muted-foreground">
                Analyzing image with AI...
              </p>
            </div>
          ) : recognizedItem ? (
            <div className="space-y-3">
              <DataRecognition
                recognizedItem={recognizedItem}
                isProcessing={isSaving}
                onSave={handleSaveItem}
                onCancel={resetUpload}
              />
            </div>
          ) : null}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
        <h3 className="font-medium text-foreground dark:text-white mb-4">Enhanced AI Recognition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2 text-foreground dark:text-gray-300">
            <p>• Automatic text recognition (OCR)</p>
            <p>• Product identification</p>
            <p>• Document classification</p>
          </div>
          <div className="space-y-2 text-foreground dark:text-gray-300">
            <p>• Receipt analysis</p>
            <p>• Event extraction</p>
            <p>• Multi-item detection</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
