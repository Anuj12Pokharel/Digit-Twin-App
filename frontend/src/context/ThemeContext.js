import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Load theme from storage
    AsyncStorage.getItem('theme').then((savedTheme) => {
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        setIsDarkMode(true);
      }
    });
  }, []);

  const toggleTheme = (value) => {
    setIsDarkMode(value);
    AsyncStorage.setItem('theme', value ? 'dark' : 'light');
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      gradient: isDarkMode ? ['#081E2D', '#05141E', '#030A0F'] : ['#F8FBFF', '#EBF4FF', '#D6EAFF'],
      background: isDarkMode ? '#05141E' : '#F8FBFF',
      card: isDarkMode ? '#081E2D' : '#FFFFFF',
      text: isDarkMode ? '#FFFFFF' : '#0F172A',
      textSecondary: isDarkMode ? '#8FA0AF' : '#64748B',
      border: isDarkMode ? 'rgba(0, 240, 255, 0.15)' : '#E2E8F0',
      primary: isDarkMode ? '#00F0FF' : '#2563EB',
      dangerBg: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
      dangerText: '#EF4444',
      modalOverlay: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)',
      inputBg: isDarkMode ? '#030A0F' : '#FFFFFF',
      inputBgDisabled: isDarkMode ? '#081E2D' : '#F8FAFC',
      bottomNav: isDarkMode ? '#05141E' : '#FFFFFF',
      bottomNavShadow: isDarkMode ? '#02060A' : '#94A3B8',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
