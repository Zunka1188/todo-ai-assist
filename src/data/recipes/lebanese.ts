import { Recipe } from './types';

export const lebaneseRecipes: Recipe[] = [
  {
    id: 'shawarma',
    name: 'Chicken Shawarma',
    category: 'main',
    cuisine: 'lebanese',
    baseServings: 1,
    prepTime: 30,
    cookTime: 25,
    calories: 480,
    ingredients: {
      default: [
        { name: 'chicken thighs', quantity: 250, unit: 'g', scalable: true },
        { name: 'pita bread', quantity: 2, unit: 'pieces', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'lemon juice', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'yogurt', quantity: 50, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'tahini', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'lettuce', quantity: 50, unit: 'g', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true }
      ],
      vegan: [
        { name: 'seitan', quantity: 250, unit: 'g', scalable: true },
        { name: 'pita bread', quantity: 2, unit: 'pieces', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'lemon juice', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'coconut yogurt', quantity: 50, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'tahini', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'lettuce', quantity: 50, unit: 'g', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true }
      ],
      glutenFree: [
        { name: 'chicken thighs', quantity: 250, unit: 'g', scalable: true },
        { name: 'gluten-free pita', quantity: 2, unit: 'pieces', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'lemon juice', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'yogurt', quantity: 50, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'tahini', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'lettuce', quantity: 50, unit: 'g', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true }
      ],
      dairyFree: [
        { name: 'chicken thighs', quantity: 250, unit: 'g', scalable: true },
        { name: 'pita bread', quantity: 2, unit: 'pieces', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'lemon juice', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'olive oil', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'tahini', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'hummus', quantity: 50, unit: 'g', scalable: true },
        { name: 'lettuce', quantity: 50, unit: 'g', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true }
      ],
      lowCarb: [
        { name: 'chicken thighs', quantity: 300, unit: 'g', scalable: true },
        { name: 'lettuce leaves', quantity: 4, unit: 'large', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'lemon juice', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'olive oil', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'yogurt', quantity: 50, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'tahini', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'cucumber', quantity: 1, unit: 'medium', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true }
      ]
    },
    instructions: [
      'Marinate chicken with spices',
      'Let rest for 30 minutes',
      'Grill or pan-fry chicken',
      'Prepare tahini sauce',
      'Warm pita bread',
      'Slice vegetables',
      'Assemble shawarma',
      'Serve with sauce'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: false,
      isDairyFree: false,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 480,
      protein: 35,
      carbohydrates: 35,
      fat: 25,
      fiber: 4
    }
  }
];
