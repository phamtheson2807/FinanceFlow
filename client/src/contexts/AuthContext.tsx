import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (token: string) => {
    try {
      console.log('Fetching user with token:', token.slice(0, 20) + '...');
      const response = await axiosInstance.get('/api/auth/me');
      console.log('User fetched:', response.data);
      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('Failed to fetch user:', {
        message: error.message,
        response: error.response?.data,
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Sending login request:', { email });
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      console.log('Login response:', { token, userData });

      // Lưu token nguyên dạng từ backend (có Bearer)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('📡 Token đã lưu:', token);

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login failed:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ Đã đăng xuất');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token) {
        try {
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
          await fetchUser(token);
        } catch (error) {
          console.error('❌ Khởi tạo auth thất bại:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};