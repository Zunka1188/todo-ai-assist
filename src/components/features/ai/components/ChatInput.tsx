
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FoodContext } from '../types';
import { sanitizeTextInput } from '@/utils/input-validation';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isProcessing: boolean;
  foodContext: FoodContext;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isProcessing,
  foodContext,
  onSubmit,
}) => {
  const isDisabled = isProcessing || ['dietary_restrictions', 'schedule_event'].includes(foodContext.conversationState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize input in real-time as user types
    setInput(sanitizeTextInput(e.target.value, 500));
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        // Additional sanitization before submission
        const sanitizedInput = sanitizeTextInput(input, 500);
        setInput(sanitizedInput);
        if (sanitizedInput.trim()) {
          onSubmit(e);
        }
      }}
      className="border-t p-4 flex gap-2"
      role="region"
      aria-label="Chat input"
    >
      <Input
        placeholder="Type a message..."
        value={input}
        onChange={handleInputChange}
        className="flex-grow"
        disabled={isDisabled}
        aria-label="Chat message"
        maxLength={500}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // Apply sanitization before submission with Enter key
            const sanitizedInput = sanitizeTextInput(input, 500);
            setInput(sanitizedInput);
            if (sanitizedInput.trim()) {
              onSubmit(e as any);
            }
          }
        }}
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={!input.trim() || isDisabled}
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
};
