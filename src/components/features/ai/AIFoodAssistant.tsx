import React, { useState, useRef, useEffect } from 'react';
import { 
  Search,
  Utensils,
  Calendar,
  Check,
  File,
  ArrowUp,
  X,
  Camera, 
  Upload, 
  ScanBarcode, 
  Send, 
  RotateCcw, 
  ShoppingCart, 
  Receipt, 
  Clock, 
  CheckSquare
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Recipe } from '@/types/recipe';
import RecipeSearch from './RecipeSearch';

type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

interface DietaryRestriction {
  id: string;
  label: string;
  checked: boolean;
};

type FoodContext = {
  conversationState: 'initial' | 'recipe_search' | 'dish_selection' | 'serving_size' | 'dietary_restrictions' | 'ingredient_list' | 'decision_point' | 'recipe_generation' | 'schedule_event' | 'closing';
  dishName?: string;
  selectedRecipe?: Recipe;
  servingSize?: number;
  dietaryRestrictions: string[];
  dateTime?: Date;
  eventNotes?: string;
  ingredientsAdded: boolean;
  recipeSaved: boolean;
  eventScheduled: boolean;
};

const STORAGE_KEY = 'ai-food-assistant-session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const DIETARY_OPTIONS: DietaryRestriction[] = [
  { id: 'vegan', label: 'Vegan', checked: false },
  { id: 'vegetarian', label: 'Vegetarian', checked: false },
  { id: 'nut-free', label: 'Nut-Free', checked: false },
  { id: 'lactose-free', label: 'Lactose-Free', checked: false },
  { id: 'low-carb', label: 'Low-Carb', checked: false },
  { id: 'gluten-free', label: 'Gluten-Free', checked: false },
];

interface ButtonOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  action: () => void;
}

interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  options?: ButtonOption[];
  buttons?: ButtonOption[];
}

interface AIFoodAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FoodContext {
  conversationState: 'initial' | 'name_search' | 'dietary_restrictions' | 'serving_size' | 'schedule_event';
  selectedRecipe?: Recipe;
  dietaryRestrictions: string[];
  ingredientsAdded: boolean;
  recipeSaved: boolean;
  eventScheduled: boolean;
}

const AIFoodAssistant = ({ isOpen, onClose }: AIFoodAssistantProps) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [eventNotes, setEventNotes] = useState('');
  const [dietaryOptions, setDietaryOptions] = useState<DietaryRestriction[]>(DIETARY_OPTIONS);
  const [foodContext, setFoodContext] = useState<FoodContext>({
    conversationState: 'initial',
    dietaryRestrictions: [],
    ingredientsAdded: false,
    recipeSaved: false,
    eventScheduled: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Safely scroll to bottom only if the ref is available
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRecipeSelection = (recipe: Recipe) => {
    const recipeName = recipe.name;
    
    addUserMessage(`I want to make ${recipeName}`);
    
    setFoodContext(prev => ({
      ...prev,
      dishName: recipeName,
      selectedRecipe: recipe,
      conversationState: 'serving_size'
    }));
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      const servingButtons: ButtonOption[] = [
        { 
          id: '1', 
          label: '1', 
          variant: 'outline', 
          action: () => handleServingSizeSelection(1) 
        },
        { 
          id: '2', 
          label: '2', 
          variant: 'outline', 
          action: () => handleServingSizeSelection(2) 
        },
        { 
          id: '4', 
          label: '4', 
          variant: 'outline', 
          action: () => handleServingSizeSelection(4) 
        },
        { 
          id: '6', 
          label: '6', 
          variant: 'outline', 
          action: () => handleServingSizeSelection(6) 
        }
      ];
      
      addAssistantMessage("How many servings?", undefined, servingButtons);
    }, 500);
  };

  const handleDishNameInput = () => {
    setFoodContext(prev => ({ 
      ...prev, 
      conversationState: 'dietary_restrictions'
    }));
    suggestRecipes();
  };

  const handleServingSizeSelection = (servings: number) => {
    setFoodContext(prev => ({ 
      ...prev, 
      conversationState: 'schedule_event'
    }));
    
    const recipe = foodContext.selectedRecipe;
    if (!recipe) return;

    const scalingFactor = servings / recipe.baseServings;
    const scaledIngredients = recipe.ingredients.default.map(ing => ({
      ...ing,
      quantity: ing.scalable ? ing.quantity * scalingFactor : ing.quantity
    }));

    const ingredientsList = scaledIngredients
      .map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`)
      .join('\n');

    addAssistantMessage(
      `Here's your recipe for ${recipe.name} (${servings} servings):\n\nIngredients:\n${ingredientsList}\n\nInstructions:\n${recipe.instructions.join('\n')}`,
      undefined,
      undefined,
      [
        { 
          id: 'save',
          label: 'Save Recipe',
          icon: <File size={16} />,
          action: () => saveRecipe()
        },
        {
          id: 'schedule',
          label: 'Schedule Cooking',
          icon: <Calendar size={16} />,
          action: () => scheduleRecipe()
        }
      ]
    );
  };

  const suggestRecipes = () => {
    const { dietaryRestrictions } = foodContext;
    const suggestions = RecipeService.getSuggestedRecipes({
      dietary: dietaryRestrictions as Array<keyof Recipe['dietaryInfo']>,
      maxPrepTime: 60,
      maxCalories: 800
    });

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: suggestions.length > 0
        ? 'Here are some recipes that match your preferences:'
        : 'I couldn\'t find any recipes matching your exact preferences. Here are some alternatives:',
      timestamp: new Date(),
      options: suggestions.slice(0, 5).map(recipe => ({
        id: recipe.id.toString(),
        label: recipe.name,
        action: () => selectRecipe(recipe)
      }))
    };

    setMessages(prev => [...prev, message]);
  };

  const selectRecipe = (recipe: Recipe) => {
    setFoodContext(prev => ({ 
      ...prev, 
      selectedRecipe: recipe,
      conversationState: 'serving_size'
    }));

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Great choice! ${recipe.name} serves ${recipe.baseServings} people by default. How many servings would you like?`,
      timestamp: new Date(),
      options: [
        { id: '2', label: '2 servings', action: () => adjustServings(2) },
        { id: '4', label: '4 servings', action: () => adjustServings(4) },
        { id: '6', label: '6 servings', action: () => adjustServings(6) },
        { id: '8', label: '8 servings', action: () => adjustServings(8) },
      ]
    };

    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `I'd like to make ${recipe.name}.`,
      timestamp: new Date()
    }, message]);
  };

  const adjustServings = (servings: number) => {
    setFoodContext(prev => ({ 
      ...prev, 
      conversationState: 'schedule_event'
    }));

    const recipe = foodContext.selectedRecipe;
    if (!recipe) return;

    const scalingFactor = servings / recipe.baseServings;
    const scaledIngredients = recipe.ingredients.default.map(ing => ({
      ...ing,
      quantity: ing.scalable ? ing.quantity * scalingFactor : ing.quantity
    }));

    const ingredientsList = scaledIngredients
      .map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`)
      .join('\n');

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Here's your recipe for ${recipe.name} (${servings} servings):\n\nIngredients:\n${ingredientsList}\n\nInstructions:\n${recipe.instructions.join('\n')}`,
      timestamp: new Date(),
      buttons: [
        { 
          id: 'save',
          label: 'Save Recipe',
          icon: <File size={16} />,
          action: () => saveRecipe()
        },
        {
          id: 'schedule',
          label: 'Schedule Cooking',
          icon: <Calendar size={16} />,
          action: () => scheduleRecipe()
        }
      ]
    };

    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `I want ${servings} servings.`,
      timestamp: new Date()
    }, message]);
  };

  const saveRecipe = () => {
    const recipe = foodContext.selectedRecipe;
    if (!recipe) return;

    setFoodContext(prev => ({ 
      ...prev, 
      recipeSaved: true 
    }));

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `I've saved ${recipe.name} to your recipe collection. Would you like to schedule when you'll cook it?`,
      timestamp: new Date(),
      buttons: [
        {
          id: 'schedule',
          label: 'Schedule Cooking',
          icon: <Calendar size={16} />,
          action: () => scheduleRecipe()
        }
      ]
    };

    setMessages(prev => [...prev, message]);
  };

  const scheduleRecipe = () => {
    setFoodContext(prev => ({ 
      ...prev, 
      conversationState: 'schedule_event' 
    }));

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'When would you like to cook this recipe?',
      timestamp: new Date(),
      buttons: [
        {
          id: 'today',
          label: 'Today',
          icon: <Calendar size={16} />,
          action: () => handleDateSelection(new Date())
        },
        {
          id: 'tomorrow',
          label: 'Tomorrow',
          icon: <Calendar size={16} />,
          action: () => handleDateSelection(new Date(Date.now() + 24 * 60 * 60 * 1000))
        },
        {
          id: 'custom',
          label: 'Choose Date',
          icon: <Calendar size={16} />,
          action: () => setShowDatePicker(true)
        }
      ]
    };

    setMessages(prev => [...prev, message]);
  };

  const handleDateSelection = (date: Date) => {
    setSelectedDate(date);
    setFoodContext(prev => ({ 
      ...prev, 
      conversationState: 'schedule_event',
      eventScheduled: true
    }));

    const formattedDate = format(date, 'EEEE, MMMM d');
    const recipe = foodContext.selectedRecipe;
    if (!recipe) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Great! I've scheduled ${recipe.name} for ${formattedDate}. Would you like to add any notes about this cooking session?`,
      timestamp: new Date(),
      buttons: [
        {
          id: 'add-notes',
          label: 'Add Notes',
          icon: <File size={16} />,
          action: () => setShowNotesInput(true)
        },
        {
          id: 'finish',
          label: 'Finish',
          icon: <Check size={16} />,
          action: () => finishScheduling()
        }
      ]
    };

    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `I'll cook it on ${formattedDate}.`,
      timestamp: new Date()
    }, message]);
  };

  const finishScheduling = () => {
    const recipe = foodContext.selectedRecipe;
    if (!recipe) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Perfect! Is there anything else you would like help with?',
      timestamp: new Date(),
      buttons: [
        {
          id: 'new-recipe',
          label: 'Find Another Recipe',
          icon: <Search size={16} />,
          action: () => handleRecipePreferences()
        },
        {
          id: 'close',
          label: 'Close',
          icon: <X size={16} />,
          action: () => onClose()
        }
      ]
    };

    setMessages(prev => [...prev, message]);
    setFoodContext(prev => ({ ...prev, conversationState: 'initial' }));
  };

  const handleNameSearch = () => {
    setFoodContext({
      ...foodContext,
      conversationState: 'name_search'
    });
    addAssistantMessage('What recipe would you like to search for?');
  };

  const handleRecipePreferences = () => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: "Let's find the perfect recipe for you! What type of cuisine would you prefer?",
      timestamp: new Date(),
      options: [
        { id: 'italian', label: 'Italian', action: () => selectCuisine('italian') },
        { id: 'chinese', label: 'Chinese', action: () => selectCuisine('chinese') },
        { id: 'indian', label: 'Indian', action: () => selectCuisine('indian') },
        { id: 'mexican', label: 'Mexican', action: () => selectCuisine('mexican') },
        { id: 'japanese', label: 'Japanese', action: () => selectCuisine('japanese') },
      ]
    };
    setMessages(prev => [...prev, message]);
    setFoodContext(prev => ({ ...prev, conversationState: 'dietary_restrictions' }));
  };

  const selectCuisine = (cuisine: string) => {
    setFoodContext(prev => ({ ...prev, conversationState: 'dietary_restrictions' }));
    
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Great choice! Do you have any dietary restrictions?',
      timestamp: new Date(),
      options: DIETARY_OPTIONS.map(option => ({
        id: option.id,
        label: option.label,
        action: () => toggleDietaryRestriction(option.id)
      }))
    };
    
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `I prefer ${cuisine} cuisine.`,
      timestamp: new Date()
    }, message]);
  };

  const toggleDietaryRestriction = (restrictionId: string) => {
    setDietaryOptions(prev => 
      prev.map(option => 
        option.id === restrictionId 
          ? { ...option, checked: !option.checked }
          : option
      )
    );
    
    setFoodContext(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restrictionId)
        ? prev.dietaryRestrictions.filter(id => id !== restrictionId)
        : [...prev.dietaryRestrictions, restrictionId]
    }));
  };
  
  const showIngredientsList = () => {
    const { selectedRecipe, dishName, servingSize, dietaryRestrictions } = foodContext;
    
    let ingredientsList = "";
    
    if (selectedRecipe) {
      // Scale ingredients by serving size ratio
      const servingSizeRatio = (servingSize || 1) / (selectedRecipe.servings || 1);
      
      ingredientsList = `Ingredients for ${selectedRecipe.name} (${servingSize} servings):\n\n`;
      selectedRecipe.ingredients.forEach(ingredient => {
        // Scale numeric amounts by the serving size ratio
        let scaledAmount = ingredient.amount;
        if (!isNaN(Number(ingredient.amount))) {
          const numericAmount = Number(ingredient.amount);
          scaledAmount = (numericAmount * servingSizeRatio).toString();
          // Round to 2 decimal places if it's not a whole number
          if (scaledAmount.includes('.') && scaledAmount.split('.')[1].length > 2) {
            scaledAmount = Number(scaledAmount).toFixed(2).replace(/\.00$/, '');
          }
        }
        ingredientsList += `- ${scaledAmount} ${ingredient.unit} ${ingredient.name}\n`;
      });
    } else if (dishName?.toLowerCase() === 'lasagna') {
      const quantity = servingSize || 2;
      ingredientsList = `Ingredients for ${dishName} (${quantity} servings):\n\n`;
      
      if (dietaryRestrictions.includes('Vegan')) {
        ingredientsList += `- ${200 * quantity}g plant-based mince\n`;
        ingredientsList += `- ${100 * quantity}g vegan cheese\n`;
        ingredientsList += `- ${1 * quantity} large onion, diced\n`;
        ingredientsList += `- ${2 * quantity} cloves garlic, minced\n`;
        ingredientsList += `- ${1 * quantity} carrot, grated\n`;
        ingredientsList += `- ${400 * quantity}g chopped tomatoes\n`;
        ingredientsList += `- ${6 * quantity} vegan lasagna sheets\n`;
        ingredientsList += `- ${2 * quantity} tbsp olive oil\n`;
        ingredientsList += `- Salt and pepper to taste\n`;
        ingredientsList += `- ${1 * quantity} tsp dried oregano\n`;
      } else if (dietaryRestrictions.includes('Vegetarian')) {
        ingredientsList += `- ${2 * quantity} bell peppers, diced\n`;
        ingredientsList += `- ${100 * quantity}g mushrooms, sliced\n`;
        ingredientsList += `- ${1 * quantity} large onion, diced\n`;
        ingredientsList += `- ${2 * quantity} cloves garlic, minced\n`;
        ingredientsList += `- ${1 * quantity} carrot, grated\n`;
        ingredientsList += `- ${400 * quantity}g chopped tomatoes\n`;
        ingredientsList += `- ${100 * quantity}g cheese\n`;
        ingredientsList += `- ${6 * quantity} lasagna sheets\n`;
        ingredientsList += `- ${2 * quantity} tbsp olive oil\n`;
        ingredientsList += `- Salt and pepper to taste\n`;
        ingredientsList += `- ${1 * quantity} tsp dried oregano\n`;
      } else {
        ingredientsList += `- ${250 * quantity}g minced beef\n`;
        ingredientsList += `- ${1 * quantity} large onion, diced\n`;
        ingredientsList += `- ${2 * quantity} cloves garlic, minced\n`;
        ingredientsList += `- ${1 * quantity} carrot, grated\n`;
        ingredientsList += `- ${400 * quantity}g chopped tomatoes\n`;
        ingredientsList += `- ${100 * quantity}g cheese\n`;
        ingredientsList += `- ${6 * quantity} lasagna sheets\n`;
        ingredientsList += `- ${2 * quantity} tbsp olive oil\n`;
        ingredientsList += `- Salt and pepper to taste\n`;
        ingredientsList += `- ${1 * quantity} tsp dried oregano\n`;
      }
      
      if (dietaryRestrictions.includes('Lactose-Free') && !dietaryRestrictions.includes('Vegan')) {
        ingredientsList = ingredientsList.replace('cheese', 'lactose-free cheese');
      }
      
      if (dietaryRestrictions.includes('Low-Carb')) {
        ingredientsList = ingredientsList.replace('lasagna sheets', 'sliced zucchini (as pasta replacement)');
      }

      if (dietaryRestrictions.includes('Gluten-Free')) {
        ingredientsList = ingredientsList.replace('lasagna sheets', 'gluten-free lasagna sheets');
      }
    } else {
      ingredientsList = `Ingredients for ${dishName || "your dish"} (${servingSize || 2} servings):\n\n`;
      ingredientsList += `- Main ingredient\n`;
      ingredientsList += `- Secondary ingredient\n`;
      ingredientsList += `- Herbs and spices\n`;
    }
    
    const ingredientButtons: ButtonOption[] = [
      { 
        id: 'add-to-shopping', 
        label: 'Add to Shopping List', 
        icon: <ShoppingCart className="w-4 h-4 mr-1" />,
        action: () => handleAddToShoppingList() 
      },
      { 
        id: 'adjust-servings', 
        label: 'Adjust Servings', 
        icon: <Clock className="w-4 h-4 mr-1" />,
        action: () => {
          setFoodContext(prev => ({
            ...prev,
            conversationState: 'serving_size'
          }));
          const servingButtons: ButtonOption[] = [
            { id: '1', label: '1', variant: 'outline', action: () => handleServingSizeSelection(1) },
            { id: '2', label: '2', variant: 'outline', action: () => handleServingSizeSelection(2) },
            { id: '3', label: '3', variant: 'outline', action: () => handleServingSizeSelection(3) },
            { id: '4', label: '4', variant: 'outline', action: () => handleServingSizeSelection(4) },
            { id: 'custom', label: 'Custom', variant: 'outline', action: () => {
              addAssistantMessage("How many servings do you need?");
            }},
          ];
          addAssistantMessage("How many servings would you like instead?", undefined, servingButtons);
        } 
      },
    ];
    
    addAssistantMessage(ingredientsList, undefined, ingredientButtons);
  };
  
  const handleAddToShoppingList = () => {
    addUserMessage("Add ingredients to my shopping list");
    
    setFoodContext(prev => ({
      ...prev,
      ingredientsAdded: true,
      conversationState: 'decision_point'
    }));
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      addAssistantMessage("Added to your shopping list! You can customize ingredients in the Shopping List tab.");
      
      showDecisionPoint();
    }, 800);
  };
  
  const showDecisionPoint = () => {
    const decisionButtons: ButtonOption[] = [
      { 
        id: 'get-recipe', 
        label: 'Get Recipe', 
        icon: <Receipt className="w-4 h-4 mr-1" />,
        action: () => handleGetRecipe() 
      },
      { 
        id: 'schedule-event', 
        label: 'Schedule Event', 
        icon: <Calendar className="w-4 h-4 mr-1" />,
        action: () => handleScheduleEvent() 
      },
      { 
        id: 'finish', 
        label: 'Finish', 
        action: () => handleFinish() 
      },
    ];
    
    addAssistantMessage("What would you like to do next?", undefined, decisionButtons);
  };
  
  const handleGetRecipe = () => {
    addUserMessage("Get the recipe");
    
    setFoodContext(prev => ({
      ...prev,
      conversationState: 'recipe_generation'
    }));
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      const { selectedRecipe, dishName, servingSize, dietaryRestrictions } = foodContext;
      
      let recipe = "";
      
      if (selectedRecipe) {
        recipe = `# ${selectedRecipe.name} Recipe (${servingSize} servings)\n\n`;
        recipe += `## Ingredients\n`;
        
        // Scale ingredients by serving size ratio
        const servingSizeRatio = (servingSize || 1) / (selectedRecipe.servings || 1);
        
        selectedRecipe.ingredients.forEach(ingredient => {
          // Scale numeric amounts by the serving size ratio
          let scaledAmount = ingredient.amount;
          if (!isNaN(Number(ingredient.amount))) {
            const numericAmount = Number(ingredient.amount);
            scaledAmount = (numericAmount * servingSizeRatio).toString();
            // Round to 2 decimal places if it's not a whole number
            if (scaledAmount.includes('.') && scaledAmount.split('.')[1].length > 2) {
              scaledAmount = Number(scaledAmount).toFixed(2).replace(/\.00$/, '');
            }
          }
          recipe += `- ${scaledAmount} ${ingredient.unit} ${ingredient.name}\n`;
        });
        
        recipe += `\n## Instructions\n`;
        selectedRecipe.instructions.forEach((step, index) => {
          recipe += `${index + 1}. ${step}\n`;
        });
        
        // Add dietary information
        if (selectedRecipe.dietaryRestrictions.length > 0) {
          recipe += `\n**Dietary Information:** ${selectedRecipe.dietaryRestrictions.join(', ')}\n`;
        }
        
        // Add cooking time information
        recipe += `\n**Prep Time:** ${selectedRecipe.prepTime} minutes\n`;
        recipe += `**Cook Time:** ${selectedRecipe.cookTime} minutes\n`;
        recipe += `**Total Time:** ${selectedRecipe.prepTime + selectedRecipe.cookTime} minutes\n`;
      } else if (dishName?.toLowerCase() === 'lasagna') {
        recipe = `# ${dishName} Recipe (${servingSize} servings)\n\n`;
        
        if (dietaryRestrictions.includes('Vegan')) {
          recipe += `## Ingredients\n`;
          recipe += `- ${200 * (servingSize || 2)}g plant-based mince\n`;
          recipe += `- ${100 * (servingSize || 2)}g vegan cheese\n`;
          recipe += `- ${1 * (servingSize || 2)} large onion, diced\n`;
          recipe += `- ${2 * (servingSize || 2)} cloves garlic, minced\n`;
          recipe += `- ${1 * (servingSize || 2)} carrot, grated\n`;
          recipe += `- ${400 * (servingSize || 2)}g chopped tomatoes\n`;
          recipe += `- ${6 * (servingSize || 2)} vegan lasagna sheets\n`;
          recipe += `- ${2 * (servingSize || 2)} tbsp olive oil\n`;
          recipe += `- Salt and pepper to taste\n`;
          recipe += `- ${1 * (servingSize || 2)} tsp dried oregano\n\n`;
          
          recipe += `## Instructions\n`;
          recipe += `1. Preheat oven to 180°C (350°F).\n`;
          recipe += `2. Heat olive oil in a pan over medium heat. Add onion and cook for 5 minutes until soft.\n`;
          recipe += `3. Add garlic and cook for 1 minute.\n`;
          recipe += `4. Add plant-based mince and cook until browned.\n`;
          recipe += `5. Add chopped tomatoes, carrot, oregano, salt, and pepper. Simmer for 15 minutes.\n`;
          recipe += `6. In a baking dish, layer sauce, vegan lasagna sheets, and vegan cheese. Repeat layers.\n`;
          recipe += `7. Top with remaining vegan cheese.\n`;
          recipe += `8. Cover with foil and bake for 25 minutes. Remove foil and bake for another 10 minutes.\n`;
          recipe += `9. Let rest for 5 minutes before serving.\n`;
        } else if (dietaryRestrictions.includes('Vegetarian')) {
          recipe += `## Ingredients\n`;
          recipe += `- ${2 * (servingSize || 2)} bell peppers, diced\n`;
          recipe += `- ${100 * (servingSize || 2)}g mushrooms, sliced\n`;
          recipe += `- ${1 * (servingSize || 2)} large onion, diced\n`;
          recipe += `- ${2 * (servingSize || 2)} cloves garlic, minced\n`;
          recipe += `- ${1 * (servingSize || 2)} carrot, grated\n`;
          recipe += `- ${400 * (servingSize || 2)}g chopped tomatoes\n`;
          recipe += `- ${100 * (servingSize || 2)}g cheese\n`;
          recipe += `- ${6 * (servingSize || 2)} lasagna sheets\n`;
          recipe += `- ${2 * (servingSize || 2)} tbsp olive oil\n`;
          recipe += `- Salt and pepper to taste\n`;
          recipe += `- ${1 * (servingSize || 2)} tsp dried oregano\n\n`;
          
          recipe += `## Instructions\n`;
          recipe += `1. Preheat oven to 180°C (350°F).\n`;
          recipe += `2. Heat olive oil in a pan over medium heat. Add onion and cook for 5 minutes until soft.\n`;
          recipe += `3. Add garlic and cook for 1 minute.\n`;
          recipe += `4. Add bell peppers and mushrooms and cook for 5 minutes.\n`;
          recipe += `5. Add chopped tomatoes, carrot, oregano, salt, and pepper. Simmer for 15 minutes.\n`;
          recipe += `6. In a baking dish, layer sauce, lasagna sheets, and cheese. Repeat layers.\n`;
          recipe += `7. Top with remaining cheese.\n`;
          recipe += `8. Cover with foil and bake for 25 minutes. Remove foil and bake for another 10 minutes.\n`;
          recipe += `9. Let rest for 5 minutes before serving.\n`;
        } else {
          recipe += `## Ingredients\n`;
          recipe += `- ${250 * (servingSize || 2)}g minced beef\n`;
          recipe += `- ${1 * (servingSize || 2)} large onion, diced\n`;
          recipe += `- ${2 * (servingSize || 2)} cloves garlic, minced\n`;
          recipe += `- ${1 * (servingSize || 2)} carrot, grated\n`;
          recipe += `- ${400 * (servingSize || 2)}g chopped tomatoes\n`;
          recipe += `- ${100 * (servingSize || 2)}g cheese\n`;
          recipe += `- ${6 * (servingSize || 2)} lasagna sheets\n`;
          recipe += `- ${2 * (servingSize || 2)} tbsp olive oil\n`;
          recipe += `- Salt and pepper to taste\n`;
          recipe += `- ${1 * (servingSize || 2)} tsp dried oregano\n\n`;
          
          recipe += `## Instructions\n`;
          recipe += `1. Preheat oven to 180°C (350°F).\n`;
          recipe += `2. Heat olive oil in a pan over medium heat. Add onion and cook for 5 minutes until soft.\n`;
          recipe += `3. Add garlic and cook for 1 minute.\n`;
          recipe += `4. Add minced beef and cook until browned.\n`;
          recipe += `5. Add chopped tomatoes, carrot, oregano, salt, and pepper. Simmer for 15 minutes.\n`;
          recipe += `6. In a baking dish, layer meat sauce, lasagna sheets, and cheese. Repeat layers.\n`;
          recipe += `7. Top with remaining cheese.\n`;
          recipe += `8. Cover with foil and bake for 25 minutes. Remove foil and bake for another 10 minutes.\n`;
          recipe += `9. Let rest for 5 minutes before serving.\n`;
        }
        
        if (dietaryRestrictions.includes('Lactose-Free') && !dietaryRestrictions.includes('Vegan')) {
          recipe = recipe.replace(/cheese/g, 'lactose-free cheese');
        }
        
        if (dietaryRestrictions.includes('Low-Carb')) {
          recipe = recipe.replace(/lasagna sheets/g, 'sliced zucchini (as pasta replacement)');
          recipe = recipe.replace(/Preheat oven to 180°C \(350°F\)/g, 'Preheat oven to 180°C (350°F). Slice zucchini thinly lengthwise and salt it to draw out moisture. Let sit for 15 minutes, then pat dry.');
        }
        
        if (dietaryRestrictions.includes('Gluten-Free')) {
          recipe = recipe.replace(/lasagna sheets/g, 'gluten-free lasagna sheets');
        }
        
        if (dietaryRestrictions.includes('Nut-Free')) {
          recipe += `\n**Note:** This recipe is nut-free.\n`;
        }
        
      } else {
        recipe = `# ${dishName || "Your Dish"} Recipe (${servingSize || 2} servings)\n\n`;
        recipe += `## Ingredients\n`;
        recipe += `- Main ingredient\n`;
        recipe += `- Secondary ingredient\n`;
        recipe += `- Herbs and spices\n\n`;
        recipe += `## Instructions\n`;
        recipe += `1. Step one\n`;
        recipe += `2. Step two\n`;
        recipe += `3. Step three\n`;
        recipe += `4. Step four\n`;
        recipe += `5. Enjoy your ${dishName || "meal"}!\n`;
      }
      
      const recipeButtons: ButtonOption[] = [
        { 
          id: 'save-recipe', 
          label: 'Save Recipe', 
          action: () => handleSaveRecipe() 
        }
      ];
      
      addAssistantMessage(recipe, undefined, recipeButtons);
    }, 1200);
  };
  
  const handleSaveRecipe = () => {
    addUserMessage("Save this recipe");
    
    setFoodContext(prev => ({
      ...prev,
      recipeSaved: true
    }));
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      addAssistantMessage("Recipe saved to Documents/Recipes!");
      
      const scheduleButtons: ButtonOption[] = [
        { 
          id: 'schedule-event', 
          label: 'Schedule Event', 
          icon: <Calendar className="w-4 h-4 mr-1" />,
          action: () => handleScheduleEvent() 
        },
        { 
          id: 'finish', 
          label: 'Finish', 
          action: () => handleFinish() 
        },
      ];
      
      addAssistantMessage("All done with the recipe! Schedule cooking time?", undefined, scheduleButtons);
    }, 800);
  };
  
  const handleScheduleEvent = () => {
    addUserMessage("Schedule a cooking event");
    
    setFoodContext(prev => ({
      ...prev,
      conversationState: 'schedule_event'
    }));
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      addAssistantMessage("When will you cook this?");
      
      const calendarMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Select a date:",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, calendarMessage]);
      
      const notesMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Add notes (optional):",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, notesMessage]);
      
      const calendarButtons: ButtonOption[] = [
        { 
          id: 'add-to-calendar', 
          label: 'Add to Calendar', 
          icon: <Calendar className="w-4 h-4 mr-1" />,
          action: () => handleAddToCalendar() 
        }
      ];
      
      addAssistantMessage("Click to add to calendar:", undefined, calendarButtons);
    }, 800);
  };
  
  const handleAddToCalendar = () => {
    if (!selectedDate) {
      addAssistantMessage("Please select a date first.");
      return;
    }
    
    addUserMessage(`Schedule for ${format(selectedDate, 'PPP')}`);
    
    setFoodContext(prev => ({
      ...prev,
      dateTime: selectedDate,
      eventNotes: eventNotes,
      eventScheduled: true
    }));
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      addAssistantMessage(`Event scheduled for ${format(selectedDate, 'PPP')}!`);
      
      if (!foodContext.recipeSaved) {
        const recipeButtons: ButtonOption[] = [
          { 
            id: 'get-recipe', 
            label: 'Get Recipe', 
            icon: <Receipt className="w-4 h-4 mr-1" />,
            action: () => handleGetRecipe() 
          },
          { 
            id: 'finish', 
            label: 'Finish', 
            action: () => handleFinish() 
          },
        ];
        
        addAssistantMessage("Event scheduled! Need the recipe too?", undefined, recipeButtons);
      } else {
        handleFinish();
      }
    }, 800);
  };
  
  const handleFinish = () => {
    addUserMessage("Finish");
    
    setFoodContext(prev => ({
      ...prev,
      conversationState: 'closing'
    }));
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      let closingMessage = "Your ";
      const items = [];
      
      if (foodContext.ingredientsAdded) items.push("shopping list");
      if (foodContext.recipeSaved) items.push("recipe");
      if (foodContext.eventScheduled) items.push("event");
      
      if (items.length === 0) {
        closingMessage = "Thank you for using Mr. Todoodle! Enjoy your meal! 🍽️";
      } else if (items.length === 1) {
        closingMessage = `Your ${items[0]} is saved. Enjoy your meal! 🍽️`;
      } else if (items.length === 2) {
        closingMessage = `Your ${items[0]} and ${items[1]} are saved. Enjoy your meal! 🍽️`;
      } else {
        closingMessage = `Your ${items[0]}, ${items[1]}, and ${items[2]} are saved. Enjoy your meal! 🍽️`;
      }
      
      addAssistantMessage(closingMessage);
      
      // Add option to start over
      const newConversationButton: ButtonOption = {
        id: 'new-conversation',
        label: 'Start Over',
        action: resetConversation
      };
      
      addAssistantMessage("Need help with something else?", undefined, [newConversationButton]);
    }, 800);
  };
  
  const DietaryCheckboxes = () => {
    if (foodContext.conversationState !== 'dietary_restrictions') {
      return null;
    }
    
    return (
      <div className="flex flex-col space-y-2 p-4 bg-secondary rounded-lg">
        {dietaryOptions.map(option => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={option.checked}
              onCheckedChange={() => toggleDietaryRestriction(option.id)}
            />
            <Label htmlFor={option.id}>{option.label}</Label>
          </div>
        ))}
        <Button 
          className="mt-4" 
          onClick={() => {
            const selectedRestrictions = dietaryOptions
              .filter(opt => opt.checked)
              .map(opt => opt.id);
            setFoodContext(prev => ({ 
              ...prev, 
              dietaryRestrictions: selectedRestrictions,
              conversationState: 'name_search' 
            }));
            suggestRecipes();
          }}
        >
          Confirm Selections
        </Button>
      </div>
    );
  };

  const DatePickerComponent = () => (
    <div className="bg-secondary px-3 py-2 rounded-lg w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <Calendar size={16} className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {showNotesInput && (
        <Textarea
          placeholder="Add notes about this cooking event..."
          className="mt-2"
          value={eventNotes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEventNotes(e.target.value)}
        />
      )}
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right"
        className={cn(
          "w-full sm:w-[400px] h-full flex flex-col p-0",
          theme === 'dark' ? 'dark' : ''
        )}
      >
        <SheetHeader className="px-4 py-2 border-b">
          <SheetTitle>AI Food Assistant</SheetTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X size={16} />
            <span className="sr-only">Close</span>
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-4' 
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.options && message.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.options.map((option: ButtonOption) => (
                      <Button
                        key={option.id}
                        variant="secondary"
                        size="sm"
                        onClick={option.action}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}

                {message.buttons && message.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.buttons.map((button: ButtonOption) => (
                      <Button
                        key={button.id}
                        variant={button.variant || 'default'}
                        size="sm"
                        onClick={button.action}
                        className="flex items-center gap-1"
                      >
                        {button.icon}
                        {button.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-secondary px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Recipe Search UI */}
          {foodContext.conversationState === 'recipe_search' && (
            <div className="flex items-start w-full">
              <div className="bg-secondary px-3 py-2 rounded-lg w-full">
                <RecipeSearch 
                  onSelectRecipe={handleRecipeSelection}
                  selectedDietaryRestrictions={foodContext.dietaryRestrictions}
                />
              </div>
            </div>
          )}
          
          {foodContext.conversationState === 'schedule_event' && (
            <>
              <div className="flex items-start">
                <div className="bg-secondary px-3 py-2 rounded-lg w-full">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Textarea
                    placeholder="Add notes about this cooking event..."
                    className="mt-2"
                    value={eventNotes}
                    onChange={(e) => setEventNotes(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          
          {foodContext.conversationState === 'dietary_restrictions' && (
            <DietaryCheckboxes />
          )}

          {showDatePicker && foodContext.conversationState === 'schedule_event' && (
            <DatePickerComponent />
          )}

          <div ref={messagesEndRef} />
        </div>

        <form 
          onSubmit={handleSubmit}
          className="border-t p-4 flex gap-2"
        >
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            className="flex-grow"
            disabled={isProcessing || ['dietary_restrictions', 'schedule_event'].includes(foodContext.conversationState)}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!input.trim() || isProcessing || ['dietary_restrictions', 'schedule_event'].includes(foodContext.conversationState)}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AIFoodAssistant;
