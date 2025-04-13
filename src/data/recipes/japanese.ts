
import { Recipe } from './types';

export const japaneseRecipes: Recipe[] = [
  {
    id: 'miso-ramen',
    name: 'Miso Ramen',
    category: 'main',
    cuisine: 'japanese',
    baseServings: 1,
    prepTime: 30,
    cookTime: 45,
    calories: 550,
    ingredients: {
      default: [
        { name: 'ramen noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'miso paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'dashi stock', quantity: 500, unit: 'ml', scalable: true },
        { name: 'corn', quantity: 50, unit: 'g', scalable: true },
        { name: 'bamboo shoots', quantity: 30, unit: 'g', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'nori', quantity: 1, unit: 'sheet', scalable: true },
        { name: 'soft-boiled egg', quantity: 1, unit: 'piece', scalable: true }
      ],
      vegan: [
        { name: 'ramen noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'miso paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'tofu', quantity: 150, unit: 'g', scalable: true },
        { name: 'vegetable stock', quantity: 500, unit: 'ml', scalable: true },
        { name: 'corn', quantity: 50, unit: 'g', scalable: true },
        { name: 'bamboo shoots', quantity: 30, unit: 'g', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'nori', quantity: 1, unit: 'sheet', scalable: true },
        { name: 'mushrooms', quantity: 100, unit: 'g', scalable: true }
      ],
      glutenFree: [
        { name: 'rice noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'miso paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'dashi stock', quantity: 500, unit: 'ml', scalable: true },
        { name: 'corn', quantity: 50, unit: 'g', scalable: true },
        { name: 'bamboo shoots', quantity: 30, unit: 'g', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'nori', quantity: 1, unit: 'sheet', scalable: true },
        { name: 'soft-boiled egg', quantity: 1, unit: 'piece', scalable: true }
      ],
      dairyFree: [
        { name: 'ramen noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'miso paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'dashi stock', quantity: 500, unit: 'ml', scalable: true },
        { name: 'corn', quantity: 50, unit: 'g', scalable: true },
        { name: 'bamboo shoots', quantity: 30, unit: 'g', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'nori', quantity: 1, unit: 'sheet', scalable: true },
        { name: 'soft-boiled egg', quantity: 1, unit: 'piece', scalable: true }
      ],
      lowCarb: [
        { name: 'shirataki noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'miso paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'pork belly', quantity: 200, unit: 'g', scalable: true },
        { name: 'dashi stock', quantity: 500, unit: 'ml', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'bamboo shoots', quantity: 30, unit: 'g', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'nori', quantity: 1, unit: 'sheet', scalable: true },
        { name: 'soft-boiled egg', quantity: 2, unit: 'piece', scalable: true }
      ]
    },
    instructions: [
      'Prepare dashi stock',
      'Cook pork belly until tender',
      'Boil noodles according to package',
      'Mix miso paste with hot stock',
      'Assemble toppings',
      'Combine in serving bowl',
      'Add hot broth',
      'Garnish and serve'
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
      calories: 550,
      protein: 30,
      carbohydrates: 65,
      fat: 22,
      fiber: 4
    },
    image: '/images/recipes/miso-ramen.jpg' // Add default image path
  }
];
