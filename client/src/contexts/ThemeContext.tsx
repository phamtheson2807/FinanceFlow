import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface ThemeContextType {
  theme: Theme;
  darkMode: boolean;
  currency: string;
  toggleDarkMode: () => void;
  setCurrency: (newCurrency: string) => void;
  formatCurrency: (amount: number) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E90FF', // Màu xanh pastel sáng
    },
    secondary: {
      main: '#FFB6C1', // Màu hồng pastel
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333',
      secondary: '#666',
    },
    error: {
      main: '#D32F2F',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1E90FF', // Giữ màu xanh pastel sáng cho nhất quán
    },
    secondary: {
      main: '#FFB6C1',
    },
    background: {
      default: '#1A2027',
      paper: '#2D3748',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#D1D5DB',
    },
    error: {
      main: '#E53E3E',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage or defaults
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  const [currency, setCurrencyState] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    return savedCurrency || 'VND';
  });

  const theme = darkMode ? darkTheme : lightTheme;

  // Format currency helper function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    try {
      await axiosInstance.put('/api/settings', { darkMode: newMode });
    } catch (error) {
      console.error('Failed to update dark mode setting:', error);
    }
  };

  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
    try {
      await axiosInstance.put('/api/settings', { currency: newCurrency });
    } catch (error) {
      console.error('Failed to update currency setting:', error);
    }
  };
  
  // Sync with settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get('/api/settings');
        if (response.data) {
          // Update darkMode if different from current state
          if (response.data.darkMode !== darkMode) {
            setDarkMode(response.data.darkMode);
            localStorage.setItem('darkMode', JSON.stringify(response.data.darkMode));
          }
          
          // Update currency if different from current state
          if (response.data.currency && response.data.currency !== currency) {
            setCurrencyState(response.data.currency);
            localStorage.setItem('currency', response.data.currency);
          }
        }
      } catch (error) {
        console.error('Failed to fetch theme settings:', error);
      }
    };

    fetchSettings();
  }, [darkMode, currency]);

  const value = {
    theme,
    darkMode,
    currency,
    toggleDarkMode,
    setCurrency,
    formatCurrency
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};