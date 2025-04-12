import { Recipe } from './types';

export const turkishRecipes: Recipe[] = [
  {
    id: 'adana-kebab',
    name: 'Adana Kebab',
    category: 'main',
    cuisine: 'turkish',
    baseServings: 1,
    prepTime: 30,
    cookTime: 15,
    calories: 450,
    ingredients: {
      default: [
        { name: 'ground lamb', quantity: 250, unit: 'g', scalable: true },
        { name: 'red pepper paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'pita bread', quantity: 2, unit: 'pieces', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true }
      ],
      vegan: [
        { name: 'seitan', quantity: 250, unit: 'g', scalable: true },
        { name: 'red pepper paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'pita bread', quantity: 2, unit: 'pieces', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true }
      ],
      glutenFree: [
        { name: 'ground lamb', quantity: 250, unit: 'g', scalable: true },
        { name: 'red pepper paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'gluten-free pita', quantity: 2, unit: 'pieces', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true }
      ],
      dairyFree: [
        { name: 'ground lamb', quantity: 250, unit: 'g', scalable: true },
        { name: 'red pepper paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'pita bread', quantity: 2, unit: 'pieces', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true }
      ],
      lowCarb: [
        { name: 'ground lamb', quantity: 300, unit: 'g', scalable: true },
        { name: 'red pepper paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'lettuce leaves', quantity: 4, unit: 'pieces', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true }
      ]
    },
    instructions: [
      'Mix ground lamb with spices',
      'Form into long kebabs',
      'Grill until cooked',
      'Warm pita bread',
      'Slice tomatoes and onions',
      'Assemble kebab in pita',
      'Add vegetables',
      'Serve immediately'
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
      carbohydrates: 25,
      fat: 25,
      fiber: 3
    }
  }
];
