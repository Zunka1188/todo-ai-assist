import React, { useState } from 'react';
import { Upload, ArrowLeft, Image, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import DataRecognition, { RecognizedItem, RecognizedItemType } from '@/components/features/scanning/DataRecognition';
import CategorySelection from '@/components/features/scanning/CategorySelection';

type CategoryOption = 'invitation' | 'receipt' | 'product' | 'document' | 'unknown' | 'general';

const UploadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentTab, setCurrentTab] = useState<'category' | 'details'>('category');
  const [suggestedCategory, setSuggestedCategory] = useState<CategoryOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>('unknown');
  const [categoryConfirmed, setCategoryConfirmed] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(0);
  
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [savedItemData, setSavedItemData] = useState<any>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          
          setCurrentTab('category');
          setCategoryConfirmed(false);
          
          analyzeImageCategory(event.target.result as string);
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
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          
          setCurrentTab('category');
          setCategoryConfirmed(false);
          
          analyzeImageCategory(event.target.result as string);
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
  
  const analyzeImageCategory = async (imageDataURL: string) => {
    setProcessing(true);
    setProgressValue(0);
    
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 10;
      });
    }, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      setProgressValue(100);
      
      const types: CategoryOption[] = ['invitation', 'receipt', 'product', 'document', 'general'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const confidence = 0.6 + (Math.random() * 0.35);
      
      setSuggestedCategory(randomType);
      setSelectedCategory(randomType);
      setAiConfidence(confidence);
      setProcessing(false);
      
      if (confidence < 0.3) {
        setSelectedCategory('unknown');
      }
      
      toast({
        title: "Image Analysis Complete",
        description: `Suggested category: ${randomType}`,
      });
    }, 1500);
  };
  
  const confirmCategory = () => {
    setCategoryConfirmed(true);
    setCurrentTab('details');
    // Convert CategoryOption to RecognizedItemType before passing
    const recognizedType = selectedCategory === 'general' ? 'unknown' : selectedCategory;
    processImage(uploadedImage as string, recognizedType);
  };
  
  const processImage = async (imageDataURL: string, category: RecognizedItemType) => {
    setProcessing(true);
    setProgressValue(0);
    
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      setProgressValue(100);
      
      const confidence = 0.7 + (Math.random() * 0.25);
      let mockData = generateTypeSpecificMockData(category as any);
      
      const mockExtractedText = generateMockExtractedText(category as any);
      
      const mockDetectedObjects = generateMockDetectedObjects(category as any);
      
      const result: RecognizedItem = {
        type: category === 'general' ? 'unknown' : category as any,
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
        description: `Details extracted (${Math.round(confidence * 100)}% confidence)`,
      });
    }, 2000);
  };
  
  const generateMockExtractedText = (type: CategoryOption): string => {
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
  
  const generateTypeSpecificMockData = (type: CategoryOption) => {
    switch (type) {
      case 'invitation':
        return {
          title: "Team Offsite Meeting",
          date: "2025-05-15",
          time: "10:00 AM",
          location: "Conference Room A, Building 2",
          organizer: "Sarah Johnson",
          notes: "Quarterly team meeting. Bring your presentation materials."
        };
      
      case 'receipt':
        return {
          store: "Green Grocers",
          date: "2025-04-03",
          total: "$12.40",
          category: "Groceries",
          items: [
            { name: "Apples", price: "$4.99" },
            { name: "Bread", price: "$3.50" },
            { name: "Milk", price: "$2.99" }
          ]
        };
      
      case 'product':
        return {
          name: "Organic Avocados",
          price: "$5.99",
          category: "Groceries",
          brand: "Nature's Best",
          store: "Green Grocers",
          description: "Fresh organic avocados, perfect for guacamole."
        };
      
      case 'document':
        return {
          title: "Meeting Minutes",
          date: "2025-04-10",
          type: "Work",
          content: "Discussion about upcoming product launch and marketing strategy.",
          author: "John Smith"
        };
      
      case 'general':
      default:
        return {
          title: "Uploaded Image",
          description: "This is a general image with no specific category.",
          tags: ["photo", "image"]
        };
    }
  };
  
  const generateMockDetectedObjects = (type: CategoryOption) => {
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
          { name: "Image", confidence: 0.92 },
          { name: "Object", confidence: 0.78 }
        );
    }
    
    return objects;
  };
  
  const handleSaveItem = (formData: any, originalItem: RecognizedItem) => {
    setIsSaving(true);
    
    // Save the data to be displayed in the confirmation dialog
    setSavedItemData({
      ...formData,
      itemType: formData.itemType,
      hasImage: formData.keepImage,
      saveLocations: getSaveLocationsFromFormData(formData)
    });
    
    setTimeout(() => {
      setIsSaving(false);
      setShowConfirmationDialog(true);
    }, 1000);
  };
  
  const getSaveLocationsFromFormData = (formData: any): string[] => {
    const locations: string[] = [];
    
    if (formData.addToShoppingList) locations.push("Shopping List");
    if (formData.addToCalendar) locations.push("Calendar");
    if (formData.saveToDocuments) locations.push("Documents");
    if (formData.saveToSpending) locations.push("Receipts & Expenses");
    
    return locations.length ? locations : ["General Storage"];
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
    setCategoryConfirmed(false);
    setCurrentTab('category');
    setShowConfirmationDialog(false);
    setSavedItemData(null);
  };
  
  const handleChangeCategory = () => {
    setCategoryConfirmed(false);
    setCurrentTab('category');
  };

  const getItemTypeDisplayName = (type: string): string => {
    switch (type) {
      case 'invitation': return 'Event/Invitation';
      case 'receipt': return 'Receipt';
      case 'product': return 'Product';
      case 'document': return 'Document';
      case 'general': return 'General Picture';
      default: return 'Item';
    }
  };
  
  const closeConfirmationAndNavigate = () => {
    setShowConfirmationDialog(false);
    if (savedItemData) {
      navigateBasedOnFormData(savedItemData);
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
            
            {processing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
                <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                <p className="text-white mb-2">
                  {categoryConfirmed ? "Analyzing details..." : "Identifying image..."}
                </p>
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
                {categoryConfirmed ? "Analyzing details with AI..." : "Identifying image type..."}
              </p>
            </div>
          ) : uploadedImage && !categoryConfirmed ? (
            <div className="space-y-3">
              <CategorySelection
                suggestedCategory={suggestedCategory}
                selectedCategory={selectedCategory}
                aiConfidence={aiConfidence}
                onSelectCategory={setSelectedCategory}
                onConfirm={confirmCategory}
              />
            </div>
          ) : recognizedItem ? (
            <div className="space-y-3">
              <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'category' | 'details')}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="category" onClick={handleChangeCategory}>Category</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="category" className="pt-4">
                  <CategorySelection
                    suggestedCategory={suggestedCategory}
                    selectedCategory={selectedCategory}
                    aiConfidence={aiConfidence}
                    onSelectCategory={setSelectedCategory}
                    onConfirm={confirmCategory}
                  />
                </TabsContent>
                
                <TabsContent value="details" className="pt-4">
                  <DataRecognition
                    recognizedItem={recognizedItem}
                    isProcessing={isSaving}
                    onSave={handleSaveItem}
                    onCancel={resetUpload}
                  />
                </TabsContent>
              </Tabs>
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
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Item Saved Successfully</DialogTitle>
            <DialogDescription>
              Your item has been saved to the following locations:
            </DialogDescription>
          </DialogHeader>
          
          {savedItemData && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-100 p-2 rounded-full dark:bg-green-900/30">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-medium">{savedItemData.title || 'Unnamed Item'}</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{getItemTypeDisplayName(savedItemData.itemType)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Image:</span>
                  <span className="font-medium">{savedItemData.hasImage ? 'Included' : 'Not included'}</span>
                </div>
                
                <div>
                  <span className="text-muted-foreground">Saved to:</span>
                  <ul className="mt-1 space-y-1">
                    {savedItemData.saveLocations.map((location: string, index: number) => (
                      <li key={index} className="font-medium flex items-center">
                        <Check className="h-3 w-3 text-green-600 mr-1" />
                        {location}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              className="w-full sm:w-auto bg-todo-purple hover:bg-todo-purple/90"
              onClick={closeConfirmationAndNavigate}
            >
              Go to saved location
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={resetUpload}
            >
              Upload another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadPage;
