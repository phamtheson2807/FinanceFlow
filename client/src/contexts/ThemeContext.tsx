import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import { createContext, ReactNode, useContext, useState } from 'react';

interface ThemeContextType {
  theme: Theme;
  darkMode: boolean;
  currency: string;
  toggleDarkMode: () => void;
  setCurrency: (newCurrency: string) => void;
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
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('VND'); // State để quản lý tiền tệ toàn cục

  const theme = darkMode ? darkTheme : lightTheme;

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const value = {
    theme,
    darkMode,
    currency,
    toggleDarkMode,
    setCurrency, // Thêm hàm setCurrency để cập nhật tiền tệ
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