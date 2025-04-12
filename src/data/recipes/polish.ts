import { Recipe } from './types';

export const polishRecipes: Recipe[] = [
  {
    id: 'pierogi',
    name: 'Pierogi',
    category: 'main',
    cuisine: 'polish',
    baseServings: 1,
    prepTime: 60,
    cookTime: 30,
    calories: 380,
    ingredients: {
      default: [
        { name: 'flour', quantity: 150, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'water', quantity: 60, unit: 'ml', scalable: true },
        { name: 'potatoes', quantity: 200, unit: 'g', scalable: true },
        { name: 'farmer cheese', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ],
      vegan: [
        { name: 'flour', quantity: 150, unit: 'g', scalable: true },
        { name: 'aquafaba', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'water', quantity: 60, unit: 'ml', scalable: true },
        { name: 'potatoes', quantity: 200, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'vegan butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'nutritional yeast', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ],
      glutenFree: [
        { name: 'gluten-free flour blend', quantity: 150, unit: 'g', scalable: true },
        { name: 'xanthan gum', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'water', quantity: 60, unit: 'ml', scalable: true },
        { name: 'potatoes', quantity: 200, unit: 'g', scalable: true },
        { name: 'farmer cheese', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ],
      dairyFree: [
        { name: 'flour', quantity: 150, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'water', quantity: 60, unit: 'ml', scalable: true },
        { name: 'potatoes', quantity: 200, unit: 'g', scalable: true },
        { name: 'dairy-free cheese', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'olive oil', quantity: 30, unit: 'ml', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ],
      lowCarb: [
        { name: 'almond flour', quantity: 100, unit: 'g', scalable: true },
        { name: 'coconut flour', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 2, unit: 'piece', scalable: true },
        { name: 'water', quantity: 30, unit: 'ml', scalable: true },
        { name: 'cauliflower', quantity: 200, unit: 'g', scalable: true },
        { name: 'farmer cheese', quantity: 150, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ]
    },
    instructions: [
      'Make dough with flour, egg, water',
      'Rest dough for 30 minutes',
      'Prepare potato-cheese filling',
      'Roll out dough and cut circles',
      'Fill and seal pierogi',
      'Boil in batches until they float',
      'Pan-fry with butter if desired',
      'Serve with caramelized onions'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: false,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 380,
      protein: 12,
      carbohydrates: 48,
      fat: 16,
      fiber: 3
    }
  }
];
