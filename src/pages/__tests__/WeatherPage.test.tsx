
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WeatherPage from '../WeatherPage';
import { render as customRender } from '@/test-utils';

// Mock weather service
vi.mock('@/services/weather.service', () => ({
  getCurrentWeather: vi.fn().mockResolvedValue({
    location: {
      name: 'New York',
      country: 'US',
    },
    current: {
      temp_c: 22,
      temp_f: 71.6,
      condition: {
        text: 'Sunny',
        icon: 'sunny-icon.png'
      },
      humidity: 65,
      wind_kph: 15,
    },
    forecast: {
      forecastday: [
        {
          date: '2025-04-14',
          day: {
            maxtemp_c: 25,
            mintemp_c: 18,
            condition: {
              text: 'Sunny',
              icon: 'sunny-icon.png'
            }
          },
          hour: []
        },
        {
          date: '2025-04-15',
          day: {
            maxtemp_c: 24,
            mintemp_c: 17,
            condition: {
              text: 'Partly cloudy',
              icon: 'partly-cloudy-icon.png'
            }
          },
          hour: []
        }
      ]
    }
  }),
  searchLocations: vi.fn().mockResolvedValue([
    { id: '1', name: 'New York', country: 'US' },
    { id: '2', name: 'London', country: 'UK' }
  ])
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn().mockImplementation((success) => {
    success({
      coords: {
        latitude: 40.7128,
        longitude: -74.006
      }
    });
  })
};
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('WeatherPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders loading state initially', () => {
    render(<WeatherPage />);
    
    expect(screen.getByText(/loading weather data/i)).toBeInTheDocument();
  });
  
  it('loads and displays current weather data', async () => {
    render(<WeatherPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading weather data/i)).not.toBeInTheDocument();
    });
    
    // Check if current weather is displayed
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('22°C')).toBeInTheDocument();
    expect(screen.getByText('Sunny')).toBeInTheDocument();
    expect(screen.getByText('Humidity: 65%')).toBeInTheDocument();
  });
  
  it('displays forecast data', async () => {
    render(<WeatherPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading weather data/i)).not.toBeInTheDocument();
    });
    
    // Check if forecast is displayed
    expect(screen.getByText('Forecast')).toBeInTheDocument();
    expect(screen.getByText('25°')).toBeInTheDocument();
    expect(screen.getByText('18°')).toBeInTheDocument();
    expect(screen.getByText('24°')).toBeInTheDocument();
    expect(screen.getByText('17°')).toBeInTheDocument();
  });
  
  it('allows location search', async () => {
    render(<WeatherPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading weather data/i)).not.toBeInTheDocument();
    });
    
    // Find and interact with search input
    const searchInput = screen.getByPlaceholderText(/search location/i);
    fireEvent.change(searchInput, { target: { value: 'London' } });
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    
    // Wait for search results
    await waitFor(() => {
      expect(require('@/services/weather.service').searchLocations).toHaveBeenCalledWith('London');
    });
    
    // Check search results are displayed
    expect(screen.getByText('London, UK')).toBeInTheDocument();
    
    // Select a search result
    fireEvent.click(screen.getByText('London, UK'));
    
    // Check new weather data is requested
    expect(require('@/services/weather.service').getCurrentWeather).toHaveBeenCalledWith('2');
  });
  
  it('handles error during weather fetch', async () => {
    // Override the mock to simulate an error
    vi.mocked(require('@/services/weather.service').getCurrentWeather).mockRejectedValueOnce(
      new Error('Failed to fetch weather data')
    );
    
    render(<WeatherPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading weather/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/failed to fetch weather data/i)).toBeInTheDocument();
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
  
  it('uses geolocation to get local weather', async () => {
    render(<WeatherPage />);
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading weather data/i)).not.toBeInTheDocument();
    });
    
    // Find and click the "Use my location" button
    const locationButton = screen.getByText(/use my location/i);
    fireEvent.click(locationButton);
    
    // Check if geolocation was used
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    
    // Check if weather was requested with coordinates
    await waitFor(() => {
      expect(require('@/services/weather.service').getCurrentWeather).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: 40.7128,
          lon: -74.006
        })
      );
    });
  });
});
