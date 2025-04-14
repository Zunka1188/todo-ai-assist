
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RecognitionResults from '../RecognitionResults';

// Mock necessary hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('RecognitionResults', () => {
  const mockItem = {
    name: 'Apple',
    confidence: 0.95,
    price: 1.99,
    weightGrams: 185,
    nutritionData: {
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3
    },
    imageUrl: 'test-image-url'
  };
  
  const mockOnEdit = vi.fn();
  const mockOnConfirm = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders recognition results correctly', () => {
    render(
      <RecognitionResults 
        item={mockItem}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Should show the detected item
    expect(screen.getByText('Apple')).toBeInTheDocument();
    
    // Should show confidence level
    expect(screen.getByText('95% - High Confidence')).toBeInTheDocument();
    
    // Should show edit and confirm buttons
    expect(screen.getByRole('button', { name: /override/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    render(
      <RecognitionResults 
        item={mockItem}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /override/i }));
    
    expect(mockOnEdit).toHaveBeenCalled();
  });
  
  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <RecognitionResults 
        item={mockItem}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    
    expect(mockOnConfirm).toHaveBeenCalled();
  });
  
  it('displays price information correctly', () => {
    render(
      <RecognitionResults 
        item={mockItem}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Check price is displayed
    expect(screen.getByText('$1.99')).toBeInTheDocument();
    
    // Check weight information is displayed
    expect(screen.getByText('185g')).toBeInTheDocument();
  });
  
  it('displays nutrition information correctly', () => {
    render(
      <RecognitionResults 
        item={mockItem}
        onEdit={mockOnEdit}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Check nutrition data is displayed
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('0.5g')).toBeInTheDocument();
  });
});
