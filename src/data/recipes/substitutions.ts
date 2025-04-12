import { Ingredient } from './types';

export const commonSubstitutions = {
  // Protein substitutions
  'chicken': { vegan: 'tofu', vegetarian: 'tempeh' },
  'beef': { vegan: 'seitan', vegetarian: 'mushrooms' },
  'fish': { vegan: 'hearts of palm', vegetarian: 'tempeh' },
  
  // Dairy substitutions
  'butter': { vegan: 'vegan butter', dairyFree: 'coconut oil' },
  'cream': { vegan: 'coconut cream', dairyFree: 'coconut cream' },
  'cheese': { vegan: 'nutritional yeast', dairyFree: 'nutritional yeast' },
  'yogurt': { vegan: 'coconut yogurt', dairyFree: 'coconut yogurt' },
  
  // Carb substitutions
  'pasta': { glutenFree: 'gluten-free pasta', lowCarb: 'zucchini noodles' },
  'rice': { lowCarb: 'cauliflower rice' },
  'bread': { glutenFree: 'gluten-free bread', lowCarb: 'lettuce wraps' },
  'flour': { glutenFree: 'almond flour', lowCarb: 'coconut flour' }
};

export function substituteIngredient(
  ingredient: Ingredient,
  dietaryType: 'vegan' | 'vegetarian' | 'glutenFree' | 'dairyFree' | 'lowCarb'
): Ingredient {
  const sub = commonSubstitutions[ingredient.name]?.[dietaryType];
  if (!sub) return ingredient;
  
  return {
    ...ingredient,
    name: sub
  };
}
