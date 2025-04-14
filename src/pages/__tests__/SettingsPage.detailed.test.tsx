
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SettingsPage from '@/pages/SettingsPage';

// Mock hooks
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

vi.mock('@/hooks/use-language', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    languageList: {
      en: { label: 'English' },
      fr: { label: 'Français' }
    }
  })
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}));

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ asChild, children }: { asChild: boolean, children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children, className }: { children: React.ReactNode, className?: string }) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetFooter: ({ children, className }: { children: React.ReactNode, className?: string }) => <div>{children}</div>,
  SheetClose: ({ asChild, children }: { asChild: boolean, children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn()
}));

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: () => ({}),
    handleSubmit: (cb: any) => (data: any) => cb(data),
    setValue: vi.fn()
  })
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the settings page', () => {
    render(<SettingsPage />);
    expect(screen.getByText('settings.title')).toBeInTheDocument();
  });

  it('displays user profile information', () => {
    render(<SettingsPage />);
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('has an edit profile button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('settings.editProfile')).toBeInTheDocument();
  });

  it('displays language selector', () => {
    render(<SettingsPage />);
    expect(screen.getByText('settings.language')).toBeInTheDocument();
    
    // Find language selectors (there are two in the UI)
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
    
    // Check available options in the second language selector
    const options = selects[1].querySelectorAll('option');
    expect(options.length).toBe(2); // en and fr
    expect(options[0].textContent).toBe('English');
    expect(options[1].textContent).toBe('Français');
  });

  it('has theme toggle controls', () => {
    const { useTheme } = require('@/hooks/use-theme');
    const mockToggleTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      setTheme: vi.fn(),
      systemTheme: 'light',
      isUsingSystemTheme: false,
      useSystemTheme: vi.fn()
    });
    
    render(<SettingsPage />);
    expect(screen.getByText('settings.darkMode')).toBeInTheDocument();
    
    // Find the theme toggle switch
    const themeToggle = screen.getByRole('switch');
    expect(themeToggle).toBeInTheDocument();
    
    // Click the toggle
    fireEvent.click(themeToggle);
    expect(mockToggleTheme).toHaveBeenCalled();
  });
});
