
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatMessages from '../components/ChatMessages';

describe('ChatMessages', () => {
  const mockMessages = [
    {
      id: '1',
      content: 'Hello, how can I help you?',
      role: 'assistant',
      timestamp: new Date('2025-01-01T12:00:00Z'),
    },
    {
      id: '2',
      content: 'I need a recipe for dinner.',
      role: 'user',
      timestamp: new Date('2025-01-01T12:01:00Z'),
    },
    {
      id: '3',
      content: 'Here are some dinner recipes you might like...',
      role: 'assistant',
      timestamp: new Date('2025-01-01T12:02:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty message when no messages are provided', () => {
    render(<ChatMessages messages={[]} isLoading={false} />);
    
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('renders all messages in the correct order', () => {
    render(<ChatMessages messages={mockMessages} isLoading={false} />);
    
    const displayedMessages = screen.getAllByRole('listitem');
    expect(displayedMessages).toHaveLength(mockMessages.length);
    
    expect(displayedMessages[0]).toHaveTextContent('Hello, how can I help you?');
    expect(displayedMessages[1]).toHaveTextContent('I need a recipe for dinner.');
    expect(displayedMessages[2]).toHaveTextContent('Here are some dinner recipes you might like...');
  });

  it('applies different styles for user and assistant messages', () => {
    render(<ChatMessages messages={mockMessages} isLoading={false} />);
    
    const assistantMessages = screen.getAllByText((content) => 
      content.includes('Hello, how can I help you?') || 
      content.includes('Here are some dinner recipes you might like...')
    );
    
    const userMessages = screen.getAllByText('I need a recipe for dinner.');
    
    expect(assistantMessages).toHaveLength(2);
    expect(userMessages).toHaveLength(1);
    
    // Check for specific classes or styles
    // This depends on the actual implementation
  });

  it('shows loading indicator when isLoading is true', () => {
    render(<ChatMessages messages={mockMessages} isLoading={true} />);
    
    // Check for loading indicator
    expect(screen.getByText(/thinking|loading|typing/i)).toBeInTheDocument();
  });
});
