
import React, { useState, useEffect } from 'react';
import { Calendar, Receipt, List, FileText, Image as ImageIcon, Check, Edit, ArrowRight, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManualDataEditor from './ManualDataEditor';
import SaveOptions from './SaveOptions';
import { useToast } from '@/components/ui/use-toast';
import FeedbackComponent from './FeedbackComponent';

export type RecognizedItemType = 'invitation' | 'receipt' | 'product' | 'document' | 'unknown';

export interface RecognizedItem {
  type: RecognizedItemType;
  confidence: number;
  data: any;
  imageData: string;
  extractedText?: string;
  detectedObjects?: Array<{ name: string; confidence: number }>;
}

interface DataRecognitionProps {
  recognizedItem: RecognizedItem | null;
  isProcessing: boolean;
  onSave: (formData: any, originalItem: RecognizedItem) => void;
  onCancel: () => void;
}

const DataRecognition: React.FC<DataRecognitionProps> = ({
  recognizedItem,
  isProcessing,
  onSave,
  onCancel
}) => {
  const [editMode, setEditMode] = useState(false);
  const [currentItemType, setCurrentItemType] = useState<RecognizedItemType>('unknown');
  const [currentData, setCurrentData] = useState<any>({});
  const [keepImage, setKeepImage] = useState(true);
  const [currentTab, setCurrentTab] = useState('data');
  const [saveLocations, setSaveLocations] = useState({
    addToShoppingList: false,
    addToCalendar: false,
    saveToDocuments: false,
    saveToSpending: false
  });
  const [editsSaved, setEditsSaved] = useState(false);
  const { toast } = useToast();
  
  // Initialize data from recognized item
  useEffect(() => {
    if (recognizedItem) {
      setCurrentItemType(recognizedItem.type);
      setCurrentData(recognizedItem.data || {});
      setEditsSaved(false);
      
      // Set default save location based on item type
      if (recognizedItem.type === 'invitation') {
        setSaveLocations(prev => ({ ...prev, addToCalendar: true }));
      } else if (recognizedItem.type === 'receipt') {
        setSaveLocations(prev => ({ ...prev, saveToSpending: true }));
      } else if (recognizedItem.type === 'product') {
        setSaveLocations(prev => ({ ...prev, addToShoppingList: true }));
      } else if (recognizedItem.type === 'document') {
        setSaveLocations(prev => ({ ...prev, saveToDocuments: true }));
      }
      
      // If confidence is low, enable edit mode by default
      if (recognizedItem.confidence < 0.8) {
        setEditMode(true);
      }
    }
  }, [recognizedItem]);
  
  const getLowConfidenceMessage = () => {
    if (!recognizedItem || recognizedItem.confidence >= 0.8) return null;
    
    return (
      <div className="text-sm text-amber-600 font-normal mt-1 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
        <p>AI confidence is low. Please review the detected information.</p>
      </div>
    );
  };

  const getCategoryIcon = (type: RecognizedItemType) => {
    switch (type) {
      case 'invitation':
        return <Calendar className="h-5 w-5 text-todo-purple" />;
      case 'receipt':
        return <Receipt className="h-5 w-5 text-green-600" />;
      case 'product':
        return <List className="h-5 w-5 text-blue-600" />;
      case 'document':
        return <FileText className="h-5 w-5 text-amber-600" />;
      default:
        return <ImageIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleSaveEdits = () => {
    setEditsSaved(true);
    setEditMode(false);
    toast({
      title: "Edits Saved",
      description: "Your changes have been saved. You can now proceed to save the item.",
    });
  };

  const handleSave = () => {
    if (!recognizedItem) return;
    
    // Prepare form data
    const formData = {
      title: currentData.title || currentData.name || "Unnamed Item",
      itemType: currentItemType,
      data: currentData,
      keepImage: keepImage,
      imageData: keepImage ? recognizedItem.imageData : null,
      ...saveLocations
    };
    
    onSave(formData, recognizedItem);
  };
  
  const handleTypeChange = (newType: RecognizedItemType) => {
    setCurrentItemType(newType);
    setEditsSaved(false);
    
    // Reset save locations when type changes
    setSaveLocations({
      addToShoppingList: newType === 'product',
      addToCalendar: newType === 'invitation',
      saveToDocuments: newType === 'document',
      saveToSpending: newType === 'receipt'
    });
  };
  
  const handleEditButtonClick = () => {
    setEditMode(true);
    setEditsSaved(false);
    setCurrentTab('data'); // Switch to data tab when edit is clicked
  };

  const handleSaveTabClick = () => {
    if (editMode) {
      toast({
        title: "Save Edits First",
        description: "Please save your edits before proceeding to save options.",
        variant: "destructive"
      });
      return;
    }
    setCurrentTab('save');
  };
  
  // If no recognized item, show empty state
  if (!recognizedItem) {
    return (
      <div className="p-6 text-center">
        <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium">No Item Detected</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try capturing a clearer image
        </p>
        <Button 
          variant="outline" 
          onClick={onCancel} 
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Map recognition type to detection type for feedback
  const getDetectionType = (type: RecognizedItemType): string => {
    switch (type) {
      case 'invitation': return 'document';
      case 'receipt': return 'document';
      case 'product': return 'product';
      case 'document': return 'document';
      default: return 'context';
    }
  };

  return (
    <div className="bg-white rounded-lg border dark:bg-gray-800 dark:border-gray-700">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center">
          <div className={cn(
            "mr-3 p-2 rounded-full",
            currentItemType === 'invitation' && "bg-todo-purple/10",
            currentItemType === 'receipt' && "bg-green-100 dark:bg-green-900/30",
            currentItemType === 'product' && "bg-blue-100 dark:bg-blue-900/30",
            currentItemType === 'document' && "bg-amber-100 dark:bg-amber-900/30",
            currentItemType === 'unknown' && "bg-gray-100 dark:bg-gray-700",
          )}>
            {getCategoryIcon(currentItemType)}
          </div>
          <div className="flex-1">
            <h3 className="font-medium dark:text-white">
              {currentItemType.charAt(0).toUpperCase() + currentItemType.slice(1)}
              {recognizedItem.confidence < 0.8 && " (Low Confidence)"}
            </h3>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Confidence: {Math.round(recognizedItem.confidence * 100)}%
            </p>
            {getLowConfidenceMessage()}
          </div>
          
          {!editMode && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleEditButtonClick}
              className="text-xs"
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          )}
        </div>

        {/* Add feedback component in minimal mode */}
        <div className="mt-2">
          <FeedbackComponent
            detectionType={getDetectionType(currentItemType)}
            detectionLabel={currentItemType}
            detectionResult={recognizedItem}
            minimal={true}
          />
        </div>
      </div>
      
      <div className="p-4">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="save" onClick={handleSaveTabClick}>Save Options</TabsTrigger>
            <TabsTrigger value="raw">Raw Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data" className="pt-4">
            {editMode ? (
              <div className="space-y-4">
                <ManualDataEditor
                  initialData={currentData}
                  itemType={currentItemType}
                  onDataChange={setCurrentData}
                  onTypeChange={handleTypeChange}
                />
                
                <Button 
                  onClick={handleSaveEdits} 
                  className="w-full bg-todo-purple hover:bg-todo-purple/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Edits
                </Button>
              </div>
            ) : (
              <div className="text-sm space-y-4 dark:text-gray-300">
                {Object.entries(currentData).map(([key, value]) => {
                  // Skip rendering arrays like items
                  if (Array.isArray(value)) {
                    return (
                      <div key={key}>
                        <span className="font-medium capitalize">{key}: </span>
                        <span>{Array.isArray(value) ? `${value.length} items` : String(value)}</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={key}>
                      <span className="font-medium capitalize">{key}: </span>
                      <span>{String(value)}</span>
                    </div>
                  );
                })}
                
                {Object.keys(currentData).length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    <p>No data extracted. Click Edit to enter data manually.</p>
                  </div>
                )}

                <div className="pt-4 flex justify-between items-center">
                  <Button 
                    variant="outline"
                    onClick={handleEditButtonClick}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </Button>
                  
                  <Button 
                    onClick={() => setCurrentTab('save')} 
                    className="bg-todo-purple hover:bg-todo-purple/90"
                  >
                    Continue to Save Options
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="save" className="pt-4">
            <SaveOptions 
              itemType={currentItemType}
              keepImage={keepImage}
              onKeepImageChange={setKeepImage}
              saveLocations={saveLocations}
              onSaveLocationsChange={setSaveLocations}
            />

            <div className="mt-4 text-sm text-muted-foreground dark:text-gray-400">
              <p>Your item will be saved to the selected locations with{keepImage ? '' : 'out'} the image.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="pt-4">
            <div className="bg-gray-50 p-3 rounded-md dark:bg-gray-900">
              <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[200px] dark:text-gray-300">
                {recognizedItem.extractedText || "No raw text extracted"}
              </pre>
            </div>
            
            {recognizedItem.detectedObjects && recognizedItem.detectedObjects.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 dark:text-gray-200">Detected Objects:</h4>
                <div className="flex flex-wrap gap-2">
                  {recognizedItem.detectedObjects.map((obj, index) => (
                    <div key={index} className="bg-gray-100 px-2 py-1 rounded text-xs dark:bg-gray-700 dark:text-gray-300">
                      {obj.name} ({Math.round(obj.confidence * 100)}%)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="border-t p-4 flex gap-3 dark:border-gray-700">
        {isProcessing ? (
          <Button className="flex-1" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </Button>
        ) : (
          <Button 
            className="flex-1 bg-todo-purple hover:bg-todo-purple/90"
            onClick={handleSave}
            disabled={editMode}
          >
            <Check className="mr-2 h-4 w-4" />
            Save to Selected Locations
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default DataRecognition;
