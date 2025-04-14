
import { Recipe } from '@/data/recipes/types';

export interface AIFoodAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export type DietaryRestrictionType = 
  | 'vegan' 
  | 'vegetarian' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'low-carb'
  | 'nut-free';

export interface DietaryOption {
  id: DietaryRestrictionType;
  label: string;
  checked: boolean;
}

export interface RecipeSearchProps {
  onSelectRecipe: (recipe: Recipe) => void;
  selectedDietaryRestrictions?: DietaryRestrictionType[];
}

export type ConversationStateType = 
  | 'initial'
  | 'recipe_search'
  | 'serving_size'
  | 'dietary_restrictions'
  | 'recipe_details'
  | 'schedule_event';

export interface FoodContext {
  conversationState: ConversationStateType;
  dietaryRestrictions: DietaryRestrictionType[];
  ingredientsAdded?: boolean;
  recipeSaved?: boolean;
  eventScheduled?: boolean;
  dishName?: string;
  selectedRecipe?: Recipe;
  servingSize?: number;
}

export interface ButtonOption {
  id: string;
  label: string;
  variant?: 'default' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  action: () => void;
}

export interface MessageAction {
  id: string;
  label: string;
  variant?: 'default' | 'outline' | 'ghost';
  action: () => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  imageUrl?: string;
  timestamp: Date;
  actions?: MessageAction[];
  buttons?: ButtonOption[];
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  improvementRate: number;
}
