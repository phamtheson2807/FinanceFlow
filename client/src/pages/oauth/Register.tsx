import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Khai báo kiểu cho window.turnstile
interface Turnstile {
  render: (element: HTMLElement | null, options: {
    sitekey: string;
    callback: (token: string) => void;
    'error-callback'?: (errorCode: string) => void;
  }) => string | undefined; // Trả về widget ID
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile: Turnstile;
  }
}

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [particlesLoaded, setParticlesLoaded] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined); // Lưu widget ID

  const particlesInit = useCallback(async () => {
    await loadSlim(window.tsParticles);
    setParticlesLoaded(true);
  }, []);

  useEffect(() => {
    particlesInit();
  }, [particlesInit]);

  // Tải script Turnstile và render widget
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
    script.async = true;
  
    script.onload = () => {
      try {
        if (window.turnstile && turnstileRef.current) {
          if (widgetIdRef.current) {
            window.turnstile.remove(widgetIdRef.current);
          }
  
          const widgetId = window.turnstile.render(turnstileRef.current, {
            sitekey: '0x4AAAAAABBx1f9dbxt8kKvn',
            callback: (token: string) => setCaptchaToken(token),
            'error-callback': () => {
              setError('Lỗi xác thực CAPTCHA. Vui lòng thử lại.');
              setCaptchaToken(null);
            },
          });
  
          widgetIdRef.current = widgetId;
        }
      } catch (err) {
        console.error('Lỗi khởi tạo CAPTCHA:', err);
        setError('Không thể khởi tạo CAPTCHA. Vui lòng thử lại.');
      }
    };
  
    script.onerror = () => {
      setError('Không thể tải CAPTCHA từ máy chủ. Kiểm tra mạng hoặc thử lại sau.');
    };
  
    document.body.appendChild(script);
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!captchaToken) {
      setError('Vui lòng xác thực CAPTCHA trước khi đăng ký.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        ...formData,
        captchaToken,
      });
      setMessage('Đăng ký thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Đăng ký thất bại');
    }
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
          justifyContent: 'center',
          px: 0,
          width: '100%',
          position: 'relative',
        }}
      >
<Box
          sx={{
            flex: 1.5,
            display: { xs: 'none', md: 'block' },
            pl: 30, // Giữ nguyên padding bên trái
            pr: 1, // Giữ nguyên padding bên phải
          }}
        >
          <img
            src="https://app.taobillgia.com/public/src/vtd/img/svg/log-in-girl.svg"
            alt="Log In Girl"
            style={{
              width: '100%',
              maxWidth: '600px', // Giữ nguyên maxWidth
            }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            maxWidth: { xs: '100%', md: '400px' },
            mr: 0,
            pr: 0,
            ml: 'auto',
            zIndex: 2,
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
              Đăng ký tài khoản 👋
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Poppins', sans-serif",
                color: '#A1A1AA',
                mb: 3,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Tạo tài khoản mới để sử dụng dịch vụ
            </Typography>

            {message && (
              <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#000',
                  }}
                >
                  {message}
                </Alert>
              </MotionBox>
            )}

            {error && (
              <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#000',
                  }}
                >
                  {error}
                </Alert>
              </MotionBox>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Họ và tên"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#A78BFA' }} />
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

              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <div ref={turnstileRef} className="cf-turnstile"></div>
              </Box>

              <MotionButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={!captchaToken}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: '#A78BFA',
                  color: '#FFFFFF',
                  '&:hover': { background: '#906EEB' },
                  '&:disabled': {
                    background: '#A1A1AA',
                    cursor: 'not-allowed',
                  },
                }}
              >
                Đăng ký
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
                  onClick={() => navigate('/login')}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: '#A78BFA',
                    '&:hover': { color: '#906EEB' },
                  }}
                >
                  Đã có tài khoản? Đăng nhập
                </Button>
              </Box>
            </Box>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;