
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RecipePage from '../RecipePage';
import { customRender } from '@/test-utils';

// Mock the useParams hook to return a recipe ID
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '123' }),
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the recipe service
vi.mock('@/services/RecipeService', () => ({
  getRecipeById: vi.fn().mockResolvedValue({
    id: '123',
    title: 'Test Recipe',
    description: 'A test recipe description',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    instructions: ['Step 1', 'Step 2'],
    cookTime: 30,
    prepTime: 15,
    servings: 4,
    cuisine: 'Italian',
    image: 'test-image.jpg'
  })
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('RecipePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders loading state initially', async () => {
    render(<RecipePage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('renders recipe details after loading', async () => {
    render(<RecipePage />);
    
    // Wait for the recipe to load
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('A test recipe description')).toBeInTheDocument();
    expect(screen.getByText('Ingredient 1')).toBeInTheDocument();
    expect(screen.getByText('Ingredient 2')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('30 mins')).toBeInTheDocument();
    expect(screen.getByText('15 mins')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });
  
  it('handles error state', async () => {
    // Override the mock to simulate an error
    vi.mocked(require('@/services/RecipeService').getRecipeById).mockRejectedValueOnce(
      new Error('Failed to fetch recipe')
    );
    
    render(<RecipePage />);
    
    // Wait for the error state
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/failed to fetch recipe/i)).toBeInTheDocument();
  });
  
  it('allows saving recipe to favorites', async () => {
    render(<RecipePage />);
    
    // Wait for the recipe to load
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
    
    // Find and click the save button
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Verify the toast was called
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
});
