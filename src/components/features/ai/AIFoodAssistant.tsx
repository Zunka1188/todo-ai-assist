import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ScanBarcode, Send, X, RotateCcw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AIFoodAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatMessage = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Context types for the assistant
type FoodContext = {
  dishName?: string;
  servingSize?: number;
  lastUserIntent?: 'get_recipe' | 'get_ingredients' | 'add_to_shopping' | 'save_recipe' | 'identify_food';
  identifiedFood?: string;
  confirmationNeeded?: boolean;
};

const STORAGE_KEY = 'ai-food-assistant-session';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const AIFoodAssistant: React.FC<AIFoodAssistantProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'How would you like to start your food query?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [activeScanOption, setActiveScanOption] = useState<'camera' | 'upload' | 'barcode' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Store conversation context
  const [foodContext, setFoodContext] = useState<FoodContext>({});
  
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
    if (messages.length > 1 || Object.keys(foodContext).length > 0) {
      saveSession();
    }
  }, [messages, foodContext]);

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
            timestamp: new Date(msg.timestamp)
          }));
          
          setMessages(parsedMessages);
          setFoodContext(context);
          toast.success('Previous conversation restored', { 
            description: 'Continuing from where you left off' 
          });
        } else {
          // Session expired, clear storage
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
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

  const handleClose = () => {
    onClose();
    // Reset scan option when closing but preserve conversation
    setActiveScanOption(null);
  };

  const resetConversation = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Reset states
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'How would you like to start your food query?',
        timestamp: new Date(),
      },
    ]);
    setFoodContext({});
    setInput('');
    setActiveScanOption(null);
    setIsProcessing(false);
    
    toast.success('Started a new conversation', {
      description: 'Previous conversation history has been cleared'
    });
  };

  const processUserIntent = (userMessage: string) => {
    // This is a simple intent detection - would be replaced by the AI model
    let newContext = { ...foodContext };
    
    // Simple intent matching
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('recipe')) {
      newContext.lastUserIntent = 'get_recipe';
      
      // Try to extract dish name
      const dishMatch = lowerMessage.match(/(\w+)\s+recipe/);
      if (dishMatch && dishMatch[1]) {
        newContext.dishName = dishMatch[1];
      }
    } 
    else if (lowerMessage.includes('ingredients')) {
      newContext.lastUserIntent = 'get_ingredients';
      
      // Try to extract dish name and servings
      const dishMatch = lowerMessage.match(/ingredients\s+for\s+(\w+)/);
      if (dishMatch && dishMatch[1]) {
        newContext.dishName = dishMatch[1];
      }
      
      const servingMatch = lowerMessage.match(/for\s+(\d+)\s+people/);
      if (servingMatch && servingMatch[1]) {
        newContext.servingSize = parseInt(servingMatch[1]);
      }
    }
    else if (lowerMessage.includes('shopping')) {
      newContext.lastUserIntent = 'add_to_shopping';
    }
    else if (lowerMessage.includes('save')) {
      newContext.lastUserIntent = 'save_recipe';
    }
    
    // If a serving size is mentioned directly
    const servingMatch = lowerMessage.match(/(\d+)\s+people/);
    if (servingMatch && servingMatch[1]) {
      newContext.servingSize = parseInt(servingMatch[1]);
    }
    
    // Simple yes/no confirmation handling
    if (foodContext.confirmationNeeded) {
      if (lowerMessage.includes('yes') || lowerMessage.includes('yeah') || lowerMessage.includes('correct')) {
        // Confirm the previously identified food
        newContext.dishName = foodContext.identifiedFood;
        newContext.confirmationNeeded = false;
      } else if (lowerMessage.includes('no') || lowerMessage.includes('nope') || lowerMessage.includes('wrong')) {
        // Reset identification
        newContext.identifiedFood = undefined;
        newContext.confirmationNeeded = false;
      }
    }
    
    setFoodContext(newContext);
    return newContext;
  };

  const generateAssistantResponse = (context: FoodContext): string => {
    // This would be replaced by actual AI generation
    
    // If we're waiting for confirmation of identified food
    if (context.confirmationNeeded && context.identifiedFood) {
      return `I think this is ${context.identifiedFood} — is that right?`;
    }
    
    // If dish is known but servings are not
    if (context.dishName && !context.servingSize && 
        (context.lastUserIntent === 'get_recipe' || context.lastUserIntent === 'get_ingredients')) {
      return `Got it! How many servings would you like for ${context.dishName}?`;
    }
    
    // If we have dish name and serving size
    if (context.dishName && context.servingSize) {
      if (context.lastUserIntent === 'get_recipe') {
        return `Here's a ${context.dishName} recipe for ${context.servingSize} people! 🍝\n\n` + 
          `Ingredients:\n` + 
          `- 400g minced beef\n` + 
          `- 1 onion, diced\n` + 
          `- 2 cloves garlic, minced\n` + 
          `- 1 carrot, diced\n\n` +
          `Would you like to add these to your shopping list or save the recipe?`;
      } 
      else if (context.lastUserIntent === 'get_ingredients') {
        return `Sure! Here's what you'll need for ${context.servingSize} servings of ${context.dishName} 🍲\n\n` + 
          `- 400g minced beef\n` + 
          `- 1 onion, diced\n` + 
          `- 2 cloves garlic, minced\n` + 
          `- 1 carrot, diced\n\n` + 
          `Want to add this to your shopping list or save it for later?`;
      }
    }
    
    if (context.lastUserIntent === 'add_to_shopping') {
      return `I've added the ingredients for ${context.dishName || 'your dish'} to your shopping list! Is there anything else you'd like to do?`;
    }
    
    if (context.lastUserIntent === 'save_recipe') {
      return `I've saved this ${context.dishName || 'recipe'} to your documents. You can find it in your Recipe collection!`;
    }
    
    // Default response if no specific context is matched
    return "I'd be happy to help with your food query. Would you like a recipe, ingredient list, or help with meal planning?";
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, newUserMessage]);
    setInput('');
    setIsProcessing(true);
    setIsTyping(true);
    
    // Process the message for intent and context
    setTimeout(() => {
      const updatedContext = processUserIntent(newUserMessage.content);
      
      // Add a small delay before showing the typing indicator
      setTimeout(() => {
        setIsTyping(false);
        
        // Generate response based on updated context
        const responseContent = generateAssistantResponse(updatedContext);
        
        const assistantResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantResponse]);
        setIsProcessing(false);
      }, 1500); // Simulate typing time
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleOptionClick = (option: 'camera' | 'upload' | 'barcode') => {
    setActiveScanOption(option);
    
    // Add user message indicating their choice
    const actionMap = {
      camera: 'take a picture',
      upload: 'upload an image',
      barcode: 'scan a barcode'
    };
    
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `I want to ${actionMap[option]}`,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newUserMessage]);
    setIsProcessing(true);
    
    // This is where we would integrate with actual scanning functionality
    // For now, we'll simulate the response
    setTimeout(() => {
      // Set context as if we've identified a food
      const updatedContext: FoodContext = {
        confirmationNeeded: true,
        identifiedFood: 'lasagna', // This would come from the AI image recognition
        lastUserIntent: 'identify_food'
      };
      
      setFoodContext(updatedContext);
      
      const assistantResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I think this is lasagna — is that right?`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantResponse]);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="left" 
        className={cn(
          "flex flex-col p-0 w-full sm:max-w-md",
          theme === 'dark' ? 'bg-background text-foreground' : 'bg-white'
        )}
        preventNavigateOnClose
      >
        <SheetHeader className="px-4 py-3 border-b flex justify-between items-center">
          <SheetTitle className="text-lg">Mr. Todoodle</SheetTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetConversation}
              className="h-8 px-2 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>New Chat</span>
            </Button>
          </div>
        </SheetHeader>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex max-w-[80%] mb-2 rounded-lg p-3 whitespace-pre-line",
                message.role === 'user' 
                  ? "ml-auto bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
          ))}
          
          {isProcessing && isTyping && (
            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse delay-150"></div>
                <div className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          )}
          
          {/* For auto-scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Action buttons when no scanning option is active */}
        {!activeScanOption && (
          <div className="p-4 space-y-3 border-t">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 flex-1"
                onClick={() => handleOptionClick('camera')}
              >
                <Camera className="h-4 w-4" />
                <span>Take a Picture</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 flex-1"
                onClick={() => handleOptionClick('upload')}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 flex-1"
                onClick={() => handleOptionClick('barcode')}
              >
                <ScanBarcode className="h-4 w-4" />
                <span>Scan Barcode</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your food query..."
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Show different UI based on active scanning option */}
        {activeScanOption && (
          <div className="p-4 space-y-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {activeScanOption === 'camera' && 'Take a Picture'}
                {activeScanOption === 'upload' && 'Upload an Image'}
                {activeScanOption === 'barcode' && 'Scan a Barcode'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveScanOption(null)}
              >
                <X className="h-4 w-4" />
                <span className="ml-2">Cancel</span>
              </Button>
            </div>
            
            {/* Placeholder for actual functionality integration */}
            <div className="bg-muted h-64 rounded-md flex items-center justify-center">
              {activeScanOption === 'camera' && (
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>Camera integration will go here</p>
                </div>
              )}
              
              {activeScanOption === 'upload' && (
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>File upload integration will go here</p>
                </div>
              )}
              
              {activeScanOption === 'barcode' && (
                <div className="text-center">
                  <ScanBarcode className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>Barcode scanner integration will go here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AIFoodAssistant;
