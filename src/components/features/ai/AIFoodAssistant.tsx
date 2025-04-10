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

// Enhanced FoodContext type for conversation state management
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
  
  // Initial food context
  const [foodContext, setFoodContext] = useState<FoodContext>({
    conversationState: 'initial',
    dietaryRestrictions: [],
    ingredientsAdded: false,
    recipeSaved: false,
    eventScheduled: false
  });
  
  // Auto scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load session from localStorage when component mounts
  useEffect(() => {
    loadSession();
  }, []);

  // Save session whenever messages or context changes
  useEffect(() => {
    if (messages.length > 0 || Object.keys(foodContext).length > 0) {
      saveSession();
    }
  }, [messages, foodContext]);
  
  // Initialize conversation if no messages
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
        
        // Check if session has expired (24 hours)
        const now = new Date().getTime();
        const lastInteraction = new Date(timestamp).getTime();
        
        if (now - lastInteraction < SESSION_EXPIRY) {
          // Convert ISO strings back to Date objects
          const parsedMessages = storedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            dateTime: msg.dateTime ? new Date(msg.dateTime) : undefined
          }));
          
          setMessages(parsedMessages);
          setFoodContext({
            ...context,
            dateTime: context.dateTime ? new Date(context.dateTime) : undefined
          });
        } else {
          // Session expired, clear storage
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
    // Reset scan option when closing but preserve conversation
    setActiveScanOption(null);
  };

  const resetConversation = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Reset states
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
    
    // Start new conversation
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
    // Update context with dish name
    setFoodContext(prev => ({
      ...prev,
      dishName,
      conversationState: 'serving_size'
    }));
    
    // Add user message
    addUserMessage(dishName);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Create serving size buttons
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
            // Add a prompt for custom serving size input
            addAssistantMessage("How many servings do you need?");
            setFoodContext(prev => ({
              ...prev,
              conversationState: 'serving_size'
            }));
          } 
        },
      ];
      
      // Add assistant message with serving size options
      addAssistantMessage("How many servings?", undefined, servingButtons);
    }, 500);
  };

  const handleServingSizeSelection = (servingSize: number) => {
    // Add user message with selection
    addUserMessage(servingSize.toString());
    
    // Update context with serving size
    setFoodContext(prev => ({
      ...prev,
      servingSize,
      conversationState: 'dietary_restrictions'
    }));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Create dietary restriction buttons
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
      
      // Add assistant message with dietary restriction options
      addAssistantMessage("Any dietary needs? (Select all that apply)", undefined, dietaryButtons);
    }, 500);
  };
  
  const toggleDietaryRestriction = (restriction: string) => {
    setFoodContext(prev => {
      // If 'None' is selected, clear other restrictions
      if (restriction === 'None') {
        return {
          ...prev,
          dietaryRestrictions: ['None']
        };
      }
      
      // If another restriction is selected, remove 'None' if present
      let updatedRestrictions = prev.dietaryRestrictions.filter(r => r !== 'None');
      
      // Toggle the restriction
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
    // Show selected restrictions as user message
    let userMessage = "Selected: ";
    if (restrictions.length === 0 || (restrictions.length === 1 && restrictions[0] === 'None')) {
      userMessage = "No dietary restrictions";
    } else {
      userMessage += restrictions.join(', ');
    }
    
    addUserMessage(userMessage);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Update context
    setFoodContext(prev => ({
      ...prev,
      dietaryRestrictions: restrictions,
      conversationState: 'ingredient_list'
    }));
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      showIngredientsList();
    }, 1000);
  };
  
  const showIngredientsList = () => {
    const { dishName, servingSize, dietaryRestrictions } = foodContext;
    
    // Generate sample ingredient list based on dish and serving size
    let ingredientsList = "";
    
    if (dishName?.toLowerCase() === 'lasagna') {
      const quantity = servingSize || 2;
      ingredientsList = `Ingredients for ${dishName} (${quantity} servings):\n\n`;
      
      // Adjust ingredients based on dietary restrictions
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
      
      // Adjust for lactose-free
      if (dietaryRestrictions.includes('Lactose-Free') && !dietaryRestrictions.includes('Vegan')) {
        ingredientsList = ingredientsList.replace('cheese', 'lactose-free cheese');
      }
      
      // Adjust for low-carb
      if (dietaryRestrictions.includes('Low-Carb')) {
        ingredientsList = ingredientsList.replace('lasagna sheets', 'sliced zucchini (as pasta replacement)');
      }
    } else {
      // Generic ingredient list for other dishes
      ingredientsList = `Ingredients for ${dishName || "your dish"} (${servingSize || 2} servings):\n\n`;
      ingredientsList += `- Main ingredient\n`;
      ingredientsList += `- Secondary ingredient\n`;
      ingredientsList += `- Herbs and spices\n`;
    }
    
    // Create buttons for ingredient list actions
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
          // Loop back to serving size selection
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
    
    // Add assistant message with ingredient list
    addAssistantMessage(ingredientsList, undefined, ingredientButtons);
  };
  
  const handleAddToShoppingList = () => {
    // Add user message
    addUserMessage("Add ingredients to my shopping list");
    
    // Update context
    setFoodContext(prev => ({
      ...prev,
      ingredientsAdded: true,
      conversationState: 'decision_point'
    }));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Add confirmation message
      addAssistantMessage("Added to your shopping list! You can customize ingredients in the Shopping List tab.");
      
      // Move to decision point
      showDecisionPoint();
    }, 800);
  };
  
  const showDecisionPoint = () => {
    // Create decision buttons
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
    
    // Add decision point message
    addAssistantMessage("What would you like to do next?", undefined, decisionButtons);
  };
  
  const handleGetRecipe = () => {
    // Add user message
    addUserMessage("Get the recipe");
    
    // Update context
    setFoodContext(prev => ({
      ...prev,
      conversationState: 'recipe_generation'
    }));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      const { dishName, servingSize, dietaryRestrictions } = foodContext;
      
      // Generate sample recipe based on dish
      let recipe = "";
      
      if (dishName?.toLowerCase() === 'lasagna') {
        recipe = `# ${dishName} Recipe (${servingSize} servings)\n\n`;
        
        // Adjust recipe based on dietary restrictions
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
        
        // Adjust for dietary restrictions
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
        // Generic recipe for other dishes
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
      
      // Create recipe action buttons
      const recipeButtons: ButtonOption[] = [
        { 
          id: 'save-recipe', 
          label: 'Save Recipe', 
          action: () => handleSaveRecipe() 
        }
      ];
      
      // Add recipe message
      addAssistantMessage(recipe, undefined, recipeButtons);
    }, 1200);
  };
  
  const handleSaveRecipe = () => {
    // Add user message
    addUserMessage("Save this recipe");
    
    // Update context
    setFoodContext(prev => ({
      ...prev,
      recipeSaved: true
    }));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Add confirmation message
      addAssistantMessage("Recipe saved to Documents/Recipes!");
      
      // Ask about scheduling
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
    // Add user message
    addUserMessage("Schedule a cooking event");
    
    // Update context
    setFoodContext(prev => ({
      ...prev,
      conversationState: 'schedule_event'
    }));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Add calendar selection message
      addAssistantMessage("When will you cook this?");
      
      // Show calendar component in next message
      const calendarMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Select a date:",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, calendarMessage]);
      
      // Add notes input in the next message
      const notesMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Add notes (optional):",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, notesMessage]);
      
      // Add calendar button in the next message
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
    
    // Add user message
    addUserMessage(`Schedule for ${format(selectedDate, 'PPP')}`);
    
    // Update context
    setFoodContext(prev => ({
      ...prev,
      dateTime: selectedDate,
      eventNotes: eventNotes,
      eventScheduled: true
    }));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Add confirmation message
      addAssistantMessage(`Event scheduled for ${format(selectedDate, 'PPP')}!`);
      
      // Ask about recipe if not already shown
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
    // Add user message
    addUserMessage("Finish");
    
    // Update context
    setFoodContext(prev => ({
      ...prev,
      conversationState: 'closing'
    }));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Add closing message
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
        closingMessage = `Your ${items[0]}, ${items[1]},
