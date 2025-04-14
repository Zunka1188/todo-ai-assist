
import React, { useState, useMemo } from 'react';
import { ChatMessage, MessageAction } from '../types';

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

  const addAssistantMessage = (content: string, image?: string, actions?: MessageAction[]) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      image,
      actions
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
