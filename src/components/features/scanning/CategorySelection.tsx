
import React from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar, Receipt, List, FileText, Image as ImageIcon } from 'lucide-react';
import { RecognizedItemType } from './DataRecognition';
import { cn } from '@/lib/utils';

type CategoryOption = RecognizedItemType | 'general';

interface CategorySelectionProps {
  suggestedCategory: CategoryOption | null;
  selectedCategory: CategoryOption;
  aiConfidence: number;
  onSelectCategory: (category: CategoryOption) => void;
  onConfirm: () => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  suggestedCategory,
  selectedCategory,
  aiConfidence,
  onSelectCategory,
  onConfirm
}) => {
  const categories: {value: CategoryOption; label: string; icon: React.ReactNode; description: string; savesTo: string}[] = [
    {
      value: 'product',
      label: 'Product',
      icon: <List className="h-5 w-5 text-blue-600" />,
      description: 'Add to shopping list or product catalog',
      savesTo: 'Shopping List'
    },
    {
      value: 'receipt',
      label: 'Receipt',
      icon: <Receipt className="h-5 w-5 text-green-600" />,
      description: 'Store for expense tracking and budgeting',
      savesTo: 'Receipts & Expenses'
    },
    {
      value: 'invitation',
      label: 'Invitation/Event',
      icon: <Calendar className="h-5 w-5 text-todo-purple" />,
      description: 'Save to calendar or events list',
      savesTo: 'Calendar'
    },
    {
      value: 'document',
      label: 'Document',
      icon: <FileText className="h-5 w-5 text-amber-600" />,
      description: 'Store notes, files, or important information',
      savesTo: 'Documents'
    },
    {
      value: 'general',
      label: 'General Picture',
      icon: <ImageIcon className="h-5 w-5 text-gray-600" />,
      description: 'Save image with basic information',
      savesTo: 'General Images'
    }
  ];

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence > 0.9) return 'High Confidence';
    if (confidence > 0.7) return 'Medium Confidence';
    return 'Low Confidence';
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.9) return 'text-green-600';
    if (confidence > 0.7) return 'text-amber-500';
    return 'text-red-500';
  }

  return (
    <div className="space-y-4">
      {suggestedCategory && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2 dark:text-white">AI Suggestion</h3>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "p-2 rounded-full",
              suggestedCategory === 'invitation' && "bg-todo-purple/10",
              suggestedCategory === 'receipt' && "bg-green-100 dark:bg-green-900/30",
              suggestedCategory === 'product' && "bg-blue-100 dark:bg-blue-900/30",
              suggestedCategory === 'document' && "bg-amber-100 dark:bg-amber-900/30",
              suggestedCategory === 'general' && "bg-gray-100 dark:bg-gray-700"
            )}>
              {categories.find(c => c.value === suggestedCategory)?.icon}
            </div>
            <div>
              <p className="font-medium dark:text-white">
                This looks like a {categories.find(c => c.value === suggestedCategory)?.label}
              </p>
              <p className={cn("text-xs", getConfidenceColor(aiConfidence))}>
                {getConfidenceLabel(aiConfidence)} ({Math.round(aiConfidence * 100)}%)
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium mb-3 dark:text-white">Confirm or Select Category</h3>
        <RadioGroup 
          value={selectedCategory} 
          onValueChange={(value) => onSelectCategory(value as CategoryOption)}
          className="space-y-2"
        >
          {categories.map((category) => (
            <div 
              key={category.value} 
              className={cn(
                "flex items-center space-x-2 p-3 rounded-md border",
                selectedCategory === category.value 
                  ? "bg-primary/5 border-primary" 
                  : "bg-card border-input hover:bg-accent/50 dark:hover:bg-gray-800",
                suggestedCategory === category.value && selectedCategory !== category.value 
                  ? "border-primary/30" 
                  : ""
              )}
            >
              <RadioGroupItem value={category.value} id={`category-${category.value}`} />
              <Label 
                htmlFor={`category-${category.value}`} 
                className="flex-1 flex items-center cursor-pointer"
              >
                <div className="mr-3">
                  {category.icon}
                </div>
                <div>
                  <p className="font-medium dark:text-white">{category.label}</p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">{category.description}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Saves to: {category.savesTo}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button 
        className="w-full bg-todo-purple hover:bg-todo-purple/90 mt-4"
        onClick={onConfirm}
      >
        Confirm Category & Continue
      </Button>
    </div>
  );
};

export default CategorySelection;
