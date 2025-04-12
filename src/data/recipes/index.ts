import { Recipe } from './types';
import { thaiRecipes } from './thai';
import { indianRecipes } from './indian';
import { italianRecipes } from './italian';
import { polishRecipes } from './polish';
import { frenchRecipes } from './french';
import { japaneseRecipes } from './japanese';
import { chineseRecipes } from './chinese';
import { greekRecipes } from './greek';
import { spanishRecipes } from './spanish';
import { vietnameseRecipes } from './vietnamese';
import { koreanRecipes } from './korean';
import { turkishRecipes } from './turkish';
import { moroccanRecipes } from './moroccan';
import { lebaneseRecipes } from './lebanese';
// Import other cuisine recipes as they are added

export const recipes: Recipe[] = [
  ...thaiRecipes,
  ...indianRecipes,
  ...italianRecipes,
  ...polishRecipes,
  ...frenchRecipes,
  ...japaneseRecipes,
  ...chineseRecipes,
  ...greekRecipes,
  ...spanishRecipes,
  ...vietnameseRecipes,
  ...koreanRecipes,
  ...turkishRecipes,
  ...moroccanRecipes,
  ...lebaneseRecipes,
  // Spread other cuisine recipes here as they are added
];

// Helper functions for filtering recipes
export function getRecipesByCuisine(cuisine: Recipe['cuisine']): Recipe[] {
  return recipes.filter(recipe => recipe.cuisine === cuisine);
}

export function getRecipesByDiet(diet: keyof Recipe['dietaryInfo']): Recipe[] {
  return recipes.filter(recipe => recipe.dietaryInfo[diet]);
}

export function getRecipesByCategory(category: Recipe['category']): Recipe[] {
  return recipes.filter(recipe => recipe.category === category);
}
