
import React, { useRef, useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Recipe } from '@/data/recipes/types';
import RecipeSearch from './RecipeSearch';
import { DietaryCheckboxes } from './components/DietaryCheckboxes';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';
import { EventScheduler } from './components/EventScheduler';
import { DIETARY_OPTIONS } from './constants';
import { AIFoodAssistantProps, DietaryOption, FoodContext } from './types';
import { useChatMessages } from './hooks/useChatMessages';

const AIFoodAssistant: React.FC<AIFoodAssistantProps> = ({ isOpen, onClose }) => {
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
    const messageEnd = messagesEndRef.current;
    if (messageEnd) {
      messageEnd.scrollIntoView({ behavior: 'smooth' });
    }
    return () => {
      // Cleanup scroll listener if needed
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

    // Process user input based on context
    setTimeout(() => {
      setIsProcessing(false);
      // Add response logic here
    }, 1000);
  };

  const handleDishNameInput = () => {
    setFoodContext(prev => ({
      ...prev,
      conversationState: 'recipe_search'
    }));
  };

  const handleRecipeSelection = (recipe: Recipe) => {
    addUserMessage(`I want to make ${recipe.name}`);
    setFoodContext(prev => ({
      ...prev,
      dishName: recipe.name,
      selectedRecipe: recipe,
      conversationState: 'serving_size'
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
          <div className="flex items-start w-full">
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
          setOptions={setDietaryOptions}
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
