import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme from storage
    AsyncStorage.getItem('theme').then((savedTheme) => {
      if (savedTheme === 'dark') {
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
      gradient: isDarkMode ? ['#0F172A', '#1E293B', '#0F172A'] : ['#F8FBFF', '#EBF4FF', '#D6EAFF'],
      background: isDarkMode ? '#0F172A' : '#F8FBFF',
      card: isDarkMode ? '#1E293B' : '#FFFFFF',
      text: isDarkMode ? '#F8FAFC' : '#0F172A',
      textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
      border: isDarkMode ? '#334155' : '#E2E8F0',
      primary: '#2563EB',
      dangerBg: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
      dangerText: '#EF4444',
      modalOverlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
      inputBg: isDarkMode ? '#0F172A' : '#FFFFFF',
      inputBgDisabled: isDarkMode ? '#1E293B' : '#F8FAFC',
      bottomNav: isDarkMode ? '#1E293B' : '#FFFFFF',
      bottomNavShadow: isDarkMode ? '#000000' : '#94A3B8',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
