
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RecipeCollectionPage from '../RecipeCollectionPage';
import { customRender } from '@/test-utils';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ cuisine: 'italian' })
}));

// Mock the recipe data
vi.mock('@/data/recipes', () => ({
  recipes: {
    italian: [
      {
        id: 'italian-1',
        title: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta dish',
        ingredients: ['Pasta', 'Eggs', 'Pecorino cheese'],
        instructions: ['Boil pasta', 'Mix ingredients'],
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        cuisine: 'italian',
        image: 'carbonara.jpg'
      },
      {
        id: 'italian-2',
        title: 'Margherita Pizza',
        description: 'Traditional pizza from Naples',
        ingredients: ['Dough', 'Tomatoes', 'Mozzarella'],
        instructions: ['Prepare dough', 'Add toppings', 'Bake'],
        prepTime: 20,
        cookTime: 10,
        servings: 2,
        cuisine: 'italian',
        image: 'pizza.jpg'
      }
    ]
  }
}));

// Mock the useRecipes hook
vi.mock('@/hooks/useRecipes', () => ({
  useRecipes: () => ({
    getRecipesByCuisine: (cuisine: string) => {
      const recipes = require('@/data/recipes').recipes;
      return recipes[cuisine] || [];
    },
    isLoading: false,
    error: null
  })
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('RecipeCollectionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the page with cuisine title', () => {
    render(<RecipeCollectionPage />);
    
    expect(screen.getByText('Italian Recipes')).toBeInTheDocument();
  });
  
  it('displays all recipes for the cuisine', () => {
    render(<RecipeCollectionPage />);
    
    expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    expect(screen.getByText('Classic Italian pasta dish')).toBeInTheDocument();
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('Traditional pizza from Naples')).toBeInTheDocument();
  });
  
  it('navigates to recipe details when a recipe is clicked', () => {
    render(<RecipeCollectionPage />);
    
    // Find and click the first recipe
    const recipeCard = screen.getByText('Spaghetti Carbonara').closest('div');
    fireEvent.click(recipeCard!);
    
    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith('/recipes/italian-1');
  });
  
  it('handles loading state', async () => {
    // Override the mock to simulate loading
    vi.mock('@/hooks/useRecipes', () => ({
      useRecipes: () => ({
        getRecipesByCuisine: () => [],
        isLoading: true,
        error: null
      })
    }), { virtual: true });
    
    render(<RecipeCollectionPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('handles error state', async () => {
    // Override the mock to simulate an error
    vi.mock('@/hooks/useRecipes', () => ({
      useRecipes: () => ({
        getRecipesByCuisine: () => [],
        isLoading: false,
        error: 'Failed to fetch recipes'
      })
    }), { virtual: true });
    
    render(<RecipeCollectionPage />);
    
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch recipes/i)).toBeInTheDocument();
  });
  
  it('handles empty recipe collection', async () => {
    // Override the params mock to return a cuisine with no recipes
    vi.mocked(require('react-router-dom').useParams).mockReturnValueOnce({ cuisine: 'unknown' });
    
    render(<RecipeCollectionPage />);
    
    expect(screen.getByText(/no recipes found/i)).toBeInTheDocument();
  });
  
  it('allows filtering recipes by keyword', () => {
    render(<RecipeCollectionPage />);
    
    // Find and use the search input
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Pizza' } });
    
    // Should only show the pizza recipe
    expect(screen.queryByText('Spaghetti Carbonara')).not.toBeInTheDocument();
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
  });
});
