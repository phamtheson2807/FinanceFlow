import {
  ExitToApp,
  Security,
  Visibility,
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
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';

interface UserSettings {
  darkMode: boolean;
  emailNotifications: boolean;
  showBalance: boolean;
  currency: string;
  aiFinancialManagement: boolean;
}

const Settings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeContext();

  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    emailNotifications: true,
    showBalance: true,
    currency: 'VND',
    aiFinancialManagement: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [loading, setLoading] = useState(false);
  const [checkingAI, setCheckingAI] = useState(false);
  const [showAIResultPopup, setShowAIResultPopup] = useState(false);

  const getToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('No token found');

      console.log('📌 Fetching settings with token:', token.slice(0, 20) + '...');
      const response = await axios.get('http://localhost:5000/api/settings', {
        headers: { Authorization: token },
      });

      console.log('📌 Settings response:', response.data);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error: any) {
      console.error('❌ Lỗi fetchSettings:', error);
      showSnackbar(
        error.response?.data?.message || 'Lỗi khi tải cài đặt',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const generateAIFinancialReport = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error('No token found');

      console.log('📌 Generating AI financial report with token:', token.slice(0, 20) + '...');
      const response = await axios.post('http://localhost:5000/api/ai/report', {}, {
        headers: { Authorization: token },
      });

      console.log('📌 AI Report response:', response.data);
      return response.data; // Trả về báo cáo để dùng nếu cần
    } catch (error: any) {
      showSnackbar('Lỗi khi tạo báo cáo tài chính: ' + (error.response?.data?.message || error.message), 'error');
      throw error;
    }
  };

  const handleSettingChange = async (setting: keyof UserSettings, value: any) => {
    setLoading(true);
    try {
      if (setting === 'darkMode') {
        toggleDarkMode();
      }

      if (setting === 'aiFinancialManagement' && value === true) {
        if (!window.confirm('Bạn có muốn bật AI Quản Lý Tài Chính? AI sẽ tạo báo cáo tài chính ngay lập tức.')) {
          setLoading(false);
          return;
        }
        setCheckingAI(true);
        await generateAIFinancialReport(); // Tạo báo cáo ngay
        setCheckingAI(false);
        setShowAIResultPopup(true); // Hỏi xem báo cáo
        setSettings((prev) => ({ ...prev, [setting]: value }));
        showSnackbar('Đã bật AI và tạo báo cáo tài chính', 'success');
        setLoading(false);
        return;
      }

      const token = getToken();
      if (!token) throw new Error('No token found');

      await axios.put(
        'http://localhost:5000/api/settings',
        { [setting]: value },
        { headers: { Authorization: token } }
      );
      setSettings((prev) => ({ ...prev, [setting]: value }));
      showSnackbar('Cập nhật cài đặt thành công', 'success');
    } catch (error: any) {
      showSnackbar('Lỗi khi cập nhật cài đặt: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAIResultPopup = () => {
    setShowAIResultPopup(false);
  };

  const handleViewAIReport = () => {
    navigate('/dashboard/ai-report');
    setShowAIResultPopup(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main, fontFamily: 'Poppins, sans-serif' }}>
        Cài đặt
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Poppins, sans-serif' }}>
                <Visibility sx={{ mr: 1 }} /> Giao diện
              </Typography>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                }
                label="Chế độ tối"
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Đơn vị tiền tệ</InputLabel>
                <Select
                  value={settings.currency}
                  label="Đơn vị tiền tệ"
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <MenuItem value="VND" sx={{ fontFamily: 'Poppins, sans-serif' }}>VND - Việt Nam Đồng</MenuItem>
                  <MenuItem value="USD" sx={{ fontFamily: 'Poppins, sans-serif' }}>USD - US Dollar</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Poppins, sans-serif' }}>
                <Security sx={{ mr: 1 }} /> Bảo mật, Thông báo & AI
              </Typography>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showBalance}
                    onChange={(e) => handleSettingChange('showBalance', e.target.checked)}
                  />
                }
                label="Hiển thị số dư"
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Thông báo qua email"
                sx={{ fontFamily: 'Poppins, sans-serif', mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.aiFinancialManagement}
                    onChange={(e) => handleSettingChange('aiFinancialManagement', e.target.checked)}
                  />
                }
                label="Bật AI Quản Lý Tài Chính"
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'error.main', fontFamily: 'Poppins, sans-serif' }}>
                <ExitToApp sx={{ mr: 1 }} /> Đăng xuất
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography color="text.secondary" paragraph sx={{ fontFamily: 'Poppins, sans-serif' }}>
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<ExitToApp />}
                onClick={handleLogout}
                sx={{ '&:hover': { backgroundColor: 'error.dark' }, fontFamily: 'Poppins, sans-serif' }}
              >
                Đăng xuất
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1200,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {checkingAI && (
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
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1200,
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2, fontFamily: 'Poppins, sans-serif', color: '#333' }}>
            Đang tạo báo cáo tài chính bằng AI...
          </Typography>
        </Box>
      )}

      <Dialog
        open={showAIResultPopup}
        onClose={handleCloseAIResultPopup}
        aria-labelledby="ai-report-dialog-title"
        sx={{ fontFamily: 'Poppins, sans-serif' }}
      >
        <DialogTitle id="ai-report-dialog-title" sx={{ fontFamily: 'Poppins, sans-serif', color: '#1E90FF' }}>
          Kết quả Phân tích AI
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}>
            AI đã hoàn thành tạo báo cáo tài chính của bạn. Bạn có muốn xem chi tiết không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAIResultPopup} sx={{ fontFamily: 'Poppins, sans-serif', color: '#D32F2F' }}>
            Đóng
          </Button>
          <Button onClick={handleViewAIReport} sx={{ fontFamily: 'Poppins, sans-serif', color: '#1E90FF' }}>
            Xem
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontFamily: 'Poppins, sans-serif' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;