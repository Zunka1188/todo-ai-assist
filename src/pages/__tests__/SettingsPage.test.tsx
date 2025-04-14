
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SettingsPage from '../SettingsPage';
import { render as customRender } from '@/test-utils';

// Mock theme hook
vi.mock('@/hooks/use-theme', () => ({
  useTheme: vi.fn().mockReturnValue({
    theme: 'light',
    setTheme: vi.fn()
  })
}));

// Mock language hook
vi.mock('@/hooks/use-language', () => ({
  useLanguage: vi.fn().mockReturnValue({
    language: 'en',
    setLanguage: vi.fn()
  })
}));

// Mock user settings service
vi.mock('@/services/user-settings.service', () => ({
  getUserSettings: vi.fn().mockResolvedValue({
    notifications: {
      email: true,
      push: false
    },
    privacy: {
      shareData: false,
      analyticsConsent: true
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      largeText: false
    }
  }),
  updateUserSettings: vi.fn().mockImplementation((settings) => Promise.resolve(settings))
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders all settings sections', () => {
    render(<SettingsPage />);
    
    // Check for section headings
    expect(screen.getByText(/appearance/i)).toBeInTheDocument();
    expect(screen.getByText(/language/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy/i)).toBeInTheDocument();
    expect(screen.getByText(/accessibility/i)).toBeInTheDocument();
  });
  
  it('toggles theme from light to dark', () => {
    const mockSetTheme = vi.fn();
    vi.mocked(require('@/hooks/use-theme').useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme
    });
    
    render(<SettingsPage />);
    
    // Find and click the theme toggle
    const themeToggle = screen.getByLabelText(/theme/i);
    fireEvent.click(themeToggle);
    
    // Check if theme was toggled
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
  
  it('changes language selection', () => {
    const mockSetLanguage = vi.fn();
    vi.mocked(require('@/hooks/use-language').useLanguage).mockReturnValue({
      language: 'en',
      setLanguage: mockSetLanguage
    });
    
    render(<SettingsPage />);
    
    // Find and change language selector
    const languageSelector = screen.getByLabelText(/language/i);
    fireEvent.change(languageSelector, { target: { value: 'fr' } });
    
    // Check if language was changed
    expect(mockSetLanguage).toHaveBeenCalledWith('fr');
  });
  
  it('toggles notification settings', async () => {
    render(<SettingsPage />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });
    
    // Find and toggle push notifications
    const pushNotificationToggle = screen.getByLabelText(/push notifications/i);
    fireEvent.click(pushNotificationToggle);
    
    // Check if updateUserSettings was called with the right data
    await waitFor(() => {
      expect(require('@/services/user-settings.service').updateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: {
            email: true,
            push: true
          }
        })
      );
    });
    
    // Check toast notification
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
  
  it('toggles accessibility settings', async () => {
    render(<SettingsPage />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/reduced motion/i)).toBeInTheDocument();
    });
    
    // Find and toggle high contrast
    const highContrastToggle = screen.getByLabelText(/high contrast/i);
    fireEvent.click(highContrastToggle);
    
    // Check if updateUserSettings was called with the right data
    await waitFor(() => {
      expect(require('@/services/user-settings.service').updateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          accessibility: {
            reducedMotion: false,
            highContrast: true,
            largeText: false
          }
        })
      );
    });
    
    // Check toast notification
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
  
  it('handles error during settings fetch', async () => {
    // Override the mock to simulate an error
    vi.mocked(require('@/services/user-settings.service').getUserSettings).mockRejectedValueOnce(
      new Error('Failed to fetch settings')
    );
    
    render(<SettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading settings/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/failed to fetch settings/i)).toBeInTheDocument();
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
  
  it('handles error during settings update', async () => {
    render(<SettingsPage />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });
    
    // Override the mock to simulate an error on update
    vi.mocked(require('@/services/user-settings.service').updateUserSettings).mockRejectedValueOnce(
      new Error('Failed to update settings')
    );
    
    // Find and toggle a setting
    const emailNotificationToggle = screen.getByLabelText(/email notifications/i);
    fireEvent.click(emailNotificationToggle);
    
    // Check for error toast
    await waitFor(() => {
      expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive'
        })
      );
    });
  });
});
