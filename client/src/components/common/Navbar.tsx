// src/components/admin/Navbar.tsx (hoặc đường dẫn khác tùy dự án)
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import CategoryIcon from '@mui/icons-material/Category';
import ChatIcon from '@mui/icons-material/Chat'; // Thêm icon cho hỗ trợ
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationContent, setNotificationContent] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [notificationId, setNotificationId] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSendOrUpdateNotification = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');

      const payload = {
        title: notificationTitle,
        content: notificationContent,
        isActive,
        recipients: [] as string[], // hoặc kiểu phù hợp nếu không phải string
        createdBy: localStorage.getItem('userId') || '',
      };

      let response;
      if (notificationId) {
        response = await axios.put(`/api/admin/notifications/${notificationId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.post('/api/admin/notifications', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotificationId(response.data.notification?._id);
      }

      console.log('Sending/Updating notification:', { ...payload, id: notificationId || response.data.notification?._id });
      setNotificationDialogOpen(false);
      setNotificationTitle('');
      setNotificationContent('');
      setIsActive(false);
      setNotificationId(null);
      alert('Thông báo đã được ' + (notificationId ? 'cập nhật' : 'gửi') + ' thành công!');
    } catch (error) {
      console.error('Lỗi gửi/cập nhật thông báo:', error);
      alert('Không thể gửi/cập nhật thông báo. Vui lòng thử lại.');
    }
  };

  const handleToggleNotification = (newValue: boolean) => {
    setIsActive(newValue);
    if (notificationId) {
      handleSendOrUpdateNotification();
    }
  };

  const menuItems = [
    { text: 'Người dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Quản lý giao dịch', icon: <ReceiptIcon />, path: '/admin/transactions' },
    { text: 'Quản lý danh mục', icon: <CategoryIcon />, path: '/admin/categories' },
    { text: 'Thống kê', icon: <BarChartIcon />, path: '/admin/analytics' },
    { text: 'Tài khoản', icon: <AccountCircleIcon />, path: '/admin/account' },
    { text: 'Quản lý thông báo', icon: <NotificationsIcon />, path: '/admin/notifications' },
    { text: 'Hỗ trợ', icon: <ChatIcon />, path: '/admin/support' }, // Thêm mục Hỗ trợ
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: '#1E3A8A',
          color: 'white',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-start', p: 2 }}>
        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Admin Panel
          </Typography>
        </motion.div>
      </Toolbar>
      <List>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <ListItem disablePadding sx={{ display: 'block' }}>
              <NavLink
                to={item.path}
                style={{ textDecoration: 'none', color: 'inherit' }}
                end
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: 'initial',
                    px: 2.5,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center', color: 'white' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: 1, fontFamily: 'Poppins, sans-serif' }}
                  />
                </ListItemButton>
              </NavLink>
              {item.text === 'Quản lý thông báo' && (
                <ListItemButton
                  onClick={() => setNotificationDialogOpen(true)}
                  sx={{
                    minHeight: 48,
                    justifyContent: 'initial',
                    px: 2.5,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center', color: 'white' }}>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tạo/Chỉnh sửa thông báo"
                    sx={{ opacity: 1, fontFamily: 'Poppins, sans-serif' }}
                  />
                </ListItemButton>
              )}
            </ListItem>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: menuItems.length * 0.1, duration: 0.5 }}
        >
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                minHeight: 48,
                justifyContent: 'initial',
                px: 2.5,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 3, justifyContent: 'center', color: 'white' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Đăng xuất"
                sx={{ opacity: 1, fontFamily: 'Poppins, sans-serif' }}
              />
            </ListItemButton>
          </ListItem>
        </motion.div>
      </List>

      <Dialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#1E3A8A' }}>
          {notificationId ? 'Cập nhật thông báo' : 'Tạo thông báo mới'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Tiêu đề thông báo"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Nội dung thông báo"
            value={notificationContent}
            onChange={(e) => setNotificationContent(e.target.value)}
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontFamily: 'Poppins, sans-serif' }}>Bật thông báo giữa màn hình:</Typography>
            <Switch
              checked={isActive}
              onChange={(e) => handleToggleNotification(e.target.checked)}
              color="primary"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialogOpen(false)} sx={{ color: '#777' }}>
            Hủy
          </Button>
          <Button
            onClick={handleSendOrUpdateNotification}
            variant="contained"
            color="primary"
            sx={{ bgcolor: '#1976d2', color: 'white' }}
          >
            {notificationId ? 'Cập nhật' : 'Gửi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default Navbar;