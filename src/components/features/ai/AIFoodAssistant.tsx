import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import RecipeSearch from './RecipeSearch';
import { DietaryCheckboxes } from './components/DietaryCheckboxes';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';
import { EventScheduler } from './components/EventScheduler';
import { DIETARY_OPTIONS } from './constants';
import { AIFoodAssistantProps, DietaryOption, FoodContext, DietaryRestrictionType } from './types';
import { useChatMessages } from './hooks/useChatMessages';
import { Recipe } from '@/data/recipes/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sanitizeTextInput } from '@/utils/input-validation';

const AIFoodAssistant: React.FC<AIFoodAssistantProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const {
    messages,
    isTyping,
    setIsTyping,
    addUserMessage,
    addAssistantMessage,
    resetMessages
  } = useChatMessages();

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [eventNotes, setEventNotes] = useState('');
  const [dietaryOptions, setDietaryOptions] = useState<DietaryOption[]>(DIETARY_OPTIONS);
  const [foodContext, setFoodContext] = useState<FoodContext>({
    conversationState: 'initial',
    dietaryRestrictions: [],
    ingredientsAdded: false,
    recipeSaved: false,
    eventScheduled: false
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  const safeSetError = useCallback((value: string | null) => {
    if (isMounted.current) {
      setError(value);
    }
  }, []);

  const safeSetIsProcessing = useCallback((value: boolean) => {
    if (isMounted.current) {
      setIsProcessing(value);
    }
  }, []);

  const safeSetIsTyping = useCallback((value: boolean) => {
    if (isMounted.current) {
      setIsTyping(value);
    }
  }, []);

  const safeSetIsLoading = useCallback((value: boolean) => {
    if (isMounted.current) {
      setIsLoading(value);
    }
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        if (isMounted.current) {
          addAssistantMessage(
            "👋 Hi there! I'm your AI Food Assistant. I can help you find recipes, plan meals, and answer cooking questions. What would you like to cook today?"
          );
        }
      }, 500);
    }
  }, [isOpen, messages.length, addAssistantMessage]);

  useEffect(() => {
    const messageEnd = messagesEndRef.current;
    if (messageEnd) {
      messageEnd.scrollIntoView({ behavior: 'smooth' });
    }
    return () => {
      if (messageEnd) {
        messageEnd.scrollIntoView({ behavior: 'auto' });
      }
    };
  }, [messages]);

  const validateInput = (text: string): boolean => {
    if (!text.trim()) {
      safeSetError("Please enter a message.");
      return false;
    }
    
    if (text.length > 500) {
      safeSetError("Message is too long (maximum 500 characters).");
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const sanitizedInput = sanitizeTextInput(input, 500);
    if (!validateInput(sanitizedInput)) return;

    addUserMessage(sanitizedInput);
    setInput('');
    safeSetIsProcessing(true);
    safeSetIsTyping(true);
    safeSetError(null);

    try {
      setTimeout(() => {
        if (!isMounted.current) return;
        
        safeSetIsProcessing(false);
        safeSetIsTyping(false);

        const lowerInput = sanitizedInput.toLowerCase();
        
        if (lowerInput.includes('recipe') || lowerInput.includes('cook') || lowerInput.includes('make')) {
          addAssistantMessage("Great! Let's find some recipes. Please tell me what dish you're interested in making, or just browse our options below.");
          setFoodContext(prev => ({
            ...prev,
            conversationState: 'recipe_search'
          }));
        } else if (lowerInput.includes('diet') || lowerInput.includes('vegan') || lowerInput.includes('vegetarian')) {
          addAssistantMessage(
            "Let me know your dietary preferences. I can filter recipes based on dietary restrictions.",
            undefined,
            [
              {
                id: 'set-dietary',
                label: 'Set Dietary Preferences',
                variant: 'default',
                action: () => handleDishNameInput()
              }
            ]
          );
        } else {
          addAssistantMessage(
            "I can help you find recipes, plan meals, or answer cooking questions. What would you like to do?",
            undefined,
            [
              {
                id: 'find-recipes',
                label: 'Find Recipes',
                variant: 'default',
                action: () => handleDishNameInput()
              }
            ]
          );
        }
      }, 1000);
    } catch (err) {
      console.error("Error processing input:", err);
      safeSetError("Something went wrong. Please try again.");
      safeSetIsProcessing(false);
      safeSetIsTyping(false);
    }
  };

  const handleDishNameInput = useCallback(() => {
    if (!isMounted.current) return;
    
    setFoodContext(prev => ({
      ...prev,
      conversationState: 'recipe_search'
    }));
    addAssistantMessage("What kind of dish would you like to make? You can search below or tell me.");
  }, [addAssistantMessage]);

  const handleRecipeSelection = useCallback((recipe: Recipe) => {
    if (!isMounted.current) return;
    
    safeSetIsLoading(true);
    try {
      addUserMessage(`I want to make ${recipe.name}`);
      
      setFoodContext(prev => ({
        ...prev,
        dishName: recipe.name,
        selectedRecipe: recipe,
        conversationState: 'serving_size'
      }));
      
      setTimeout(() => {
        if (!isMounted.current) return;
        
        addAssistantMessage(
          `Great choice! ${recipe.name} is a delicious ${recipe.cuisine} ${recipe.category}. Would you like me to adjust the recipe for any dietary restrictions or serving size?`,
          recipe.image,
          [
            {
              id: 'view-recipe',
              label: 'View Recipe Details',
              variant: 'default',
              action: () => showRecipeDetails(recipe)
            },
            {
              id: 'save-recipe',
              label: 'Save to My Recipes',
              variant: 'outline',
              action: () => saveRecipe(recipe)
            }
          ]
        );
        safeSetIsLoading(false);
      }, 500);
    } catch (err) {
      console.error("Error selecting recipe:", err);
      safeSetError("Failed to load recipe details. Please try again.");
      safeSetIsLoading(false);
    }
  }, [addUserMessage, addAssistantMessage]);

  const showRecipeDetails = useCallback((recipe: Recipe) => {
    try {
      const dietaryInfo = [];
      if (recipe.dietaryInfo.isVegan) dietaryInfo.push("Vegan");
      if (recipe.dietaryInfo.isVegetarian) dietaryInfo.push("Vegetarian");
      if (recipe.dietaryInfo.isGlutenFree) dietaryInfo.push("Gluten-Free");
      if (recipe.dietaryInfo.isDairyFree) dietaryInfo.push("Dairy-Free");
      if (recipe.dietaryInfo.isLowCarb) dietaryInfo.push("Low-Carb");
      
      const recipeDetails = `
## ${recipe.name}
**Cuisine**: ${recipe.cuisine}
**Prep Time**: ${recipe.prepTime} mins | **Cook Time**: ${recipe.cookTime} mins
**Calories**: ${recipe.nutritionalInfo.calories} | **Servings**: ${recipe.baseServings}
${dietaryInfo.length > 0 ? `**Dietary Info**: ${dietaryInfo.join(", ")}` : ""}

### Ingredients:
${recipe.ingredients.default
  .map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name}`)
  .join("\n")}

### Instructions:
${recipe.instructions.map((step, i) => `${i+1}. ${step}`).join("\n")}
      `;
      
      addAssistantMessage(recipeDetails, recipe.image);
    } catch (err) {
      console.error("Error showing recipe details:", err);
      toast({
        title: "Error",
        description: "Failed to display recipe details",
        variant: "destructive"
      });
    }
  }, [addAssistantMessage, toast]);

  const saveRecipe = useCallback((recipe: Recipe) => {
    try {
      setFoodContext(prev => ({
        ...prev,
        recipeSaved: true
      }));
      
      toast({
        title: "Recipe Saved",
        description: `${recipe.name} has been added to your saved recipes.`,
      });
      
      addAssistantMessage(`I've saved ${recipe.name} to your recipe collection. You can access it anytime from your saved recipes.`);
    } catch (err) {
      console.error("Error saving recipe:", err);
      toast({
        title: "Error",
        description: "Failed to save recipe",
        variant: "destructive"
      });
    }
  }, [addAssistantMessage, toast]);

  const handleDietaryChange = useCallback((options: DietaryOption[]) => {
    setDietaryOptions(options);
    
    const selectedDiets: DietaryRestrictionType[] = options
      .filter(option => option.checked)
      .map(option => option.id);
      
    setFoodContext(prev => ({
      ...prev,
      dietaryRestrictions: selectedDiets
    }));
  }, []);

  const clearError = useCallback(() => {
    safeSetError(null);
  }, [safeSetError]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right"
        className={cn("w-full sm:w-[400px] h-full flex flex-col p-0")}
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

        {error && (
          <Alert variant="destructive" className="mx-4 my-2 py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 absolute right-2 top-2"
              onClick={clearError}
            >
              <X size={10} />
            </Button>
          </Alert>
        )}

        <ChatMessages messages={messages} isTyping={isTyping} />

        {isLoading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}

        {foodContext.conversationState === 'recipe_search' && (
          <div className="flex items-start w-full p-4 pb-0">
            <div className="bg-secondary px-3 py-2 rounded-lg w-full">
              <RecipeSearch 
                onSelectRecipe={handleRecipeSelection}
                selectedDietaryRestrictions={foodContext.dietaryRestrictions}
              />
            </div>
          </div>
        )}

        <DietaryCheckboxes 
          options={dietaryOptions}
          setOptions={handleDietaryChange}
          foodContext={foodContext}
          setFoodContext={setFoodContext}
          addUserMessage={addUserMessage}
          handleDishNameInput={handleDishNameInput}
        />

        {foodContext.conversationState === 'schedule_event' && (
          <EventScheduler
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            eventNotes={eventNotes}
            setEventNotes={setEventNotes}
          />
        )}

        <div ref={messagesEndRef} />

        <ChatInput
          input={input}
          setInput={setInput}
          isProcessing={isProcessing}
          foodContext={foodContext}
          onSubmit={handleSubmit}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AIFoodAssistant;
