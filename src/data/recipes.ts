
import { Recipe, Ingredient } from '@/types/recipe';

// Utility function to convert old format to new format
const convertToIngredientFormat = (ingredients: {amount: string, unit: string, name: string}[]): Ingredient[] => {
  return ingredients.map(ing => ({
    name: ing.name,
    quantity: parseFloat(ing.amount) || 1,
    unit: ing.unit,
    scalable: true // Setting default to true
  }));
};

export const recipes: Recipe[] = [
  // Italian Cuisine
  {
    id: "italian-pasta-marinara",
    name: "Pasta Marinara",
    cuisine: "italian",
    category: "main",
    baseServings: 1,
    prepTime: 5,
    cookTime: 15,
    calories: 400,
    ingredients: {
      default: [
        { name: "spaghetti", quantity: 85, unit: "g", scalable: true },
        { name: "marinara sauce", quantity: 0.5, unit: "cup", scalable: true },
        { name: "garlic, minced", quantity: 1, unit: "clove", scalable: false },
        { name: "olive oil", quantity: 1, unit: "tbsp", scalable: true },
        { name: "fresh basil, chopped", quantity: 1, unit: "tbsp", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "Bring a pot of salted water to boil and cook pasta according to package instructions.",
      "In a pan, heat olive oil over medium heat. Add minced garlic and sauté for 30 seconds.",
      "Add marinara sauce and simmer for 5 minutes.",
      "Drain pasta and add to the sauce. Toss to combine.",
      "Season with salt and pepper, and garnish with fresh basil."
    ],
    image: "",
    dietaryRestrictions: ["vegetarian"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 400,
      protein: 10,
      carbs: 60,
      fat: 12
    }
  },
  {
    id: "italian-risotto-mushroom",
    name: "Mushroom Risotto",
    cuisine: "italian",
    category: "main",
    baseServings: 1,
    prepTime: 10,
    cookTime: 25,
    calories: 450,
    ingredients: {
      default: [
        { name: "arborio rice", quantity: 0.25, unit: "cup", scalable: true },
        { name: "mushrooms, sliced", quantity: 1, unit: "cup", scalable: true },
        { name: "onion, diced", quantity: 0.5, unit: "clove", scalable: false },
        { name: "garlic, minced", quantity: 1, unit: "clove", scalable: false },
        { name: "vegetable broth", quantity: 1, unit: "cup", scalable: true },
        { name: "white wine", quantity: 0.25, unit: "cup", scalable: true },
        { name: "butter", quantity: 0.25, unit: "cup", scalable: true },
        { name: "parmesan cheese, grated", quantity: 0.25, unit: "cup", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "In a pan, heat half the butter over medium heat. Add mushrooms and cook until golden. Set aside.",
      "In the same pan, add remaining butter, onion, and garlic. Sauté until translucent.",
      "Add rice and toast for 1-2 minutes. Add wine and stir until absorbed.",
      "Gradually add warm broth, 1/4 cup at a time, stirring constantly until absorbed before adding more.",
      "When rice is creamy and al dente (about 20 minutes), stir in mushrooms and parmesan.",
      "Season with salt and pepper and serve immediately."
    ],
    image: "",
    dietaryRestrictions: ["vegetarian"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 450,
      protein: 15,
      carbs: 70,
      fat: 18
    }
  },
  {
    id: "italian-caprese-salad",
    name: "Caprese Salad",
    cuisine: "italian",
    category: "side",
    baseServings: 1,
    prepTime: 5,
    cookTime: 0,
    calories: 200,
    ingredients: {
      default: [
        { name: "tomato, sliced", quantity: 1, unit: "medium", scalable: true },
        { name: "fresh mozzarella, sliced", quantity: 0.6, unit: "g", scalable: true },
        { name: "fresh basil", quantity: 5, unit: "leaves", scalable: true },
        { name: "olive oil", quantity: 0.1, unit: "tbsp", scalable: true },
        { name: "balsamic glaze", quantity: 0.1, unit: "tsp", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "Arrange tomato and mozzarella slices alternately on a plate.",
      "Tuck basil leaves between the slices.",
      "Drizzle with olive oil and balsamic glaze.",
      "Season with salt and pepper. Serve immediately."
    ],
    image: "",
    dietaryRestrictions: ["vegetarian", "gluten-free", "low-carb"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
      isLowCarb: true,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 200,
      protein: 5,
      carbs: 10,
      fat: 5
    }
  },
  {
    id: "italian-eggplant-parmesan",
    name: "Eggplant Parmesan",
    cuisine: "italian",
    category: "main",
    baseServings: 1,
    prepTime: 15,
    cookTime: 25,
    calories: 500,
    ingredients: {
      default: [
        { name: "eggplant, sliced", quantity: 0.5, unit: "small", scalable: true },
        { name: "flour", quantity: 0.25, unit: "cup", scalable: true },
        { name: "egg, beaten", quantity: 1, unit: "", scalable: false },
        { name: "breadcrumbs", quantity: 0.25, unit: "cup", scalable: true },
        { name: "marinara sauce", quantity: 0.25, unit: "cup", scalable: true },
        { name: "mozzarella cheese, shredded", quantity: 0.25, unit: "cup", scalable: true },
        { name: "parmesan cheese, grated", quantity: 0.25, unit: "cup", scalable: true },
        { name: "olive oil", quantity: 0.1, unit: "tbsp", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "Preheat oven to 375°F (190°C).",
      "Season eggplant slices with salt and let sit for 10 minutes. Pat dry.",
      "Dredge eggplant in flour, dip in beaten egg, and coat with breadcrumbs.",
      "Heat olive oil in a pan and fry eggplant until golden on both sides.",
      "In a baking dish, layer marinara sauce, eggplant, and cheeses.",
      "Bake for 15 minutes until cheese is bubbly and golden."
    ],
    image: "",
    dietaryRestrictions: ["vegetarian"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 500,
      protein: 15,
      carbs: 60,
      fat: 20
    }
  },
  {
    id: "italian-tomato-bruschetta",
    name: "Tomato Bruschetta",
    cuisine: "italian",
    category: "side",
    baseServings: 1,
    prepTime: 10,
    cookTime: 5,
    calories: 250,
    ingredients: {
      default: [
        { name: "baguette or Italian bread", quantity: 2, unit: "slices", scalable: true },
        { name: "tomato, diced", quantity: 1, unit: "", scalable: true },
        { name: "garlic", quantity: 1, unit: "clove", scalable: false },
        { name: "fresh basil, chopped", quantity: 5, unit: "leaves", scalable: true },
        { name: "olive oil", quantity: 0.1, unit: "tbsp", scalable: true },
        { name: "balsamic vinegar", quantity: 0.1, unit: "tsp", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "Toast bread slices until golden.",
      "Rub each slice with the cut side of a garlic clove.",
      "In a bowl, combine diced tomatoes, chopped basil, olive oil, and balsamic vinegar.",
      "Season with salt and pepper.",
      "Spoon the tomato mixture onto the toasted bread. Serve immediately."
    ],
    image: "",
    dietaryRestrictions: ["vegetarian"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 250,
      protein: 5,
      carbs: 10,
      fat: 5
    }
  },
  
  // French Cuisine
  {
    id: "french-ratatouille",
    name: "Ratatouille",
    cuisine: "french",
    category: "main",
    baseServings: 1,
    prepTime: 15,
    cookTime: 35,
    calories: 550,
    ingredients: {
      default: [
        { name: "eggplant, diced", quantity: 0.25, unit: "", scalable: true },
        { name: "zucchini, diced", quantity: 0.25, unit: "", scalable: true },
        { name: "yellow squash, diced", quantity: 0.25, unit: "", scalable: true },
        { name: "bell pepper, diced", quantity: 0.25, unit: "", scalable: true },
        { name: "onion, diced", quantity: 0.5, unit: "clove", scalable: false },
        { name: "garlic, minced", quantity: 1, unit: "clove", scalable: false },
        { name: "crushed tomatoes", quantity: 0.5, unit: "cup", scalable: true },
        { name: "olive oil", quantity: 0.25, unit: "tbsp", scalable: true },
        { name: "herbs de Provence", quantity: 0.25, unit: "tsp", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "Heat olive oil in a pan over medium heat. Add onions and sauté until translucent.",
      "Add garlic and cook for 30 seconds.",
      "Add eggplant and cook for 5 minutes until slightly softened.",
      "Add zucchini, yellow squash, and bell pepper. Cook for 5 more minutes.",
      "Stir in crushed tomatoes and herbs de Provence.",
      "Simmer covered for 20 minutes until vegetables are tender.",
      "Season with salt and pepper. Serve warm or at room temperature."
    ],
    image: "",
    dietaryRestrictions: ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "low-carb"],
    dietaryInfo: {
      isVegan: true,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
      isLowCarb: true,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 550,
      protein: 15,
      carbs: 70,
      fat: 20
    }
  },
  {
    id: "french-nicoise-salad",
    name: "Salade Niçoise",
    cuisine: "french",
    category: "side",
    baseServings: 1,
    prepTime: 15,
    cookTime: 10,
    calories: 300,
    ingredients: {
      default: [
        { name: "mixed greens", quantity: 1, unit: "cup", scalable: true },
        { name: "canned tuna, drained", quantity: 0.85, unit: "g", scalable: true },
        { name: "hard-boiled egg, halved", quantity: 1, unit: "", scalable: false },
        { name: "green beans, blanched", quantity: 5, unit: "leaves", scalable: true },
        { name: "new potatoes, boiled and halved", quantity: 4, unit: "slices", scalable: true },
        { name: "black olives", quantity: 5, unit: "leaves", scalable: true },
        { name: "small red onion, thinly sliced", quantity: 0.5, unit: "clove", scalable: false },
        { name: "olive oil", quantity: 0.1, unit: "tbsp", scalable: true },
        { name: "Dijon mustard", quantity: 0.25, unit: "tsp", scalable: true },
        { name: "red wine vinegar", quantity: 0.1, unit: "tsp", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "Whisk together olive oil, Dijon mustard, red wine vinegar, salt, and pepper to make dressing.",
      "Arrange mixed greens on a plate.",
      "Top with tuna, egg halves, green beans, potatoes, olives, and red onion.",
      "Drizzle with dressing and serve immediately."
    ],
    image: "",
    dietaryRestrictions: ["gluten-free", "dairy-free", "nut-free", "low-carb"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
      isLowCarb: true,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 300,
      protein: 10,
      carbs: 20,
      fat: 10
    }
  },
  {
    id: "french-coq-au-vin",
    name: "Coq Au Vin",
    cuisine: "french",
    category: "main",
    baseServings: 1,
    prepTime: 15,
    cookTime: 40,
    calories: 600,
    ingredients: {
      default: [
        { name: "chicken thigh", quantity: 1, unit: "", scalable: true },
        { name: "bacon, chopped", quantity: 0.25, unit: "cup", scalable: true },
        { name: "button mushrooms, quartered", quantity: 4, unit: "slices", scalable: true },
        { name: "onion, diced", quantity: 0.5, unit: "clove", scalable: false },
        { name: "garlic, minced", quantity: 1, unit: "clove", scalable: false },
        { name: "red wine", quantity: 0.25, unit: "cup", scalable: true },
        { name: "chicken broth", quantity: 0.25, unit: "cup", scalable: true },
        { name: "thyme", quantity: 1, unit: "sprig", scalable: true },
        { name: "bay leaf", quantity: 1, unit: "leaf", scalable: true },
        { name: "flour", quantity: 0.25, unit: "cup", scalable: true },
        { name: "butter", quantity: 0.25, unit: "cup", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "Season chicken with salt and pepper.",
      "In a pan, cook bacon until crispy. Remove and set aside.",
      "Brown chicken in bacon fat. Remove and set aside.",
      "Add onions and mushrooms to the pan and cook until softened.",
      "Add garlic and cook for 30 seconds.",
      "Sprinkle flour over vegetables and stir for 1 minute.",
      "Add wine and broth, scraping up browned bits from the bottom of the pan.",
      "Return chicken and bacon to the pan. Add thyme and bay leaf.",
      "Cover and simmer for 30 minutes until chicken is cooked through.",
      "Remove bay leaf and thyme. Stir in butter and serve."
    ],
    image: "",
    dietaryRestrictions: ["dairy-free", "nut-free"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 600,
      protein: 20,
      carbs: 20,
      fat: 30
    }
  },
  {
    id: "french-onion-soup",
    name: "French Onion Soup",
    cuisine: "french",
    category: "side",
    baseServings: 1,
    prepTime: 10,
    cookTime: 35,
    calories: 350,
    ingredients: {
      default: [
        { name: "onion, thinly sliced", quantity: 1, unit: "large", scalable: true },
        { name: "beef broth", quantity: 1, unit: "cup", scalable: true },
        { name: "butter", quantity: 0.25, unit: "cup", scalable: true },
        { name: "flour", quantity: 0.25, unit: "cup", scalable: true },
        { name: "dry white wine", quantity: 0.25, unit: "tbsp", scalable: true },
        { name: "baguette", quantity: 1, unit: "slice", scalable: true },
        { name: "gruyere cheese, grated", quantity: 0.25, unit: "cup", scalable: true },
        { name: "thyme", quantity: 1, unit: "sprig", scalable: true },
        { name: "bay leaf", quantity: 1, unit: "leaf", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "In a pot, melt butter over medium-low heat. Add onions and cook slowly until caramelized, about 20 minutes.",
      "Sprinkle flour over onions and stir for 1 minute.",
      "Add wine and stir, scraping up any browned bits.",
      "Add broth, thyme, and bay leaf. Simmer for 15 minutes.",
      "Meanwhile, toast baguette slice.",
      "Remove bay leaf and thyme. Pour soup into an oven-safe bowl.",
      "Top with toasted baguette and sprinkle with cheese.",
      "Broil until cheese is melted and bubbly, about 2-3 minutes."
    ],
    image: "",
    dietaryRestrictions: [],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 350,
      protein: 10,
      carbs: 10,
      fat: 20
    }
  },
  {
    id: "french-quiche-lorraine",
    name: "Quiche Lorraine",
    cuisine: "french",
    category: "main",
    baseServings: 1,
    prepTime: 15,
    cookTime: 30,
    calories: 400,
    ingredients: {
      default: [
        { name: "pie crust", quantity: 1, unit: "small", scalable: true },
        { name: "bacon, chopped", quantity: 0.25, unit: "cup", scalable: true },
        { name: "onion, diced", quantity: 0.5, unit: "clove", scalable: false },
        { name: "egg", quantity: 1, unit: "", scalable: false },
        { name: "heavy cream", quantity: 0.25, unit: "cup", scalable: true },
        { name: "gruyere cheese, grated", quantity: 0.25, unit: "cup", scalable: true },
        { name: "nutmeg", quantity: 0.1, unit: "pinch", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false }
      ]
    },
    instructions: [
      "Preheat oven to 375°F (190°C).",
      "Press pie crust into a small tart pan.",
      "Cook bacon until crispy. Add onions and cook until softened.",
      "In a bowl, whisk together egg, cream, salt, pepper, and nutmeg.",
      "Spread bacon and onions over the crust. Sprinkle with cheese.",
      "Pour egg mixture over the top.",
      "Bake for 25-30 minutes until set and golden. Let cool slightly before serving."
    ],
    image: "",
    dietaryRestrictions: ["nut-free"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 400,
      protein: 10,
      carbs: 10,
      fat: 20
    }
  },
  
  // Japanese Cuisine
  {
    id: "japanese-miso-soup",
    name: "Miso Soup",
    cuisine: "japanese",
    category: "side",
    baseServings: 1,
    prepTime: 5,
    cookTime: 10,
    calories: 200,
    ingredients: {
      default: [
        { name: "dashi stock (or vegetable broth)", quantity: 1, unit: "cup", scalable: true },
        { name: "miso paste", quantity: 1, unit: "tbsp", scalable: true },
        { name: "silken tofu, cubed", quantity: 0.25, unit: "block", scalable: true },
        { name: "green onion, chopped", quantity: 1, unit: "tbsp", scalable: true },
        { name: "wakame seaweed, rehydrated", quantity: 1, unit: "tbsp", scalable: true }
      ]
    },
    instructions: [
      "Heat dashi stock in a small pot until hot but not boiling.",
      "In a small bowl, whisk a little hot broth with miso paste to dissolve.",
      "Add miso mixture back to the pot and stir gently.",
      "Add tofu and wakame. Simmer for 1-2 minutes (do not boil).",
      "Garnish with green onions and serve hot."
    ],
    image: "",
    dietaryRestrictions: ["vegetarian", "gluten-free", "dairy-free", "nut-free", "low-carb"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
      isLowCarb: true,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 200,
      protein: 5,
      carbs: 10,
      fat: 5
    }
  },
  {
    id: "japanese-teriyaki-salmon",
    name: "Teriyaki Salmon",
    cuisine: "japanese",
    category: "main",
    baseServings: 1,
    prepTime: 10,
    cookTime: 15,
    calories: 400,
    ingredients: {
      default: [
        { name: "salmon fillet (115g)", quantity: 1, unit: "", scalable: true },
        { name: "soy sauce (or tamari for gluten-free)", quantity: 1, unit: "tbsp", scalable: true },
        { name: "mirin", quantity: 1, unit: "tbsp", scalable: true },
        { name: "honey", quantity: 1, unit: "tsp", scalable: true },
        { name: "ginger, grated", quantity: 0.5, unit: "tsp", scalable: true },
        { name: "garlic, minced", quantity: 1, unit: "clove", scalable: false },
        { name: "sesame oil", quantity: 1, unit: "tbsp", scalable: true },
        { name: "sesame seeds", quantity: 1, unit: "tbsp", scalable: true },
        { name: "green onion, chopped", quantity: 1, unit: "tbsp", scalable: true }
      ]
    },
    instructions: [
      "In a small bowl, mix soy sauce, mirin, honey, ginger, and garlic.",
      "Place salmon in a shallow dish and pour half the marinade over it. Let marinate for 5-10 minutes.",
      "Heat sesame oil in a pan over medium-high heat.",
      "Remove salmon from marinade and cook in the pan for about 3-4 minutes per side.",
      "Add remaining marinade to the pan and simmer until sauce thickens and salmon is glazed.",
      "Garnish with sesame seeds and green onions. Serve with rice."
    ],
    image: "",
    dietaryRestrictions: ["gluten-free", "dairy-free", "nut-free"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 400,
      protein: 20,
      carbs: 10,
      fat: 20
    }
  },
  {
    id: "japanese-tempura-vegetables",
    name: "Vegetable Tempura",
    cuisine: "japanese",
    category: "side",
    baseServings: 1,
    prepTime: 15,
    cookTime: 10,
    calories: 300,
    ingredients: {
      default: [
        { name: "sweet potato, sliced", quantity: 0.5, unit: "", scalable: true },
        { name: "shiitake mushrooms", quantity: 2, unit: "slices", scalable: true },
        { name: "asparagus spears", quantity: 2, unit: "slices", scalable: true },
        { name: "all-purpose flour", quantity: 0.25, unit: "cup", scalable: true },
        { name: "cold sparkling water", quantity: 0.25, unit: "cup", scalable: true },
        { name: "salt", quantity: 0.1, unit: "pinch", scalable: true },
        { name: "vegetable oil for frying", quantity: 0.5, unit: "cup", scalable: true },
        { name: "tempura dipping sauce", quantity: 2, unit: "tbsp", scalable: true }
      ]
    },
    instructions: [
      "Prepare vegetables by cutting into bite-sized pieces.",
      "In a bowl, lightly mix flour, cold sparkling water, and salt. The batter should be lumpy.",
      "Heat oil in a deep pan to 350°F (175°C).",
      "Dip vegetables in batter and fry until light golden and crisp, about 1-2 minutes per batch.",
      "Drain on paper towels and serve immediately with dipping sauce."
    ],
    image: "",
    dietaryRestrictions: ["vegetarian", "dairy-free", "nut-free"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 300,
      protein: 10,
      carbs: 10,
      fat: 10
    }
  },
  {
    id: "japanese-chicken-katsu",
    name: "Chicken Katsu",
    cuisine: "japanese",
    category: "main",
    baseServings: 1,
    prepTime: 10,
    cookTime: 15,
    calories: 500,
    ingredients: {
      default: [
        { name: "boneless chicken breast", quantity: 1, unit: "", scalable: true },
        { name: "all-purpose flour", quantity: 0.25, unit: "cup", scalable: true },
        { name: "egg, beaten", quantity: 1, unit: "", scalable: false },
        { name: "panko breadcrumbs", quantity: 0.25, unit: "cup", scalable: true },
        { name: "salt and pepper to taste", quantity: 1, unit: "", scalable: false },
        { name: "vegetable oil for frying", quantity: 0.5, unit: "cup", scalable: true },
        { name: "tonkatsu sauce", quantity: 2, unit: "tbsp", scalable: true },
        { name: "cabbage, shredded", quantity: 0.5, unit: "cup", scalable: true }
      ]
    },
    instructions: [
      "Place chicken breast between plastic wrap and pound until even thickness.",
      "Season with salt and pepper.",
      "Coat chicken in flour, dip in beaten egg, and then coat with panko breadcrumbs.",
      "Heat oil in a pan to 350°F (175°C).",
      "Fry chicken until golden brown and cooked through, about 4-5 minutes per side.",
      "Let rest on paper towels, then slice into strips.",
      "Serve with shredded cabbage and tonkatsu sauce."
    ],
    image: "",
    dietaryRestrictions: ["dairy-free", "nut-free"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 500,
      protein: 20,
      carbs: 10,
      fat: 20
    }
  },
  {
    id: "japanese-onigiri",
    name: "Onigiri (Rice Balls)",
    cuisine: "japanese",
    category: "side",
    baseServings: 1,
    prepTime: 15,
    cookTime: 0,
    calories: 100,
    ingredients: {
      default: [
        { name: "cooked short-grain rice", quantity: 1, unit: "cup", scalable: true },
        { name: "salt", quantity: 0.1, unit: "tsp", scalable: true },
        { name: "furikake seasoning", quantity: 0.1, unit: "tsp", scalable: true },
        { name: "nori seaweed, cut into strips", quantity: 1, unit: "sheet", scalable: true },
        { name: "pickled plum or cooked salmon (optional filling)", quantity: 0.1, unit: "tbsp", scalable: true }
      ]
    },
    instructions: [
      "Wet your hands with water and sprinkle with a little salt.",
      "Take a handful of warm rice (about 1/3 cup) and press into a ball.",
      "Make an indentation in the center and add filling if desired.",
      "Close the rice around the filling and shape into a triangle or ball.",
      "Wrap the bottom with a strip of nori.",
      "Sprinkle with furikake seasoning if desired."
    ],
    image: "",
    dietaryRestrictions: ["vegetarian", "dairy-free", "nut-free"],
    dietaryInfo: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: false,
      isDairyFree: true,
      isLowCarb: false,
      isNutFree: true
    },
    nutritionalInfo: {
      calories: 100,
      protein: 3,
      carbs: 20,
      fat: 1
    }
  }
];
