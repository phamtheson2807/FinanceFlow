import { Email } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Container,
    InputAdornment,
    TextField,
    Typography
} from '@mui/material';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
  
  const MotionBox = motion(Box);
  const MotionButton = motion(Button);
  
  const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [particlesLoaded, setParticlesLoaded] = useState(false);
  
    const particlesInit = useCallback(async () => {
      await loadSlim(window.tsParticles);
      setParticlesLoaded(true);
    }, []);
  
    useEffect(() => {
      particlesInit();
    }, [particlesInit]);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage('');
      setError('');
  
      try {
        console.log('📡 Gửi yêu cầu quên mật khẩu...', email);
        const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
        console.log('✅ Phản hồi API:', res.data);
        setMessage(res.data.message);
      } catch (err: any) {
        console.error('❌ Lỗi khi gửi yêu cầu:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Lỗi khi gửi yêu cầu');
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
          background: '#0A0A23', // Màu nền giống form đăng nhập
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
  
        <Container maxWidth="xs">
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
            sx={{
              mt: 8,
              p: 4,
              borderRadius: '20px',
              background: '#1C1C3D', // Màu nền giống form đăng nhập
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 1,
              }}
            >
              🔐 Quên mật khẩu
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                color: '#A1A1AA',
                mb: 3,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              Nhập email để nhận liên kết đặt lại mật khẩu.
            </Typography>
  
            <Box component="form" onSubmit={handleSubmit}>
              <MotionBox
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#A78BFA' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
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
  
              <MotionButton
                type="submit"
                fullWidth
                variant="contained"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                sx={{
                  py: 1.5,
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: '#A78BFA',
                  color: '#FFFFFF',
                  '&:hover': { background: '#906EEB' },
                }}
              >
                Gửi yêu cầu
              </MotionButton>
            </Box>
  
            {message && (
              <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Alert
                  severity="success"
                  sx={{
                    mt: 2,
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
                    mt: 2,
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#000',
                  }}
                >
                  {error}
                </Alert>
              </MotionBox>
            )}
  
            <Box sx={{ mt: 3 }}>
              <Button
                onClick={() => window.history.back()}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  color: '#A1A1AA',
                  '&:hover': { color: '#A78BFA' },
                }}
              >
                Quay lại
              </Button>
            </Box>
          </MotionBox>
        </Container>
      </Box>
    );
  };
  
  export default ForgotPassword;