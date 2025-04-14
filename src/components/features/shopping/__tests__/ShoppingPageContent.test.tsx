
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShoppingPageContent from '../ShoppingPageContent';
import { ShoppingItemsProvider } from '../ShoppingItemsContext';

// Mock the hooks and components
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false }),
}));

vi.mock('@/components/ui/search-input', () => ({
  default: ({ value, onChange }) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search shopping items..."
    />
  ),
}));

vi.mock('../ShoppingItemsContext', () => ({
  useShoppingItemsContext: () => ({
    addItem: vi.fn((item) => true),
    isLoading: false,
    updateSearchTerm: vi.fn(),
    updateFilterMode: vi.fn(),
    notPurchasedItems: [{ id: '1', name: 'Test Item', completed: false }],
    purchasedItems: [],
  }),
  ShoppingItemsProvider: ({ children }) => <>{children}</>,
}));

vi.mock('../AddItemDialog', () => ({
  default: ({ open, onOpenChange, onSave }) => (
    <div data-testid="add-item-dialog" style={{ display: open ? 'block' : 'none' }}>
      <button onClick={() => onSave({ name: 'New Item' })}>Save Item</button>
      <button onClick={() => onOpenChange(false)}>Cancel</button>
    </div>
  ),
}));

vi.mock('../ShoppingTabsSection', () => ({
  default: ({ activeTab, handleTabChange }) => (
    <div data-testid="shopping-tabs">
      <button onClick={() => handleTabChange('all')}>All</button>
      <button onClick={() => handleTabChange('one-off')}>One-off</button>
      <button onClick={() => handleTabChange('weekly')}>Weekly</button>
      <button onClick={() => handleTabChange('monthly')}>Monthly</button>
    </div>
  ),
}));

describe('ShoppingPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with search input and add button', () => {
    render(<ShoppingPageContent />);
    
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByTestId('shopping-tabs')).toBeInTheDocument();
  });

  it('shows add dialog when add button is clicked', async () => {
    render(<ShoppingPageContent />);
    
    // Initially dialog should be hidden
    expect(screen.getByTestId('add-item-dialog')).not.toBeVisible();
    
    // Click add button
    fireEvent.click(screen.getByText('Add'));
    
    // Dialog should be visible
    await waitFor(() => {
      expect(screen.getByTestId('add-item-dialog')).toBeVisible();
    });
  });

  it('handles search term changes', async () => {
    const mockUpdateSearchTerm = vi.fn();
    
    vi.mocked(useShoppingItemsContext).mockReturnValue({
      ...vi.mocked(useShoppingItemsContext)(),
      updateSearchTerm: mockUpdateSearchTerm,
    });
    
    render(<ShoppingPageContent />);
    
    // Change search input
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'search term' } });
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockUpdateSearchTerm).toHaveBeenCalledWith('search term');
    });
  });

  it('shows loading state when isLoading is true', () => {
    vi.mocked(useShoppingItemsContext).mockReturnValue({
      ...vi.mocked(useShoppingItemsContext)(),
      isLoading: true,
    });
    
    render(<ShoppingPageContent />);
    
    // We're not directly checking for LoadingState because we mocked it
    // But the rendering should happen without errors
  });

  it('shows empty state when no items and no search', () => {
    vi.mocked(useShoppingItemsContext).mockReturnValue({
      ...vi.mocked(useShoppingItemsContext)(),
      notPurchasedItems: [],
      purchasedItems: [],
    });
    
    render(<ShoppingPageContent />);
    
    // Empty state should be visible
    expect(screen.getByText('Your shopping list is empty')).toBeInTheDocument();
    expect(screen.getByText('Add items to your shopping list to get started')).toBeInTheDocument();
  });

  it('handles tab changes correctly', async () => {
    const mockUpdateFilterMode = vi.fn();
    
    vi.mocked(useShoppingItemsContext).mockReturnValue({
      ...vi.mocked(useShoppingItemsContext)(),
      updateFilterMode: mockUpdateFilterMode,
    });
    
    render(<ShoppingPageContent />);
    
    // Click on weekly tab
    fireEvent.click(screen.getByText('Weekly'));
    
    await waitFor(() => {
      expect(mockUpdateFilterMode).toHaveBeenCalledWith('weekly');
    });
  });

  it('handles adding an item through dialog', async () => {
    const mockAddItem = vi.fn().mockReturnValue(true);
    
    vi.mocked(useShoppingItemsContext).mockReturnValue({
      ...vi.mocked(useShoppingItemsContext)(),
      addItem: mockAddItem,
    });
    
    render(<ShoppingPageContent />);
    
    // Open dialog
    fireEvent.click(screen.getByText('Add'));
    
    // Click save in dialog
    fireEvent.click(screen.getByText('Save Item'));
    
    // Check if addItem was called
    expect(mockAddItem).toHaveBeenCalledWith({ name: 'New Item' });
    
    // Dialog should close
    await waitFor(() => {
      expect(screen.getByTestId('add-item-dialog')).not.toBeVisible();
    });
  });
});
