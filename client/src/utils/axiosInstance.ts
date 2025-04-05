import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor request: Gắn token vào header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (typeof token !== 'string') {
        console.error('❌ Token không phải là chuỗi:', token);
        throw new Error('Token không hợp lệ');
      }
      const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
      // Đảm bảo headers luôn được khởi tạo
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log('📤 Gắn token vào request:', config.headers.Authorization);
      console.log('📤 Request URL:', config.url);
    } else {
      console.warn('⚠️ Không tìm thấy token trong localStorage');
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Lỗi trong interceptor request:', error);
    return Promise.reject(error);
  }
);

// Interceptor response: Xử lý lỗi 401 và làm mới token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const token = localStorage.getItem('token');
        if (!token || typeof token !== 'string') {
          throw new Error('Token không hợp lệ để làm mới');
        }
        const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh-token',
          { token: cleanToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const newToken = response.data.token;
        if (!newToken) {
          throw new Error('Không nhận được token mới từ server');
        }
        localStorage.setItem('token', newToken);
        console.log('✅ Đã làm mới token:', newToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        console.error('❌ Lỗi khi làm mới token:', refreshError.response?.data || refreshError.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    console.error('❌ Lỗi từ server:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;