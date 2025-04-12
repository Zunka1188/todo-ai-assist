import { useState, useRef, useEffect } from 'react';
import { 
  Search,
  Utensils,
  Calendar,
  Check,
  File,
  ArrowUp,
  X
} from 'lucide-react';

import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Recipe } from '@/data/recipes';
import { RecipeService } from '@/services/RecipeService';

type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

interface DietaryRestriction {
  id: string;
  label: string;
  checked: boolean;
}

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

  const handleCuisineBrowse = () => {
    const cuisines = Array.from(new Set(RecipeService.getAllRecipes().map((recipe: Recipe) => recipe.cuisine)));
    const cuisineOptions: ButtonOption[] = cuisines.map((cuisine: string) => ({
      id: cuisine,
      label: cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
      action: () => showRecipesByCuisine(cuisine)
    }));
    addAssistantMessage('Browse recipes by cuisine:', undefined, undefined, cuisineOptions);
  };

  const showRecipesByCuisine = (cuisine: string) => {
    const filteredRecipes = RecipeService.getAllRecipes().filter((recipe: Recipe) => recipe.cuisine === cuisine);
    const recipeOptions: ButtonOption[] = filteredRecipes.map((recipe: Recipe) => ({
      id: recipe.id.toString(),
      label: recipe.name,
      variant: 'outline',
      action: () => handleRecipeSelection(recipe)
    }));
    addAssistantMessage(`Here are the ${cuisine} recipes:`, undefined, undefined, recipeOptions);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addAssistantMessage = (
    content: string,
    imageUrl?: string,
    options?: ButtonOption[],
    buttons?: ButtonOption[]
  ) => {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      imageUrl,
      options,
      buttons
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSubmit: (e: FormSubmitEvent) => void = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    addUserMessage(userMessage);

    // Process user input based on context
    switch (foodContext.conversationState) {
      case 'name_search':
        handleDishNameInput();
        break;
      case 'serving_size':
        const servingSize = parseInt(userMessage);
        if (!isNaN(servingSize) && servingSize > 0) {
          handleServingSizeSelection(servingSize);
        } else {
          addAssistantMessage("Please enter a valid number of servings.");
        }
        break;
      default:
        // Handle general conversation
        addAssistantMessage("I'm here to help you find and manage recipes. Would you like to search for a specific recipe or browse by cuisine?", undefined, undefined, [
          {
            id: 'search',
            label: 'Search Recipe',
            icon: <Search size={16} />,
            action: () => handleNameSearch()
          },
          {
            id: 'browse',
            label: 'Browse Cuisines',
            icon: <Utensils size={16} />,
            action: () => handleCuisineBrowse()
          }
        ]);
    }

    setIsProcessing(false);
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
            <ArrowUp size={16} />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AIFoodAssistant;
