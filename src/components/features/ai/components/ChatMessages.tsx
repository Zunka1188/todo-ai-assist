import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatMessage } from '../types';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={cn(
          "flex items-start",
          message.role === 'user' && "justify-end"
        )}>
          <div className={cn(
            "px-3 py-2 rounded-lg max-w-[85%]",
            message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-secondary"
          )}>
            <p>{message.content}</p>
            {message.imageUrl && (
              <img 
                src={message.imageUrl} 
                alt="Message attachment" 
                className="mt-2 rounded-md max-w-full h-auto"
              />
            )}
            {message.buttons && message.buttons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.buttons.map((button) => (
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
    </div>
  );
};
