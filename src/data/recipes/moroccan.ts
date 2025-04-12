import { Recipe } from './types';

export const moroccanRecipes: Recipe[] = [
  {
    id: 'tagine',
    name: 'Moroccan Lamb Tagine',
    category: 'main',
    cuisine: 'moroccan',
    baseServings: 1,
    prepTime: 30,
    cookTime: 120,
    calories: 520,
    ingredients: {
      default: [
        { name: 'lamb shoulder', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'dried apricots', quantity: 50, unit: 'g', scalable: true },
        { name: 'almonds', quantity: 30, unit: 'g', scalable: true },
        { name: 'couscous', quantity: 100, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'honey', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'fresh cilantro', quantity: 0.25, unit: 'cup', scalable: true }
      ],
      vegan: [
        { name: 'chickpeas', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'dried apricots', quantity: 50, unit: 'g', scalable: true },
        { name: 'almonds', quantity: 30, unit: 'g', scalable: true },
        { name: 'couscous', quantity: 100, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'agave syrup', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'fresh cilantro', quantity: 0.25, unit: 'cup', scalable: true }
      ],
      glutenFree: [
        { name: 'lamb shoulder', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'dried apricots', quantity: 50, unit: 'g', scalable: true },
        { name: 'almonds', quantity: 30, unit: 'g', scalable: true },
        { name: 'quinoa', quantity: 100, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'honey', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'fresh cilantro', quantity: 0.25, unit: 'cup', scalable: true }
      ],
      dairyFree: [
        { name: 'lamb shoulder', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'dried apricots', quantity: 50, unit: 'g', scalable: true },
        { name: 'almonds', quantity: 30, unit: 'g', scalable: true },
        { name: 'couscous', quantity: 100, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'honey', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'fresh cilantro', quantity: 0.25, unit: 'cup', scalable: true }
      ],
      lowCarb: [
        { name: 'lamb shoulder', quantity: 300, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'dried apricots', quantity: 25, unit: 'g', scalable: true },
        { name: 'almonds', quantity: 45, unit: 'g', scalable: true },
        { name: 'cauliflower rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'monk fruit sweetener', quantity: 1, unit: 'tsp', scalable: true },
        { name: 'fresh cilantro', quantity: 0.25, unit: 'cup', scalable: true }
      ],
      nutFree: [
        { name: 'lamb shoulder', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'dried apricots', quantity: 50, unit: 'g', scalable: true },
        { name: 'pumpkin seeds', quantity: 30, unit: 'g', scalable: true },
        { name: 'couscous', quantity: 100, unit: 'g', scalable: true },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'honey', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'fresh cilantro', quantity: 0.25, unit: 'cup', scalable: true }
      ]
    },
    instructions: [
      'Brown lamb pieces',
      'Sauté onions and garlic',
      'Add spices and carrots',
      'Add liquid and simmer',
      'Add dried fruit',
      'Cook until tender',
      'Prepare couscous',
      'Garnish and serve'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: false
    },
    nutritionalInfo: {
      calories: 520,
      protein: 35,
      carbohydrates: 45,
      fat: 25,
      fiber: 6
    }
  }
];
