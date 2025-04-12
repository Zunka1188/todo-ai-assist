import { Recipe } from './types';

export const italianRecipes: Recipe[] = [
  {
    id: 'pasta-carbonara',
    name: 'Pasta Carbonara',
    category: 'main',
    cuisine: 'italian',
    baseServings: 1,
    prepTime: 15,
    cookTime: 15,
    calories: 550,
    ingredients: {
      default: [
        { name: 'spaghetti', quantity: 100, unit: 'g', scalable: true },
        { name: 'pancetta', quantity: 50, unit: 'g', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'large', scalable: true },
        { name: 'parmesan cheese', quantity: 30, unit: 'g', scalable: true },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false }
      ],
      vegan: [
        { name: 'spaghetti', quantity: 100, unit: 'g', scalable: true },
        { name: 'smoked tempeh', quantity: 50, unit: 'g', scalable: true },
        { name: 'silken tofu', quantity: 100, unit: 'g', scalable: true },
        { name: 'nutritional yeast', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false }
      ],
      glutenFree: [
        { name: 'gluten-free spaghetti', quantity: 100, unit: 'g', scalable: true },
        { name: 'pancetta', quantity: 50, unit: 'g', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'large', scalable: true },
        { name: 'parmesan cheese', quantity: 30, unit: 'g', scalable: true },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false }
      ],
      lowCarb: [
        { name: 'zucchini noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'pancetta', quantity: 75, unit: 'g', scalable: true },
        { name: 'eggs', quantity: 2, unit: 'large', scalable: true },
        { name: 'parmesan cheese', quantity: 45, unit: 'g', scalable: true },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false }
      ]
    },
    instructions: [
      'Boil pasta in salted water',
      'Crisp pancetta in olive oil with garlic',
      'Beat eggs with cheese and pepper',
      'Drain pasta, reserving some water',
      'Mix hot pasta with egg mixture',
      'Add pancetta and oil',
      'Thin with pasta water if needed',
      'Serve immediately with extra cheese'
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
      calories: 550,
      protein: 25,
      carbohydrates: 65,
      fat: 22,
      fiber: 3
    }
  },
  {
    id: 'margherita-pizza',
    name: 'Pizza Margherita',
    category: 'main',
    cuisine: 'italian',
    baseServings: 1,
    prepTime: 20,
    cookTime: 15,
    calories: 600,
    ingredients: {
      default: [
        { name: 'pizza dough', quantity: 200, unit: 'g', scalable: true },
        { name: 'tomato sauce', quantity: 80, unit: 'ml', scalable: true },
        { name: 'mozzarella', quantity: 100, unit: 'g', scalable: true },
        { name: 'fresh basil', quantity: 8, unit: 'leaves', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false }
      ],
      vegan: [
        { name: 'pizza dough', quantity: 200, unit: 'g', scalable: true },
        { name: 'tomato sauce', quantity: 80, unit: 'ml', scalable: true },
        { name: 'vegan mozzarella', quantity: 100, unit: 'g', scalable: true },
        { name: 'fresh basil', quantity: 8, unit: 'leaves', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false }
      ],
      glutenFree: [
        { name: 'gluten-free pizza dough', quantity: 200, unit: 'g', scalable: true },
        { name: 'tomato sauce', quantity: 80, unit: 'ml', scalable: true },
        { name: 'mozzarella', quantity: 100, unit: 'g', scalable: true },
        { name: 'fresh basil', quantity: 8, unit: 'leaves', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false }
      ],
      lowCarb: [
        { name: 'cauliflower pizza crust', quantity: 200, unit: 'g', scalable: true },
        { name: 'tomato sauce', quantity: 60, unit: 'ml', scalable: true },
        { name: 'mozzarella', quantity: 150, unit: 'g', scalable: true },
        { name: 'fresh basil', quantity: 8, unit: 'leaves', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false }
      ]
    },
    instructions: [
      'Preheat oven to 220°C/425°F',
      'Roll out pizza dough',
      'Spread tomato sauce',
      'Add mozzarella',
      'Bake for 12-15 minutes',
      'Add fresh basil',
      'Drizzle with olive oil',
      'Slice and serve'
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
      calories: 600,
      protein: 24,
      carbohydrates: 75,
      fat: 25,
      fiber: 4
    }
  }
];
