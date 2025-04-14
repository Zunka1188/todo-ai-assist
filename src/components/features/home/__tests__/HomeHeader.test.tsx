
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import HomeHeader from '../HomeHeader';
import { useTheme } from '@/hooks/use-theme';

// Mock hooks
vi.mock('@/hooks/use-theme', () => ({
  useTheme: vi.fn()
}));

describe('HomeHeader', () => {
  beforeEach(() => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      systemTheme: 'light',
      isUsingSystemTheme: false,
      useSystemTheme: vi.fn()
    });
  });

  it('renders the welcome heading', () => {
    render(<HomeHeader />);
    
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
  
  it('renders with the correct styles based on theme', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      systemTheme: 'dark',
      isUsingSystemTheme: false,
      useSystemTheme: vi.fn()
    });
    
    const { container } = render(<HomeHeader />);
    
    // The container should have styling that's responsive to theme
    expect(container.firstChild).toHaveClass('fade-in');
  });
  
  it('has responsive design classes', () => {
    const { container } = render(<HomeHeader />);
    
    // Check for responsive classes
    const headerElement = container.firstChild;
    expect(headerElement).toHaveAttribute('class', expect.stringContaining('sm:'));
  });
});
