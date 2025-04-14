
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import WeatherPage from '@/pages/WeatherPage';
import { WeatherWidget } from '@/components/widgets/WidgetsIndex';
import { mockUseToast, mockUseNavigate, render as testRender } from '@/test-utils';

// Mock the WeatherWidget component
vi.mock('@/components/widgets/WidgetsIndex', () => ({
  WeatherWidget: vi.fn(() => <div data-testid="weather-widget">Mocked Weather Widget</div>)
}));

// Mock the useTheme hook
vi.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
    setTheme: vi.fn(),
    systemTheme: 'light',
    isUsingSystemTheme: false,
    useSystemTheme: vi.fn()
  })
}));

describe('WeatherPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the weather widget', () => {
    render(<WeatherPage />);
    expect(screen.getByTestId('weather-widget')).toBeInTheDocument();
  });

  it('displays the refresh button', () => {
    render(<WeatherPage />);
    const refreshButton = screen.getByText(/refresh/i);
    expect(refreshButton).toBeInTheDocument();
  });

  it('displays the change location button', () => {
    render(<WeatherPage />);
    const changeLocationButton = screen.getByText(/change location/i);
    expect(changeLocationButton).toBeInTheDocument();
  });

  it('sets refreshing state when refresh button is clicked', async () => {
    vi.useFakeTimers();
    render(<WeatherPage />);
    
    const refreshButton = screen.getByText(/refresh/i);
    refreshButton.click();
    
    // Check if the refresh icon has the animation class
    const refreshIcon = screen.getByTestId('refresh-icon');
    expect(refreshIcon).toHaveClass('animate-spin');
    
    // Advance timers to complete the refresh
    vi.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(refreshIcon).not.toHaveClass('animate-spin');
    });
    
    vi.useRealTimers();
  });
});
