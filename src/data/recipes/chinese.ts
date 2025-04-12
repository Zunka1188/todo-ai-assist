import { Recipe } from './types';

export const chineseRecipes: Recipe[] = [
  {
    id: 'kung-pao-chicken',
    name: 'Kung Pao Chicken',
    category: 'main',
    cuisine: 'chinese',
    baseServings: 1,
    prepTime: 20,
    cookTime: 15,
    calories: 450,
    ingredients: {
      default: [
        { name: 'chicken breast', quantity: 200, unit: 'g', scalable: true },
        { name: 'peanuts', quantity: 50, unit: 'g', scalable: true },
        { name: 'dried red chilies', quantity: 4, unit: 'pieces', scalable: false },
        { name: 'scallions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'inch', scalable: false },
        { name: 'soy sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'rice wine', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'rice vinegar', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'cornstarch', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tsp', scalable: true }
      ],
      vegan: [
        { name: 'tofu', quantity: 200, unit: 'g', scalable: true },
        { name: 'peanuts', quantity: 50, unit: 'g', scalable: true },
        { name: 'dried red chilies', quantity: 4, unit: 'pieces', scalable: false },
        { name: 'scallions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'inch', scalable: false },
        { name: 'soy sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'rice wine', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'rice vinegar', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'cornstarch', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tsp', scalable: true }
      ],
      glutenFree: [
        { name: 'chicken breast', quantity: 200, unit: 'g', scalable: true },
        { name: 'peanuts', quantity: 50, unit: 'g', scalable: true },
        { name: 'dried red chilies', quantity: 4, unit: 'pieces', scalable: false },
        { name: 'scallions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'inch', scalable: false },
        { name: 'tamari sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'mirin', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'rice vinegar', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'cornstarch', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tsp', scalable: true }
      ],
      dairyFree: [
        { name: 'chicken breast', quantity: 200, unit: 'g', scalable: true },
        { name: 'peanuts', quantity: 50, unit: 'g', scalable: true },
        { name: 'dried red chilies', quantity: 4, unit: 'pieces', scalable: false },
        { name: 'scallions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'inch', scalable: false },
        { name: 'soy sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'rice wine', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'rice vinegar', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'cornstarch', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tsp', scalable: true }
      ],
      lowCarb: [
        { name: 'chicken breast', quantity: 250, unit: 'g', scalable: true },
        { name: 'peanuts', quantity: 60, unit: 'g', scalable: true },
        { name: 'dried red chilies', quantity: 4, unit: 'pieces', scalable: false },
        { name: 'scallions', quantity: 3, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'inch', scalable: false },
        { name: 'soy sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'rice wine', quantity: 0.5, unit: 'tbsp', scalable: true },
        { name: 'rice vinegar', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'xanthan gum', quantity: 0.25, unit: 'tsp', scalable: true },
        { name: 'sesame oil', quantity: 2, unit: 'tsp', scalable: true }
      ],
      nutFree: [
        { name: 'chicken breast', quantity: 200, unit: 'g', scalable: true },
        { name: 'sunflower seeds', quantity: 50, unit: 'g', scalable: true },
        { name: 'dried red chilies', quantity: 4, unit: 'pieces', scalable: false },
        { name: 'scallions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'inch', scalable: false },
        { name: 'soy sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'rice wine', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'rice vinegar', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'cornstarch', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tsp', scalable: true }
      ]
    },
    instructions: [
      'Dice chicken into cubes',
      'Mix sauce ingredients',
      'Toast peanuts until golden',
      'Stir-fry chicken until cooked',
      'Add aromatics and chilies',
      'Pour in sauce mixture',
      'Add peanuts and scallions',
      'Serve hot with rice'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: true,
      isNutFree: false
    },
    nutritionalInfo: {
      calories: 450,
      protein: 35,
      carbohydrates: 15,
      fat: 28,
      fiber: 3
    }
  }
];
