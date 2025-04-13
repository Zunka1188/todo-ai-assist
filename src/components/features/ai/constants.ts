import { DietaryOption } from './types';

export const STORAGE_KEY = 'ai-food-assistant-session';
export const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const DIETARY_OPTIONS: DietaryOption[] = [
  { id: 'vegan', label: 'Vegan', checked: false },
  { id: 'vegetarian', label: 'Vegetarian', checked: false },
  { id: 'gluten-free', label: 'Gluten-Free', checked: false },
  { id: 'dairy-free', label: 'Dairy-Free', checked: false },
  { id: 'low-carb', label: 'Low-Carb', checked: false },
  { id: 'nut-free', label: 'Nut-Free', checked: false },
];
