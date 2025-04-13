
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DietaryOption, FoodContext } from '../types';

interface DietaryCheckboxesProps {
  options: DietaryOption[];
  setOptions: (options: DietaryOption[]) => void;
  foodContext: FoodContext;
  setFoodContext: React.Dispatch<React.SetStateAction<FoodContext>>;
  addUserMessage: (content: string) => void;
  handleDishNameInput: () => void;
}

export const DietaryCheckboxes: React.FC<DietaryCheckboxesProps> = ({
  options,
  setOptions,
  foodContext,
  setFoodContext,
  addUserMessage,
  handleDishNameInput,
}) => {
  if (foodContext.conversationState !== 'dietary_restrictions') {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox 
            id={option.id}
            checked={option.checked}
            onCheckedChange={(checked) => {
              option.checked = checked as boolean;
              setOptions([...options]);
              if (checked) {
                setFoodContext(prev => ({
                  ...prev,
                  dietaryRestrictions: [...prev.dietaryRestrictions, option.id]
                }));
              } else {
                setFoodContext(prev => ({
                  ...prev,
                  dietaryRestrictions: prev.dietaryRestrictions.filter(id => id !== option.id)
                }));
              }
            }}
          />
          <Label htmlFor={option.id}>{option.label}</Label>
        </div>
      ))}
      <Button 
        className="mt-2"
        onClick={() => {
          addUserMessage(`Selected dietary restrictions: ${foodContext.dietaryRestrictions.join(', ')}`);
          handleDishNameInput();
        }}
      >
        Continue
      </Button>
    </div>
  );
};
