import { Alert, Box, CircularProgress, List, ListItem, ListItemText, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance'; // Sửa đường dẫn

interface Notification {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdBy: { name: string; email: string } | null; // Cho phép createdBy là null
  createdAt: Date;
  isRead?: boolean;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token đang sử dụng:', token);
      if (!token) throw new Error('Token không tồn tại');

      const response = await axiosInstance.get('/api/notifications'); // Sử dụng axiosInstance
      const fetchedNotifications = response.data.map((notif: any) => ({
        ...notif,
        isRead: notif.isRead || false,
      }));
      setNotifications(fetchedNotifications);
    } catch (error: any) {
      console.error('Lỗi tải thông báo:', error);
      setError(error.response?.data?.message || 'Không thể tải danh sách thông báo.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');

      await axiosInstance.put(`/api/notifications/${id}/mark-read`, {}); // Sử dụng axiosInstance
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (error: any) {
      console.error('Lỗi đánh dấu đã đọc:', error);
      setError(error.response?.data?.message || 'Không thể đánh dấu thông báo là đã đọc.');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f0f4f8', minHeight: 'calc(100vh - 64px)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            color: '#1E3A8A',
            textShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          Thông báo
        </Typography>
      </motion.div>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress sx={{ color: '#1E3A8A' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <List>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <ListItem
                  sx={{
                    bgcolor: 'white',
                    mb: 1,
                    borderRadius: 2,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                  }}
                  onClick={() => markAsRead(notification._id)}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="h6"
                        sx={{ fontFamily: 'Poppins, sans-serif', color: '#1E3A8A', fontWeight: 'bold' }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          sx={{ fontFamily: 'Poppins, sans-serif', color: '#555', mt: 0.5 }}
                        >
                          {notification.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'Poppins, sans-serif', color: '#777', mt: 0.5 }}
                        >
                          Được tạo bởi:{' '}
                          {notification.createdBy
                            ? `${notification.createdBy.name} (${notification.createdBy.email})`
                            : 'Không xác định'}{' '}
                          - {new Date(notification.createdAt).toLocaleString('vi-VN')}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'Poppins, sans-serif',
                            color: notification.isActive ? '#2e7d32' : '#d32f2f',
                            mt: 0.5,
                          }}
                        >
                          Trạng thái: {notification.isActive ? 'Đang hiển thị' : 'Ẩn'}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </motion.div>
            ))
          ) : (
            <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#666', textAlign: 'center' }}>
              Không có thông báo nào.
            </Typography>
          )}
        </List>
      )}
    </Box>
  );
};

export default Notifications;