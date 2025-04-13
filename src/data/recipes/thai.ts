
import { Recipe } from './types';

export const thaiRecipes: Recipe[] = [
  {
    id: 'thai-basil-chicken',
    name: 'Thai Basil Chicken',
    category: 'main',
    cuisine: 'thai',
    baseServings: 1,
    prepTime: 15,
    cookTime: 10,
    calories: 450,
    ingredients: {
      default: [
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'thai basil leaves', quantity: 1, unit: 'cup', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'thai chili', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'oyster sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'fish sauce', quantity: 0.5, unit: 'tsp', scalable: true },
        { name: 'vegetable oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'jasmine rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      vegan: [
        { name: 'tofu', quantity: 150, unit: 'g', scalable: true },
        { name: 'thai basil leaves', quantity: 1, unit: 'cup', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'thai chili', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'mushroom sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'vegetable oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'jasmine rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      glutenFree: [
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'thai basil leaves', quantity: 1, unit: 'cup', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'thai chili', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'tamari sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'fish sauce', quantity: 0.5, unit: 'tsp', scalable: true },
        { name: 'vegetable oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'jasmine rice', quantity: 0.5, unit: 'cup', scalable: true }
      ]
    },
    instructions: [
      'Mince garlic and thai chilies',
      'Cut chicken (or tofu) into bite-sized pieces',
      'Heat oil in a wok over high heat',
      'Add garlic and chilies, stir-fry for 30 seconds',
      'Add chicken/tofu, cook until nearly done',
      'Add sauces and stir well',
      'Add thai basil leaves and cook until wilted',
      'Serve hot over jasmine rice'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 450,
      protein: 35,
      carbohydrates: 45,
      fat: 15,
      fiber: 3
    },
    image: '/images/recipes/thai-basil-chicken.jpg' // Add default image path
  }
];
