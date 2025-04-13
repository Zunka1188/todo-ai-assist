
import { Recipe } from './types';

export const koreanRecipes: Recipe[] = [
  {
    id: 'bibimbap',
    name: 'Bibimbap',
    category: 'main',
    cuisine: 'korean',
    baseServings: 1,
    prepTime: 40,
    cookTime: 20,
    calories: 480,
    ingredients: {
      default: [
        { name: 'rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'ground beef', quantity: 100, unit: 'g', scalable: true },
        { name: 'spinach', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'bean sprouts', quantity: 100, unit: 'g', scalable: true },
        { name: 'shiitake mushrooms', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'gochujang', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'sesame seeds', quantity: 1, unit: 'tbsp', scalable: false }
      ],
      vegan: [
        { name: 'rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 150, unit: 'g', scalable: true },
        { name: 'spinach', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'bean sprouts', quantity: 100, unit: 'g', scalable: true },
        { name: 'shiitake mushrooms', quantity: 100, unit: 'g', scalable: true },
        { name: 'tempeh', quantity: 50, unit: 'g', scalable: true },
        { name: 'gochujang', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'sesame seeds', quantity: 1, unit: 'tbsp', scalable: false }
      ],
      glutenFree: [
        { name: 'rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'ground beef', quantity: 100, unit: 'g', scalable: true },
        { name: 'spinach', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'bean sprouts', quantity: 100, unit: 'g', scalable: true },
        { name: 'shiitake mushrooms', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'gluten-free gochujang', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'tamari sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'sesame seeds', quantity: 1, unit: 'tbsp', scalable: false }
      ],
      dairyFree: [
        { name: 'rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'ground beef', quantity: 100, unit: 'g', scalable: true },
        { name: 'spinach', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'bean sprouts', quantity: 100, unit: 'g', scalable: true },
        { name: 'shiitake mushrooms', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'gochujang', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'sesame seeds', quantity: 1, unit: 'tbsp', scalable: false }
      ],
      lowCarb: [
        { name: 'cauliflower rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'ground beef', quantity: 150, unit: 'g', scalable: true },
        { name: 'spinach', quantity: 150, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'bean sprouts', quantity: 150, unit: 'g', scalable: true },
        { name: 'shiitake mushrooms', quantity: 75, unit: 'g', scalable: true },
        { name: 'egg', quantity: 2, unit: 'piece', scalable: true },
        { name: 'gochujang', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'sesame seeds', quantity: 1, unit: 'tbsp', scalable: false }
      ]
    },
    instructions: [
      'Cook rice',
      'Prepare vegetables',
      'Season and cook beef',
      'Sauté mushrooms',
      'Blanch spinach',
      'Fry egg sunny-side up',
      'Arrange in bowl',
      'Mix before eating'
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
      calories: 480,
      protein: 25,
      carbohydrates: 55,
      fat: 20,
      fiber: 6
    },
    image: '/images/recipes/bibimbap.jpg'
  },
  {
    id: 'kimchi-jjigae',
    name: 'Kimchi Jjigae (Kimchi Stew)',
    category: 'main',
    cuisine: 'korean',
    baseServings: 1, // Fixed from 2 to 1 to match the type definition
    prepTime: 15,
    cookTime: 30,
    calories: 350,
    ingredients: {
      default: [
        { name: 'kimchi', quantity: 250, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'green onion', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'kimchi juice', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'gochugaru', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'gochujang', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'soup stock', quantity: 500, unit: 'ml', scalable: true }
      ],
      vegan: [
        { name: 'vegan kimchi', quantity: 250, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 150, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 300, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'green onion', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'vegan kimchi juice', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'gochugaru', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'gochujang', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'vegetable stock', quantity: 500, unit: 'ml', scalable: true }
      ],
      glutenFree: [
        { name: 'kimchi', quantity: 250, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'green onion', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'kimchi juice', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'gochugaru', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'gluten-free gochujang', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'gluten-free soup stock', quantity: 500, unit: 'ml', scalable: true }
      ],
      dairyFree: [
        { name: 'kimchi', quantity: 250, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'green onion', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'kimchi juice', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'gochugaru', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'gochujang', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'soup stock', quantity: 500, unit: 'ml', scalable: true }
      ],
      lowCarb: [
        { name: 'kimchi', quantity: 200, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 200, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'green onion', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'kimchi juice', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'gochugaru', quantity: 0.5, unit: 'tbsp', scalable: true },
        { name: 'gochujang', quantity: 0.5, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'bone broth', quantity: 500, unit: 'ml', scalable: true }
      ]
    },
    instructions: [
      'Sauté kimchi in sesame oil',
      'Add pork and cook until no longer pink',
      'Add garlic and onion',
      'Pour in stock and kimchi juice',
      'Add gochugaru and gochujang',
      'Simmer for 15 minutes',
      'Add tofu and simmer for 5 more minutes',
      'Garnish with green onions',
      'Serve hot with rice'
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
      calories: 350,
      protein: 22,
      carbohydrates: 15,
      fat: 25,
      fiber: 4
    },
    image: '/images/recipes/kimchi-jjigae.jpg'
  }
];
