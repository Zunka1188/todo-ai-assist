
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import RecipeSearch from '@/components/features/ai/RecipeSearch';

// Mock recipe data
const mockRecipes = [
  { 
    id: '1', 
    title: 'Spaghetti Carbonara', 
    cuisine: 'italian',
    ingredients: ['pasta', 'eggs', 'cheese', 'bacon'],
    preparationTime: 20,
    cookingTime: 15,
    servings: 4
  },
  { 
    id: '2', 
    title: 'Chicken Curry', 
    cuisine: 'indian',
    ingredients: ['chicken', 'curry paste', 'coconut milk'],
    preparationTime: 15,
    cookingTime: 30,
    servings: 4
  }
];

// Mock hooks
vi.mock('@/hooks/useRecipes', () => ({
  useRecipes: () => ({
    recipes: mockRecipes,
    isLoading: false,
    error: null,
    searchRecipes: vi.fn((query) => {
      return mockRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        recipe.ingredients.some(i => i.toLowerCase().includes(query.toLowerCase())) ||
        recipe.cuisine.toLowerCase().includes(query.toLowerCase())
      );
    })
  })
}));

// Mock router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ to, children }: { to: string, children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  )
}));

describe('RecipeSearch Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock onSelectRecipe function
  const mockOnSelectRecipe = vi.fn();

  it('renders the search input', () => {
    render(<RecipeSearch onSelectRecipe={mockOnSelectRecipe} />);
    expect(screen.getByPlaceholderText(/search recipes/i)).toBeInTheDocument();
  });

  it('displays recipes on initial load', () => {
    render(<RecipeSearch onSelectRecipe={mockOnSelectRecipe} />);
    expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
    expect(screen.getByText('Chicken Curry')).toBeInTheDocument();
  });

  it('filters recipes when searching by name', async () => {
    render(<RecipeSearch onSelectRecipe={mockOnSelectRecipe} />);
    
    const searchInput = screen.getByPlaceholderText(/search recipes/i);
    fireEvent.change(searchInput, { target: { value: 'carbonara' } });
    
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
      expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument();
    });
  });

  it('filters recipes when searching by ingredient', async () => {
    render(<RecipeSearch onSelectRecipe={mockOnSelectRecipe} />);
    
    const searchInput = screen.getByPlaceholderText(/search recipes/i);
    fireEvent.change(searchInput, { target: { value: 'chicken' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Spaghetti Carbonara')).not.toBeInTheDocument();
      expect(screen.getByText('Chicken Curry')).toBeInTheDocument();
    });
  });

  it('filters recipes when searching by cuisine', async () => {
    render(<RecipeSearch onSelectRecipe={mockOnSelectRecipe} />);
    
    const searchInput = screen.getByPlaceholderText(/search recipes/i);
    fireEvent.change(searchInput, { target: { value: 'italian' } });
    
    await waitFor(() => {
      expect(screen.getByText('Spaghetti Carbonara')).toBeInTheDocument();
      expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument();
    });
  });

  it('shows no results message when no recipes match search', async () => {
    render(<RecipeSearch onSelectRecipe={mockOnSelectRecipe} />);
    
    const searchInput = screen.getByPlaceholderText(/search recipes/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistentrecipe' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Spaghetti Carbonara')).not.toBeInTheDocument();
      expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument();
      expect(screen.getByText(/no recipes found/i)).toBeInTheDocument();
    });
  });
});
