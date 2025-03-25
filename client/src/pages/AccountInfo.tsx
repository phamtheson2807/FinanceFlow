import { Edit as EditIcon } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Định nghĩa kiểu dữ liệu
interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  isLocked: boolean;
  isVerified: boolean;
  avatar: string;
  createdAt: string;
}

interface EditDialogProps {
  open: boolean;
  title: string;
  fieldName: string;
  currentValue: string;
  onClose: () => void;
  onSave: (value: string) => Promise<void>;
}

// Component Dialog chỉnh sửa thông tin (nhỏ hơn)
const EditDialog = ({ open, title, fieldName, currentValue, onClose, onSave }: EditDialogProps) => {
  const [value, setValue] = useState(currentValue);
  const [error, setError] = useState('');

  useEffect(() => {
    setValue(currentValue);
    setError('');
  }, [currentValue]);

  const handleSave = async () => {
    if (!value.trim()) {
      setError(`${fieldName} không được để trống`);
      return;
    }
    if (fieldName === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Email không hợp lệ');
      return;
    }
    try {
      await onSave(value);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Dialog 
        open={open} 
        onClose={onClose} 
        TransitionComponent={Fade} 
        transitionDuration={600}
        PaperProps={{
          sx: { 
            width: '100%', 
            maxWidth: '400px', // Giảm kích thước tối đa
            borderRadius: '20px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1e1e5f 0%, #00ddeb 100%)',
          color: 'white',
          py: 2, // Giảm padding
          px: 3,
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          fontSize: '1.2rem', // Giảm font size
          letterSpacing: '0.5px',
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            animation: 'glow 5s infinite'
          },
          '@keyframes glow': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.2)' },
            '100%': { transform: 'scale(1)' }
          }
        }}>
          {title}
        </DialogTitle>
        <DialogContent sx={{
          bgcolor: 'rgba(245, 247, 255, 0.95)',
          py: 3, // Giảm padding
          px: 4,
          background: 'linear-gradient(180deg, rgba(245,247,255,0.95) 0%, rgba(230,235,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
        }}>
          <TextField
            autoFocus
            margin="dense"
            label={fieldName}
            type={fieldName === 'Email' ? 'email' : 'text'}
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
            variant="outlined"
            error={!!error}
            helperText={error}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)', // Giảm shadow
                border: '1px solid rgba(0,221,235,0.2)',
                fontSize: '0.9rem', // Giảm font size
                height: '40px', // Giảm chiều cao
                '&:hover fieldset': { borderColor: '#00ddeb' },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ddeb',
                  boxShadow: '0 0 10px rgba(0,221,235,0.3)', // Giảm shadow
                },
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Poppins, sans-serif',
                color: '#6b7280',
                fontWeight: 500,
                fontSize: '0.9rem', // Giảm font size
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#00ddeb',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{
          bgcolor: 'rgba(245, 247, 255, 0.95)',
          px: 4,
          py: 2, // Giảm padding
          borderTop: '1px solid rgba(0,221,235,0.1)',
        }}>
          <Button
            onClick={onClose}
            sx={{
              fontFamily: 'Poppins, sans-serif',
              color: '#6b7280',
              px: 2, // Giảm padding
              py: 1,
              borderRadius: '8px',
              fontSize: '0.9rem', // Giảm font size
              '&:hover': {
                bgcolor: 'rgba(0,221,235,0.1)',
                color: '#00ddeb',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Hủy
          </Button>
          <motion.div whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                background: 'linear-gradient(45deg, #00ddeb 0%, #1e1e5f 100%)',
                borderRadius: '8px',
                px: 3, // Giảm padding
                py: 1,
                boxShadow: '0 6px 20px rgba(0,221,235,0.4)', // Giảm shadow
                fontSize: '0.9rem', // Giảm font size
                '&:hover': {
                  background: 'linear-gradient(45deg, #1e1e5f 0%, #00ddeb 100%)',
                  boxShadow: '0 8px 25px rgba(0,221,235,0.5)',
                },
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shine 2s infinite'
                },
                '@keyframes shine': {
                  '0%': { left: '-100%' },
                  '20%': { left: '100%' },
                  '100%': { left: '100%' }
                }
              }}
            >
              Lưu
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

// Component Dialog đổi mật khẩu (nhỏ hơn)
const ChangePasswordDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setError('Vui lòng điền đầy đủ');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không hợp lệ');
      const response = await axios.put(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Dialog 
        open={open} 
        onClose={onClose} 
        TransitionComponent={Fade} 
        transitionDuration={600}
        PaperProps={{
          sx: { 
            width: '100%', 
            maxWidth: '400px', // Giảm kích thước tối đa
            borderRadius: '20px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #1e1e5f 0%, #00ddeb 100%)',
          color: 'white',
          py: 2, // Giảm padding
          px: 3,
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          fontSize: '1.2rem', // Giảm font size
          letterSpacing: '0.5px',
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            animation: 'glow 5s infinite'
          }
        }}>
          Đổi Mật Khẩu
        </DialogTitle>
        <DialogContent sx={{
          bgcolor: 'rgba(245, 247, 255, 0.95)',
          py: 3, // Giảm padding
          px: 4,
          background: 'linear-gradient(180deg, rgba(245,247,255,0.95) 0%, rgba(230,235,255,0.95) 100%)',
          backdropFilter: 'blur(10px)',
        }}>
          {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu'].map((label, index) => (
            <TextField
              key={index}
              margin="dense"
              label={label}
              type="password"
              fullWidth
              value={index === 0 ? passwords.currentPassword : index === 1 ? passwords.newPassword : passwords.confirmPassword}
              onChange={(e) => setPasswords({
                ...passwords,
                [index === 0 ? 'currentPassword' : index === 1 ? 'newPassword' : 'confirmPassword']: e.target.value
              })}
              variant="outlined"
              error={index === 2 && !!error}
              helperText={index === 2 && error}
              sx={{
                mb: 1.5, // Giảm margin giữa các field
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,221,235,0.2)',
                  fontSize: '0.9rem',
                  height: '40px', // Giảm chiều cao
                  '&:hover fieldset': { borderColor: '#00ddeb' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00ddeb',
                    boxShadow: '0 0 10px rgba(0,221,235,0.3)',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: 'Poppins, sans-serif',
                  color: '#6b7280',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#00ddeb',
                },
              }}
            />
          ))}
        </DialogContent>
        <DialogActions sx={{
          bgcolor: 'rgba(245, 247, 255, 0.95)',
          px: 4,
          py: 2, // Giảm padding
          borderTop: '1px solid rgba(0,221,235,0.1)',
        }}>
          <Button
            onClick={onClose}
            sx={{
              fontFamily: 'Poppins, sans-serif',
              color: '#6b7280',
              px: 2, // Giảm padding
              py: 1,
              borderRadius: '8px',
              fontSize: '0.9rem',
              '&:hover': {
                bgcolor: 'rgba(0,221,235,0.1)',
                color: '#00ddeb',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Hủy
          </Button>
          <motion.div whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                background: 'linear-gradient(45deg, #00ddeb 0%, #1e1e5f 100%)',
                borderRadius: '8px',
                px: 3, // Giảm padding
                py: 1,
                boxShadow: '0 6px 20px rgba(0,221,235,0.4)',
                fontSize: '0.9rem',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1e1e5f 0%, #00ddeb 100%)',
                  boxShadow: '0 8px 25px rgba(0,221,235,0.5)',
                },
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shine 2s infinite'
                }
              }}
            >
              Đổi
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

// Component chính (điều chỉnh kích thước một số phần tử)
const AccountInfo = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [editDialog, setEditDialog] = useState({
    open: false,
    title: '',
    fieldName: '',
    currentValue: '',
  });
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token không tồn tại');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data.user);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Không thể tải thông tin');
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const handleEdit = (field: 'name' | 'email') => {
    if (!userInfo) return;
    setEditDialog({
      open: true,
      title: `Thay ${field === 'name' ? 'Tên' : 'Email'}`,
      fieldName: field === 'name' ? 'Tên' : 'Email',
      currentValue: userInfo[field] || '',
    });
  };

  const handleSave = async (value: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không hợp lệ');
      const field = editDialog.fieldName === 'Tên' ? 'name' : 'email';
      const response = await axios.put(
        'http://localhost:5000/api/auth/update',
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (userInfo) {
        setUserInfo({ ...userInfo, [field]: value });
      }
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Lỗi khi cập nhật');
      throw error;
    }
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: '#e5e7eb',
        background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
      }}>
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <CircularProgress
            size={80} // Giảm kích thước
            thickness={5}
            sx={{ color: '#00ddeb', filter: 'drop-shadow(0 0 8px rgba(0,221,235,0.5))' }}
          />
        </motion.div>
      </Box>
    );
  }

  if (!userInfo) {
    return (
      <Box sx={{
        p: 3,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography variant="h6" sx={{ // Giảm từ h5 xuống h6
          color: '#dc2626',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          bgcolor: 'rgba(255,255,255,0.9)',
          py: 1.5, // Giảm padding
          px: 3,
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)', // Giảm shadow
        }}>
          {error || 'Không có thông tin người dùng'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: { xs: 2, md: 4 }, // Giảm padding
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(0,221,235,0.15) 0%, transparent 70%)',
        animation: 'pulse 8s infinite ease-in-out'
      },
      '&:after': {
        content: '""',
        position: 'absolute',
        bottom: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(30,30,95,0.1) 0%, transparent 70%)',
        animation: 'pulse 10s infinite ease-in-out'
      },
      '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.15)' },
        '100%': { transform: 'scale(1)' }
      }
    }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: 'spring', stiffness: 300 }}
      >
        <Typography
          variant="h4" // Giảm từ h3 xuống h4
          gutterBottom
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 800,
            background: 'linear-gradient(45deg, #1e1e5f 0%, #00ddeb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            mb: 6,
            letterSpacing: '1px',
            textShadow: '0 3px 10px rgba(0,221,235,0.3)', // Giảm shadow
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px', // Giảm chiều rộng
              height: '3px',
              background: 'linear-gradient(45deg, #00ddeb, #1e1e5f)',
              borderRadius: '2px',
            }
          }}
        >
          Thông Tin Tài Khoản
        </Typography>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography sx={{
            color: '#dc2626',
            mb: 3,
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            fontSize: '1rem', // Giảm font size
            bgcolor: 'rgba(255,255,255,0.9)',
            py: 1.5,
            px: 3,
            borderRadius: '10px',
            boxShadow: '0 6px 15px rgba(220,38,38,0.2)', // Giảm shadow
            maxWidth: '500px',
            mx: 'auto'
          }}>
            {error}
          </Typography>
        </motion.div>
      )}

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={7}> {/* Giảm từ md={8} xuống md={7} */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, type: 'spring' }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: '20px', // Giảm bo góc
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(15px)', // Giảm blur
                boxShadow: '0 15px 40px rgba(0,0,0,0.1), 0 8px 20px rgba(0,0,0,0.05)', // Giảm shadow
                border: '1px solid rgba(255,255,255,0.3)',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}> {/* Giảm padding */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Avatar
                      sx={{
                        width: 120, // Giảm từ 150 xuống 120
                        height: 120,
                        bgcolor: 'transparent',
                        p: 1,
                        position: 'relative',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          inset: '-10px',
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #00ddeb, #1e1e5f)',
                          zIndex: -1,
                          animation: 'rotate 3s linear infinite',
                          filter: 'blur(4px)',
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          inset: '-8px',
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, #1e1e5f, #00ddeb)',
                          zIndex: -1,
                          animation: 'rotate 4s linear infinite reverse',
                        },
                        '@keyframes rotate': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          bgcolor: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '4rem', // Giảm từ 5rem
                          fontWeight: 800,
                          color: '#1e1e5f',
                          boxShadow: 'inset 0 0 20px rgba(0,221,235,0.3)', // Giảm shadow
                          border: '1px solid rgba(0,221,235,0.5)',
                        }}
                      >
                        {userInfo.name?.charAt(0)?.toUpperCase() || 'N/A'}
                      </Box>
                    </Avatar>
                  </motion.div>
                  <Box sx={{ ml: 3 }}> {/* Giảm margin left */}
                    <Typography
                      variant="h5" // Giảm từ h4 xuống h5
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        color: '#1e1e5f',
                        mb: 0.5,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {userInfo.name || 'Chưa có tên'}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#6b7280',
                        fontSize: '1rem', // Giảm font size
                        fontWeight: 500,
                      }}
                    >
                      {userInfo.email || 'Chưa có email'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{
                  my: 3, // Giảm margin
                  background: 'linear-gradient(to right, transparent, rgba(0,221,235,0.4), transparent)',
                  height: '1px', // Giảm chiều cao
                }} />

                <List sx={{ px: 2 }}>
                  {[
                    { label: 'Tên', value: userInfo.name || 'Chưa có tên', field: 'name' },
                    { label: 'Email', value: userInfo.email || 'Chưa có email', field: 'email' },
                    {
                      label: 'Ngày tham gia',
                      value: userInfo.createdAt
                        ? new Date(userInfo.createdAt).toLocaleDateString('vi-VN')
                        : 'Chưa xác định'
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2, type: 'spring', stiffness: 300 }}
                    >
                      <ListItem
                        sx={{
                          py: 1.5, // Giảm padding
                          borderRadius: '12px',
                          mb: 1,
                          transition: 'all 0.4s ease',
                          background: 'rgba(255,255,255,0.8)',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.05)', // Giảm shadow
                          '&:hover': {
                            bgcolor: 'rgba(0,221,235,0.1)',
                            transform: 'translateX(5px)',
                            boxShadow: '0 6px 20px rgba(0,221,235,0.2)',
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography sx={{
                              fontFamily: 'Poppins, sans-serif',
                              fontWeight: 600,
                              color: '#1e1e5f',
                              fontSize: '1rem', // Giảm font size
                            }}>
                              {item.label}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{
                              fontFamily: 'Poppins, sans-serif',
                              color: '#6b7280',
                              fontSize: '0.9rem', // Giảm font size
                              mt: 0.3,
                            }}>
                              {item.value}
                            </Typography>
                          }
                        />
                        {item.field && (
                          <motion.div whileHover={{ scale: 1.2, rotate: 180 }} transition={{ duration: 0.4 }}>
                            <IconButton
                              edge="end"
                              onClick={() => handleEdit(item.field as 'name' | 'email')}
                              sx={{
                                color: '#00ddeb',
                                bgcolor: 'rgba(0,221,235,0.1)',
                                p: 1, // Giảm padding
                                '&:hover': {
                                  color: 'white',
                                  bgcolor: '#00ddeb',
                                  boxShadow: '0 0 12px rgba(0,221,235,0.5)', // Giảm shadow
                                }
                              }}
                            >
                              <EditIcon fontSize="small" /> {/* Giảm kích thước icon */}
                            </IconButton>
                          </motion.div>
                        )}
                      </ListItem>
                    </motion.div>
                  ))}
                </List>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setChangePasswordDialog(true)}
                    sx={{
                      mt: 3, // Giảm margin top
                      py: 1.5, // Giảm padding
                      borderRadius: '12px',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 700,
                      fontSize: '1rem', // Giảm font size
                      background: 'linear-gradient(45deg, #00ddeb 0%, #1e1e5f 100%)',
                      boxShadow: '0 8px 20px rgba(0,221,235,0.4)', // Giảm shadow
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1e1e5f 0%, #00ddeb 100%)',
                        boxShadow: '0 10px 25px rgba(0,221,235,0.6)',
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shine 2s infinite'
                      },
                    }}
                  >
                    Đổi Mật Khẩu
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <EditDialog
        open={editDialog.open}
        title={editDialog.title}
        fieldName={editDialog.fieldName}
        currentValue={editDialog.currentValue}
        onClose={() => setEditDialog({ ...editDialog, open: false })}
        onSave={handleSave}
      />

      <ChangePasswordDialog
        open={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
      />
    </Box>
  );
};

export default AccountInfo;