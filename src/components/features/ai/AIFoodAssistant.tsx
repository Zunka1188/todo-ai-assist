
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ScanBarcode, Send, X, RotateCcw, Calendar, ShoppingCart, Receipt, Clock } from 'lucide-react';
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
      
      const dietaryButtons: ButtonOption[] = [
        { 
          id: 'vegan', 
          label: 'Vegan', 
          variant: 'outline', 
          action: () => toggleDietaryRestriction('Vegan') 
        },
        { 
          id: 'vegetarian', 
          label: 'Vegetarian', 
          variant: 'outline', 
          action: () => toggleDietaryRestriction('Vegetarian') 
        },
        { 
          id: 'nut-free', 
          label: 'Nut-Free', 
          variant: 'outline', 
          action: () => toggleDietaryRestriction('Nut-Free') 
        },
        { 
          id: 'lactose-free', 
          label: 'Lactose-Free', 
          variant: 'outline', 
          action: () => toggleDietaryRestriction('Lactose-Free') 
        },
        { 
          id: 'low-carb', 
          label: 'Low-Carb', 
          variant: 'outline', 
          action: () => toggleDietaryRestriction('Low-Carb') 
        },
        { 
          id: 'none', 
          label: 'None', 
          variant: 'outline', 
          action: () => handleDietaryComplete(['None']) 
        },
        { 
          id: 'continue', 
          label: 'Continue', 
          action: () => handleDietaryComplete(foodContext.dietaryRestrictions) 
        },
      ];
      
      addAssistantMessage("Any dietary needs? (Select all that apply)", undefined, dietaryButtons);
    }, 500);
  };
  
  const toggleDietaryRestriction = (restriction: string) => {
    setFoodContext(prev => {
      const currentRestrictions = Array.isArray(prev.dietaryRestrictions) ? prev.dietaryRestrictions : [];
      
      if (restriction === 'None') {
        return {
          ...prev,
          dietaryRestrictions: ['None']
        };
      }
      
      let updatedRestrictions = currentRestrictions.filter(r => r !== 'None');
      
      if (updatedRestrictions.includes(restriction)) {
        updatedRestrictions = updatedRestrictions.filter(r => r !== restriction);
      } else {
        updatedRestrictions = [...updatedRestrictions, restriction];
      }
      
      return {
        ...prev,
        dietaryRestrictions: updatedRestrictions
      };
    });
  };
  
  const handleDietaryComplete = (restrictions: string[]) => {
    let userMessage = "Selected: ";
    if (restrictions.length === 0 || (restrictions.length === 1 && restrictions[0] === 'None')) {
      userMessage = "No dietary restrictions";
    } else {
      userMessage += restrictions.join(', ');
    }
    
    addUserMessage(userMessage);
    
    setFoodContext(prev => ({
      ...prev,
      dietaryRestrictions: restrictions,
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
  
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="right"
        className={cn(
          "sm:max-w-md md:max-w-lg w-full overflow-y-auto",
          theme === 'dark' ? 'bg-gray-950' : 'bg-white'
        )}
        hideCloseButton
      >
        <SheetHeader className="border-b pb-2 mb-4">
          <div className="flex justify-between items-center">
            <SheetTitle className="flex items-center gap-2">
              <span className="text-base md:text-lg font-semibold">Mr. Todoodle</span>
              <Badge variant="outline" className="font-normal">Food Assistant</Badge>
            </SheetTitle>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={resetConversation}
                title="Start over"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleClose}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        <div className="flex flex-col space-y-4 pb-20">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-2 text-sm",
                  message.role === "user"
                    ? "bg-purple-600 text-white"
                    : theme === "dark"
                    ? "bg-gray-800"
                    : "bg-gray-100"
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {message.options && message.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.options.map(option => (
                      <Button
                        key={option.id}
                        variant="secondary"
                        size="sm"
                        onClick={option.action}
                        className="text-xs"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                {message.buttons && message.buttons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.buttons.map(button => (
                      <Button
                        key={button.id}
                        variant={button.variant || "default"}
                        size="sm"
                        onClick={button.action}
                        className="text-xs"
                      >
                        {button.icon}
                        {button.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                {message.imageUrl && (
                  <img 
                    src={message.imageUrl} 
                    alt="Assistant provided image" 
                    className="mt-2 rounded-md max-w-full" 
                  />
                )}
              </div>
              
              <div className="text-xs text-gray-500 mt-1 px-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {foodContext.conversationState === 'schedule_event' && (
            <div className="flex flex-col items-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-2">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border rounded-md"
                />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 w-full">
                <Textarea
                  placeholder="Event notes (optional)"
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}
          
          {isTyping && (
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <div className="flex space-x-1">
                <span className="animate-bounce delay-0">•</span>
                <span className="animate-bounce delay-150">•</span>
                <span className="animate-bounce delay-300">•</span>
              </div>
              <span>Mr. Todoodle is typing</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-950 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                const userInput = input.trim();
                
                if (foodContext.conversationState === 'dish_selection') {
                  handleDishNameInput(userInput);
                } else if (foodContext.conversationState === 'serving_size') {
                  const servingSize = parseInt(userInput);
                  if (!isNaN(servingSize) && servingSize > 0) {
                    handleServingSizeSelection(servingSize);
                  } else {
                    addAssistantMessage("Please enter a valid number of servings.");
                  }
                } else {
                  addUserMessage(userInput);
                  addAssistantMessage("I've noted your input. Let's continue with the current step.");
                }
              }
            }}
            className="flex items-center space-x-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isProcessing}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIFoodAssistant;
