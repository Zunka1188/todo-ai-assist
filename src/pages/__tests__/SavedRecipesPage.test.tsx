
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SavedRecipesPage from '../SavedRecipesPage';
import { customRender } from '@/test-utils';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock the recipe service
vi.mock('@/services/userRecipeService', () => ({
  getSavedRecipes: vi.fn().mockResolvedValue([
    {
      id: '123',
      title: 'Saved Recipe 1',
      description: 'A saved recipe description',
      image: 'recipe1.jpg',
      cuisine: 'Italian',
      prepTime: 15,
      cookTime: 30,
      savedAt: '2023-01-01T12:00:00Z'
    },
    {
      id: '456',
      title: 'Saved Recipe 2',
      description: 'Another saved recipe description',
      image: 'recipe2.jpg',
      cuisine: 'Mexican',
      prepTime: 10,
      cookTime: 20,
      savedAt: '2023-01-02T12:00:00Z'
    }
  ]),
  removeFromSaved: vi.fn().mockResolvedValue(true)
}));

// Mock the saved recipes list component
vi.mock('@/components/features/recipe/SavedRecipesList', () => ({
  default: ({ recipes, onRecipeClick, onRemove }: { 
    recipes: any[], 
    onRecipeClick: (id: string) => void, 
    onRemove: (id: string) => void 
  }) => (
    <div data-testid="saved-recipes-list">
      {recipes.map(recipe => (
        <div key={recipe.id} data-testid={`recipe-item-${recipe.id}`}>
          <h3>{recipe.title}</h3>
          <button onClick={() => onRecipeClick(recipe.id)}>View</button>
          <button onClick={() => onRemove(recipe.id)}>Remove</button>
        </div>
      ))}
    </div>
  )
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('SavedRecipesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders loading state initially', () => {
    render(<SavedRecipesPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('renders saved recipes after loading', async () => {
    render(<SavedRecipesPage />);
    
    // Wait for the recipes to load
    await waitFor(() => {
      expect(screen.getByTestId('saved-recipes-list')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Saved Recipe 1')).toBeInTheDocument();
    expect(screen.getByText('Saved Recipe 2')).toBeInTheDocument();
  });
  
  it('handles empty state', async () => {
    // Override the mock to return empty array
    vi.mocked(require('@/services/userRecipeService').getSavedRecipes).mockResolvedValueOnce([]);
    
    render(<SavedRecipesPage />);
    
    // Wait for the empty state
    await waitFor(() => {
      expect(screen.getByText(/no saved recipes/i)).toBeInTheDocument();
    });
  });
  
  it('navigates to recipe details when clicked', async () => {
    render(<SavedRecipesPage />);
    
    // Wait for the recipes to load
    await waitFor(() => {
      expect(screen.getByTestId('saved-recipes-list')).toBeInTheDocument();
    });
    
    // Find and click the view button for the first recipe
    const viewButton = screen.getAllByText('View')[0];
    fireEvent.click(viewButton);
    
    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/123');
  });
  
  it('handles removing saved recipe', async () => {
    render(<SavedRecipesPage />);
    
    // Wait for the recipes to load
    await waitFor(() => {
      expect(screen.getByTestId('saved-recipes-list')).toBeInTheDocument();
    });
    
    // Find and click the remove button for the second recipe
    const removeButton = screen.getAllByText('Remove')[1];
    fireEvent.click(removeButton);
    
    // Check if removeFromSaved was called
    expect(require('@/services/userRecipeService').removeFromSaved).toHaveBeenCalledWith('456');
    
    // Check toast notification
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
  
  it('handles error state', async () => {
    // Override the mock to simulate an error
    vi.mocked(require('@/services/userRecipeService').getSavedRecipes).mockRejectedValueOnce(
      new Error('Failed to fetch saved recipes')
    );
    
    render(<SavedRecipesPage />);
    
    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/failed to fetch saved recipes/i)).toBeInTheDocument();
    
    // Check for retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });
});
