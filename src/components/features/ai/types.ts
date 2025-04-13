import { Recipe } from '@/data/recipes/types';
import { ReactNode } from 'react';

export type DietaryRestrictionType = 
  | 'vegan' 
  | 'vegetarian' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'nut-free' 
  | 'low-carb';

export interface DietaryOption {
  id: DietaryRestrictionType;
  label: string;
  checked: boolean;
}

export interface FoodContext {
  conversationState: 'initial' | 'recipe_search' | 'dish_selection' | 'serving_size' | 'dietary_restrictions' | 'ingredient_list' | 'decision_point' | 'recipe_generation' | 'schedule_event' | 'closing';
  dishName?: string;
  selectedRecipe?: Recipe;
  servingSize?: number;
  dietaryRestrictions: DietaryRestrictionType[];
  dateTime?: Date;
  eventNotes?: string;
  ingredientsAdded: boolean;
  recipeSaved: boolean;
  eventScheduled: boolean;
}

export interface ButtonOption {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  action: () => void;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  options?: ButtonOption[];
  buttons?: ButtonOption[];
}

export interface AIFoodAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}
