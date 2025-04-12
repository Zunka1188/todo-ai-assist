import { Recipe } from './types';

export const indianRecipes: Recipe[] = [
  {
    id: 'butter-chicken',
    name: 'Butter Chicken',
    category: 'main',
    cuisine: 'indian',
    baseServings: 1,
    prepTime: 25,
    cookTime: 30,
    calories: 480,
    ingredients: {
      default: [
        { name: 'chicken thighs', quantity: 200, unit: 'g', scalable: true },
        { name: 'butter', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'heavy cream', quantity: 100, unit: 'ml', scalable: true },
        { name: 'tomato puree', quantity: 200, unit: 'ml', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'basmati rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      vegan: [
        { name: 'cauliflower', quantity: 200, unit: 'g', scalable: true },
        { name: 'vegan butter', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'coconut cream', quantity: 100, unit: 'ml', scalable: true },
        { name: 'tomato puree', quantity: 200, unit: 'ml', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'basmati rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      dairyFree: [
        { name: 'chicken thighs', quantity: 200, unit: 'g', scalable: true },
        { name: 'coconut oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'coconut cream', quantity: 100, unit: 'ml', scalable: true },
        { name: 'tomato puree', quantity: 200, unit: 'ml', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'basmati rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      lowCarb: [
        { name: 'chicken thighs', quantity: 250, unit: 'g', scalable: true },
        { name: 'butter', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'heavy cream', quantity: 150, unit: 'ml', scalable: true },
        { name: 'tomato puree', quantity: 150, unit: 'ml', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'cauliflower rice', quantity: 1, unit: 'cup', scalable: true }
      ]
    },
    instructions: [
      'Marinate chicken in spices',
      'Sauté onion, ginger, and garlic',
      'Add tomato puree and simmer',
      'Add chicken and cook through',
      'Stir in butter and cream',
      'Simmer until sauce thickens',
      'Cook rice or alternative',
      'Serve with naan or alternative'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: true,
      isDairyFree: false,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 480,
      protein: 35,
      carbohydrates: 30,
      fat: 28,
      fiber: 4
    }
  },
  {
    id: 'chana-masala',
    name: 'Chana Masala',
    category: 'main',
    cuisine: 'indian',
    baseServings: 1,
    prepTime: 15,
    cookTime: 25,
    calories: 350,
    ingredients: {
      default: [
        { name: 'chickpeas', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'cumin seeds', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'vegetable oil', quantity: 2, unit: 'tbsp', scalable: false },
        { name: 'basmati rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      lowCarb: [
        { name: 'chickpeas', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'cumin seeds', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'vegetable oil', quantity: 2, unit: 'tbsp', scalable: false },
        { name: 'cauliflower rice', quantity: 1, unit: 'cup', scalable: true }
      ]
    },
    instructions: [
      'Sauté cumin seeds in oil',
      'Add diced onion and cook until golden',
      'Add garlic and ginger paste',
      'Add spices and tomatoes',
      'Add chickpeas and water',
      'Simmer until sauce thickens',
      'Cook rice or alternative',
      'Serve hot with rice'
    ],
    dietaryInfo: {
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 350,
      protein: 15,
      carbohydrates: 45,
      fat: 12,
      fiber: 12
    }
  }
];
