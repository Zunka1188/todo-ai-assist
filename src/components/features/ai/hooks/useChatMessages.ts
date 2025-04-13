import React, { useState, useMemo } from 'react';
import { ChatMessage, ButtonOption } from '../types';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const addAssistantMessage = (content: string, imageUrl?: string, buttons?: ButtonOption[]) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      imageUrl,
      buttons
    }]);
  };

  const resetMessages = () => {
    setMessages([]);
  };

  return {
    messages: memoizedMessages,
    isTyping,
    setIsTyping,
    addUserMessage,
    addAssistantMessage,
    resetMessages,
  };
};
