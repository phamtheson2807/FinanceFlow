import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'vi');

  const changeLanguage = async (lang: string) => {
    try {
      localStorage.setItem('language', lang);
      setLanguage(lang);
      await axiosInstance.put('/api/settings', { language: lang });
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get('/api/settings');
        if (response.data && response.data.language && response.data.language !== language) {
          localStorage.setItem('language', response.data.language);
          setLanguage(response.data.language);
        }
      } catch (error) {
        console.error('Failed to fetch language settings:', error);
      }
    };

    fetchSettings();
  }, [language]);

  // Dummy t function (bạn có thể làm đơn giản hơn hoặc thay thế bằng object từ điển sau này)
  const t = (key: string) => {
    return key; // hoặc ánh xạ key => chuỗi tiếng Việt nếu cần
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
