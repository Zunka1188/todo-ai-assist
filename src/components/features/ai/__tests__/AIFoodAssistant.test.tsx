import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock scrollIntoView for JSDOM
global.HTMLElement.prototype.scrollIntoView = vi.fn();
import { ThemeProvider } from 'next-themes';
import '@testing-library/jest-dom';
import AIFoodAssistant from '../AIFoodAssistant';
import { expect, vi, describe, beforeEach, it } from 'vitest';

// Mock the Toast provider since it might be used in the component
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock any other dependencies that might cause test failures
vi.mock('@/types/recipe', () => ({
  Recipe: {},
}));

describe('AIFoodAssistant', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider attribute="class">
        <AIFoodAssistant isOpen={true} onClose={mockOnClose} />
      </ThemeProvider>
    );
    expect(screen.getByText('AI Food Assistant')).toBeInTheDocument();
  });

  it('handles chat input correctly', () => {
    render(
      <ThemeProvider attribute="class">
        <AIFoodAssistant isOpen={true} onClose={mockOnClose} />
      </ThemeProvider>
    );
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(screen.getByRole('region', { name: 'Chat input' }));
    expect(input).toHaveValue('');
  });

  it('shows recipe search when in recipe_search state', () => {
    render(
      <AIFoodAssistant
        isOpen={true}
        onClose={mockOnClose}
        initialFoodContext={{
          conversationState: 'recipe_search',
          dietaryRestrictions: [],
          ingredientsAdded: false,
          recipeSaved: false,
          eventScheduled: false
        }}
      />
    );
    // Now expect the searchbox to appear
    expect(screen.queryByRole('searchbox')).not.toBeNull();
  });

  it('handles dietary restrictions correctly', () => {
    render(
      <ThemeProvider attribute="class">
        <AIFoodAssistant
          isOpen={true}
          onClose={mockOnClose}
          initialFoodContext={{
            conversationState: 'dietary_restrictions',
            dietaryRestrictions: [],
            ingredientsAdded: false,
            recipeSaved: false,
            eventScheduled: false
          }}
        />
      </ThemeProvider>
    );
    const veganCheckbox = screen.queryByLabelText('Vegan');
    expect(veganCheckbox).not.toBeNull();
    if (veganCheckbox) {
      fireEvent.click(veganCheckbox);
      expect(veganCheckbox).toBeChecked();
    }
  });

  it('closes when close button is clicked', () => {
    render(<AIFoodAssistant isOpen={true} onClose={mockOnClose} />);
    // Disambiguate by picking the first close button, or use test id if available
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBeGreaterThan(0);
    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
