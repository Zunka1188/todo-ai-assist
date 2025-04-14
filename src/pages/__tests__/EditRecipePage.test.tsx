
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EditRecipePage from '../EditRecipePage';

// Mock necessary dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '123' }),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the recipe service
vi.mock('@/services/recipe.service', () => ({
  getRecipeById: vi.fn().mockResolvedValue({
    id: '123',
    title: 'Existing Recipe',
    description: 'An existing recipe description',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    instructions: ['Step 1', 'Step 2'],
    cookTime: 30,
    prepTime: 15,
    servings: 4,
    cuisine: 'Italian'
  }),
  updateRecipe: vi.fn().mockResolvedValue({ id: '123', title: 'Updated Recipe' })
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock the form component
vi.mock('@/components/features/recipe/RecipeForm', () => ({
  default: ({ initialData, onSubmit }: { initialData: any, onSubmit: (data: any) => void }) => (
    <div data-testid="recipe-form">
      <div data-testid="form-initial-data">{JSON.stringify(initialData)}</div>
      <button 
        onClick={() => onSubmit({
          title: 'Updated Recipe',
          description: 'An updated recipe description',
          ingredients: ['Ingredient 1', 'Ingredient 2', 'New Ingredient'],
          instructions: ['Updated Step 1', 'Step 2'],
          cookTime: 25,
          prepTime: 15,
          servings: 6,
          cuisine: 'Italian'
        })}
      >
        Submit Form
      </button>
    </div>
  )
}));

describe('EditRecipePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('loads existing recipe data', async () => {
    render(<EditRecipePage />);
    
    // Check loading state first
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('recipe-form')).toBeInTheDocument();
    });
    
    // Check if initial data was passed correctly to the form
    const formDataElement = screen.getByTestId('form-initial-data');
    expect(formDataElement.textContent).toContain('Existing Recipe');
  });
  
  it('handles form submission and updates recipe', async () => {
    render(<EditRecipePage />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByTestId('recipe-form')).toBeInTheDocument();
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Form'));
    
    // Check if updateRecipe was called with the right data
    await waitFor(() => {
      expect(require('@/services/recipe.service').updateRecipe).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          title: 'Updated Recipe',
          description: 'An updated recipe description'
        })
      );
    });
    
    // Check for successful navigation
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/123');
    
    // Check toast notification
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
  
  it('handles errors during recipe loading', async () => {
    // Override the mock to simulate an error
    vi.mocked(require('@/services/recipe.service').getRecipeById).mockRejectedValueOnce(
      new Error('Failed to load recipe')
    );
    
    render(<EditRecipePage />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/failed to load recipe/i)).toBeInTheDocument();
  });
  
  it('handles errors during recipe update', async () => {
    // First render normally
    render(<EditRecipePage />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByTestId('recipe-form')).toBeInTheDocument();
    });
    
    // Override the mock to simulate an error on update
    vi.mocked(require('@/services/recipe.service').updateRecipe).mockRejectedValueOnce(
      new Error('Failed to update recipe')
    );
    
    // Submit the form
    fireEvent.click(screen.getByText('Submit Form'));
    
    // Check for error toast
    await waitFor(() => {
      expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive'
        })
      );
    });
    
    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
