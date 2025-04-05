import { CloudUpload as CloudUploadIcon, Edit as EditIcon } from '@mui/icons-material';

import {
  Alert,
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
  Fade,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

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

interface EditHistory {
  _id: string;
  field: string;
  oldValue: string;
  newValue: string;
  updatedAt: string;
}

// Danh sách avatar chibi có sẵn
const chibiAvatars = [
  '/assets/avatars/chibi-1.png',
  '/assets/avatars/chibi-2.png',
  '/assets/avatars/chibi-3.png',
  '/assets/avatars/chibi-4.png',
  '/assets/avatars/chibi-5.png',
  '/assets/avatars/chibi-6.png',
  '/assets/avatars/chibi-7.png',
  '/assets/avatars/chibi-8.png',
  '/assets/avatars/chibi-9.png',
];

// Component Dialog chỉnh sửa thông tin
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
    <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <Dialog open={open} onClose={onClose} TransitionComponent={Fade} transitionDuration={600} PaperProps={{ sx: { width: '100%', maxWidth: '400px', borderRadius: '20px', overflow: 'hidden' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', py: 2, px: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.5px', position: 'relative', '&:before': { content: '""', position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', animation: 'glow 5s infinite' }, '@keyframes glow': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.2)' }, '100%': { transform: 'scale(1)' } } }}>
          {title}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(245, 247, 255, 0.95)', py: 3, px: 4, background: 'linear-gradient(180deg, rgba(245,247,255,0.95) 0%, rgba(230,235,255,0.95) 100%)', backdropFilter: 'blur(10px)' }}>
          <TextField autoFocus margin="dense" label={fieldName} type={fieldName === 'Email' ? 'email' : 'text'} fullWidth value={value} onChange={(e) => setValue(e.target.value)} variant="outlined" error={!!error} helperText={error} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.9rem', height: '40px', '&:hover fieldset': { borderColor: '#6366f1' }, '&.Mui-focused fieldset': { borderColor: '#6366f1', boxShadow: '0 0 10px rgba(99,102,241,0.3)' } }, '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#6b7280', fontWeight: 500, fontSize: '0.9rem' }, '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' } }} />
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'rgba(245, 247, 255, 0.95)', px: 4, py: 2, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <Button onClick={onClose} sx={{ fontFamily: 'Poppins, sans-serif', color: '#6b7280', px: 2, py: 1, borderRadius: '8px', fontSize: '0.9rem', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1', transform: 'translateY(-1px)' } }}>Hủy</Button>
          <motion.div whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleSave} variant="contained" sx={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(45deg, #6366f1 0%, #a855f7 100%)', borderRadius: '8px', px: 3, py: 1, boxShadow: '0 6px 20px rgba(99,102,241,0.4)', fontSize: '0.9rem', '&:hover': { background: 'linear-gradient(45deg, #a855f7 0%, #6366f1 100%)', boxShadow: '0 8px 25px rgba(99,102,241,0.5)' }, '&:before': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shine 2s infinite' }, '@keyframes shine': { '0%': { left: '-100%' }, '20%': { left: '100%' }, '100%': { left: '100%' } } }}>Lưu</Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

// Component Dialog đổi mật khẩu
const ChangePasswordDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
      await axiosInstance.put('/api/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <Dialog open={open} onClose={onClose} TransitionComponent={Fade} transitionDuration={600} PaperProps={{ sx: { width: '100%', maxWidth: '400px', borderRadius: '20px', overflow: 'hidden' } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', py: 2, px: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.5px', position: 'relative', '&:before': { content: '""', position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', animation: 'glow 5s infinite' } }}>Đổi Mật Khẩu</DialogTitle>
        <DialogContent sx={{ bgcolor: 'rgba(245, 247, 255, 0.95)', py: 3, px: 4, background: 'linear-gradient(180deg, rgba(245,247,255,0.95) 0%, rgba(230,235,255,0.95) 100%)', backdropFilter: 'blur(10px)' }}>
          {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu'].map((label, index) => (
            <TextField key={index} margin="dense" label={label} type="password" fullWidth value={index === 0 ? passwords.currentPassword : index === 1 ? passwords.newPassword : passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, [index === 0 ? 'currentPassword' : index === 1 ? 'newPassword' : 'confirmPassword']: e.target.value })} variant="outlined" error={index === 2 && !!error} helperText={index === 2 && error} sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.9rem', height: '40px', '&:hover fieldset': { borderColor: '#6366f1' }, '&.Mui-focused fieldset': { borderColor: '#6366f1', boxShadow: '0 0 10px rgba(99,102,241,0.3)' } }, '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#6b7280', fontWeight: 500, fontSize: '0.9rem' }, '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' } }} />
          ))}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'rgba(245, 247, 255, 0.95)', px: 4, py: 2, borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <Button onClick={onClose} sx={{ fontFamily: 'Poppins, sans-serif', color: '#6b7280', px: 2, py: 1, borderRadius: '8px', fontSize: '0.9rem', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1', transform: 'translateY(-1px)' } }}>Hủy</Button>
          <motion.div whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleSubmit} variant="contained" sx={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(45deg, #6366f1 0%, #a855f7 100%)', borderRadius: '8px', px: 3, py: 1, boxShadow: '0 6px 20px rgba(99,102,241,0.4)', fontSize: '0.9rem', '&:hover': { background: 'linear-gradient(45deg, #a855f7 0%, #6366f1 100%)', boxShadow: '0 8px 25px rgba(99,102,241,0.5)' }, '&:before': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shine 2s infinite' } }}>Đổi</Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

// Component Dialog chọn avatar
const AvatarDialog = ({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (avatar: string) => void }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelectedAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async () => {
    if (!file && !selectedAvatar) return;
    setUploading(true);
    try {
      if (file) {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await axiosInstance.post('/api/auth/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onSave(response.data.avatarUrl);
      } else if (selectedAvatar) {
        const response = await axiosInstance.post('/api/auth/upload-avatar', {
          avatarUrl: selectedAvatar,
        });
        onSave(response.data.avatarUrl);
      }
      onClose();
    } catch (error: any) {
      console.error('Lỗi khi upload avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      PaperProps={{ 
        sx: { 
          width: '100%', 
          maxWidth: '600px', 
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(243,244,255,0.95) 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 10px 25px rgba(99,102,241,0.3)',
          border: '1px solid rgba(255,255,255,0.8)'
        } 
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
        color: 'white', 
        py: 2.5, 
        px: 3, 
        fontFamily: 'Poppins, sans-serif', 
        fontWeight: 700, 
        fontSize: '1.2rem',
        textAlign: 'center',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '10%',
          width: '80%',
          height: '3px',
          background: 'rgba(255,255,255,0.5)',
          borderRadius: '3px'
        }
      }}>
        Thay Đổi Avatar
      </DialogTitle>

      <DialogContent sx={{ py: 3, px: { xs: 2, sm: 4 } }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)} 
          centered 
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: '#a855f7',
              height: '3px',
              borderRadius: '3px'
            },
            '& .MuiTab-root': {
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#6b7280',
              textTransform: 'none',
              '&.Mui-selected': {
                color: '#6366f1'
              }
            }
          }}
        >
          <Tab label="Avatar Chibi" />
          <Tab label="Tải lên" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#6366f1', textAlign: 'center' }}>
              Chọn Avatar Chibi
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {chibiAvatars.map((avatar, index) => (
                <Grid item xs={4} sm={4} md={4} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <motion.div 
                    whileHover={{ scale: 1.1, y: -5 }} 
                    whileTap={{ scale: 0.95 }}
                    animate={selectedAvatar === avatar ? { y: [-5, 0, -5], transition: { repeat: Infinity, duration: 1.5 } } : {}}
                  >
                    <Avatar
                      src={avatar}
                      sx={{
                        width: 80,
                        height: 80,
                        cursor: 'pointer',
                        border: selectedAvatar === avatar ? '3px solid #a855f7' : '3px solid transparent',
                        boxShadow: selectedAvatar === avatar ? '0 0 15px rgba(168,85,247,0.6)' : '0 5px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 25px rgba(99,102,241,0.5)'
                        }
                      }}
                      onClick={() => { setSelectedAvatar(avatar); setFile(null); }}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#6366f1' }}>
              Tải lên từ máy của bạn
            </Typography>
            
            <Box
              sx={{
                border: '2px dashed #d1d5db',
                borderRadius: '16px',
                p: 3,
                mb: 3,
                bgcolor: 'rgba(243,244,255,0.7)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#6366f1',
                  bgcolor: 'rgba(243,244,255,0.9)',
                }
              }}
              component="label"
            >
              {selectedAvatar && file ? (
                <Box sx={{ mb: 2 }}>
                  <motion.div whileHover={{ scale: 1.05, rotate: 5 }}>
                    <Avatar 
                      src={selectedAvatar} 
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                        border: '3px solid #a855f7'
                      }}
                    />
                  </motion.div>
                </Box>
              ) : (
                <CloudUploadIcon sx={{ fontSize: 60, color: '#6366f1', mb: 2 }} />
              )}
              
              <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#6b7280', mb: 1 }}>
                {file ? file.name : 'Kéo thả hoặc nhấn để chọn file'}
              </Typography>
              
              <Button 
                variant="outlined" 
                component="span"
                sx={{
                  borderRadius: '12px',
                  color: '#6366f1',
                  borderColor: '#6366f1',
                  '&:hover': {
                    borderColor: '#a855f7',
                    bgcolor: 'rgba(99,102,241,0.1)'
                  }
                }}
              >
                Chọn file
              </Button>
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Box>
            
            {file && (
              <Typography variant="caption" sx={{ display: 'block', color: '#6b7280', mt: -2, mb: 2 }}>
                Đã chọn: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 3, justifyContent: 'center', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
        <Button 
          onClick={onClose} 
          disabled={uploading}
          sx={{ 
            fontFamily: 'Poppins, sans-serif',
            color: '#6b7280',
            px: 3,
            py: 1.2,
            borderRadius: '10px',
            fontSize: '0.9rem',
            '&:hover': {
              bgcolor: 'rgba(99,102,241,0.1)',
              color: '#6366f1'
            }
          }}
        >
          Hủy
        </Button>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!selectedAvatar || uploading}
            sx={{
              fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(45deg, #6366f1 0%, #a855f7 100%)',
              borderRadius: '10px',
              px: 3,
              py: 1.2,
              boxShadow: '0 8px 20px rgba(99,102,241,0.4)',
              fontSize: '0.95rem',
              fontWeight: 600,
              minWidth: '120px',
              '&:hover': {
                background: 'linear-gradient(45deg, #a855f7 0%, #6366f1 100%)',
                boxShadow: '0 10px 25px rgba(99,102,241,0.6)'
              },
              '&.Mui-disabled': {
                background: '#d1d5db',
                color: '#9ca3af'
              }
            }}
          >
            {uploading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Lưu'}
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

// Component chính
const AccountInfo = () => {
  const theme = useTheme();
  const { isAuthenticated, user: authUser, loginWithGoogle, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [editDialog, setEditDialog] = useState({ open: false, title: '', fieldName: '', currentValue: '' });
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [avatarDialog, setAvatarDialog] = useState(false);
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Xử lý token từ Google OAuth
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const errorParam = urlParams.get('error');

      console.log('📥 Tham số URL:', { token, error: errorParam });

      if (token) {
        loginWithGoogle(token)
          .then(() => {
            console.log('✅ Đăng nhập Google thành công');
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch((err: Error) => {
            console.error('❌ Đăng nhập Google thất bại:', err.message);
            setError('Đăng nhập Google thất bại: ' + err.message);
          });
      } else if (errorParam) {
        console.warn('⚠️ Lỗi từ Google OAuth:', errorParam);
        setError(errorParam === 'OAuthFail' ? 'Đăng nhập Google thất bại' : 'Tài khoản bị khóa');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      console.error('❌ Lỗi trong useEffect (AccountInfo):', err.message);
      setError('Lỗi không xác định khi xử lý đăng nhập Google: ' + err.message);
    }
  }, [loginWithGoogle]);

  // Lấy thông tin user và lịch sử chỉnh sửa
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const [userResponse, historyResponse] = await Promise.all([
          axiosInstance.get('/api/auth/me'),
          axiosInstance.get('/api/auth/edit-history'),
        ]);
        console.log('📥 Thông tin user:', userResponse.data.user);
        console.log('📜 Lịch sử chỉnh sửa:', historyResponse.data);
        setUserInfo(userResponse.data.user);
        setEditHistory(historyResponse.data);
      } catch (error: any) {
        console.error('❌ Lỗi khi lấy thông tin user:', error.message);
        setError(error.response?.data?.message || 'Không thể tải thông tin user');
        if (error.response?.status === 401) {
          logout(); // Đăng xuất nếu token không hợp lệ
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [isAuthenticated, logout]);

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
      const field = editDialog.fieldName === 'Tên' ? 'name' : 'email';
      const response = await axiosInstance.put('/api/auth/update', { [field]: value });
      if (userInfo) {
        setUserInfo({ ...userInfo, [field]: value });
      }
      setError(null);
      // Cập nhật lại lịch sử chỉnh sửa
      const historyResponse = await axiosInstance.get('/api/auth/edit-history');
      setEditHistory(historyResponse.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Lỗi khi cập nhật');
      throw error;
    }
  };

  const handleAvatarSave = async (avatarUrl: string) => {
    try {
      await axiosInstance.put('/api/auth/update', { avatar: avatarUrl });
      const updatedAvatarUrl = `${avatarUrl}?v=${Date.now()}`;
      if (userInfo) {
        setUserInfo({ ...userInfo, avatar: updatedAvatarUrl });
      }
      setError(null);
      setSuccessMsg('🎉 Avatar đã được cập nhật thành công!');
      const historyResponse = await axiosInstance.get('/api/auth/edit-history');
      setEditHistory(historyResponse.data);
    } catch (error: any) {
      console.error('Lỗi khi cập nhật avatar:', error);
      setError(error.response?.data?.message || 'Lỗi khi cập nhật avatar');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (!isAuthenticated || !userInfo) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#4b5563', fontFamily: 'Poppins, sans-serif' }}>
          Bạn chưa đăng nhập
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#6b7280', maxWidth: 500, mx: 'auto' }}>
          Vui lòng đăng nhập để xem và quản lý thông tin tài khoản của bạn.
        </Typography>
        {error && (
          <Typography variant="body2" sx={{ color: 'error.main', mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
            {error}
          </Typography>
        )}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="contained"
            onClick={() => window.location.href = '/login'}
            sx={{
              fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(45deg, #6366f1 0%, #a855f7 100%)',
              borderRadius: '10px',
              px: 4,
              py: 1.5,
              boxShadow: '0 8px 20px rgba(99,102,241,0.4)',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Đăng Nhập
          </Button>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {error && (
        <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'error.light' }}>
          <Typography variant="body2" sx={{ color: 'error.main' }}>
            {error}
          </Typography>
        </Box>
      )}

      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4, 
          fontWeight: 800, 
          color: '#1f2937', 
          fontFamily: 'Poppins, sans-serif',
          textAlign: { xs: 'center', md: 'left' },
          fontSize: { xs: '1.8rem', md: '2.2rem' },
          background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Thông Tin Tài Khoản
      </Typography>

      <Grid container spacing={4}>
        {/* Thông tin cá nhân */}
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card sx={{ 
              borderRadius: '20px', 
              overflow: 'visible',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
              height: '100%',
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '30%',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                borderRadius: '20px 20px 0 0',
                zIndex: 0
              }
            }}>
              <CardContent sx={{ position: 'relative', pt: 7, pb: 3, px: 3, zIndex: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      src={userInfo.avatar} 
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        borderRadius: '50%',
                        border: '4px solid white',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        mb: 2,
                        bgcolor: '#6366f1'
                      }}
                    />
                    <IconButton 
                      onClick={() => setAvatarDialog(true)}
                      sx={{ 
                        position: 'absolute', 
                        right: 0, 
                        bottom: 10, 
                        bgcolor: 'white', 
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: '#f3f4ff' }
                      }}
                    >
                      <EditIcon sx={{ color: '#6366f1', fontSize: '1.2rem' }} />
                    </IconButton>
                  </Box>

                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#1f2937', 
                      mb: 0.5,
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '1.3rem'
                    }}
                  >
                    {userInfo.name}
                  </Typography>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6b7280', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    {userInfo.email}
                  </Typography>

                  <Box 
                    sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      px: 2, 
                      py: 0.8, 
                      borderRadius: '10px', 
                      bgcolor: userInfo.role === 'admin' ? 'rgba(220,38,38,0.1)' : 'rgba(99,102,241,0.1)',
                      mb: 3
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: userInfo.role === 'admin' ? '#dc2626' : '#6366f1',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {userInfo.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </Typography>
                  </Box>

                  <Box sx={{ width: '100%', mt: 0.5 }}>
                    <List>
                      <ListItem 
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleEdit('name')}>
                            <EditIcon sx={{ color: '#6366f1', fontSize: '1.2rem' }} />
                          </IconButton>
                        }
                        sx={{ px: 1, py: 1.5, borderBottom: '1px solid #f3f4ff' }}
                      >
                        <ListItemText 
                          primary="Tên" 
                          secondary={userInfo.name} 
                          primaryTypographyProps={{ fontWeight: 600, color: '#4b5563', fontSize: '0.85rem' }}
                          secondaryTypographyProps={{ color: '#6b7280' }}
                        />
                      </ListItem>

                      <ListItem 
                        secondaryAction={
                          <IconButton edge="end" onClick={() => handleEdit('email')}>
                            <EditIcon sx={{ color: '#6366f1', fontSize: '1.2rem' }} />
                          </IconButton>
                        }
                        sx={{ px: 1, py: 1.5, borderBottom: '1px solid #f3f4ff' }}
                      >
                        <ListItemText 
                          primary="Email" 
                          secondary={userInfo.email}
                          primaryTypographyProps={{ fontWeight: 600, color: '#4b5563', fontSize: '0.85rem' }}
                          secondaryTypographyProps={{ color: '#6b7280' }}
                        />
                      </ListItem>

                      <ListItem sx={{ px: 1, py: 1.5, borderBottom: '1px solid #f3f4ff' }}>
                        <ListItemText 
                          primary="Trạng thái" 
                          secondary={userInfo.isLocked ? 'Đã khóa' : 'Hoạt động'}
                          primaryTypographyProps={{ fontWeight: 600, color: '#4b5563', fontSize: '0.85rem' }}
                          secondaryTypographyProps={{ 
                            sx: { 
                              color: userInfo.isLocked ? '#dc2626' : '#10b981',
                              fontWeight: 600
                            }
                          }}
                        />
                      </ListItem>

                      <ListItem sx={{ px: 1, py: 1.5 }}>
                        <ListItemText 
                          primary="Xác thực email" 
                          secondary={userInfo.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                          primaryTypographyProps={{ fontWeight: 600, color: '#4b5563', fontSize: '0.85rem' }}
                          secondaryTypographyProps={{ 
                            sx: { 
                              color: userInfo.isVerified ? '#10b981' : '#f59e0b',
                              fontWeight: 600
                            }
                          }}
                        />
                      </ListItem>
                    </List>
                  </Box>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: '100%', marginTop: '16px' }}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => setChangePasswordDialog(true)}
                      sx={{
                        borderRadius: '12px',
                        py: 1.2,
                        color: '#6366f1',
                        borderColor: '#6366f1',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#4f46e5',
                          bgcolor: 'rgba(99,102,241,0.04)'
                        }
                      }}
                    >
                      Đổi Mật Khẩu
                    </Button>
                  </motion.div>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Chi tiết tài khoản */}
        <Grid item xs={12} md={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card sx={{ 
              borderRadius: '20px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' 
            }}>
              <CardContent sx={{ p: 0 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={(_, value) => setTabValue(value)}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '.MuiTabs-indicator': {
                      backgroundColor: '#6366f1',
                      height: 3,
                      borderRadius: '3px'
                    }
                  }}
                >
                  <Tab 
                    label="Thông tin chi tiết" 
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      color: tabValue === 0 ? '#6366f1' : '#6b7280',
                      '&.Mui-selected': {
                        color: '#6366f1'
                      }
                    }}
                  />
                  <Tab 
                    label="Lịch sử chỉnh sửa" 
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      color: tabValue === 1 ? '#6366f1' : '#6b7280',
                      '&.Mui-selected': {
                        color: '#6366f1'
                      }
                    }}
                  />
                </Tabs>
                
                {/* Tab thông tin chi tiết */}
                {tabValue === 0 && (
                  <Box sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ mb: 3, fontWeight: 700, color: '#4b5563', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Chi tiết tài khoản
                    </Typography>
                    
                    <List>
                      <ListItem sx={{ px: 1, py: 1.5, borderBottom: '1px solid #f3f4ff' }}>
                        <ListItemText 
                          primary="ID tài khoản" 
                          secondary={userInfo._id}
                          primaryTypographyProps={{ fontWeight: 600, color: '#4b5563', fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ color: '#6b7280', fontSize: '0.85rem' }}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 1, py: 1.5, borderBottom: '1px solid #f3f4ff' }}>
                        <ListItemText 
                          primary="Ngày tạo tài khoản" 
                          secondary={formatDate(userInfo.createdAt)}
                          primaryTypographyProps={{ fontWeight: 600, color: '#4b5563', fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ color: '#6b7280', fontSize: '0.85rem' }}
                        />
                      </ListItem>
                      
                      <ListItem sx={{ px: 1, py: 1.5 }}>
                        <ListItemText 
                          primary="Phân quyền" 
                          secondary={userInfo.role === 'admin' ? 'Quản trị viên' : 'Người dùng thường'}
                          primaryTypographyProps={{ fontWeight: 600, color: '#4b5563', fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ 
                            sx: { 
                              color: userInfo.role === 'admin' ? '#dc2626' : '#6366f1',
                              fontWeight: 500,
                              fontSize: '0.85rem' 
                            }
                          }}
                        />
                      </ListItem>
                    </List>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ mt: 4, mb: 3, fontWeight: 700, color: '#4b5563', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Bảo mật tài khoản
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ 
                          bgcolor: userInfo.isVerified ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          borderRadius: '16px',
                          border: `1px solid ${userInfo.isVerified ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                          boxShadow: 'none'
                        }}>
                          <CardContent>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 700, 
                                color: userInfo.isVerified ? '#10b981' : '#f59e0b',
                                mb: 1 
                              }}
                            >
                              Xác thực email
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4b5563', mb: 1 }}>
                              {userInfo.isVerified 
                                ? 'Email của bạn đã được xác thực' 
                                : 'Vui lòng xác thực email của bạn'}
                            </Typography>
                            {!userInfo.isVerified && (
                              <Button 
                                variant="outlined" 
                                size="small"
                                sx={{
                                  mt: 1,
                                  color: '#f59e0b',
                                  borderColor: '#f59e0b',
                                  '&:hover': {
                                    borderColor: '#d97706',
                                    bgcolor: 'rgba(245,158,11,0.04)'
                                  }
                                }}
                              >
                                Gửi lại email xác thực
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ 
                          bgcolor: 'rgba(99,102,241,0.1)',
                          borderRadius: '16px',
                          border: '1px solid rgba(99,102,241,0.3)',
                          boxShadow: 'none'
                        }}>
                          <CardContent>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 700, 
                                color: '#6366f1',
                                mb: 1 
                              }}
                            >
                              Mật khẩu
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4b5563', mb: 1 }}>
                              Thay đổi mật khẩu định kỳ để bảo vệ tài khoản
                            </Typography>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => setChangePasswordDialog(true)}
                              sx={{
                                mt: 1,
                                color: '#6366f1',
                                borderColor: '#6366f1',
                                '&:hover': {
                                  borderColor: '#4f46e5',
                                  bgcolor: 'rgba(99,102,241,0.04)'
                                }
                              }}
                            >
                              Đổi mật khẩu
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                {/* Tab lịch sử chỉnh sửa */}
                {tabValue === 1 && (
                  <Box sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ mb: 3, fontWeight: 700, color: '#4b5563', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Lịch sử thay đổi thông tin
                    </Typography>
                    
                    {editHistory.length === 0 ? (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6, 
                        color: '#6b7280',
                        bgcolor: 'rgba(243,244,255,0.7)',
                        borderRadius: '16px' 
                      }}>
                        <Typography variant="body1">
                          Chưa có thay đổi nào được ghi nhận
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ bgcolor: 'rgba(243,244,255,0.3)', borderRadius: '16px', overflow: 'hidden' }}>
                        {editHistory.map((item) => (
                          <ListItem 
                            key={item._id}
                            sx={{ 
                              flexDirection: 'column', 
                              alignItems: 'flex-start',
                              borderBottom: '1px solid rgba(99,102,241,0.1)',
                              p: 2,
                              '&:last-child': {
                                borderBottom: 'none'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: 600, 
                                  color: '#4b5563',
                                  fontSize: '0.95rem'
                                }}
                              >
                                {item.field === 'name' ? 'Tên' : 
                                 item.field === 'email' ? 'Email' : 
                                 item.field === 'avatar' ? 'Avatar' : item.field}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#6b7280',
                                  fontStyle: 'italic'
                                }}
                              >
                                {formatDate(item.updatedAt)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ width: '100%' }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
                                    Giá trị cũ:
                                  </Typography>
                                  {item.field === 'avatar' ? (
                                    <Avatar 
                                      src={item.oldValue} 
                                      sx={{ width: 40, height: 40, border: '1px solid #e5e7eb' }}
                                    />
                                  ) : (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: '#4b5563',
                                        bgcolor: 'rgba(243,244,246,0.7)',
                                        p: 1,
                                        borderRadius: '8px',
                                        wordBreak: 'break-all'
                                      }}
                                    >
                                      {item.oldValue || '(trống)'}
                                    </Typography>
                                  )}
                                </Grid>
                                
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
                                    Giá trị mới:
                                  </Typography>
                                  {item.field === 'avatar' ? (
                                    <Avatar 
                                      src={item.newValue} 
                                      sx={{ width: 40, height: 40, border: '1px solid #e5e7eb' }}
                                    />
                                  ) : (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        color: '#4b5563',
                                        bgcolor: 'rgba(243,244,246,0.7)',
                                        p: 1,
                                        borderRadius: '8px',
                                        wordBreak: 'break-all'
                                      }}
                                    >
                                      {item.newValue || '(trống)'}
                                    </Typography>
                                  )}
                                </Grid>
                              </Grid>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Dialog chỉnh sửa */}
      <EditDialog
        open={editDialog.open}
        title={editDialog.title}
        fieldName={editDialog.fieldName}
        currentValue={editDialog.currentValue}
        onClose={() => setEditDialog({ ...editDialog, open: false })}
        onSave={handleSave}
      />

      {/* Dialog đổi mật khẩu */}
      <ChangePasswordDialog
        open={changePasswordDialog}
        onClose={() => setChangePasswordDialog(false)}
      />

      {/* Dialog đổi avatar */}
      <AvatarDialog
        open={avatarDialog}
        onClose={() => setAvatarDialog(false)}
        onSave={handleAvatarSave}
      />

      {/* Snackbar thông báo thành công */}
      {successMsg && (
        <Snackbar
          open={!!successMsg}
          autoHideDuration={3000}
          onClose={() => setSuccessMsg(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled" sx={{ fontFamily: 'Poppins' }} onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default AccountInfo;