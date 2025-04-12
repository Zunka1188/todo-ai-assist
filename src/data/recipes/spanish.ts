import { Recipe } from './types';

export const spanishRecipes: Recipe[] = [
  {
    id: 'paella',
    name: 'Seafood Paella',
    category: 'main',
    cuisine: 'spanish',
    baseServings: 1,
    prepTime: 30,
    cookTime: 45,
    calories: 520,
    ingredients: {
      default: [
        { name: 'bomba rice', quantity: 100, unit: 'g', scalable: true },
        { name: 'shrimp', quantity: 100, unit: 'g', scalable: true },
        { name: 'mussels', quantity: 100, unit: 'g', scalable: true },
        { name: 'squid', quantity: 50, unit: 'g', scalable: true },
        { name: 'saffron', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'seafood stock', quantity: 300, unit: 'ml', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'peas', quantity: 50, unit: 'g', scalable: true }
      ],
      vegan: [
        { name: 'bomba rice', quantity: 100, unit: 'g', scalable: true },
        { name: 'artichokes', quantity: 100, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 100, unit: 'g', scalable: true },
        { name: 'bell peppers', quantity: 1, unit: 'medium', scalable: true },
        { name: 'saffron', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'vegetable stock', quantity: 300, unit: 'ml', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'peas', quantity: 50, unit: 'g', scalable: true }
      ],
      glutenFree: [
        { name: 'bomba rice', quantity: 100, unit: 'g', scalable: true },
        { name: 'shrimp', quantity: 100, unit: 'g', scalable: true },
        { name: 'mussels', quantity: 100, unit: 'g', scalable: true },
        { name: 'squid', quantity: 50, unit: 'g', scalable: true },
        { name: 'saffron', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'seafood stock', quantity: 300, unit: 'ml', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'peas', quantity: 50, unit: 'g', scalable: true }
      ],
      dairyFree: [
        { name: 'bomba rice', quantity: 100, unit: 'g', scalable: true },
        { name: 'shrimp', quantity: 100, unit: 'g', scalable: true },
        { name: 'mussels', quantity: 100, unit: 'g', scalable: true },
        { name: 'squid', quantity: 50, unit: 'g', scalable: true },
        { name: 'saffron', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'seafood stock', quantity: 300, unit: 'ml', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'peas', quantity: 50, unit: 'g', scalable: true }
      ],
      lowCarb: [
        { name: 'cauliflower rice', quantity: 150, unit: 'g', scalable: true },
        { name: 'shrimp', quantity: 150, unit: 'g', scalable: true },
        { name: 'mussels', quantity: 150, unit: 'g', scalable: true },
        { name: 'squid', quantity: 75, unit: 'g', scalable: true },
        { name: 'saffron', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'seafood stock', quantity: 200, unit: 'ml', scalable: true },
        { name: 'olive oil', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'green beans', quantity: 50, unit: 'g', scalable: true }
      ]
    },
    instructions: [
      'Toast rice in oil',
      'Add saffron to stock',
      'Sauté vegetables',
      'Add rice and stock',
      'Cook until rice absorbs liquid',
      'Add seafood',
      'Create socarrat',
      'Rest before serving'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: true,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 520,
      protein: 35,
      carbohydrates: 45,
      fat: 22,
      fiber: 3
    }
  }
];
