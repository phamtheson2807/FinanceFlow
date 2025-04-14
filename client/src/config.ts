// Tạo file config để quản lý URL API
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  // Các cấu hình khác
};

export default config;