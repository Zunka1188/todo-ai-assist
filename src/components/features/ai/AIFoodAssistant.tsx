
import React, { useRef, useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import RecipeSearch from './RecipeSearch';
import { DietaryCheckboxes } from './components/DietaryCheckboxes';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';
import { EventScheduler } from './components/EventScheduler';
import { DIETARY_OPTIONS } from './constants';
import { AIFoodAssistantProps, DietaryOption, FoodContext, DietaryRestrictionType } from './types';
import { useChatMessages } from './hooks/useChatMessages';
import { Recipe } from '@/types/recipe';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setTimeout(() => {
        addAssistantMessage(
          "👋 Hi there! I'm your AI Food Assistant. I can help you find recipes, plan meals, and answer cooking questions. What would you like to cook today?"
        );
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    addUserMessage(input);
    setInput('');
    setIsProcessing(true);
    setIsTyping(true);

    // Process user input based on context
    setTimeout(() => {
      setIsProcessing(false);
      setIsTyping(false);

      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('recipe') || lowerInput.includes('cook') || lowerInput.includes('make')) {
        // User is looking for recipes
        addAssistantMessage("Great! Let's find some recipes. Please tell me what dish you're interested in making, or just browse our options below.");
        setFoodContext(prev => ({
          ...prev,
          conversationState: 'recipe_search'
        }));
      } else if (lowerInput.includes('diet') || lowerInput.includes('vegan') || lowerInput.includes('vegetarian')) {
        // User asking about dietary restrictions
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
        // General response
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
  };

  const handleDishNameInput = () => {
    setFoodContext(prev => ({
      ...prev,
      conversationState: 'recipe_search'
    }));
    addAssistantMessage("What kind of dish would you like to make? You can search below or tell me.");
  };

  const handleRecipeSelection = (recipe: Recipe) => {
    addUserMessage(`I want to make ${recipe.name}`);
    
    setFoodContext(prev => ({
      ...prev,
      dishName: recipe.name,
      selectedRecipe: recipe,
      conversationState: 'serving_size'
    }));
    
    // Show recipe details
    setTimeout(() => {
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
    }, 500);
  };

  const showRecipeDetails = (recipe: Recipe) => {
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
${Object.values(recipe.ingredients.default)
  .map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name}`)
  .join("\n")}

### Instructions:
${recipe.instructions.map((step, i) => `${i+1}. ${step}`).join("\n")}
    `;
    
    addAssistantMessage(recipeDetails, recipe.image);
  };

  const saveRecipe = (recipe: Recipe) => {
    // Simulate saving the recipe
    setFoodContext(prev => ({
      ...prev,
      recipeSaved: true
    }));
    
    toast({
      title: "Recipe Saved",
      description: `${recipe.name} has been added to your saved recipes.`,
    });
    
    addAssistantMessage(`I've saved ${recipe.name} to your recipe collection. You can access it anytime from your saved recipes.`);
  };

  const handleDietaryChange = (options: DietaryOption[]) => {
    setDietaryOptions(options);
    
    const selectedDiets: DietaryRestrictionType[] = options
      .filter(option => option.checked)
      .map(option => option.id);
      
    setFoodContext(prev => ({
      ...prev,
      dietaryRestrictions: selectedDiets
    }));
  };

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

        <ChatMessages messages={messages} isTyping={isTyping} />

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
