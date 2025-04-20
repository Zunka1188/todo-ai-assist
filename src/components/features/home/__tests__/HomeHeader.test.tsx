
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { vi } from 'vitest';
import HomeHeader from '../HomeHeader';
import { useTheme } from '@/hooks/use-theme';

// Mock hooks
vi.mock('@/hooks/use-theme', () => ({
  useTheme: vi.fn(),
}));

describe('HomeHeader', () => {
  beforeEach(() => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      systemTheme: 'light',
      isUsingSystemTheme: false,
      useSystemTheme: vi.fn(),
    });
  });

  it('renders the welcome heading', () => {
    render(
      <ThemeProvider attribute="class">
        <HomeHeader />
      </ThemeProvider>
    );
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('renders with the correct styles based on theme', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
      systemTheme: 'dark',
      isUsingSystemTheme: false,
      useSystemTheme: vi.fn(),
    });
    render(
      <ThemeProvider attribute="class">
        <HomeHeader />
      </ThemeProvider>
    );
    // The heading should have the 'text-white' class in dark mode
    expect(screen.getByRole('heading')).toHaveClass('text-white');
  });
});

