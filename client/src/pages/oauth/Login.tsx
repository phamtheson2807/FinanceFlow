import {
  Email,
  Google,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [particlesLoaded, setParticlesLoaded] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const particlesInit = useCallback(async () => {
    await loadSlim(window.tsParticles);
    setParticlesLoaded(true);
  }, []);

  useEffect(() => {
    particlesInit();
  }, [particlesInit]);

  // Kiểm tra nếu có email đã lưu trong localStorage khi vào trang
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true); // Tự động tích checkbox nếu có email đã lưu
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get('verified');
    const oauthError = params.get('error');

    if (verified === 'true') {
      setSuccessMessage('✅ Xác thực email thành công! Bạn có thể đăng nhập.');
    } else if (oauthError === 'OAuthFail') {
      setError('❌ Đăng nhập Google thất bại. Vui lòng thử lại.');
    } else if (oauthError === 'AccountLocked') {
      setError('❌ Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    } else if (oauthError === 'invalid_token') {
      setError('❌ Token xác thực không hợp lệ hoặc đã hết hạn.');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
  
    try {
      await login(email, password);
  
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('savedEmail');
      }
  
      // Thêm log để kiểm tra token
      const token = localStorage.getItem('token');
      console.log('✅ Token sau khi đăng nhập:', token);
  
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Cải thiện thông báo lỗi
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
      setError(errorMessage);
      console.error('❌ Lỗi đăng nhập:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#0A0A23',
      }}
    >
      {particlesLoaded && (
        <Particles
          id="tsparticles"
          options={{
            background: { color: { value: 'transparent' } },
            fpsLimit: 60,
            particles: {
              number: { value: 50, density: { enable: true } },
              color: { value: '#ffffff' },
              shape: { type: 'circle' },
              opacity: { value: { min: 0.1, max: 0.5 } },
              size: { value: { min: 1, max: 3 } },
              move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: true,
                straight: false,
                outModes: 'out',
              },
            },
            interactivity: {
              events: {
                onHover: { enable: true, mode: 'repulse' },
                onClick: { enable: true, mode: 'push' },
              },
              modes: {
                repulse: { distance: 100, duration: 0.4 },
                push: { quantity: 4 },
              },
            },
            detectRetina: true,
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />
      )}

      <Container
        maxWidth={false}
        sx={{
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 0,
          width: '100%',
        }}
      >
        {/* Hình ảnh cô gái - Giữ nguyên thuộc tính */}
        <Box
          sx={{
            flex: 1.5,
            display: { xs: 'none', md: 'block' },
            pl: 30, // Giữ nguyên padding bên trái
            pr: 1, // Giữ nguyên padding bên phải
          }}
        >
          <img
            src="https://fakebill.taobillgia.com/public/src/vtd/img/svg/log-in-girl.svg"
            alt="Log In Girl"
            style={{
              width: '100%',
              maxWidth: '600px', // Giữ nguyên maxWidth
            }}
          />
        </Box>

        {/* Form đăng nhập sát bên phải */}
        <Box
          sx={{
            flex: 1,
            maxWidth: { xs: '100%', md: '400px' },
            mr: 0,
            pr: 0,
            ml: 'auto',
          }}
        >
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: '20px 0 0 20px',
              background: '#1C1C3D',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 1,
              }}
            >
              Chào mừng trở lại! 👋
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Poppins', sans-serif",
                color: '#A1A1AA',
                mb: 3,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Vui lòng đăng nhập để sử dụng dịch vụ
            </Typography>

            {successMessage && (
              <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Alert severity="success" sx={{ mb: 2, borderRadius: '10px', background: 'rgba(255, 255, 255, 0.9)' }}>
                  {successMessage}
                </Alert>
              </MotionBox>
            )}

            {error && (
              <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', background: 'rgba(255, 255, 255, 0.9)' }}>
                  {error}
                </Alert>
              </MotionBox>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <MotionBox initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Tài Khoản"
                  placeholder="Nhập email hoặc tài khoản"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#A78BFA' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '10px',
                      background: '#2A2A4A',
                      color: '#FFFFFF',
                      '&:hover': { background: '#3A3A5A' },
                      '&.Mui-focused': { background: '#3A3A5A' },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#A1A1AA',
                      '&.Mui-focused': { color: '#A78BFA' },
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#3A3A5A' },
                      '&:hover fieldset': { borderColor: '#A78BFA' },
                      '&.Mui-focused fieldset': { borderColor: '#A78BFA' },
                    },
                  }}
                />
              </MotionBox>

              <MotionBox initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Mật Khẩu"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu được bảo mật"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#A78BFA' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? (
                            <VisibilityOff sx={{ color: '#A78BFA' }} />
                          ) : (
                            <Visibility sx={{ color: '#A78BFA' }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: '10px',
                      background: '#2A2A4A',
                      color: '#FFFFFF',
                      '&:hover': { background: '#3A3A5A' },
                      '&.Mui-focused': { background: '#3A3A5A' },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#A1A1AA',
                      '&.Mui-focused': { color: '#A78BFA' },
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#3A3A5A' },
                      '&:hover fieldset': { borderColor: '#A78BFA' },
                      '&.Mui-focused fieldset': { borderColor: '#A78BFA' },
                    },
                  }}
                />
              </MotionBox>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: '#A1A1AA',
                        '&.Mui-checked': { color: '#A78BFA' },
                      }}
                    />
                  }
                  label="Lưu đăng nhập"
                  sx={{
                    color: '#A1A1AA',
                    '&:hover': { color: '#A78BFA' },
                  }}
                />
                <Button
                  onClick={() => navigate('/forgot-password')}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    color: '#A1A1AA',
                    '&:hover': { color: '#A78BFA' },
                  }}
                >
                  Quên mật khẩu?
                </Button>
              </Box>

              <MotionButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                sx={{
                  mt: 1,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: '#A78BFA',
                  color: '#FFFFFF',
                  '&:hover': { background: '#906EEB' },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Đăng Nhập'}
              </MotionButton>

              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  color: '#A1A1AA',
                  my: 2,
                  fontSize: '0.9rem',
                }}
              >
                HOẶC
              </Typography>

              <MotionButton
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                onClick={handleGoogleLogin}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                sx={{
                  py: 1.5,
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderColor: '#3A3A5A',
                  color: '#FFFFFF',
                  background: '#2A2A4A',
                  '&:hover': {
                    borderColor: '#A78BFA',
                    background: '#3A3A5A',
                  },
                }}
              >
                Đăng Nhập Bằng Google
              </MotionButton>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={() => navigate('/')}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    color: '#A1A1AA',
                    '&:hover': { color: '#A78BFA' },
                  }}
                >
                  Quay trở lại trang chủ
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#A78BFA',
                    '&:hover': { color: '#906EEB' },
                  }}
                >
                  Đăng Ký Ngay
                </Button>
              </Box>
            </Box>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;