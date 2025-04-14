import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Typography,
} from '@mui/material';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
  
  const MotionBox = motion(Box);
  const MotionButton = motion(Button);
  
  const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Lấy token từ URL
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState<string>('');
    const [particlesLoaded, setParticlesLoaded] = useState(false);
  
    const particlesInit = useCallback(async () => {
      await loadSlim(window.tsParticles);
      setParticlesLoaded(true);
    }, []);
  
    useEffect(() => {
      particlesInit();
    }, [particlesInit]);
  
    useEffect(() => {
      const verifyEmail = async () => {
        if (!token) {
          setStatus('error');
          setMessage('Token không hợp lệ. Vui lòng thử lại.');
          return;
        }
  
        try {
          const response = await axiosInstance.get(`/api/auth/verify-email?token=${token}`);
          if (response.status === 200) {
            setStatus('success');
            setMessage(response.data.message || 'Email đã được xác thực thành công!');
            setTimeout(() => navigate('/login'), 3000); // Chuyển về login sau 3s
          } else {
            setStatus('error');
            setMessage('Xác thực thất bại! Token không hợp lệ hoặc đã hết hạn.');
          }
        } catch (error: any) {
          console.error('❌ Lỗi xác thực:', error);
          setStatus('error');
          setMessage(
            error.response?.data?.message || 'Xác thực thất bại! Token không hợp lệ hoặc đã hết hạn.'
          );
        }
      };
  
      verifyEmail();
    }, [token, navigate]);
  
    const handleResendEmail = async () => {
      try {
        setStatus('loading');
        setMessage('Đang gửi lại email xác thực...');
        const response = await axiosInstance.post('/api/auth/resend-verification', {
          email: searchParams.get('email') || '',
        });
        setStatus('success');
        setMessage(response.data.message || 'Email xác thực đã được gửi lại! Vui lòng kiểm tra hộp thư.');
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 'Không thể gửi lại email xác thực. Vui lòng thử lại sau.'
        );
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
          background: 'linear-gradient(135deg, #0A0A23 0%, #1C1C3D 100%)',
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
                color: { value: '#A78BFA' },
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
          maxWidth="sm"
          sx={{
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: '20px',
              background: 'rgba(28, 28, 61, 0.95)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              maxWidth: 500,
              width: '100%',
            }}
          >
            {/* Hình ảnh minh họa */}
            <Box sx={{ mb: 3 }}>
              <img
                src="https://fakebill.taobillgia.com/public/src/vtd/img/svg/verify-email.svg"
                alt="Verify Email Illustration"
                style={{ width: '150px', height: '150px' }}
              />
            </Box>
  
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 2,
              }}
            >
              Xác thực email của bạn 📧
            </Typography>
  
            {status === 'loading' && (
              <>
                <CircularProgress sx={{ color: '#A78BFA', mb: 2 }} />
                <Typography
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    color: '#A1A1AA',
                    fontSize: { xs: '1rem', sm: '1.2rem' },
                  }}
                >
                  {message || 'Đang xác thực email...'}
                </Typography>
              </>
            )}
  
            {status === 'success' && (
              <>
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#333',
                  }}
                >
                  ✅ {message}
                </Alert>
                <MotionButton
                  variant="contained"
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{
                    py: 1.5,
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: '#A78BFA',
                    color: '#FFFFFF',
                    '&:hover': { background: '#906EEB' },
                  }}
                >
                  Đi đến trang đăng nhập
                </MotionButton>
              </>
            )}
  
            {status === 'error' && (
              <>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#333',
                  }}
                >
                  ❌ {message}
                </Alert>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <MotionButton
                    variant="outlined"
                    onClick={handleResendEmail}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      py: 1.5,
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      borderColor: '#A78BFA',
                      color: '#A78BFA',
                      '&:hover': { borderColor: '#906EEB', color: '#906EEB' },
                    }}
                  >
                    Gửi lại email xác thực
                  </MotionButton>
                  <MotionButton
                    variant="contained"
                    onClick={() => navigate('/register')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      py: 1.5,
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      background: '#A78BFA',
                      color: '#FFFFFF',
                      '&:hover': { background: '#906EEB' },
                    }}
                  >
                    Quay lại trang đăng ký
                  </MotionButton>
                </Box>
              </>
            )}
          </MotionBox>
        </Container>
      </Box>
    );
  };
  
  export default VerifyEmail;