
import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, File, Paperclip, FileText, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DataRecognition, { RecognizedItem, RecognizedItemType } from './DataRecognition';
import CategorySelection from './CategorySelection';
import { analyzeImage, getFileType } from '@/utils/imageAnalysis';

interface FileUploaderProps {
  onClose: () => void;
  onSaveSuccess?: (data: any) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onClose, onSaveSuccess }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'document' | 'unknown'>('unknown');
  const [processing, setProcessing] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Category selection state
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<RecognizedItemType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RecognizedItemType>('unknown');
  const [categoryConfirmed, setCategoryConfirmed] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          setFileData(result);
          const detectedType = getFileType(result, selectedFile.name);
          setFileType(detectedType);
          analyzeContent(result, selectedFile.name);
        }
      };
      
      if (selectedFile.type.startsWith('image/')) {
        reader.readAsDataURL(selectedFile);
      } else {
        reader.readAsArrayBuffer(selectedFile);
      }
      
      toast({
        title: "File Selected",
        description: `Processing: ${selectedFile.name}`,
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const result = event.target.result as string;
          setFileData(result);
          const detectedType = getFileType(result, droppedFile.name);
          setFileType(detectedType);
          analyzeContent(result, droppedFile.name);
        }
      };
      
      if (droppedFile.type.startsWith('image/')) {
        reader.readAsDataURL(droppedFile);
      } else {
        reader.readAsArrayBuffer(droppedFile);
      }
      
      toast({
        title: "File Dropped",
        description: `Processing: ${droppedFile.name}`,
      });
    }
  }, [toast]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const analyzeContent = async (data: string, fileName?: string) => {
    setProcessing(true);
    setProgressValue(0);
    setError(null);
    
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      // Simulating initial content analysis
      await new Promise(r => setTimeout(r, 1500));
      
      // Generate randomized category suggestions with confidence
      const detectionTypes: RecognizedItemType[] = ['document', 'receipt', 'invitation', 'product', 'unknown'];
      const randomIndex = Math.floor(Math.random() * 4); // Exclude 'unknown' for better demo
      const detectedType = detectionTypes[randomIndex];
      const confidence = 0.65 + (Math.random() * 0.30);
      
      setSuggestedCategory(detectedType);
      setSelectedCategory(detectedType);
      setAiConfidence(confidence);
      setShowCategorySelection(true);
      
      clearInterval(interval);
      setProgressValue(100);
      setProcessing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Detected: ${detectedType} (${Math.round(confidence * 100)}% confidence)`,
      });
      
    } catch (err) {
      console.error("Error analyzing content:", err);
      setError("Error processing file. Please try again with a different file.");
      clearInterval(interval);
      setProgressValue(0);
      setProcessing(false);
      
      toast({
        title: "Analysis Failed",
        description: "Could not process the uploaded file. Please try another file.",
        variant: "destructive",
      });
    }
  };
  
  const confirmCategory = () => {
    setCategoryConfirmed(true);
    setShowCategorySelection(false);
    processForCategory(selectedCategory);
  };
  
  const processForCategory = async (category: RecognizedItemType) => {
    if (!fileData) return;
    
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
    }, 80);
    
    try {
      // Generate mock detected text based on category
      const mockExtractedText = generateMockExtractedText(category);
      
      // Use timeout to simulate API call
      setTimeout(() => {
        clearInterval(interval);
        setProgressValue(100);
        
        const mockData = generateTypeSpecificMockData(category);
        const confidence = 0.75 + (Math.random() * 0.2);
        
        const result: RecognizedItem = {
          type: category,
          confidence,
          data: mockData,
          imageData: fileData,
          extractedText: mockExtractedText,
          detectedObjects: []
        };
        
        setRecognizedItem(result);
        setProcessing(false);
        
        toast({
          title: "Category Processing Complete",
          description: `Extracted ${category} details with ${Math.round(confidence * 100)}% confidence`,
        });
      }, 1500);
    } catch (err) {
      console.error("Error processing for category:", err);
      setError("Error processing file for this category. Please try again.");
      clearInterval(interval);
      setProcessing(false);
      
      toast({
        title: "Processing Failed",
        description: "Could not process the file for this category.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveItem = (formData: any, originalItem: RecognizedItem) => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      
      if (onSaveSuccess) {
        const savedData = {
          ...formData,
          originalType: originalItem.type,
          fileType: fileType,
          savedAt: new Date().toISOString()
        };
        onSaveSuccess(savedData);
      }
    }, 1000);
  };
  
  const generateMockExtractedText = (type: RecognizedItemType): string => {
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
  
  const generateTypeSpecificMockData = (type: RecognizedItemType) => {
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
      
      default:
        return {
          title: "Uploaded File",
          description: "This is a general file with no specific category.",
          tags: ["file", "uploaded"]
        };
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-10 w-10 text-primary" />;
    
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-10 w-10 text-primary" />;
      case 'pdf':
        return <FileText className="h-10 w-10 text-primary" />;
      case 'document':
        return <File className="h-10 w-10 text-primary" />;
      default:
        return <Paperclip className="h-10 w-10 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="mr-2"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium">
          {processing
            ? "Analyzing File"
            : showCategorySelection
              ? "Confirm Category"
              : recognizedItem
                ? "Review & Save"
                : "Upload File"
          }
        </h2>
        <div className="w-8" />
      </div>
      
      {!file ? (
        <div 
          className="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-primary bg-opacity-10 p-5 rounded-full">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground dark:text-white">Upload Files</h3>
              <p className="text-sm text-muted-foreground dark:text-gray-300 max-w-xs mx-auto">
                Drag and drop files here, or click to select files to upload for AI processing
              </p>
            </div>
            <label className="cursor-pointer">
              <Button>Select Files</Button>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            </label>
            
            <div className="text-xs text-muted-foreground mt-4">
              Supported formats: JPG, PNG, PDF, Word, Text
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Display the file preview or icon */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
            {fileType === 'image' && fileData ? (
              <img src={fileData} alt="Uploaded" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 w-full h-full">
                {getFileIcon()}
                <p className="mt-4 text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            )}
            
            {/* Processing overlay */}
            {processing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
                <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                <p className="text-white mb-2">{showCategorySelection ? "Analyzing..." : "Processing file..."}</p>
                <div className="w-full max-w-xs">
                  <Progress value={progressValue} className="h-2 bg-gray-700" />
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {showCategorySelection && !processing ? (
            <CategorySelection 
              suggestedCategory={suggestedCategory}
              selectedCategory={selectedCategory}
              aiConfidence={aiConfidence}
              onSelectCategory={setSelectedCategory}
              onConfirm={confirmCategory}
            />
          ) : recognizedItem && !processing ? (
            <DataRecognition
              recognizedItem={recognizedItem}
              isProcessing={isSaving}
              onSave={handleSaveItem}
              onCancel={() => {
                setShowCategorySelection(true);
                setRecognizedItem(null);
              }}
              onChangeCategory={() => {
                setShowCategorySelection(true);
                setRecognizedItem(null);
              }}
            />
          ) : null}
          
          {!processing && !showCategorySelection && !recognizedItem && (
            <div className="flex justify-center">
              <Button 
                onClick={openFilePicker}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Another File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
