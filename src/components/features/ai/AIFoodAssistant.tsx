import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ScanBarcode, Send, X, RotateCcw, Calendar, ShoppingCart, Receipt, Clock, CheckSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AIFoodAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatMessage = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  options?: ChatOption[];
  buttons?: ButtonOption[];
  imageUrl?: string;
};

type ChatOption = {
  id: string;
  label: string;
  action: () => void;
};

type ButtonOption = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  action: () => void;
};

type DietaryRestriction = {
  id: string;
  label: string;
  checked: boolean;
};

type FoodContext = {
  conversationState: 'initial' | 'dish_selection' | 'serving_size' | 'dietary_restrictions' | 'ingredient_list' | 'decision_point' | 'recipe_generation' | 'schedule_event' | 'closing';
  dishName?: string;
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

const AIFoodAssistant: React.FC<AIFoodAssistantProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeScanOption, setActiveScanOption] = useState<'camera' | 'upload' | 'barcode' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (messages.length > 0 || Object.keys(foodContext).length > 0) {
      saveSession();
    }
  }, [messages, foodContext]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
  }, [isOpen, messages.length]);

  const loadSession = () => {
    try {
      const sessionData = localStorage.getItem(STORAGE_KEY);
      
      if (sessionData) {
        const { messages: storedMessages, context, timestamp } = JSON.parse(sessionData);
        
        const now = new Date().getTime();
        const lastInteraction = new Date(timestamp).getTime();
        
        if (now - lastInteraction < SESSION_EXPIRY) {
          const parsedMessages = storedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            dateTime: msg.dateTime ? new Date(msg.dateTime) : undefined
          }));
          
          setMessages(parsedMessages);
          setFoodContext({
            ...context,
            dietaryRestrictions: Array.isArray(context.dietaryRestrictions) ? context.dietaryRestrictions : [],
            dateTime: context.dateTime ? new Date(context.dateTime) : undefined
          });
          
          if (Array.isArray(context.dietaryRestrictions) && context.dietaryRestrictions.length > 0) {
            setDietaryOptions(prev => 
              prev.map(option => ({
                ...option, 
                checked: context.dietaryRestrictions.includes(option.label)
              }))
            );
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
          startConversation();
        }
      } else {
        startConversation();
      }
    } catch (error) {
      console.error('Error loading session:', error);
      startConversation();
    }
  };

  const saveSession = () => {
    try {
      const sessionData = {
        messages,
        context: foodContext,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const startConversation = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: 'I\'m Mr. Todoodle, your food assistant. What dish would you like to explore today?',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    setFoodContext({
      ...foodContext,
      conversationState: 'dish_selection'
    });
  };

  const handleClose = () => {
    onClose();
    setActiveScanOption(null);
  };

  const resetConversation = () => {
    localStorage.removeItem(STORAGE_KEY);
    
    setMessages([]);
    setFoodContext({
      conversationState: 'initial',
      dietaryRestrictions: [],
      ingredientsAdded: false,
      recipeSaved: false,
      eventScheduled: false
    });
    setInput('');
    setActiveScanOption(null);
    setIsProcessing(false);
    setDietaryOptions(DIETARY_OPTIONS);
    
    startConversation();
  };

  const addUserMessage = (content: string) => {
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    return newUserMessage;
  };
  
  const addAssistantMessage = (content: string, options?: ChatOption[], buttons?: ButtonOption[], imageUrl?: string) => {
    const newAssistantMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      options,
      buttons,
      imageUrl
    };
    
    setMessages(prev => [...prev, newAssistantMessage]);
    return newAssistantMessage;
  };

  const handleDishNameInput = (dishName: string) => {
    setFoodContext(prev => ({
      ...prev,
      dishName,
      conversationState: 'serving_size'
    }));
    
    addUserMessage(dishName);
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
          id: '3', 
          label: '3', 
          variant: 'outline', 
          action: () => handleServingSizeSelection(3) 
        },
        { 
          id: '4', 
          label: '4', 
          variant: 'outline', 
          action: () => handleServingSizeSelection(4) 
        },
        { 
          id: 'custom', 
          label: 'Custom', 
          variant: 'outline', 
          action: () => {
            addAssistantMessage("How many servings do you need?");
            setFoodContext(prev => ({
              ...prev,
              conversationState: 'serving_size'
            }));
          } 
        },
      ];
      
      addAssistantMessage("How many servings?", undefined, servingButtons);
    }, 500);
  };

  const handleServingSizeSelection = (servingSize: number) => {
    addUserMessage(servingSize.toString());
    
    setFoodContext(prev => ({
      ...prev,
      servingSize,
      conversationState: 'dietary_restrictions'
    }));
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      addAssistantMessage("Any dietary needs? (Select all that apply)");
      
      const dietaryMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Select your dietary preferences:",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, dietaryMessage]);
      
      const continueButton: ButtonOption = { 
        id: 'continue', 
        label: 'Continue', 
        icon: <CheckSquare className="w-4 h-4 mr-1" />,
        action: () => handleDietaryComplete() 
      };
      
      addAssistantMessage("Click Continue when you're done selecting", undefined, [continueButton]);
    }, 500);
  };
  
  const toggleDietaryRestriction = (restrictionId: string) => {
    setDietaryOptions(prev => 
      prev.map(option => 
        option.id === restrictionId 
          ? { ...option, checked: !option.checked } 
          : option
      )
    );
  };
  
  const handleDietaryComplete = () => {
    const selectedRestrictions = dietaryOptions
      .filter(option => option.checked)
      .map(option => option.label);
    
    let userMessage = "Selected: ";
    if (selectedRestrictions.length === 0) {
      userMessage = "No dietary restrictions";
      selectedRestrictions.push("None");
    } else {
      userMessage += selectedRestrictions.join(', ');
    }
    
    addUserMessage(userMessage);
    
    setFoodContext(prev => ({
      ...prev,
      dietaryRestrictions: selectedRestrictions,
      conversationState: 'ingredient_list'
    }));
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      showIngredientsList();
    }, 1000);
  };
  
  const showIngredientsList = () => {
    const { dishName, servingSize, dietaryRestrictions } = foodContext;
    
    let ingredientsList = "";
    
    if (dishName?.toLowerCase() === 'lasagna') {
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
      
      const { dishName, servingSize, dietaryRestrictions } = foodContext;
      
      let recipe = "";
      
      if (dishName?.toLowerCase() === 'lasagna') {
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
    }, 800);
  };
  
  const DietaryCheckboxes = () => {
    if (foodContext.conversationState !== 'dietary_restrictions') {
      return null;
    }
    
    return (
      <div className="flex flex-col items-start bg-gray-100 dark:bg-gray-800 rounded-lg p-3 my-2">
        <div className="w-full grid grid-cols-2 gap-2">
          {dietaryOptions.map((restriction) => (
            <div key={restriction.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`restriction-${restriction.id}`} 
                checked={restriction.checked}
                onCheckedChange={() => toggleDietaryRestriction(restriction.id)}
              />
              <Label 
                htmlFor={`restriction-${restriction.id}`}
                className="text-sm cursor-pointer"
              >
                {restriction.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="right"
        className={cn(
          "sm:max-w-md md:max-w-lg w-full overflow-y-auto pb-20",
          theme === 'dark' ? 'bg-gray-950' : 'bg-white'
        )}
        hideCloseButton
      >
        <SheetHeader className="border-b pb-2 mb-4">
          <div className="flex justify-between items-center">
            <SheetTitle className="flex items-center gap-2">
              <span className="text-base md:text-lg font-semibold">Mr. Todoodle</span>
              <Badge className="bg-green-500 text-white text-xs">Food Assistant</Badge>
            </SheetTitle>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={resetConversation} 
                className="mr-1"
                aria-label="Reset conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        <div className="flex flex-col space-y-4 pb-24 md:pb-28 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={cn(
                "flex flex-col",
                message.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div 
                className={cn(
                  "px-3 py-2 rounded-lg max-w-[85%] whitespace-pre-wrap",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary"
                )}
              >
                {message.content}
                
                {message.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={message.imageUrl} 
                      alt="Food" 
                      className="max-w-full rounded-md" 
                    />
                  </div>
                )}
                
                {message.options && message.options.length > 0 && (
                  <div className="flex flex-col space-y-2 mt-2">
                    {message.options.map((option) => (
                      <Button 
                        key={option.id} 
                        variant="outline" 
                        size="sm" 
                        onClick={option.action}
                        className="justify-start h-auto py-1.5 px-2 text-left text-sm"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                {message.buttons && message.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.buttons.map((button) => (
                      <Button 
                        key={button.id} 
                        variant={button.variant || "default"} 
                        size="sm" 
                        onClick={button.action}
                        className="flex items-center"
                      >
                        {button.icon}{button.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              <span className="text-xs text-muted-foreground mt-1">
                {format(message.timestamp, 'p')}
              </span>
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
          
          <div ref={messagesEndRef} />
        </div>

        <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-background border-t z-10 w-full">
          <form 
            className="flex items-center space-x-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                switch (foodContext.conversationState) {
                  case 'dish_selection':
                    handleDishNameInput(input);
                    break;
                  case 'serving_size':
                    const servingSize = parseInt(input);
                    if (!isNaN(servingSize) && servingSize > 0) {
                      handleServingSizeSelection(servingSize);
                    } else {
                      addAssistantMessage("Please enter a valid number of servings.");
                    }
                    break;
                  default:
                    addUserMessage(input);
                    break;
                }
              }
            }}
          >
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow"
              disabled={isProcessing || activeScanOption !== null || ['dietary_restrictions', 'schedule_event'].includes(foodContext.conversationState)}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isProcessing || activeScanOption !== null || ['dietary_restrictions', 'schedule_event'].includes(foodContext.conversationState)}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIFoodAssistant;
