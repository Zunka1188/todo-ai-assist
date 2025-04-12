import { Recipe } from './types';

export const vietnameseRecipes: Recipe[] = [
  {
    id: 'pho',
    name: 'Phở Bò (Beef Pho)',
    category: 'main',
    cuisine: 'vietnamese',
    baseServings: 1,
    prepTime: 30,
    cookTime: 180,
    calories: 420,
    ingredients: {
      default: [
        { name: 'rice noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'beef brisket', quantity: 150, unit: 'g', scalable: true },
        { name: 'beef bones', quantity: 500, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'large', scalable: true },
        { name: 'ginger', quantity: 2, unit: 'inch', scalable: false },
        { name: 'star anise', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'cinnamon stick', quantity: 1, unit: 'piece', scalable: false },
        { name: 'cloves', quantity: 3, unit: 'pieces', scalable: false },
        { name: 'fish sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'thai basil', quantity: 10, unit: 'leaves', scalable: true },
        { name: 'lime', quantity: 1, unit: 'piece', scalable: true }
      ],
      vegan: [
        { name: 'rice noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 200, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 150, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'large', scalable: true },
        { name: 'ginger', quantity: 2, unit: 'inch', scalable: false },
        { name: 'star anise', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'cinnamon stick', quantity: 1, unit: 'piece', scalable: false },
        { name: 'cloves', quantity: 3, unit: 'pieces', scalable: false },
        { name: 'soy sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'thai basil', quantity: 10, unit: 'leaves', scalable: true },
        { name: 'lime', quantity: 1, unit: 'piece', scalable: true }
      ],
      glutenFree: [
        { name: 'rice noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'beef brisket', quantity: 150, unit: 'g', scalable: true },
        { name: 'beef bones', quantity: 500, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'large', scalable: true },
        { name: 'ginger', quantity: 2, unit: 'inch', scalable: false },
        { name: 'star anise', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'cinnamon stick', quantity: 1, unit: 'piece', scalable: false },
        { name: 'cloves', quantity: 3, unit: 'pieces', scalable: false },
        { name: 'fish sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'thai basil', quantity: 10, unit: 'leaves', scalable: true },
        { name: 'lime', quantity: 1, unit: 'piece', scalable: true }
      ],
      dairyFree: [
        { name: 'rice noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'beef brisket', quantity: 150, unit: 'g', scalable: true },
        { name: 'beef bones', quantity: 500, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'large', scalable: true },
        { name: 'ginger', quantity: 2, unit: 'inch', scalable: false },
        { name: 'star anise', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'cinnamon stick', quantity: 1, unit: 'piece', scalable: false },
        { name: 'cloves', quantity: 3, unit: 'pieces', scalable: false },
        { name: 'fish sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'thai basil', quantity: 10, unit: 'leaves', scalable: true },
        { name: 'lime', quantity: 1, unit: 'piece', scalable: true }
      ],
      lowCarb: [
        { name: 'shirataki noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'beef brisket', quantity: 200, unit: 'g', scalable: true },
        { name: 'beef bones', quantity: 500, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'large', scalable: true },
        { name: 'ginger', quantity: 2, unit: 'inch', scalable: false },
        { name: 'star anise', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'cinnamon stick', quantity: 1, unit: 'piece', scalable: false },
        { name: 'cloves', quantity: 3, unit: 'pieces', scalable: false },
        { name: 'fish sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'bean sprouts', quantity: 100, unit: 'g', scalable: true },
        { name: 'thai basil', quantity: 15, unit: 'leaves', scalable: true },
        { name: 'lime', quantity: 1, unit: 'piece', scalable: true }
      ]
    },
    instructions: [
      'Char onion and ginger',
      'Simmer bones for broth',
      'Add spices to broth',
      'Cook beef separately',
      'Prepare rice noodles',
      'Assemble in bowl',
      'Add garnishes',
      'Serve hot'
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
      calories: 420,
      protein: 35,
      carbohydrates: 45,
      fat: 12,
      fiber: 3
    }
  }
];
