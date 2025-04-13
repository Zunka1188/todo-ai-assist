import { Recipe } from './types';

export const mexicanRecipes: Recipe[] = [
  {
    id: 'fish-tacos',
    name: 'Fish Tacos',
    category: 'main',
    cuisine: 'mexican',
    baseServings: 1,
    prepTime: 20,
    cookTime: 15,
    calories: 420,
    ingredients: {
      default: [
        { name: 'white fish fillets', quantity: 150, unit: 'g', scalable: true },
        { name: 'corn tortillas', quantity: 3, unit: 'piece', scalable: true },
        { name: 'lime', quantity: 1, unit: 'medium', scalable: false },
        { name: 'red cabbage', quantity: 1, unit: 'cup', scalable: true },
        { name: 'avocado', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'sour cream', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'cilantro', quantity: 0.25, unit: 'cup', scalable: false },
        { name: 'chili powder', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 0.5, unit: 'tsp', scalable: false }
      ],
      vegan: [
        { name: 'hearts of palm', quantity: 150, unit: 'g', scalable: true },
        { name: 'corn tortillas', quantity: 3, unit: 'piece', scalable: true },
        { name: 'lime', quantity: 1, unit: 'medium', scalable: false },
        { name: 'red cabbage', quantity: 1, unit: 'cup', scalable: true },
        { name: 'avocado', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'vegan sour cream', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'cilantro', quantity: 0.25, unit: 'cup', scalable: false },
        { name: 'chili powder', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 0.5, unit: 'tsp', scalable: false }
      ],
      lowCarb: [
        { name: 'white fish fillets', quantity: 200, unit: 'g', scalable: true },
        { name: 'lettuce leaves', quantity: 3, unit: 'large', scalable: true },
        { name: 'lime', quantity: 1, unit: 'medium', scalable: false },
        { name: 'red cabbage', quantity: 1, unit: 'cup', scalable: true },
        { name: 'avocado', quantity: 1, unit: 'medium', scalable: true },
        { name: 'sour cream', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'cilantro', quantity: 0.25, unit: 'cup', scalable: false },
        { name: 'chili powder', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 0.5, unit: 'tsp', scalable: false }
      ]
    },
    instructions: [
      'Season fish with spices',
      'Grill or pan-fry fish until flaky',
      'Warm tortillas or prepare lettuce',
      'Shred cabbage and slice avocado',
      'Chop cilantro',
      'Assemble tacos with fish',
      'Top with vegetables and cream',
      'Serve with lime wedges'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: true,
      isDairyFree: false,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 420,
      protein: 32,
      carbohydrates: 35,
      fat: 20,
      fiber: 8
    },
    image: '/images/recipes/fish-tacos.jpg'
  },
  {
    id: 'chicken-enchiladas',
    name: 'Chicken Enchiladas',
    category: 'main',
    cuisine: 'mexican',
    baseServings: 1,
    prepTime: 30,
    cookTime: 25,
    calories: 550,
    ingredients: {
      default: [
        { name: 'corn tortillas', quantity: 3, unit: 'piece', scalable: true },
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'enchilada sauce', quantity: 200, unit: 'ml', scalable: true },
        { name: 'cheddar cheese', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'black beans', quantity: 100, unit: 'g', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false }
      ],
      vegan: [
        { name: 'corn tortillas', quantity: 3, unit: 'piece', scalable: true },
        { name: 'jackfruit', quantity: 150, unit: 'g', scalable: true },
        { name: 'enchilada sauce', quantity: 200, unit: 'ml', scalable: true },
        { name: 'vegan cheese', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'black beans', quantity: 100, unit: 'g', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false }
      ],
      dairyFree: [
        { name: 'corn tortillas', quantity: 3, unit: 'piece', scalable: true },
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'enchilada sauce', quantity: 200, unit: 'ml', scalable: true },
        { name: 'dairy-free cheese', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'black beans', quantity: 100, unit: 'g', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false }
      ],
      lowCarb: [
        { name: 'lettuce leaves', quantity: 3, unit: 'large', scalable: true },
        { name: 'chicken breast', quantity: 200, unit: 'g', scalable: true },
        { name: 'enchilada sauce', quantity: 150, unit: 'ml', scalable: true },
        { name: 'cheddar cheese', quantity: 150, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false }
      ]
    },
    instructions: [
      'Cook and shred chicken',
      'Sauté onions and garlic',
      'Mix chicken with beans and spices',
      'Warm tortillas',
      'Fill tortillas with mixture',
      'Roll and place in baking dish',
      'Top with sauce and cheese',
      'Bake until cheese melts'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: true,
      isDairyFree: false,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 550,
      protein: 45,
      carbohydrates: 40,
      fat: 25,
      fiber: 8
    },
    image: '/images/recipes/chicken-enchiladas.jpg'
  }
];
