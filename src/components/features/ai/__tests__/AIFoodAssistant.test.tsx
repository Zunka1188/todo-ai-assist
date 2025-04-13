import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIFoodAssistant from '../AIFoodAssistant';

describe('AIFoodAssistant', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AIFoodAssistant isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('AI Food Assistant')).toBeInTheDocument();
  });

  it('handles chat input correctly', () => {
    render(<AIFoodAssistant isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(screen.getByRole('region', { name: 'Chat input' }));
    expect(input).toHaveValue('');
  });

  it('shows recipe search when in recipe_search state', () => {
    render(<AIFoodAssistant isOpen={true} onClose={mockOnClose} />);
    // Trigger recipe search state
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'I want to cook something' } });
    fireEvent.submit(screen.getByRole('region', { name: 'Chat input' }));
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('handles dietary restrictions correctly', () => {
    render(<AIFoodAssistant isOpen={true} onClose={mockOnClose} />);
    const veganCheckbox = screen.getByLabelText('Vegan');
    fireEvent.click(veganCheckbox);
    expect(veganCheckbox).toBeChecked();
  });

  it('closes when close button is clicked', () => {
    render(<AIFoodAssistant isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
