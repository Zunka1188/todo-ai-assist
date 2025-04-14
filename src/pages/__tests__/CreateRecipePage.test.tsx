import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CreateRecipePage from '../CreateRecipePage';
import { render as customRender } from '@/test-utils';

// Mock necessary dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the recipe service
vi.mock('@/services/recipe.service', () => ({
  createRecipe: vi.fn().mockResolvedValue({ id: '123', title: 'New Recipe' })
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock the form component
vi.mock('@/components/features/recipe/RecipeForm', () => ({
  default: ({ onSubmit }: { onSubmit: (data: any) => void }) => (
    <div data-testid="recipe-form">
      <button 
        onClick={() => onSubmit({
          title: 'New Recipe',
          description: 'A new recipe description',
          ingredients: ['Ingredient 1', 'Ingredient 2'],
          instructions: ['Step 1', 'Step 2'],
          cookTime: 30,
          prepTime: 15,
          servings: 4,
          cuisine: 'Italian',
        })}
      >
        Submit Form
      </button>
    </div>
  )
}));

describe('CreateRecipePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the page with form', () => {
    render(<CreateRecipePage />);
    
    expect(screen.getByText(/create new recipe/i)).toBeInTheDocument();
    expect(screen.getByTestId('recipe-form')).toBeInTheDocument();
  });
  
  it('handles form submission', async () => {
    render(<CreateRecipePage />);
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Form'));
    
    // Check if createRecipe was called with the right data
    await waitFor(() => {
      expect(require('@/services/recipe.service').createRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Recipe',
          description: 'A new recipe description',
        })
      );
    });
    
    // Check for successful navigation
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/123');
    
    // Check toast notification
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
  
  it('handles form submission errors', async () => {
    // Override the mock to simulate an error
    vi.mocked(require('@/services/recipe.service').createRecipe).mockRejectedValueOnce(
      new Error('Failed to create recipe')
    );
    
    render(<CreateRecipePage />);
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Form'));
    
    // Check for error toast
    await waitFor(() => {
      expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
        })
      );
    });
    
    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('navigates back when cancel is clicked', () => {
    render(<CreateRecipePage />);
    
    // Find and click the cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith('/recipes');
  });
});
