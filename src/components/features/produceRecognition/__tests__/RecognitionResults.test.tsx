
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RecognitionResults from '../RecognitionResults';

// Mock necessary hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('RecognitionResults', () => {
  const mockResults = {
    image: 'test-image-url',
    items: [
      { label: 'Apple', confidence: 0.95 },
      { label: 'Banana', confidence: 0.85 }
    ]
  };
  
  const mockOnSave = vi.fn();
  const mockOnRetry = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders recognition results correctly', () => {
    render(
      <RecognitionResults 
        results={mockResults}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
      />
    );
    
    // Should show the detected items
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    
    // Should show confidence levels
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    
    // Should show save and retry buttons
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
  
  it('calls onSave when save button is clicked', () => {
    render(
      <RecognitionResults 
        results={mockResults}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    expect(mockOnSave).toHaveBeenCalledWith(mockResults);
  });
  
  it('calls onRetry when retry button is clicked', () => {
    render(
      <RecognitionResults 
        results={mockResults}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    
    expect(mockOnRetry).toHaveBeenCalled();
  });
  
  it('handles empty results gracefully', () => {
    render(
      <RecognitionResults 
        results={{ image: 'test-image-url', items: [] }}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
      />
    );
    
    expect(screen.getByText(/no items detected/i)).toBeInTheDocument();
  });
  
  it('displays the captured image', () => {
    render(
      <RecognitionResults 
        results={mockResults}
        onSave={mockOnSave}
        onRetry={mockOnRetry}
      />
    );
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test-image-url');
  });
});
