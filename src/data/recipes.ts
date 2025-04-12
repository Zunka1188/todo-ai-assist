export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  scalable: boolean;
}

export type Cuisine = 
  | 'thai' 
  | 'polish' 
  | 'french' 
  | 'italian' 
  | 'japanese' 
  | 'chinese' 
  | 'indian' 
  | 'mexican' 
  | 'greek' 
  | 'spanish' 
  | 'vietnamese' 
  | 'korean' 
  | 'turkish' 
  | 'moroccan' 
  | 'lebanese';

export interface Recipe {
  id: string;
  name: string;
  category: 'main' | 'side' | 'dessert' | 'breakfast' | 'snack' | 'soup' | 'appetizer';
  cuisine: Cuisine;
  baseServings: 1;
  prepTime: number;
  cookTime: number;
  calories: number;
  ingredients: {
    default: Ingredient[];
    vegan?: Ingredient[];
    vegetarian?: Ingredient[];
    glutenFree?: Ingredient[];
    dairyFree?: Ingredient[];
    lowCarb?: Ingredient[];
    nutFree?: Ingredient[];
  };
  instructions: string[];
  dietaryInfo: {
    isVegan: boolean;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isLowCarb: boolean;
    isNutFree: boolean;
  };
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
}

export const recipes: Recipe[] = [
  {
    id: 'thai-basil-chicken',
    name: 'Thai Basil Chicken',
    category: 'main',
    cuisine: 'thai',
    baseServings: 1,
    prepTime: 15,
    cookTime: 10,
    calories: 450,
    ingredients: {
      default: [
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'thai basil leaves', quantity: 1, unit: 'cup', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'thai chili', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'oyster sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'fish sauce', quantity: 0.5, unit: 'tsp', scalable: true },
        { name: 'vegetable oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'jasmine rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      glutenFree: [
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'thai basil leaves', quantity: 1, unit: 'cup', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'thai chili', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'tamari sauce', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'fish sauce', quantity: 0.5, unit: 'tsp', scalable: true },
        { name: 'vegetable oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'jasmine rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      vegan: [
        { name: 'tofu', quantity: 150, unit: 'g', scalable: true },
        { name: 'thai basil leaves', quantity: 1, unit: 'cup', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'thai chili', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'mushroom sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'vegetable oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'jasmine rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      nutFree: [
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'thai basil leaves', quantity: 1, unit: 'cup', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'thai chili', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'oyster sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'fish sauce', quantity: 0.5, unit: 'tsp', scalable: true },
        { name: 'vegetable oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'jasmine rice', quantity: 0.5, unit: 'cup', scalable: true }
      ]
    },
    instructions: [
      'Mince garlic and thai chilies',
      'Cut chicken (or tofu) into bite-sized pieces',
      'Heat oil in a wok over high heat',
      'Add garlic and chilies, stir-fry for 30 seconds',
      'Add chicken/tofu, cook until nearly done',
      'Add sauces and stir well',
      'Add thai basil leaves and cook until wilted',
      'Serve hot over jasmine rice'
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
      calories: 450,
      protein: 35,
      carbohydrates: 45,
      fat: 15,
      fiber: 3
    }
  },
  {
    id: 'french-ratatouille',
    name: 'Classic Ratatouille',
    category: 'main',
    cuisine: 'french',
    baseServings: 1,
    prepTime: 20,
    cookTime: 35,
    calories: 320,
    ingredients: {
      default: [
        { name: 'eggplant', quantity: 1, unit: 'small', scalable: true },
        { name: 'zucchini', quantity: 1, unit: 'small', scalable: true },
        { name: 'bell pepper', quantity: 1, unit: 'medium', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'herbs de provence', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true }
      ]
    },
    instructions: [
      'Cut all vegetables into similar-sized chunks',
      'Heat olive oil in a large pan',
      'Add onions and garlic until soft',
      'Add eggplant and cook for 5 minutes',
      'Add zucchini and bell pepper, cook for 5 more minutes',
      'Add tomatoes, tomato paste, and herbs',
      'Simmer for 20 minutes until vegetables are tender',
      'Season with salt and pepper to taste'
    ],
    dietaryInfo: {
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
      isLowCarb: true,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 320,
      protein: 8,
      carbohydrates: 35,
      fat: 18,
      fiber: 12
    }
  },
  {
    id: 'japanese-miso-soup',
    name: 'Miso Soup',
    category: 'soup',
    cuisine: 'japanese',
    baseServings: 1,
    prepTime: 10,
    cookTime: 15,
    calories: 180,
    ingredients: {
      default: [
        { name: 'dashi stock', quantity: 2, unit: 'cups', scalable: true },
        { name: 'miso paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'tofu', quantity: 50, unit: 'g', scalable: true },
        { name: 'wakame seaweed', quantity: 1, unit: 'tsp', scalable: true },
        { name: 'green onion', quantity: 1, unit: 'stalk', scalable: true }
      ],
      glutenFree: [
        { name: 'gluten-free dashi stock', quantity: 2, unit: 'cups', scalable: true },
        { name: 'gluten-free miso paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'tofu', quantity: 50, unit: 'g', scalable: true },
        { name: 'wakame seaweed', quantity: 1, unit: 'tsp', scalable: true },
        { name: 'green onion', quantity: 1, unit: 'stalk', scalable: true }
      ]
    },
    instructions: [
      'Bring dashi stock to a simmer',
      'Rehydrate wakame in cold water, then drain',
      'Cut tofu into small cubes',
      'Slice green onion thinly',
      'Add miso paste to stock and whisk until dissolved',
      'Add tofu and wakame',
      'Simmer for 2-3 minutes',
      'Garnish with green onions'
    ],
    dietaryInfo: {
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: true,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 180,
      protein: 12,
      carbohydrates: 15,
      fat: 8,
      fiber: 2
    }
  },
  {
    id: 'moroccan-tagine',
    name: 'Vegetable Tagine',
    category: 'main',
    cuisine: 'moroccan',
    baseServings: 1,
    prepTime: 25,
    cookTime: 45,
    calories: 380,
    ingredients: {
      default: [
        { name: 'chickpeas', quantity: 150, unit: 'g', scalable: true },
        { name: 'butternut squash', quantity: 150, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'vegetable stock', quantity: 1, unit: 'cup', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'ras el hanout', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'couscous', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      glutenFree: [
        { name: 'chickpeas', quantity: 150, unit: 'g', scalable: true },
        { name: 'butternut squash', quantity: 150, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'vegetable stock', quantity: 1, unit: 'cup', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'ras el hanout', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'quinoa', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      lowCarb: [
        { name: 'chickpeas', quantity: 100, unit: 'g', scalable: true },
        { name: 'butternut squash', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'vegetable stock', quantity: 1, unit: 'cup', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'ras el hanout', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cauliflower rice', quantity: 1, unit: 'cup', scalable: true }
      ]
    },
    instructions: [
      'Heat olive oil in tagine or heavy pot',
      'Sauté onions and garlic until soft',
      'Add ras el hanout and stir for 1 minute',
      'Add vegetables and chickpeas',
      'Pour in stock and bring to simmer',
      'Cover and cook for 40 minutes',
      'Prepare couscous or alternative grain',
      'Serve tagine over grain of choice'
    ],
    dietaryInfo: {
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 380,
      protein: 15,
      carbohydrates: 58,
      fat: 12,
      fiber: 12
    }
  },
  {
    id: 'greek-souvlaki',
    name: 'Chicken Souvlaki',
    category: 'main',
    cuisine: 'greek',
    baseServings: 1,
    prepTime: 20,
    cookTime: 15,
    calories: 420,
    ingredients: {
      default: [
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'lemon juice', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'oregano', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'pita bread', quantity: 1, unit: 'piece', scalable: true },
        { name: 'cucumber', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'tomato', quantity: 1, unit: 'medium', scalable: true },
        { name: 'red onion', quantity: 0.25, unit: 'medium', scalable: true },
        { name: 'tzatziki sauce', quantity: 2, unit: 'tbsp', scalable: true }
      ],
      vegan: [
        { name: 'seitan', quantity: 150, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'lemon juice', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'oregano', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'pita bread', quantity: 1, unit: 'piece', scalable: true },
        { name: 'cucumber', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'tomato', quantity: 1, unit: 'medium', scalable: true },
        { name: 'red onion', quantity: 0.25, unit: 'medium', scalable: true },
        { name: 'vegan tzatziki', quantity: 2, unit: 'tbsp', scalable: true }
      ],
      glutenFree: [
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'lemon juice', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'oregano', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'gluten-free pita', quantity: 1, unit: 'piece', scalable: true },
        { name: 'cucumber', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'tomato', quantity: 1, unit: 'medium', scalable: true },
        { name: 'red onion', quantity: 0.25, unit: 'medium', scalable: true },
        { name: 'tzatziki sauce', quantity: 2, unit: 'tbsp', scalable: true }
      ],
      dairyFree: [
        { name: 'chicken breast', quantity: 150, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'lemon juice', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'oregano', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'pita bread', quantity: 1, unit: 'piece', scalable: true },
        { name: 'cucumber', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'tomato', quantity: 1, unit: 'medium', scalable: true },
        { name: 'red onion', quantity: 0.25, unit: 'medium', scalable: true },
        { name: 'dairy-free tzatziki', quantity: 2, unit: 'tbsp', scalable: true }
      ]
    },
    instructions: [
      'Cut chicken into 1-inch cubes',
      'Marinate with olive oil, lemon, garlic, and oregano for 30 minutes',
      'Thread onto skewers',
      'Grill for 12-15 minutes, turning occasionally',
      'Warm pita bread',
      'Slice vegetables',
      'Assemble souvlaki in pita with vegetables',
      'Top with tzatziki sauce'
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
      calories: 420,
      protein: 35,
      carbohydrates: 40,
      fat: 18,
      fiber: 4
    }
  },
  {
    id: 'vietnamese-pho',
    name: 'Vietnamese Pho',
    category: 'soup',
    cuisine: 'vietnamese',
    baseServings: 1,
    prepTime: 30,
    cookTime: 45,
    calories: 420,
    ingredients: {
      default: [
        { name: 'rice noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'beef slices', quantity: 150, unit: 'g', scalable: true },
        { name: 'beef bones', quantity: 300, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 30, unit: 'g', scalable: false },
        { name: 'star anise', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'cinnamon stick', quantity: 1, unit: 'piece', scalable: false },
        { name: 'fish sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'thai basil', quantity: 10, unit: 'leaves', scalable: true },
        { name: 'lime', quantity: 0.5, unit: 'piece', scalable: true },
        { name: 'hoisin sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sriracha sauce', quantity: 1, unit: 'tsp', scalable: true }
      ],
      vegan: [
        { name: 'rice noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 150, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 30, unit: 'g', scalable: false },
        { name: 'star anise', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'cinnamon stick', quantity: 1, unit: 'piece', scalable: false },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'thai basil', quantity: 10, unit: 'leaves', scalable: true },
        { name: 'lime', quantity: 0.5, unit: 'piece', scalable: true },
        { name: 'hoisin sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sriracha sauce', quantity: 1, unit: 'tsp', scalable: true }
      ],
      glutenFree: [
        { name: 'rice noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'beef slices', quantity: 150, unit: 'g', scalable: true },
        { name: 'beef bones', quantity: 300, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 30, unit: 'g', scalable: false },
        { name: 'star anise', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'cinnamon stick', quantity: 1, unit: 'piece', scalable: false },
        { name: 'tamari sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'thai basil', quantity: 10, unit: 'leaves', scalable: true },
        { name: 'lime', quantity: 0.5, unit: 'piece', scalable: true },
        { name: 'gluten-free hoisin sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sriracha sauce', quantity: 1, unit: 'tsp', scalable: true }
      ],
      lowCarb: [
        { name: 'shirataki noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'beef slices', quantity: 200, unit: 'g', scalable: true },
        { name: 'beef bones', quantity: 300, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 30, unit: 'g', scalable: false },
        { name: 'star anise', quantity: 2, unit: 'pieces', scalable: false },
        { name: 'cinnamon stick', quantity: 1, unit: 'piece', scalable: false },
        { name: 'fish sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'bean sprouts', quantity: 75, unit: 'g', scalable: true },
        { name: 'thai basil', quantity: 15, unit: 'leaves', scalable: true },
        { name: 'lime', quantity: 0.5, unit: 'piece', scalable: true }
      ]
    },
    instructions: [
      'Char onion and ginger',
      'Simmer bones with spices',
      'Cook rice noodles',
      'Slice beef very thinly',
      'Assemble bowl with noodles',
      'Add hot broth to cook beef',
      'Add fresh herbs and sprouts',
      'Serve with condiments'
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
      protein: 30,
      carbohydrates: 55,
      fat: 12,
      fiber: 3
    }
  },
  {
    id: 'banh-mi',
    name: 'Banh Mi Sandwich',
    category: 'main',
    cuisine: 'vietnamese',
    baseServings: 1,
    prepTime: 20,
    cookTime: 15,
    calories: 450,
    ingredients: {
      default: [
        { name: 'baguette', quantity: 1, unit: 'piece', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'pickled carrots', quantity: 50, unit: 'g', scalable: true },
        { name: 'pickled daikon', quantity: 50, unit: 'g', scalable: true },
        { name: 'cucumber', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'cilantro', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'pate', quantity: 30, unit: 'g', scalable: true },
        { name: 'mayonnaise', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'chili', quantity: 1, unit: 'piece', scalable: false }
      ],
      vegan: [
        { name: 'baguette', quantity: 1, unit: 'piece', scalable: true },
        { name: 'marinated tofu', quantity: 150, unit: 'g', scalable: true },
        { name: 'pickled carrots', quantity: 50, unit: 'g', scalable: true },
        { name: 'pickled daikon', quantity: 50, unit: 'g', scalable: true },
        { name: 'cucumber', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'cilantro', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'mushroom pate', quantity: 30, unit: 'g', scalable: true },
        { name: 'vegan mayonnaise', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'chili', quantity: 1, unit: 'piece', scalable: false }
      ],
      glutenFree: [
        { name: 'gluten-free roll', quantity: 1, unit: 'piece', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'pickled carrots', quantity: 50, unit: 'g', scalable: true },
        { name: 'pickled daikon', quantity: 50, unit: 'g', scalable: true },
        { name: 'cucumber', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'cilantro', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'gluten-free pate', quantity: 30, unit: 'g', scalable: true },
        { name: 'mayonnaise', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'tamari sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'chili', quantity: 1, unit: 'piece', scalable: false }
      ],
      lowCarb: [
        { name: 'lettuce leaves', quantity: 4, unit: 'large', scalable: true },
        { name: 'pork belly', quantity: 200, unit: 'g', scalable: true },
        { name: 'pickled carrots', quantity: 30, unit: 'g', scalable: true },
        { name: 'pickled daikon', quantity: 30, unit: 'g', scalable: true },
        { name: 'cucumber', quantity: 1, unit: 'medium', scalable: true },
        { name: 'cilantro', quantity: 0.5, unit: 'cup', scalable: true },
        { name: 'pate', quantity: 45, unit: 'g', scalable: true },
        { name: 'mayonnaise', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'chili', quantity: 1, unit: 'piece', scalable: false }
      ]
    },
    instructions: [
      'Toast baguette until crispy',
      'Grill or pan-fry meat',
      'Spread pate and mayo',
      'Layer meat and vegetables',
      'Add pickled vegetables',
      'Top with cilantro',
      'Add chili if desired',
      'Serve immediately'
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
      calories: 450,
      protein: 25,
      carbohydrates: 48,
      fat: 22,
      fiber: 4
    }
  },
  {
    id: 'italian-pasta-carbonara',
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
      dairyFree: [
        { name: 'spaghetti', quantity: 100, unit: 'g', scalable: true },
        { name: 'pancetta', quantity: 50, unit: 'g', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'large', scalable: true },
        { name: 'nutritional yeast', quantity: 2, unit: 'tbsp', scalable: true },
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
    id: 'indian-butter-chicken',
    name: 'Butter Chicken',
    category: 'main',
    cuisine: 'indian',
    baseServings: 1,
    prepTime: 25,
    cookTime: 30,
    calories: 480,
    ingredients: {
      default: [
        { name: 'chicken thighs', quantity: 200, unit: 'g', scalable: true },
        { name: 'butter', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'heavy cream', quantity: 100, unit: 'ml', scalable: true },
        { name: 'tomato puree', quantity: 200, unit: 'ml', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'basmati rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      vegan: [
        { name: 'cauliflower', quantity: 200, unit: 'g', scalable: true },
        { name: 'vegan butter', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'coconut cream', quantity: 100, unit: 'ml', scalable: true },
        { name: 'tomato puree', quantity: 200, unit: 'ml', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'basmati rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      glutenFree: [
        { name: 'chicken thighs', quantity: 200, unit: 'g', scalable: true },
        { name: 'butter', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'heavy cream', quantity: 100, unit: 'ml', scalable: true },
        { name: 'tomato puree', quantity: 200, unit: 'ml', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'basmati rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      dairyFree: [
        { name: 'chicken thighs', quantity: 200, unit: 'g', scalable: true },
        { name: 'coconut oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'coconut cream', quantity: 100, unit: 'ml', scalable: true },
        { name: 'tomato puree', quantity: 200, unit: 'ml', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'basmati rice', quantity: 0.5, unit: 'cup', scalable: true }
      ],
      lowCarb: [
        { name: 'chicken thighs', quantity: 250, unit: 'g', scalable: true },
        { name: 'butter', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'heavy cream', quantity: 150, unit: 'ml', scalable: true },
        { name: 'tomato puree', quantity: 150, unit: 'ml', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'ginger', quantity: 1, unit: 'thumb', scalable: false },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'garam masala', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'cauliflower rice', quantity: 1, unit: 'cup', scalable: true }
      ]
    },
    instructions: [
      'Marinate chicken in spices',
      'Sauté onion, ginger, and garlic',
      'Add tomato puree and simmer',
      'Add chicken and cook through',
      'Stir in butter and cream',
      'Simmer until sauce thickens',
      'Cook rice or alternative',
      'Serve with naan or alternative'
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
      calories: 480,
      protein: 35,
      carbohydrates: 30,
      fat: 28,
      fiber: 4
    }
  },
  {
    id: 'mexican-fish-tacos',
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
      glutenFree: [
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
      dairyFree: [
        { name: 'white fish fillets', quantity: 150, unit: 'g', scalable: true },
        { name: 'corn tortillas', quantity: 3, unit: 'piece', scalable: true },
        { name: 'lime', quantity: 1, unit: 'medium', scalable: false },
        { name: 'red cabbage', quantity: 1, unit: 'cup', scalable: true },
        { name: 'avocado', quantity: 1, unit: 'medium', scalable: true },
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
    }
  },
  {
    id: 'turkish-kebab',
    name: 'Adana Kebab',
    category: 'main',
    cuisine: 'turkish',
    baseServings: 1,
    prepTime: 25,
    cookTime: 15,
    calories: 450,
    ingredients: {
      default: [
        { name: 'ground lamb', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'sumac', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'pita bread', quantity: 1, unit: 'piece', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'yogurt sauce', quantity: 2, unit: 'tbsp', scalable: true }
      ],
      vegan: [
        { name: 'seitan', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'sumac', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'pita bread', quantity: 1, unit: 'piece', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'vegan yogurt sauce', quantity: 2, unit: 'tbsp', scalable: true }
      ],
      glutenFree: [
        { name: 'ground lamb', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'sumac', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'gluten-free pita', quantity: 1, unit: 'piece', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'yogurt sauce', quantity: 2, unit: 'tbsp', scalable: true }
      ],
      dairyFree: [
        { name: 'ground lamb', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'sumac', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'pita bread', quantity: 1, unit: 'piece', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'tahini sauce', quantity: 2, unit: 'tbsp', scalable: true }
      ],
      lowCarb: [
        { name: 'ground lamb', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'sumac', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'lettuce leaves', quantity: 3, unit: 'large', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'yogurt sauce', quantity: 3, unit: 'tbsp', scalable: true }
      ]
    },
    instructions: [
      'Mix ground meat with spices',
      'Form into long kebabs',
      'Grill until cooked through',
      'Warm pita or prepare lettuce',
      'Slice tomatoes',
      'Assemble kebab in bread',
      'Top with sauce',
      'Garnish with parsley'
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
      calories: 450,
      protein: 35,
      carbohydrates: 25,
      fat: 25,
      fiber: 3
    }
  },
  {
    id: 'miso-ramen',
    name: 'Miso Ramen',
    category: 'main',
    cuisine: 'japanese',
    baseServings: 1,
    prepTime: 20,
    cookTime: 25,
    calories: 480,
    ingredients: {
      default: [
        { name: 'ramen noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 100, unit: 'g', scalable: true },
        { name: 'miso paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'chicken stock', quantity: 500, unit: 'ml', scalable: true },
        { name: 'soft boiled egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: false },
        { name: 'corn', quantity: 50, unit: 'g', scalable: true },
        { name: 'nori', quantity: 1, unit: 'sheet', scalable: true },
        { name: 'bamboo shoots', quantity: 30, unit: 'g', scalable: true }
      ],
      vegan: [
        { name: 'ramen noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 100, unit: 'g', scalable: true },
        { name: 'miso paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'vegetable stock', quantity: 500, unit: 'ml', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: false },
        { name: 'corn', quantity: 50, unit: 'g', scalable: true },
        { name: 'nori', quantity: 1, unit: 'sheet', scalable: true },
        { name: 'bamboo shoots', quantity: 30, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 50, unit: 'g', scalable: true }
      ],
      glutenFree: [
        { name: 'rice noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 100, unit: 'g', scalable: true },
        { name: 'miso paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'chicken stock', quantity: 500, unit: 'ml', scalable: true },
        { name: 'soft boiled egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: false },
        { name: 'corn', quantity: 50, unit: 'g', scalable: true },
        { name: 'nori', quantity: 1, unit: 'sheet', scalable: true },
        { name: 'bamboo shoots', quantity: 30, unit: 'g', scalable: true }
      ],
      lowCarb: [
        { name: 'shirataki noodles', quantity: 200, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'miso paste', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'chicken stock', quantity: 500, unit: 'ml', scalable: true },
        { name: 'soft boiled egg', quantity: 2, unit: 'piece', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: false },
        { name: 'nori', quantity: 1, unit: 'sheet', scalable: true },
        { name: 'bamboo shoots', quantity: 30, unit: 'g', scalable: true }
      ]
    },
    instructions: [
      'Boil noodles according to package instructions',
      'Prepare soft-boiled eggs',
      'Heat stock and whisk in miso paste',
      'Cook sliced pork belly until crispy',
      'Chop green onions',
      'Assemble bowl with noodles and hot broth',
      'Top with pork, egg, vegetables, and garnishes',
      'Serve immediately while hot'
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
      calories: 480,
      protein: 28,
      carbohydrates: 65,
      fat: 18,
      fiber: 6
    }
  },
  {
    id: 'chicken-katsu',
    name: 'Chicken Katsu',
    category: 'main',
    cuisine: 'japanese',
    baseServings: 1,
    prepTime: 15,
    cookTime: 20,
    calories: 520,
    ingredients: {
      default: [
        { name: 'chicken breast', quantity: 200, unit: 'g', scalable: true },
        { name: 'panko breadcrumbs', quantity: 100, unit: 'g', scalable: true },
        { name: 'flour', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'large', scalable: true },
        { name: 'vegetable oil', quantity: 100, unit: 'ml', scalable: false },
        { name: 'tonkatsu sauce', quantity: 30, unit: 'ml', scalable: true },
        { name: 'cabbage', quantity: 100, unit: 'g', scalable: true },
        { name: 'steamed rice', quantity: 150, unit: 'g', scalable: true }
      ],
      vegan: [
        { name: 'seitan', quantity: 200, unit: 'g', scalable: true },
        { name: 'panko breadcrumbs', quantity: 100, unit: 'g', scalable: true },
        { name: 'flour', quantity: 50, unit: 'g', scalable: true },
        { name: 'plant-based egg substitute', quantity: 60, unit: 'ml', scalable: true },
        { name: 'vegetable oil', quantity: 100, unit: 'ml', scalable: false },
        { name: 'vegan tonkatsu sauce', quantity: 30, unit: 'ml', scalable: true },
        { name: 'cabbage', quantity: 100, unit: 'g', scalable: true },
        { name: 'steamed rice', quantity: 150, unit: 'g', scalable: true }
      ],
      glutenFree: [
        { name: 'chicken breast', quantity: 200, unit: 'g', scalable: true },
        { name: 'gluten-free breadcrumbs', quantity: 100, unit: 'g', scalable: true },
        { name: 'cornstarch', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'large', scalable: true },
        { name: 'vegetable oil', quantity: 100, unit: 'ml', scalable: false },
        { name: 'gluten-free soy sauce', quantity: 30, unit: 'ml', scalable: true },
        { name: 'cabbage', quantity: 100, unit: 'g', scalable: true },
        { name: 'steamed rice', quantity: 150, unit: 'g', scalable: true }
      ],
      lowCarb: [
        { name: 'chicken breast', quantity: 250, unit: 'g', scalable: true },
        { name: 'pork rinds', quantity: 100, unit: 'g', scalable: true },
        { name: 'almond flour', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'large', scalable: true },
        { name: 'vegetable oil', quantity: 100, unit: 'ml', scalable: false },
        { name: 'sugar-free tonkatsu sauce', quantity: 30, unit: 'ml', scalable: true },
        { name: 'cabbage', quantity: 150, unit: 'g', scalable: true },
        { name: 'cauliflower rice', quantity: 150, unit: 'g', scalable: true }
      ]
    },
    instructions: [
      'Butterfly and pound chicken breast',
      'Season chicken with salt and pepper',
      'Dredge in flour, egg, and breadcrumbs',
      'Heat oil in a large pan',
      'Fry until golden brown on both sides',
      'Drain on paper towels',
      'Slice and serve with shredded cabbage',
      'Serve with rice and tonkatsu sauce'
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
      calories: 520,
      protein: 35,
      carbohydrates: 55,
      fat: 22,
      fiber: 4
    }
  },
  {
    id: 'moussaka',
    name: 'Moussaka',
    category: 'main',
    cuisine: 'greek',
    baseServings: 1,
    prepTime: 45,
    cookTime: 60,
    calories: 550,
    ingredients: {
      default: [
        { name: 'ground lamb', quantity: 200, unit: 'g', scalable: true },
        { name: 'eggplant', quantity: 1, unit: 'medium', scalable: true },
        { name: 'potato', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'tomato sauce', quantity: 200, unit: 'ml', scalable: true },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'flour', quantity: 30, unit: 'g', scalable: true },
        { name: 'milk', quantity: 250, unit: 'ml', scalable: true },
        { name: 'parmesan cheese', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'large', scalable: true },
        { name: 'nutmeg', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false }
      ],
      vegan: [
        { name: 'lentils', quantity: 200, unit: 'g', scalable: true },
        { name: 'eggplant', quantity: 1, unit: 'medium', scalable: true },
        { name: 'potato', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'tomato sauce', quantity: 200, unit: 'ml', scalable: true },
        { name: 'vegan butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'flour', quantity: 30, unit: 'g', scalable: true },
        { name: 'plant milk', quantity: 250, unit: 'ml', scalable: true },
        { name: 'nutritional yeast', quantity: 30, unit: 'g', scalable: true },
        { name: 'silken tofu', quantity: 100, unit: 'g', scalable: true },
        { name: 'nutmeg', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false }
      ],
      glutenFree: [
        { name: 'ground lamb', quantity: 200, unit: 'g', scalable: true },
        { name: 'eggplant', quantity: 1, unit: 'medium', scalable: true },
        { name: 'potato', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'tomato sauce', quantity: 200, unit: 'ml', scalable: true },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'cornstarch', quantity: 20, unit: 'g', scalable: true },
        { name: 'milk', quantity: 250, unit: 'ml', scalable: true },
        { name: 'parmesan cheese', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'large', scalable: true },
        { name: 'nutmeg', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false }
      ],
      lowCarb: [
        { name: 'ground lamb', quantity: 250, unit: 'g', scalable: true },
        { name: 'eggplant', quantity: 2, unit: 'medium', scalable: true },
        { name: 'cauliflower', quantity: 200, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'tomato sauce', quantity: 150, unit: 'ml', scalable: true },
        { name: 'butter', quantity: 40, unit: 'g', scalable: true },
        { name: 'almond flour', quantity: 20, unit: 'g', scalable: true },
        { name: 'heavy cream', quantity: 200, unit: 'ml', scalable: true },
        { name: 'parmesan cheese', quantity: 75, unit: 'g', scalable: true },
        { name: 'egg', quantity: 2, unit: 'large', scalable: true },
        { name: 'nutmeg', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false }
      ]
    },
    instructions: [
      'Slice and salt eggplant, let drain',
      'Prepare meat sauce with spices',
      'Make bechamel sauce',
      'Layer potatoes, eggplant, and meat',
      'Top with bechamel sauce',
      'Sprinkle with cheese',
      'Bake until golden brown',
      'Let rest before serving'
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
      protein: 35,
      carbohydrates: 45,
      fat: 28,
      fiber: 6
    }
  },
  {
    id: 'greek-salad',
    name: 'Greek Salad',
    category: 'side',
    cuisine: 'greek',
    baseServings: 1,
    prepTime: 15,
    cookTime: 0,
    calories: 320,
    ingredients: {
      default: [
        { name: 'cucumber', quantity: 1, unit: 'medium', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'red onion', quantity: 0.25, unit: 'medium', scalable: true },
        { name: 'green bell pepper', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'kalamata olives', quantity: 50, unit: 'g', scalable: true },
        { name: 'feta cheese', quantity: 75, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'dried oregano', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'red wine vinegar', quantity: 1, unit: 'tbsp', scalable: true }
      ],
      vegan: [
        { name: 'cucumber', quantity: 1, unit: 'medium', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'red onion', quantity: 0.25, unit: 'medium', scalable: true },
        { name: 'green bell pepper', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'kalamata olives', quantity: 50, unit: 'g', scalable: true },
        { name: 'vegan feta', quantity: 75, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'dried oregano', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'red wine vinegar', quantity: 1, unit: 'tbsp', scalable: true }
      ],
      dairyFree: [
        { name: 'cucumber', quantity: 1, unit: 'medium', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'red onion', quantity: 0.25, unit: 'medium', scalable: true },
        { name: 'green bell pepper', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'kalamata olives', quantity: 75, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'dried oregano', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'red wine vinegar', quantity: 1, unit: 'tbsp', scalable: true }
      ]
    },
    instructions: [
      'Chop cucumber, tomatoes, and onion',
      'Slice bell pepper',
      'Combine vegetables in a bowl',
      'Add olives and feta cheese',
      'Drizzle with olive oil and vinegar',
      'Sprinkle with oregano',
      'Toss gently',
      'Serve immediately'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: false,
      isLowCarb: true,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 320,
      protein: 12,
      carbohydrates: 15,
      fat: 25,
      fiber: 5
    }
  },
  {
    id: 'seafood-paella',
    name: 'Seafood Paella',
    category: 'main',
    cuisine: 'spanish',
    baseServings: 1,
    prepTime: 30,
    cookTime: 45,
    calories: 580,
    ingredients: {
      default: [
        { name: 'bomba rice', quantity: 100, unit: 'g', scalable: true },
        { name: 'shrimp', quantity: 100, unit: 'g', scalable: true },
        { name: 'mussels', quantity: 100, unit: 'g', scalable: true },
        { name: 'squid', quantity: 50, unit: 'g', scalable: true },
        { name: 'saffron threads', quantity: 0.25, unit: 'tsp', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'bell pepper', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'peas', quantity: 50, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'seafood stock', quantity: 300, unit: 'ml', scalable: true },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false }
      ],
      vegan: [
        { name: 'bomba rice', quantity: 100, unit: 'g', scalable: true },
        { name: 'artichokes', quantity: 100, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 100, unit: 'g', scalable: true },
        { name: 'hearts of palm', quantity: 50, unit: 'g', scalable: true },
        { name: 'saffron threads', quantity: 0.25, unit: 'tsp', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'bell pepper', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'peas', quantity: 50, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'vegetable stock', quantity: 300, unit: 'ml', scalable: true },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false }
      ],
      glutenFree: [
        { name: 'bomba rice', quantity: 100, unit: 'g', scalable: true },
        { name: 'shrimp', quantity: 100, unit: 'g', scalable: true },
        { name: 'mussels', quantity: 100, unit: 'g', scalable: true },
        { name: 'squid', quantity: 50, unit: 'g', scalable: true },
        { name: 'saffron threads', quantity: 0.25, unit: 'tsp', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'bell pepper', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'peas', quantity: 50, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'seafood stock', quantity: 300, unit: 'ml', scalable: true },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false }
      ],
      lowCarb: [
        { name: 'cauliflower rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'shrimp', quantity: 150, unit: 'g', scalable: true },
        { name: 'mussels', quantity: 150, unit: 'g', scalable: true },
        { name: 'squid', quantity: 75, unit: 'g', scalable: true },
        { name: 'saffron threads', quantity: 0.25, unit: 'tsp', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'bell pepper', quantity: 1, unit: 'medium', scalable: true },
        { name: 'olive oil', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'seafood stock', quantity: 200, unit: 'ml', scalable: true },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false }
      ]
    },
    instructions: [
      'Toast saffron threads',
      'Sauté onions, garlic, and peppers',
      'Add rice and toast lightly',
      'Add saffron and stock',
      'Add seafood in stages',
      'Add peas near the end',
      'Let develop socarrat',
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
      calories: 580,
      protein: 32,
      carbohydrates: 65,
      fat: 22,
      fiber: 4
    }
  },
  {
    id: 'gazpacho',
    name: 'Gazpacho',
    category: 'soup',
    cuisine: 'spanish',
    baseServings: 1,
    prepTime: 20,
    cookTime: 0,
    calories: 180,
    ingredients: {
      default: [
        { name: 'tomatoes', quantity: 3, unit: 'medium', scalable: true },
        { name: 'cucumber', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'red bell pepper', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'sherry vinegar', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'bread', quantity: 1, unit: 'slice', scalable: true },
        { name: 'salt', quantity: 0.5, unit: 'tsp', scalable: false }
      ],
      glutenFree: [
        { name: 'tomatoes', quantity: 3, unit: 'medium', scalable: true },
        { name: 'cucumber', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'red bell pepper', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'sherry vinegar', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'salt', quantity: 0.5, unit: 'tsp', scalable: false }
      ],
      lowCarb: [
        { name: 'tomatoes', quantity: 3, unit: 'medium', scalable: true },
        { name: 'cucumber', quantity: 1, unit: 'medium', scalable: true },
        { name: 'red bell pepper', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 1, unit: 'clove', scalable: false },
        { name: 'olive oil', quantity: 3, unit: 'tbsp', scalable: true },
        { name: 'sherry vinegar', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'salt', quantity: 0.5, unit: 'tsp', scalable: false }
      ]
    },
    instructions: [
      'Roughly chop vegetables',
      'Soak bread in water if using',
      'Blend all ingredients until smooth',
      'Season to taste',
      'Chill for at least 2 hours',
      'Garnish with diced vegetables',
      'Drizzle with olive oil',
      'Serve cold'
    ],
    dietaryInfo: {
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 180,
      protein: 4,
      carbohydrates: 20,
      fat: 12,
      fiber: 5
    }
  },
  {
    id: 'bibimbap',
    name: 'Bibimbap',
    category: 'main',
    cuisine: 'korean',
    baseServings: 1,
    prepTime: 30,
    cookTime: 20,
    calories: 550,
    ingredients: {
      default: [
        { name: 'steamed rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'ground beef', quantity: 100, unit: 'g', scalable: true },
        { name: 'spinach', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 50, unit: 'g', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'shiitake mushrooms', quantity: 50, unit: 'g', scalable: true },
        { name: 'zucchini', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'gochujang', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false }
      ],
      vegan: [
        { name: 'steamed rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 100, unit: 'g', scalable: true },
        { name: 'spinach', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 50, unit: 'g', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'shiitake mushrooms', quantity: 50, unit: 'g', scalable: true },
        { name: 'zucchini', quantity: 50, unit: 'g', scalable: true },
        { name: 'gochujang', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false }
      ],
      glutenFree: [
        { name: 'steamed rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'ground beef', quantity: 100, unit: 'g', scalable: true },
        { name: 'spinach', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 50, unit: 'g', scalable: true },
        { name: 'bean sprouts', quantity: 50, unit: 'g', scalable: true },
        { name: 'shiitake mushrooms', quantity: 50, unit: 'g', scalable: true },
        { name: 'zucchini', quantity: 50, unit: 'g', scalable: true },
        { name: 'egg', quantity: 1, unit: 'piece', scalable: true },
        { name: 'gluten-free gochujang', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'tamari sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false }
      ],
      lowCarb: [
        { name: 'cauliflower rice', quantity: 200, unit: 'g', scalable: true },
        { name: 'ground beef', quantity: 150, unit: 'g', scalable: true },
        { name: 'spinach', quantity: 150, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 30, unit: 'g', scalable: true },
        { name: 'bean sprouts', quantity: 75, unit: 'g', scalable: true },
        { name: 'shiitake mushrooms', quantity: 75, unit: 'g', scalable: true },
        { name: 'zucchini', quantity: 75, unit: 'g', scalable: true },
        { name: 'egg', quantity: 2, unit: 'piece', scalable: true },
        { name: 'gochujang', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false }
      ]
    },
    instructions: [
      'Cook rice until fluffy',
      'Season and cook meat',
      'Blanch and season spinach',
      'Sauté mushrooms and carrots',
      'Cook bean sprouts and zucchini',
      'Fry egg sunny side up',
      'Arrange all components over rice',
      'Serve with gochujang sauce'
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
      protein: 28,
      carbohydrates: 65,
      fat: 25,
      fiber: 6
    }
  },
  {
    id: 'kimchi-jjigae',
    name: 'Kimchi Jjigae',
    category: 'soup',
    cuisine: 'korean',
    baseServings: 1,
    prepTime: 15,
    cookTime: 30,
    calories: 380,
    ingredients: {
      default: [
        { name: 'kimchi', quantity: 200, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 100, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'gochugaru', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tsp', scalable: true }
      ],
      vegan: [
        { name: 'vegan kimchi', quantity: 200, unit: 'g', scalable: true },
        { name: 'mushrooms', quantity: 100, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 150, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'gochugaru', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tsp', scalable: true }
      ],
      glutenFree: [
        { name: 'kimchi', quantity: 200, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 100, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'green onions', quantity: 2, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'gochugaru', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'tamari sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 1, unit: 'tsp', scalable: true }
      ],
      lowCarb: [
        { name: 'kimchi', quantity: 300, unit: 'g', scalable: true },
        { name: 'pork belly', quantity: 150, unit: 'g', scalable: true },
        { name: 'tofu', quantity: 150, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'green onions', quantity: 3, unit: 'stalks', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'gochugaru', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'soy sauce', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'sesame oil', quantity: 2, unit: 'tsp', scalable: true }
      ]
    },
    instructions: [
      'Sauté pork belly until crispy',
      'Add kimchi and cook until soft',
      'Add garlic and onions',
      'Pour in water or stock',
      'Add gochugaru and seasonings',
      'Simmer for 15 minutes',
      'Add tofu and cook gently',
      'Garnish with green onions'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: true,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 380,
      protein: 25,
      carbohydrates: 15,
      fat: 28,
      fiber: 5
    }
  },
  {
    id: 'adana-kebab',
    name: 'Adana Kebab',
    category: 'main',
    cuisine: 'turkish',
    baseServings: 1,
    prepTime: 30,
    cookTime: 15,
    calories: 520,
    ingredients: {
      default: [
        { name: 'ground lamb', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'sumac', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'pide bread', quantity: 1, unit: 'piece', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.25, unit: 'medium', scalable: true }
      ],
      vegan: [
        { name: 'seitan', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'sumac', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'pide bread', quantity: 1, unit: 'piece', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.25, unit: 'medium', scalable: true }
      ],
      glutenFree: [
        { name: 'ground lamb', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'sumac', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'gluten-free flatbread', quantity: 1, unit: 'piece', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.25, unit: 'medium', scalable: true }
      ],
      lowCarb: [
        { name: 'ground lamb', quantity: 300, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'parsley', quantity: 0.5, unit: 'cup', scalable: true },
        { name: 'red pepper flakes', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'sumac', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'lettuce leaves', quantity: 4, unit: 'large', scalable: true },
        { name: 'tomatoes', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.25, unit: 'medium', scalable: true }
      ]
    },
    instructions: [
      'Mix ground lamb with spices',
      'Grate onion and add to meat',
      'Knead mixture well',
      'Form onto skewers',
      'Grill until cooked',
      'Serve with bread and vegetables',
      'Garnish with sumac',
      'Add optional chili'
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
      calories: 520,
      protein: 35,
      carbohydrates: 30,
      fat: 32,
      fiber: 4
    }
  },
  {
    id: 'mercimek-corbasi',
    name: 'Mercimek Çorbası',
    category: 'soup',
    cuisine: 'turkish',
    baseServings: 1,
    prepTime: 15,
    cookTime: 30,
    calories: 280,
    ingredients: {
      default: [
        { name: 'red lentils', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'carrot', quantity: 1, unit: 'medium', scalable: true },
        { name: 'potato', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'lemon', quantity: 0.5, unit: 'piece', scalable: true }
      ],
      vegan: [
        { name: 'red lentils', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'carrot', quantity: 1, unit: 'medium', scalable: true },
        { name: 'potato', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'lemon', quantity: 0.5, unit: 'piece', scalable: true }
      ],
      glutenFree: [
        { name: 'red lentils', quantity: 100, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'carrot', quantity: 1, unit: 'medium', scalable: true },
        { name: 'potato', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'olive oil', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'lemon', quantity: 0.5, unit: 'piece', scalable: true }
      ],
      lowCarb: [
        { name: 'red lentils', quantity: 50, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'carrot', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'celery', quantity: 1, unit: 'stalk', scalable: true },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'paprika', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'olive oil', quantity: 2, unit: 'tbsp', scalable: true },
        { name: 'lemon', quantity: 0.5, unit: 'piece', scalable: true }
      ]
    },
    instructions: [
      'Sauté onions until soft',
      'Add carrots and potato',
      'Add tomato paste and spices',
      'Add lentils and water',
      'Simmer until tender',
      'Blend until smooth',
      'Season to taste',
      'Serve with lemon'
    ],
    dietaryInfo: {
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 280,
      protein: 15,
      carbohydrates: 45,
      fat: 8,
      fiber: 8
    }
  },
  {
    id: 'moroccan-tagine',
    name: 'Moroccan Lamb Tagine',
    category: 'main',
    cuisine: 'moroccan',
    baseServings: 1,
    prepTime: 30,
    cookTime: 120,
    calories: 450,
    ingredients: {
      default: [
        { name: 'lamb shoulder', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'chickpeas', quantity: 100, unit: 'g', scalable: true },
        { name: 'dried apricots', quantity: 50, unit: 'g', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'saffron', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'couscous', quantity: 100, unit: 'g', scalable: true }
      ],
      vegan: [
        { name: 'butternut squash', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'chickpeas', quantity: 150, unit: 'g', scalable: true },
        { name: 'dried apricots', quantity: 50, unit: 'g', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'saffron', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'couscous', quantity: 100, unit: 'g', scalable: true }
      ],
      glutenFree: [
        { name: 'lamb shoulder', quantity: 250, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'carrots', quantity: 2, unit: 'medium', scalable: true },
        { name: 'chickpeas', quantity: 100, unit: 'g', scalable: true },
        { name: 'dried apricots', quantity: 50, unit: 'g', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'saffron', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'quinoa', quantity: 100, unit: 'g', scalable: true }
      ],
      lowCarb: [
        { name: 'lamb shoulder', quantity: 300, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'cauliflower', quantity: 200, unit: 'g', scalable: true },
        { name: 'dried apricots', quantity: 25, unit: 'g', scalable: true },
        { name: 'garlic', quantity: 3, unit: 'cloves', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'tbsp', scalable: false },
        { name: 'cumin', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'coriander', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'saffron', quantity: 0.25, unit: 'tsp', scalable: false }
      ]
    },
    instructions: [
      'Brown lamb in batches',
      'Sauté onions and spices',
      'Add garlic and ginger',
      'Return meat to pot',
      'Add vegetables and fruit',
      'Simmer until tender',
      'Cook couscous separately',
      'Garnish with herbs'
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
      calories: 450,
      protein: 35,
      carbohydrates: 45,
      fat: 18,
      fiber: 8
    }
  },
  {
    id: 'harira',
    name: 'Harira Soup',
    category: 'soup',
    cuisine: 'moroccan',
    baseServings: 1,
    prepTime: 20,
    cookTime: 45,
    calories: 320,
    ingredients: {
      default: [
        { name: 'lentils', quantity: 50, unit: 'g', scalable: true },
        { name: 'chickpeas', quantity: 50, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'celery', quantity: 1, unit: 'stalk', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'vermicelli', quantity: 25, unit: 'g', scalable: true },
        { name: 'cilantro', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'lemon', quantity: 0.5, unit: 'piece', scalable: true }
      ],
      vegan: [
        { name: 'lentils', quantity: 75, unit: 'g', scalable: true },
        { name: 'chickpeas', quantity: 75, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'celery', quantity: 1, unit: 'stalk', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'vermicelli', quantity: 25, unit: 'g', scalable: true },
        { name: 'cilantro', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'lemon', quantity: 0.5, unit: 'piece', scalable: true }
      ],
      glutenFree: [
        { name: 'lentils', quantity: 50, unit: 'g', scalable: true },
        { name: 'chickpeas', quantity: 50, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'celery', quantity: 1, unit: 'stalk', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'rice noodles', quantity: 25, unit: 'g', scalable: true },
        { name: 'cilantro', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'parsley', quantity: 0.25, unit: 'cup', scalable: true },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'lemon', quantity: 0.5, unit: 'piece', scalable: true }
      ],
      lowCarb: [
        { name: 'lentils', quantity: 25, unit: 'g', scalable: true },
        { name: 'chickpeas', quantity: 25, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'celery', quantity: 2, unit: 'stalk', scalable: true },
        { name: 'tomatoes', quantity: 2, unit: 'medium', scalable: true },
        { name: 'zucchini', quantity: 1, unit: 'small', scalable: true },
        { name: 'cilantro', quantity: 0.5, unit: 'cup', scalable: true },
        { name: 'parsley', quantity: 0.5, unit: 'cup', scalable: true },
        { name: 'turmeric', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'ginger', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'cinnamon', quantity: 0.25, unit: 'tsp', scalable: false },
        { name: 'lemon', quantity: 0.5, unit: 'piece', scalable: true }
      ]
    },
    instructions: [
      'Soak chickpeas overnight',
      'Sauté onions and celery',
      'Add spices and tomatoes',
      'Add lentils and chickpeas',
      'Simmer until tender',
      'Add vermicelli',
      'Stir in fresh herbs',
      'Serve with lemon'
    ],
    dietaryInfo: {
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 320,
      protein: 18,
      carbohydrates: 52,
      fat: 6,
      fiber: 12
    }
  },
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
  },
  {
    id: 'zurek',
    name: 'Żurek (Sour Rye Soup)',
    category: 'soup',
    cuisine: 'polish',
    baseServings: 1,
    prepTime: 20,
    cookTime: 40,
    calories: 290,
    ingredients: {
      default: [
        { name: 'rye sourdough starter', quantity: 100, unit: 'ml', scalable: true },
        { name: 'white sausage', quantity: 100, unit: 'g', scalable: true },
        { name: 'potatoes', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'dried mushrooms', quantity: 10, unit: 'g', scalable: true },
        { name: 'sour cream', quantity: 50, unit: 'ml', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'piece', scalable: true },
        { name: 'marjoram', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 2, unit: 'piece', scalable: false }
      ],
      vegan: [
        { name: 'rye sourdough starter', quantity: 100, unit: 'ml', scalable: true },
        { name: 'smoked tofu', quantity: 100, unit: 'g', scalable: true },
        { name: 'potatoes', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'dried mushrooms', quantity: 15, unit: 'g', scalable: true },
        { name: 'coconut cream', quantity: 50, unit: 'ml', scalable: true },
        { name: 'marjoram', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 2, unit: 'piece', scalable: false }
      ],
      glutenFree: [
        { name: 'gluten-free sourdough starter', quantity: 100, unit: 'ml', scalable: true },
        { name: 'gluten-free sausage', quantity: 100, unit: 'g', scalable: true },
        { name: 'potatoes', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'dried mushrooms', quantity: 10, unit: 'g', scalable: true },
        { name: 'sour cream', quantity: 50, unit: 'ml', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'piece', scalable: true },
        { name: 'marjoram', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 2, unit: 'piece', scalable: false }
      ],
      dairyFree: [
        { name: 'rye sourdough starter', quantity: 100, unit: 'ml', scalable: true },
        { name: 'white sausage', quantity: 100, unit: 'g', scalable: true },
        { name: 'potatoes', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 1, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'dried mushrooms', quantity: 10, unit: 'g', scalable: true },
        { name: 'coconut cream', quantity: 50, unit: 'ml', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'piece', scalable: true },
        { name: 'marjoram', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 2, unit: 'piece', scalable: false }
      ],
      lowCarb: [
        { name: 'rye sourdough starter', quantity: 50, unit: 'ml', scalable: true },
        { name: 'white sausage', quantity: 150, unit: 'g', scalable: true },
        { name: 'cauliflower', quantity: 100, unit: 'g', scalable: true },
        { name: 'carrots', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'garlic', quantity: 2, unit: 'cloves', scalable: false },
        { name: 'dried mushrooms', quantity: 10, unit: 'g', scalable: true },
        { name: 'sour cream', quantity: 75, unit: 'ml', scalable: true },
        { name: 'eggs', quantity: 2, unit: 'piece', scalable: true },
        { name: 'marjoram', quantity: 0.5, unit: 'tsp', scalable: false },
        { name: 'bay leaf', quantity: 1, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 2, unit: 'piece', scalable: false }
      ]
    },
    instructions: [
      'Prepare sourdough starter',
      'Cook sausage and vegetables',
      'Add sourdough to broth',
      'Hard boil eggs separately',
      'Season with marjoram',
      'Add sour cream',
      'Serve with halved eggs',
      'Garnish with fresh herbs'
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
      calories: 290,
      protein: 16,
      carbohydrates: 28,
      fat: 14,
      fiber: 4
    }
  },
  {
    id: 'bigos',
    name: 'Bigos (Hunter\'s Stew)',
    category: 'main',
    cuisine: 'polish',
    baseServings: 1,
    prepTime: 45,
    cookTime: 180,
    calories: 450,
    ingredients: {
      default: [
        { name: 'sauerkraut', quantity: 200, unit: 'g', scalable: true },
        { name: 'fresh cabbage', quantity: 100, unit: 'g', scalable: true },
        { name: 'pork shoulder', quantity: 100, unit: 'g', scalable: true },
        { name: 'kielbasa', quantity: 75, unit: 'g', scalable: true },
        { name: 'bacon', quantity: 30, unit: 'g', scalable: true },
        { name: 'dried mushrooms', quantity: 10, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'bay leaves', quantity: 2, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 3, unit: 'piece', scalable: false },
        { name: 'juniper berries', quantity: 2, unit: 'piece', scalable: false },
        { name: 'prunes', quantity: 20, unit: 'g', scalable: true },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true }
      ],
      vegan: [
        { name: 'sauerkraut', quantity: 200, unit: 'g', scalable: true },
        { name: 'fresh cabbage', quantity: 100, unit: 'g', scalable: true },
        { name: 'seitan', quantity: 150, unit: 'g', scalable: true },
        { name: 'smoked tofu', quantity: 100, unit: 'g', scalable: true },
        { name: 'dried mushrooms', quantity: 20, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'bay leaves', quantity: 2, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 3, unit: 'piece', scalable: false },
        { name: 'juniper berries', quantity: 2, unit: 'piece', scalable: false },
        { name: 'prunes', quantity: 20, unit: 'g', scalable: true },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'liquid smoke', quantity: 0.25, unit: 'tsp', scalable: false }
      ],
      glutenFree: [
        { name: 'sauerkraut', quantity: 200, unit: 'g', scalable: true },
        { name: 'fresh cabbage', quantity: 100, unit: 'g', scalable: true },
        { name: 'pork shoulder', quantity: 100, unit: 'g', scalable: true },
        { name: 'gluten-free sausage', quantity: 75, unit: 'g', scalable: true },
        { name: 'bacon', quantity: 30, unit: 'g', scalable: true },
        { name: 'dried mushrooms', quantity: 10, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'bay leaves', quantity: 2, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 3, unit: 'piece', scalable: false },
        { name: 'juniper berries', quantity: 2, unit: 'piece', scalable: false },
        { name: 'prunes', quantity: 20, unit: 'g', scalable: true },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true }
      ],
      dairyFree: [
        { name: 'sauerkraut', quantity: 200, unit: 'g', scalable: true },
        { name: 'fresh cabbage', quantity: 100, unit: 'g', scalable: true },
        { name: 'pork shoulder', quantity: 100, unit: 'g', scalable: true },
        { name: 'kielbasa', quantity: 75, unit: 'g', scalable: true },
        { name: 'bacon', quantity: 30, unit: 'g', scalable: true },
        { name: 'dried mushrooms', quantity: 10, unit: 'g', scalable: true },
        { name: 'onion', quantity: 1, unit: 'medium', scalable: true },
        { name: 'bay leaves', quantity: 2, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 3, unit: 'piece', scalable: false },
        { name: 'juniper berries', quantity: 2, unit: 'piece', scalable: false },
        { name: 'prunes', quantity: 20, unit: 'g', scalable: true },
        { name: 'tomato paste', quantity: 1, unit: 'tbsp', scalable: true }
      ],
      lowCarb: [
        { name: 'sauerkraut', quantity: 300, unit: 'g', scalable: true },
        { name: 'pork shoulder', quantity: 150, unit: 'g', scalable: true },
        { name: 'kielbasa', quantity: 100, unit: 'g', scalable: true },
        { name: 'bacon', quantity: 50, unit: 'g', scalable: true },
        { name: 'dried mushrooms', quantity: 15, unit: 'g', scalable: true },
        { name: 'onion', quantity: 0.5, unit: 'medium', scalable: true },
        { name: 'bay leaves', quantity: 2, unit: 'piece', scalable: false },
        { name: 'allspice berries', quantity: 3, unit: 'piece', scalable: false },
        { name: 'juniper berries', quantity: 2, unit: 'piece', scalable: false },
        { name: 'tomato paste', quantity: 0.5, unit: 'tbsp', scalable: true }
      ]
    },
    instructions: [
      'Rinse and chop sauerkraut',
      'Cut fresh cabbage and meats',
      'Brown meats in batches',
      'Sauté onions',
      'Combine all ingredients',
      'Simmer for 2-3 hours',
      'Season to taste',
      'Let rest overnight (optional)'
    ],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: false,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: true,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 450,
      protein: 28,
      carbohydrates: 18,
      fat: 32,
      fiber: 8
    }
  },
  {
    id: 'kotlet-schabowy',
    name: 'Kotlet Schabowy',
    category: 'main',
    cuisine: 'polish',
    baseServings: 1,
    prepTime: 20,
    cookTime: 15,
    calories: 520,
    ingredients: {
      default: [
        { name: 'pork loin', quantity: 200, unit: 'g', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'piece', scalable: true },
        { name: 'breadcrumbs', quantity: 50, unit: 'g', scalable: true },
        { name: 'flour', quantity: 30, unit: 'g', scalable: true },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ],
      vegan: [
        { name: 'seitan', quantity: 200, unit: 'g', scalable: true },
        { name: 'plant-based milk', quantity: 50, unit: 'ml', scalable: true },
        { name: 'breadcrumbs', quantity: 50, unit: 'g', scalable: true },
        { name: 'flour', quantity: 30, unit: 'g', scalable: true },
        { name: 'vegan butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'nutritional yeast', quantity: 1, unit: 'tbsp', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ],
      glutenFree: [
        { name: 'pork loin', quantity: 200, unit: 'g', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'piece', scalable: true },
        { name: 'gluten-free breadcrumbs', quantity: 50, unit: 'g', scalable: true },
        { name: 'cornstarch', quantity: 30, unit: 'g', scalable: true },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ],
      dairyFree: [
        { name: 'pork loin', quantity: 200, unit: 'g', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'piece', scalable: true },
        { name: 'breadcrumbs', quantity: 50, unit: 'g', scalable: true },
        { name: 'flour', quantity: 30, unit: 'g', scalable: true },
        { name: 'olive oil', quantity: 30, unit: 'ml', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ],
      lowCarb: [
        { name: 'pork loin', quantity: 250, unit: 'g', scalable: true },
        { name: 'eggs', quantity: 1, unit: 'piece', scalable: true },
        { name: 'pork rinds', quantity: 50, unit: 'g', scalable: true },
        { name: 'almond flour', quantity: 30, unit: 'g', scalable: true },
        { name: 'butter', quantity: 30, unit: 'g', scalable: true },
        { name: 'salt', quantity: 1, unit: 'tsp', scalable: false },
        { name: 'black pepper', quantity: 0.25, unit: 'tsp', scalable: false }
      ]
    },
    instructions: [
      'Pound pork to even thickness',
      'Season with salt and pepper',
      'Dredge in flour',
      'Dip in beaten egg',
      'Coat in breadcrumbs',
      'Fry in butter until golden',
      'Drain on paper towels',
      'Serve with lemon wedge'
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
      protein: 35,
      carbohydrates: 30,
      fat: 28,
      fiber: 2
    }
  }
];
