import { Recipe } from './types';

export const greekRecipes: Recipe[] = [
  {
    id: 'moussaka',
    name: 'Moussaka',
    category: 'main',
    cuisine: 'greek',
    baseServings: 1,
    prepTime: 45,
    cookTime: 60,
    calories: 580,
    ingredients: {
      default: [
        { name: 'eggplant', quantity: 2, unit: 'medium', scalable: true },
        { name: 'ground lamb', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'tomato paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'red wine', quantity: 50, unit: 'ml', scalable: true },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'flour', quantity: 30, unit: 'g', scalable: true },
        { name: 'milk', quantity: 300, unit: 'ml', scalable: true },
        { name: 'nutmeg', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'parmesan cheese', quantity: 50, unit: 'g', scalable: true }
      ],
      vegan: [
        { name: 'eggplant', quantity: 2, unit: 'medium', scalable: true },
        { name: 'lentils', quantity: 150, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'tomato paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'vegetable stock', quantity: 50, unit: 'ml', scalable: true },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'vegan butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'flour', quantity: 30, unit: 'g', scalable: true },
        { name: 'plant milk', quantity: 300, unit: 'ml', scalable: true },
        { name: 'nutmeg', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'nutritional yeast', quantity: 30, unit: 'g', scalable: true }
      ],
      glutenFree: [
        { name: 'eggplant', quantity: 2, unit: 'medium', scalable: true },
        { name: 'ground lamb', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'tomato paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'red wine', quantity: 50, unit: 'ml', scalable: true },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'cornstarch', quantity: 25, unit: 'g', scalable: true },
        { name: 'milk', quantity: 300, unit: 'ml', scalable: true },
        { name: 'nutmeg', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'parmesan cheese', quantity: 50, unit: 'g', scalable: true }
      ],
      dairyFree: [
        { name: 'eggplant', quantity: 2, unit: 'medium', scalable: true },
        { name: 'ground lamb', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'tomato paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'red wine', quantity: 50, unit: 'ml', scalable: true },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'olive oil', quantity: 30, unit: 'ml', scalable: true },
        { name: 'flour', quantity: 30, unit: 'g', scalable: true },
        { name: 'almond milk', quantity: 300, unit: 'ml', scalable: true },
        { name: 'nutmeg', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'nutritional yeast', quantity: 30, unit: 'g', scalable: true }
      ],
      lowCarb: [
        { name: 'eggplant', quantity: 3, unit: 'medium', scalable: true },
        { name: 'ground lamb', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'red wine', quantity: 30, unit: 'ml', scalable: true },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'butter', quantity: 40, unit: 'g', scalable: true },
        { name: 'almond flour', quantity: 20, unit: 'g', scalable: true },
        { name: 'heavy cream', quantity: 200, unit: 'ml', scalable: true },
        { name: 'nutmeg', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'parmesan cheese', quantity: 70, unit: 'g', scalable: true }
      ]
    },
    instructions: [
      'Slice and salt eggplant',
      'Make meat sauce',
      'Prepare béchamel sauce',
      'Layer eggplant and meat',
      'Top with béchamel',
      'Add cheese',
      'Bake until golden',
      'Rest before serving'
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
      calories: 580,
      protein: 32,
      carbohydrates: 35,
      fat: 35,
      fiber: 8
    }
  }
];
