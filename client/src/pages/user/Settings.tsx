import {
  ExitToApp,
  Language,
  Security,
  Visibility
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  Typography,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';

interface UserSettings {
  darkMode: boolean;
  emailNotifications: boolean;
  showBalance: boolean;
  currency: string;
  language: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode, setCurrency: setGlobalCurrency } = useThemeContext();
  const { language, changeLanguage, t } = useLanguage();
  const theme = useTheme();

  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    emailNotifications: true,
    showBalance: true,
    currency: 'VND',
    language: 'vi'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📌 Fetching settings');
      const response = await axiosInstance.get('/api/settings');

      console.log('📌 Settings response:', response.data);
      if (response.data) {
        setSettings(response.data);
        // Đồng bộ darkMode từ API với ThemeContext
        if (response.data.darkMode !== darkMode) {
          toggleDarkMode();
        }
      }
    } catch (error: any) {
      console.error('❌ Lỗi fetchSettings:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || t('settings.save_error'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [darkMode, toggleDarkMode, t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSettingChange = async (setting: keyof UserSettings, value: any) => {
    setLoading(true);
    try {
      if (setting === 'darkMode') {
        toggleDarkMode(); // Cập nhật theme toàn cục
      } else if (setting === 'language') {
        changeLanguage(value); // Cập nhật ngôn ngữ toàn cục
      } else if (setting === 'currency') {
        setGlobalCurrency(value); // Cập nhật tiền tệ toàn cục
      }

      await axiosInstance.put('/api/settings', { [setting]: value });
      setSettings((prev) => ({ ...prev, [setting]: value }));
      setSnackbar({
        open: true,
        message: t('settings.save_success'),
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: t('settings.save_error') + ': ' + (error.response?.data?.message || error.message),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setConfirmLogout(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.mode === 'dark' ? '#fff' : 'primary.main',
            mb: 4,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          {t('settings.title')}
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: theme.palette.mode === 'dark' ? '#A78BFA' : 'primary.main' }}>
                  <Visibility sx={{ mr: 1 }} /> Giao diện & Ngôn ngữ
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={<Switch checked={darkMode} onChange={(e) => handleSettingChange('darkMode', e.target.checked)} color="primary" />}
                    label={<Typography sx={{ fontWeight: 500 }}>Chế độ tối<FormHelperText>Chuyển đổi giữa giao diện sáng và tối.</FormHelperText></Typography>}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Tiền tệ</InputLabel>
                  <Select value={settings.currency} label="Tiền tệ" onChange={(e) => handleSettingChange('currency', e.target.value)}>
                    <MenuItem value="VND">VNĐ</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                  </Select>
                  <FormHelperText>Chọn loại tiền tệ hiển thị trong ứng dụng.</FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Ngôn ngữ</InputLabel>
                  <Select value={settings.language} label="Ngôn ngữ" onChange={(e) => handleSettingChange('language', e.target.value)} startAdornment={<Language sx={{ mr: 1, ml: -0.5 }} />}>
                    <MenuItem value="vi">Tiếng Việt</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                  <FormHelperText>Chọn ngôn ngữ giao diện.</FormHelperText>
                </FormControl>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: theme.palette.mode === 'dark' ? '#A78BFA' : 'primary.main' }}>
                  <Security sx={{ mr: 1 }} /> Bảo mật & Quyền riêng tư
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={<Switch checked={settings.showBalance} onChange={(e) => handleSettingChange('showBalance', e.target.checked)} color="primary" />}
                    label={<Typography sx={{ fontWeight: 500 }}>Ẩn/Hiện số dư<FormHelperText>Bật để hiển thị số dư tài khoản, tắt để ẩn số dư khỏi màn hình.</FormHelperText></Typography>}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={<Switch checked={settings.emailNotifications} onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)} color="primary" />}
                    label={<Typography sx={{ fontWeight: 500 }}>Nhận thông báo qua Email<FormHelperText>Bật để nhận thông báo về hoạt động tài khoản qua email.</FormHelperText></Typography>}
                  />
                </FormControl>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div>
            <Card elevation={3} sx={{ borderLeft: '5px solid #ef4444' }}>
              <CardContent>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, color: 'error.main' }}>
                  <ExitToApp sx={{ mr: 1 }} /> Đăng xuất
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ mb: 2 }}>Đăng xuất khỏi tài khoản của bạn trên thiết bị này.</Typography>
                <Button variant="contained" color="error" startIcon={<ExitToApp />} onClick={() => setConfirmLogout(true)} sx={{ '&:hover': { backgroundColor: 'error.dark' }, px: 3, py: 1, borderRadius: 2 }}>
                  Đăng xuất
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Dialog xác nhận đăng xuất */}
      <Dialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        sx={{ '& .MuiPaper-root': { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>{t('settings.logout.confirm_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('settings.logout.confirm_message')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setConfirmLogout(false)}>
            {t('settings.logout.cancel')}
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="contained" 
            color="error"
            autoFocus
          >
            {t('settings.logout.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
          }}
        >
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;