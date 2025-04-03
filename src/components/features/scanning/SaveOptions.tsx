
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, List, Receipt, FileText, Image as ImageIcon } from 'lucide-react';
import { RecognizedItemType } from './DataRecognition';
import { cn } from '@/lib/utils';

interface SaveOptionsProps {
  itemType: RecognizedItemType;
  keepImage: boolean;
  onKeepImageChange: (keep: boolean) => void;
  saveLocations: {
    addToShoppingList: boolean;
    addToCalendar: boolean;
    saveToDocuments: boolean;
    saveToSpending: boolean;
  };
  onSaveLocationsChange: (locations: any) => void;
}

const SaveOptions: React.FC<SaveOptionsProps> = ({
  itemType,
  keepImage,
  onKeepImageChange,
  saveLocations,
  onSaveLocationsChange,
}) => {
  const handleSaveLocationChange = (key: string, value: boolean) => {
    onSaveLocationsChange({
      ...saveLocations,
      [key]: value
    });
  };

  // Set recommended option based on item type
  const getRecommendedOption = () => {
    switch (itemType) {
      case 'invitation':
        return 'Calendar';
      case 'receipt':
        return 'Receipts & Expenses';
      case 'product':
        return 'Shopping List';
      case 'document':
        return 'Documents';
      default:
        return null;
    }
  };

  const recommendedOption = getRecommendedOption();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium dark:text-white">Image Options</h3>
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md dark:bg-gray-700">
          <div>
            <Label htmlFor="keep-image" className="cursor-pointer">
              Keep image with saved data
            </Label>
            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              {keepImage 
                ? "Image will be stored alongside extracted data" 
                : "Only extracted data will be saved, not the image"}
            </p>
          </div>
          <Switch
            id="keep-image"
            checked={keepImage}
            onCheckedChange={onKeepImageChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium dark:text-white">Choose Where to Save</h3>
        <p className="text-xs text-muted-foreground dark:text-gray-400">
          {recommendedOption ? (
            <>Recommended: <span className="font-medium">{recommendedOption}</span></>
          ) : (
            'Select where to save this item'
          )}
        </p>

        <div className="space-y-3">
          <div className={cn(
            "flex items-center space-x-2 p-3 rounded-md",
            itemType === 'product' ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-700"
          )}>
            <Checkbox 
              id="add-to-shopping"
              checked={saveLocations.addToShoppingList}
              onCheckedChange={(checked) => 
                handleSaveLocationChange('addToShoppingList', checked === true)
              }
            />
            <div className="flex flex-1 items-center">
              <Label 
                htmlFor="add-to-shopping" 
                className="cursor-pointer flex items-center"
              >
                <List className="mr-2 h-4 w-4 text-blue-600" />
                <div>
                  <span className="dark:text-white">Add to Shopping List</span>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Found in Shopping tab
                  </p>
                </div>
              </Label>
            </div>
          </div>

          <div className={cn(
            "flex items-center space-x-2 p-3 rounded-md",
            itemType === 'invitation' ? "bg-todo-purple/10 dark:bg-todo-purple/20" : "bg-gray-50 dark:bg-gray-700"
          )}>
            <Checkbox 
              id="add-to-calendar"
              checked={saveLocations.addToCalendar}
              onCheckedChange={(checked) => 
                handleSaveLocationChange('addToCalendar', checked === true)
              }
            />
            <div className="flex flex-1 items-center">
              <Label 
                htmlFor="add-to-calendar" 
                className="cursor-pointer flex items-center"
              >
                <Calendar className="mr-2 h-4 w-4 text-todo-purple" />
                <div>
                  <span className="dark:text-white">Add to Calendar</span>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Found in Calendar tab
                  </p>
                </div>
              </Label>
            </div>
          </div>

          <div className={cn(
            "flex items-center space-x-2 p-3 rounded-md",
            itemType === 'receipt' ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-700"
          )}>
            <Checkbox 
              id="save-to-spending"
              checked={saveLocations.saveToSpending}
              onCheckedChange={(checked) => 
                handleSaveLocationChange('saveToSpending', checked === true)
              }
            />
            <div className="flex flex-1 items-center">
              <Label 
                htmlFor="save-to-spending" 
                className="cursor-pointer flex items-center"
              >
                <Receipt className="mr-2 h-4 w-4 text-green-600" />
                <div>
                  <span className="dark:text-white">Save to Receipts & Expenses</span>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Found in Spending tab
                  </p>
                </div>
              </Label>
            </div>
          </div>

          <div className={cn(
            "flex items-center space-x-2 p-3 rounded-md",
            itemType === 'document' ? "bg-amber-50 dark:bg-amber-900/20" : "bg-gray-50 dark:bg-gray-700"
          )}>
            <Checkbox 
              id="save-to-documents"
              checked={saveLocations.saveToDocuments}
              onCheckedChange={(checked) => 
                handleSaveLocationChange('saveToDocuments', checked === true)
              }
            />
            <div className="flex flex-1 items-center">
              <Label 
                htmlFor="save-to-documents" 
                className="cursor-pointer flex items-center"
              >
                <FileText className="mr-2 h-4 w-4 text-amber-600" />
                <div>
                  <span className="dark:text-white">Save to Documents</span>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Found in Documents tab
                  </p>
                </div>
              </Label>
            </div>
          </div>
          
          {!saveLocations.addToShoppingList && 
           !saveLocations.addToCalendar && 
           !saveLocations.saveToSpending && 
           !saveLocations.saveToDocuments && (
            <div className="mt-2 p-3 bg-yellow-50 rounded-md text-sm dark:bg-yellow-900/20 dark:text-yellow-200">
              <p>⚠️ No save location selected. Please select at least one location to save your item.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveOptions;
