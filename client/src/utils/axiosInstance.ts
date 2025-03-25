import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Gắn token vào request:', config.headers.Authorization);
      console.log('📤 Request URL:', config.url);
    } else {
      console.warn('⚠️ Không tìm thấy token trong localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Lỗi trong interceptor request:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Lỗi từ server:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;