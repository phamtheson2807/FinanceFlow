import { CalendarToday, Email, LockOpen } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AdminInfo {
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  _id?: string;
  isLocked?: boolean;
  isVerified?: boolean;
  avatar?: string;
}

const AccountPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token không tồn tại');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data.user || response.data;
        setAdminInfo(userData);
      } catch (error) {
        console.error('❌ Lỗi khi lấy thông tin admin:', error);
        setError('Không thể tải thông tin admin. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminInfo();
  }, []);

  const handleChangePassword = async () => {
    setPasswordError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');

      // Debug dữ liệu gửi lên
      console.log('Dữ liệu gửi lên:', { currentPassword: oldPassword, newPassword });

      // Gửi yêu cầu với currentPassword thay vì oldPassword
      const response = await axios.put(
        'http://localhost:5000/api/auth/change-password',
        { currentPassword: oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOpenChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Đổi mật khẩu thành công!');
      console.log('Phản hồi từ server:', response.data);
    } catch (error) {
      console.error('❌ Lỗi khi đổi mật khẩu:', error);
      if (axios.isAxiosError(error) && error.response) {
        setPasswordError(
          error.response.data.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.'
        );
      } else {
        setPasswordError('Không thể đổi mật khẩu. Vui lòng thử lại.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
        </motion.div>
      </Box>
    );
  }

  if (!adminInfo) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: 'error.main', textAlign: 'center' }}>
          {error || 'Không thể tải thông tin tài khoản.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f0f4f8', minHeight: 'calc(100vh - 64px)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            color: '#1E3A8A',
            textShadow: '0 2px 5px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          Thông Tin Tài Khoản Admin
        </Typography>
      </motion.div>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                bgcolor: 'white',
                boxShadow: '0 15px 40px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#1E3A8A',
                        fontSize: '2.5rem',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 'bold',
                        border: '3px solid #3B82F6',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      }}
                    >
                      {adminInfo.name ? adminInfo.name.charAt(0).toUpperCase() : 'A'}
                    </Avatar>
                  </motion.div>
                  <Box sx={{ ml: 3 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 'bold',
                        color: '#1E3A8A',
                      }}
                    >
                      {adminInfo.name || 'Không có tên'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#555',
                        mt: 0.5,
                      }}
                    >
                      {adminInfo.email || 'Không có email'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        color: adminInfo.role === 'admin' ? '#1976D2' : '#777',
                        mt: 0.5,
                        fontStyle: 'italic',
                      }}
                    >
                      Vai trò: {adminInfo.role || 'Không xác định'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3, bgcolor: 'rgba(0,0,0,0.1)' }} />

                <Box sx={{ px: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 'medium',
                      color: '#333',
                      mb: 2,
                    }}
                  >
                    Chi Tiết Tài Khoản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ color: '#3B82F6', mr: 2 }} />
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#555',
                            fontWeight: 'medium',
                          }}
                        >
                          Email
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#333',
                          }}
                        >
                          {adminInfo.email || 'Không có thông tin'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ color: '#3B82F6', mr: 2 }} />
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#555',
                            fontWeight: 'medium',
                          }}
                        >
                          Ngày Tham Gia
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#333',
                          }}
                        >
                          {adminInfo.createdAt
                            ? new Date(adminInfo.createdAt).toLocaleDateString('vi-VN')
                            : 'Không có thông tin'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                      <LockOpen sx={{ color: '#3B82F6', mr: 2 }} />
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#555',
                            fontWeight: 'medium',
                          }}
                        >
                          Trạng Thái
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: 'Poppins, sans-serif',
                            color: adminInfo.isLocked ? '#f44336' : '#4caf50',
                          }}
                        >
                          {adminInfo.isLocked ? 'Đã khóa' : 'Hoạt động'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <Button
                      variant="contained"
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        fontFamily: 'Poppins, sans-serif',
                        background: 'linear-gradient(45deg, #3B82F6, #1E3A8A)',
                        '&:hover': { background: 'linear-gradient(45deg, #4B9EFF, #2A4D9E)' },
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                      }}
                      onClick={() => setOpenChangePassword(true)}
                    >
                      Đổi Mật Khẩu
                    </Button>
                  </motion.div>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Dialog đổi mật khẩu */}
      <Dialog open={openChangePassword} onClose={() => setOpenChangePassword(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            bgcolor: '#1E3A8A',
            color: 'white',
            py: 2,
            textAlign: 'center',
          }}
        >
          Đổi Mật Khẩu
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#f5f5f5', py: 3 }}>
          {passwordError && (
            <Typography sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>{passwordError}</Typography>
          )}
          <TextField
            label="Mật khẩu hiện tại"
            type="password"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              },
              '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#555' },
              '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
            }}
          />
          <TextField
            label="Mật khẩu mới"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              },
              '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#555' },
              '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
            }}
          />
          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              },
              '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#555' },
              '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#f5f5f5', px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setOpenChangePassword(false);
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError(null);
            }}
            sx={{
              fontFamily: 'Poppins, sans-serif',
              color: '#777',
              '&:hover': { color: '#1E3A8A' },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(45deg, #3B82F6, #1E3A8A)',
              borderRadius: 2,
              px: 4,
              py: 1,
              '&:hover': { background: 'linear-gradient(45deg, #4B9EFF, #2A4D9E)' },
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountPage;