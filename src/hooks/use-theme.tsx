
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  systemTheme: Theme | null;
  isUsingSystemTheme: boolean;
  useSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Get the current system theme
  const getSystemTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default to dark when window is not available
  };

  // State to track if we're using the system theme
  const [isUsingSystemTheme, setIsUsingSystemTheme] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === null;
    }
    return true;
  });
  
  // Track the system theme separately
  const [systemTheme, setSystemTheme] = useState<Theme | null>(getSystemTheme());
  
  // The actual theme to apply
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage if available
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      // If using system preference or no saved theme
      if (!savedTheme) {
        return getSystemTheme();
      }
      
      // Return saved theme
      return savedTheme;
    }
    return 'dark'; // Default to dark when window is not available
  });

  // Apply theme class to document
  useEffect(() => {
    if (theme && typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      
      // Only save to localStorage if not using system theme
      if (!isUsingSystemTheme && typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
    }
  }, [theme, isUsingSystemTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
      
      // Only update theme if using system preference
      if (isUsingSystemTheme) {
        setTheme(newSystemTheme);
      }
    };
    
    // Modern approach
    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (e) {
      // Fallback for older browsers
      console.warn('Using fallback for media query listener', e);
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [isUsingSystemTheme]);

  const toggleTheme = () => {
    setIsUsingSystemTheme(false);
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setThemeWithSave = (newTheme: Theme) => {
    setIsUsingSystemTheme(false);
    setTheme(newTheme);
  };

  const useSystemTheme = () => {
    setIsUsingSystemTheme(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theme');
    }
    setTheme(systemTheme || getSystemTheme());
  };

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme: setThemeWithSave,
    systemTheme,
    isUsingSystemTheme,
    useSystemTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
