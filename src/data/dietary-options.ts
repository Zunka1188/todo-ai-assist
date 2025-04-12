export interface DietaryRestriction {
  id: string;
  label: string;
  checked: boolean;
}

export const DIETARY_OPTIONS: DietaryRestriction[] = [
  { id: 'vegan', label: 'Vegan', checked: false },
  { id: 'vegetarian', label: 'Vegetarian', checked: false },
  { id: 'nut-free', label: 'Nut-Free', checked: false },
  { id: 'lactose-free', label: 'Lactose-Free', checked: false },
  { id: 'low-carb', label: 'Low-Carb', checked: false },
  { id: 'gluten-free', label: 'Gluten-Free', checked: false },
];
