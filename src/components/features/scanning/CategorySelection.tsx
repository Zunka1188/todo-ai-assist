
import React from 'react';
import { Check, AlertCircle, ShoppingBag, Calendar, FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RecognizedItemType } from './DataRecognition';

interface CategorySelectionProps {
  suggestedCategory: RecognizedItemType | null;
  selectedCategory: RecognizedItemType;
  aiConfidence: number;
  onSelectCategory: (category: RecognizedItemType) => void;
  onConfirm: () => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  suggestedCategory,
  selectedCategory,
  aiConfidence,
  onSelectCategory,
  onConfirm
}) => {
  const getItemTypeInfo = (type: RecognizedItemType) => {
    switch (type) {
      case 'invitation':
        return { 
          icon: <Calendar className="h-5 w-5 text-blue-500" />,
          label: 'Event/Invitation',
          description: 'Calendar events, invitations, schedules'
        };
      case 'receipt':
        return { 
          icon: <Receipt className="h-5 w-5 text-green-500" />,
          label: 'Receipt',
          description: 'Purchase receipts, invoices, bills'
        };
      case 'product':
        return { 
          icon: <ShoppingBag className="h-5 w-5 text-purple-500" />,
          label: 'Product',
          description: 'Products, groceries, shopping items'
        };
      case 'document':
        return { 
          icon: <FileText className="h-5 w-5 text-yellow-500" />,
          label: 'Document',
          description: 'General documents, articles, forms'
        };
      default:
        return { 
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          label: 'Other',
          description: 'Unclassified or general purpose'
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">AI Analysis Results</h3>
          <div className="text-xs font-medium flex items-center">
            Confidence: 
            <span className={`ml-1 ${aiConfidence > 0.8 ? 'text-green-600' : aiConfidence > 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
              {Math.round(aiConfidence * 100)}%
            </span>
          </div>
        </div>
        
        {suggestedCategory && (
          <div className="bg-primary/5 border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1 rounded-full">
                {getItemTypeInfo(suggestedCategory).icon}
              </div>
              <div>
                <p className="font-medium text-sm">
                  AI detected: {getItemTypeInfo(suggestedCategory).label}
                </p>
                <Progress className="h-1.5 mt-1" value={aiConfidence * 100} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-base font-medium mb-2">Select Category</h3>
        <RadioGroup 
          value={selectedCategory} 
          onValueChange={(value) => onSelectCategory(value as RecognizedItemType)}
          className="space-y-2"
        >
          {(['product', 'document', 'receipt', 'invitation'] as RecognizedItemType[]).map((type) => {
            const { icon, label, description } = getItemTypeInfo(type);
            
            return (
              <div key={type} className={`
                flex items-center space-x-2 border rounded-lg p-3 transition-all 
                ${selectedCategory === type ? 'border-primary bg-primary/5' : 'hover:border-gray-400'}
              `}>
                <RadioGroupItem value={type} id={type} />
                <div className="flex-1 flex items-center">
                  <Label htmlFor={type} className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className={`p-1.5 rounded-full ${selectedCategory === type ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {icon}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </Label>
                  {suggestedCategory === type && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Suggested
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={onConfirm}>
          <Check className="h-4 w-4 mr-2" />
          Confirm & Continue
        </Button>
      </div>
    </div>
  );
};

export default CategorySelection;
