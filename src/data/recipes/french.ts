
import { Recipe } from './types';

export const frenchRecipes: Recipe[] = [
  {
    id: 'coq-au-vin',
    name: 'Coq au Vin',
    category: 'main',
    cuisine: 'french',
    baseServings: 1,
    prepTime: 30,
    cookTime: 90,
    calories: 520,
    ingredients: {
      default: [
        { name: 'chicken thighs', quantity: 250, unit: 'g', scalable: true },
        { name: 'bacon lardons', quantity: 50, unit: 'g', scalable: true },
        { name: 'pearl onions', quantity: 100, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'red wine', quantity: 200, unit: 'ml', scalable: true },
        { name: 'chicken stock', quantity: 100, unit: 'ml', scalable: true },
        { name: 'thyme', quantity: 2, unit: 'sprigs', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'butter', quantity: 20, unit: 'g', scalable: true },
        { name: 'flour', quantity: 15, unit: 'g', scalable: true }
      ],
      vegan: [
        { name: 'mushrooms', quantity: 200, unit: 'g', scalable: true },
        { name: 'pearl onions', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'red wine', quantity: 200, unit: 'ml', scalable: true },
        { name: 'vegetable stock', quantity: 100, unit: 'ml', scalable: true },
        { name: 'thyme', quantity: 2, unit: 'sprigs', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'vegan butter', quantity: 20, unit: 'g', scalable: true },
        { name: 'flour', quantity: 15, unit: 'g', scalable: true },
        { name: 'seitan', quantity: 200, unit: 'g', scalable: true }
      ],
      glutenFree: [
        { name: 'chicken thighs', quantity: 250, unit: 'g', scalable: true },
        { name: 'bacon lardons', quantity: 50, unit: 'g', scalable: true },
        { name: 'pearl onions', quantity: 100, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'red wine', quantity: 200, unit: 'ml', scalable: true },
        { name: 'chicken stock', quantity: 100, unit: 'ml', scalable: true },
        { name: 'thyme', quantity: 2, unit: 'sprigs', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'cornstarch', quantity: 10, unit: 'g', scalable: true }
      ],
      dairyFree: [
        { name: 'chicken thighs', quantity: 250, unit: 'g', scalable: true },
        { name: 'bacon lardons', quantity: 50, unit: 'g', scalable: true },
        { name: 'pearl onions', quantity: 100, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'red wine', quantity: 200, unit: 'ml', scalable: true },
        { name: 'chicken stock', quantity: 100, unit: 'ml', scalable: true },
        { name: 'thyme', quantity: 2, unit: 'sprigs', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'olive oil', quantity: 20, unit: 'ml', scalable: true },
        { name: 'flour', quantity: 15, unit: 'g', scalable: true }
      ],
      lowCarb: [
        { name: 'chicken thighs', quantity: 300, unit: 'g', scalable: true },
        { name: 'bacon lardons', quantity: 75, unit: 'g', scalable: true },
        { name: 'pearl onions', quantity: 50, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 150, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'red wine', quantity: 100, unit: 'ml', scalable: true },
        { name: 'chicken stock', quantity: 150, unit: 'ml', scalable: true },
        { name: 'thyme', quantity: 2, unit: 'sprigs', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'xanthan gum', quantity: 1, unit: 'tsp', scalable: false }
      ]
    },
    instructions: [
      'Brown chicken in batches',
      'Cook bacon until crispy',
      'Sauté vegetables',
      'Add wine and reduce',
      'Return chicken to pot',
      'Add herbs and stock',
      'Simmer until tender',
      'Thicken sauce with flour'
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
      calories: 520,
      protein: 45,
      carbohydrates: 15,
      fat: 28,
      fiber: 3
    },
    image: '/images/recipes/coq-au-vin.jpg' // Add default image path
  }
];
