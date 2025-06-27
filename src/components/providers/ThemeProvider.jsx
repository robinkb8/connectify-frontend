// ===== src/components/providers/ThemeProvider.jsx =====
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeProviderContext = createContext({
  theme: 'light',
  setTheme: () => null,
});

export function ThemeProvider({ children, defaultTheme = 'light', storageKey = 'connectify-theme', ...props }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then use defaultTheme
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem(storageKey, theme);
    
    console.log('🎨 Theme changed to:', theme); // Debug log
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (theme) => {
      console.log('🔄 Setting theme to:', theme); // Debug log
      setTheme(theme);
    },
    toggleTheme: () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      console.log('🔄 Toggling theme from', theme, 'to', newTheme); // Debug log
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};