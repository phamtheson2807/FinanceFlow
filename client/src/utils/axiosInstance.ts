import axios, { AxiosError, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';

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
      // Ensure headers object exists and set Authorization
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders; 
      }
      config.headers['Authorization'] = `Bearer ${cleanToken}`;
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

    // Handle 401 Unauthorized errors by attempting a token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const tokenFromStorage = localStorage.getItem('token');

      if (!tokenFromStorage) {
        // No token available to attempt a refresh. User is effectively logged out.
        console.warn('[Axios Interceptor] 401: No token in localStorage. Redirecting to login.');
        localStorage.removeItem('token'); // Ensure cleanup
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') { // Prevent redirect loop if already on login
          window.location.href = '/login';
        }
        return Promise.reject(error); // Reject with the original 401 error
      }

      // A token exists, so mark this request for retry and attempt refresh
      originalRequest._retry = true;
      try {
        // Validate the token fetched (though !tokenFromStorage should have caught null/undefined)
        if (typeof tokenFromStorage !== 'string') {
             throw new Error('Token không hợp lệ hoặc không phải chuỗi để làm mới');
        }
        const cleanToken = tokenFromStorage.startsWith('Bearer ') ? tokenFromStorage.replace('Bearer ', '') : tokenFromStorage;

        const refreshResponse = await axios.post(
          'http://localhost:5000/api/auth/refresh-token',
          { token: cleanToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newToken = refreshResponse.data.token;
        if (!newToken || typeof newToken !== 'string') {
          throw new Error('Không nhận được token mới hợp lệ từ server');
        }

        localStorage.setItem('token', newToken);
        console.log('✅ Đã làm mới token và lưu vào localStorage.');
        if (!originalRequest.headers) {
          originalRequest.headers = {} as AxiosRequestHeaders;
        }
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest); // Retry the original request with the new token

      } catch (refreshCatchError: any) {
        // Token refresh failed.
        console.error('❌ Lỗi trong quá trình làm mới token:', refreshCatchError?.response?.data || refreshCatchError?.message || refreshCatchError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') { // Prevent redirect loop
          window.location.href = '/login';
        }
        return Promise.reject(refreshCatchError); // Reject with the error from the refresh process
      }
    }

    // For errors not handled by the 401 refresh logic (e.g., non-401s, retried 401s, network errors)
    if (error.response) {
        console.error(`❌ Lỗi từ server (${error.response.status}):`, error.response.data || error.message);
    } else if (error.request) {
        console.error('❌ Lỗi request: Không nhận được phản hồi từ server.', error.message);
    } else {
        console.error('❌ Lỗi request không xác định:', error.message || error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;