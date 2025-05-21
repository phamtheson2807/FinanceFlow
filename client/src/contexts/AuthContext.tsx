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
  loginWithGoogle: (token: string) => Promise<void>;
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
      if (!token || typeof token !== 'string') {
        throw new Error('Token không hợp lệ');
      }
      console.log('📥 Đang lấy thông tin user với token:', token.slice(0, 20) + '...');
      const response = await axiosInstance.get('/api/auth/me');
      console.log('📥 User đã được lấy:', response.data);
      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy thông tin user:', {
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
      console.log('📤 Gửi yêu cầu đăng nhập:', { email });
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      console.log('📥 Phản hồi đăng nhập:', { token, userData });

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('📡 Token đã lưu:', token);

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('❌ Đăng nhập thất bại:', {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  };

  const loginWithGoogle = useCallback(async (token: string) => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Token Google không hợp lệ');
      }
      console.log('📤 Đang xử lý đăng nhập Google với token:', token.slice(0, 20) + '...');
      localStorage.setItem('token', token);
      console.log('📡 Token Google đã lưu:', token);
      await fetchUser(token);
    } catch (error: any) {
      console.error('❌ Đăng nhập Google thất bại:', {
        message: error.message,
        response: error.response?.data,
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  }, [fetchUser]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ Đã đăng xuất');
    window.location.href = '/login'; // Chuyển hướng sau khi đăng xuất
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token) {
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (parseError) {
              console.error('❌ Lỗi khi parse user từ localStorage:', parseError);
              localStorage.removeItem('user');
            }
          }
          await fetchUser(token);
        }
      } catch (error) {
        console.error('❌ Khởi tạo auth thất bại:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};