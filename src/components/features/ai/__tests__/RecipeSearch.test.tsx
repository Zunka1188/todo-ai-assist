
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecipeSearch from '../RecipeSearch';
import { Recipe } from '@/data/recipes/types';
import { useTheme } from '@/hooks/use-theme';

// Mock the hooks and modules
vi.mock('@/hooks/use-theme', () => ({
  useTheme: vi.fn().mockReturnValue({ theme: 'light', setTheme: vi.fn() })
}));

// Mock recipes data
vi.mock('@/data/recipes', () => ({
  recipes: [
    {
      id: '1',
      name: 'Test Recipe 1',
      category: 'main',
      cuisine: 'italian',
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      ingredients: [],
      instructions: [],
      dietaryInfo: {
        isVegan: false,
        isVegetarian: true,
        isGlutenFree: true,
        isDairyFree: false,
        isLowCarb: false,
        isNutFree: true
      }
    },
    {
      id: '2',
      name: 'Test Recipe 2',
      category: 'breakfast',
      cuisine: 'french',
      prepTime: 10,
      cookTime: 5,
      servings: 2,
      ingredients: [],
      instructions: [],
      dietaryInfo: {
        isVegan: true,
        isVegetarian: true,
        isGlutenFree: true,
        isDairyFree: true,
        isLowCarb: false,
        isNutFree: false
      }
    }
  ]
}));

describe('RecipeSearch Component', () => {
  const onSelectRecipeMock = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders search input and servings control', () => {
    render(<RecipeSearch onSelectRecipe={onSelectRecipeMock} selectedDietaryRestrictions={[]} />);
    
    expect(screen.getByPlaceholderText('Search for recipes...')).toBeInTheDocument();
    expect(screen.getByText('Servings:')).toBeInTheDocument();
    expect(screen.getByText('4 people')).toBeInTheDocument();
  });
  
  it('shows recipe list with correct details', async () => {
    render(<RecipeSearch onSelectRecipe={onSelectRecipeMock} selectedDietaryRestrictions={[]} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
      expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();
      expect(screen.getByText('Italian • 40 mins')).toBeInTheDocument();
      expect(screen.getByText('French • 15 mins')).toBeInTheDocument();
    });
  });
  
  it('filters recipes based on search term', async () => {
    render(<RecipeSearch onSelectRecipe={onSelectRecipeMock} selectedDietaryRestrictions={[]} />);
    
    const searchInput = screen.getByPlaceholderText('Search for recipes...');
    fireEvent.change(searchInput, { target: { value: 'Recipe 1' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Recipe 2')).not.toBeInTheDocument();
    });
  });
  
  it('filters recipes based on dietary restrictions', async () => {
    render(<RecipeSearch onSelectRecipe={onSelectRecipeMock} selectedDietaryRestrictions={['vegan']} />);
    
    // Open the filter
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Test Recipe 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Recipe 2')).toBeInTheDocument();
    });
  });
  
  it('calls onSelectRecipe when a recipe is clicked', async () => {
    render(<RecipeSearch onSelectRecipe={onSelectRecipeMock} selectedDietaryRestrictions={[]} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Test Recipe 1'));
    
    expect(onSelectRecipeMock).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      name: 'Test Recipe 1',
      servings: 4
    }));
  });
  
  it('adjusts servings and passes to selected recipe', async () => {
    render(<RecipeSearch onSelectRecipe={onSelectRecipeMock} selectedDietaryRestrictions={[]} />);
    
    // Increase servings to 6
    const increaseButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    
    expect(screen.getByText('6 people')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Test Recipe 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Test Recipe 1'));
    
    expect(onSelectRecipeMock).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      servings: 6
    }));
  });
});
