import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Switch, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Giữ useNavigate

interface Notification {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdBy: { name: string; email: string };
  recipients: { _id: string; name: string; email: string }[];
  createdAt: Date;
}

const AdminNotifications = () => {
  const navigate = useNavigate(); // Sử dụng navigate
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Partial<Notification> | null>(null);
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({ title: '', content: '', isActive: false, recipients: [] });

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      const response = await axios.get('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
      setError('Không thể tải danh sách thông báo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateNotification = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');

      if (selectedNotification?._id) {
        // Cập nhật thông báo
        await axios.put(`/api/admin/notifications/${selectedNotification._id}`, newNotification, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Thêm mới thông báo
        await axios.post('/api/admin/notifications', newNotification, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setOpenDialog(false);
      setSelectedNotification(null);
      setNewNotification({ title: '', content: '', isActive: false, recipients: [] });
      fetchNotifications();
    } catch (error) {
      console.error('Lỗi xử lý thông báo:', error);
      setError('Không thể xử lý thông báo.');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      await axios.delete(`/api/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
      navigate('/admin/notifications'); // Điều hướng lại sau khi xóa
    } catch (error) {
      console.error('Lỗi xóa thông báo:', error);
      setError('Không thể xóa thông báo.');
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
        <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#1E3A8A' }}>
          Quản lý thông báo
        </Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ mb: 2, bgcolor: '#1976d2', color: 'white' }}>
          Thêm mới thông báo
        </Button>
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
                  sx={{ bgcolor: 'white', mb: 1, borderRadius: 2, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                >
                  <ListItemText
                    primary={<Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', color: '#1E3A8A' }}>{notification.title}</Typography>}
                    secondary={
                      <>
                        <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#555', mt: 0.5 }}>{notification.content}</Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'Poppins, sans-serif', color: '#777', mt: 0.5 }}>
                          Được tạo bởi: {notification.createdBy.name} - {new Date(notification.createdAt).toLocaleString('vi-VN')}
                        </Typography>
                        <Typography variant="caption" sx={{ fontFamily: 'Poppins, sans-serif', color: notification.isActive ? '#2e7d32' : '#d32f2f', mt: 0.5 }}>
                          Trạng thái: {notification.isActive ? 'Đang hiển thị' : 'Ẩn'}
                        </Typography>
                      </>
                    }
                  />
                  <IconButton onClick={() => { setSelectedNotification(notification); setNewNotification(notification); setOpenDialog(true); }} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteNotification(notification._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
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

      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setSelectedNotification(null); }}>
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#1E3A8A' }}>
          {selectedNotification?._id ? 'Chỉnh sửa thông báo' : 'Thêm mới thông báo'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tiêu đề"
            value={newNotification.title || ''}
            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Nội dung"
            value={newNotification.content || ''}
            onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography sx={{ fontFamily: 'Poppins, sans-serif' }}>Hiển thị giữa màn hình:</Typography>
            <Switch
              checked={newNotification.isActive || false}
              onChange={(e) => setNewNotification({ ...newNotification, isActive: e.target.checked })}
              color="primary"
            />
          </Box>
          {/* Có thể thêm trường recipients nếu cần chọn người dùng cụ thể */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setSelectedNotification(null); setNewNotification({ title: '', content: '', isActive: false, recipients: [] }); }} sx={{ color: '#777' }}>
            Hủy
          </Button>
          <Button onClick={handleAddOrUpdateNotification} variant="contained" color="primary" sx={{ bgcolor: '#1976d2', color: 'white' }}>
            {selectedNotification?._id ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminNotifications;