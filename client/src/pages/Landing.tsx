import { BarChart, Savings, Security, Star, TrendingUp } from '@mui/icons-material';
import { Avatar, Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import Particles, { initParticlesEngine } from '@tsparticles/react'; // Sử dụng initParticlesEngine
import { loadSlim } from '@tsparticles/slim';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatBot from '../components/ChatBot';
import FinanceImage from '../img/finance.png';
import FinanceLogo from '../img/FinanceFlow.gif';

const Landing = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const springConfig = { type: 'spring', stiffness: 200, damping: 25 };
  const [particlesLoaded, setParticlesLoaded] = useState(false);

  // Khởi tạo Particles engine
  const particlesInit = useCallback(async () => {
    try {
      await initParticlesEngine(async (engine) => {
        await loadSlim(engine); // Load slim engine
      });
      setParticlesLoaded(true);
    } catch (error) {
      console.error('Failed to initialize particles:', error);
    }
  }, []);

  useEffect(() => {
    particlesInit();
  }, [particlesInit]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0A0A23',
        color: '#1E293B',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Inter', sans-serif",
        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
      }}
      ref={ref}
    >
      {/* Import Inter Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* Hiệu ứng Particles */}
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

      {/* Header (Thanh menu) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          zIndex: 100,
          background: 'linear-gradient(45deg, #A78BFA10, #60A5FA10)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            height: { xs: 60, sm: 70 },
            py: 0,
          }}
        >
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component={motion.img}
                src={FinanceLogo}
                alt="Finance Manager Logo"
                sx={{
                  height: { xs: 100, sm: 100 },
                  width: 'auto',
                  objectFit: 'contain',
                  maxHeight: { xs: 60, sm: 70 },
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontSize: { xs: '1.2rem', sm: '1.6rem' },
                  letterSpacing: '-0.02em',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                FinanceFlow
              </Typography>
            </Box>
          </motion.div>
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mt: { xs: 1, sm: 0 } }}>
            <Button
              sx={{
                borderRadius: 50,
                px: { xs: 2.5, sm: 4 },
                py: { xs: 0.8, sm: 1.2 },
                background: 'linear-gradient(45deg, #A78BFA, #60A5FA)',
                color: '#fff',
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '1rem' },
                boxShadow: '0 4px 15px rgba(167, 139, 250, 0.4)',
                transition: 'all 0.3s ease',
                fontFamily: "'Inter', sans-serif",
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 20px rgba(167, 139, 250, 0.6)',
                  background: 'linear-gradient(45deg, #906EEB, #4A90E2)',
                },
              }}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
            <Button
              sx={{
                borderRadius: 50,
                px: { xs: 2.5, sm: 4 },
                py: { xs: 0.8, sm: 1.2 },
                border: '2px solid #A78BFA',
                color: '#A78BFA',
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '1rem' },
                transition: 'all 0.3s ease',
                fontFamily: "'Inter', sans-serif",
                '&:hover': {
                  borderColor: '#60A5FA',
                  color: '#60A5FA',
                  transform: 'translateY(-3px)',
                  background: 'rgba(96, 165, 250, 0.1)',
                },
              }}
              onClick={() => navigate('/register')}
            >
              Đăng ký
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Các section khác giữ nguyên */}
      {/* Hero Section */}
      <Container sx={{ pt: { xs: 12, sm: 18 }, pb: { xs: 8, sm: 14 }, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={{ xs: 3, sm: 5 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ...springConfig }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                  lineHeight: 1.1,
                  color: '#FFFFFF',
                  mb: { xs: 2, sm: 4 },
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(45deg, #A78BFA, #60A5FA)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Quản Lý Tài Chính <br /> Dễ Dàng Hơn Bao Giờ Hết
              </Typography>
              <Typography
                sx={{
                  color: '#A1A1AA',
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                  maxWidth: '90%',
                  mb: { xs: 4, sm: 6 },
                  lineHeight: 1.6,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Theo dõi thu chi, lập kế hoạch tài chính và đầu tư thông minh với FinanceFlow.
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                <Button
                  sx={{
                    borderRadius: 50,
                    px: { xs: 4, sm: 6 },
                    py: { xs: 1.2, sm: 1.8 },
                    background: 'linear-gradient(45deg, #A78BFA, #60A5FA)',
                    color: '#fff',
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    fontWeight: 700,
                    boxShadow: '0 8px 25px rgba(167, 139, 250, 0.5)',
                    transition: 'all 0.3s ease',
                    fontFamily: "'Inter', sans-serif",
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(167, 139, 250, 0.7)' },
                  }}
                  onClick={() => navigate('/register')}
                >
                  Bắt đầu ngay
                </Button>
              </motion.div>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ...springConfig }}
              whileHover={{ scale: 1.03 }}
            >
              <Box
                component="img"
                src={FinanceImage}
                sx={{
                  width: '100%',
                  borderRadius: '30px',
                  boxShadow: '0 15px 50px rgba(167, 139, 250, 0.2)',
                  border: '2px solid #A78BFA',
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Container sx={{ py: { xs: 8, sm: 14 }, position: 'relative', zIndex: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            mb: { xs: 6, sm: 10 },
            fontWeight: 800,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}
        >
          Lợi Ích Khi Quản Lý Tài Chính
        </Typography>
        <Grid container spacing={{ xs: 3, sm: 5 }}>
          {[
            { title: 'Kiểm Soát Chi Tiêu', desc: 'Theo dõi mọi khoản chi tiêu hàng ngày một cách chi tiết.', icon: <Savings />, color: '#A78BFA' },
            { title: 'Lập Kế Hoạch Tài Chính', desc: 'Xây dựng kế hoạch tiết kiệm và đầu tư hiệu quả.', icon: <TrendingUp />, color: '#60A5FA' },
            { title: 'Tối Ưu Hóa Lợi Nhuận', desc: 'Phân tích và đề xuất các cơ hội đầu tư tốt nhất.', icon: <BarChart />, color: '#34D399' },
            { title: 'An Toàn Tài Chính', desc: 'Bảo vệ tài sản với các biện pháp bảo mật hiện đại.', icon: <Security />, color: '#F9A8D4' },
          ].map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <Card
                  sx={{
                    p: { xs: 3, sm: 4 },
                    background: '#1C1C3D',
                    borderRadius: '24px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${benefit.color}20`,
                    '&:hover': { boxShadow: `0 12px 30px rgba(${parseInt(benefit.color.slice(1, 3), 16)},${parseInt(benefit.color.slice(3, 5), 16)},${parseInt(benefit.color.slice(5, 7), 16)},0.2)` },
                  }}
                >
                  <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }}>
                    <Box sx={{ color: benefit.color, mb: 2, fontSize: { xs: 35, sm: 45 } }}>{benefit.icon}</Box>
                  </motion.div>
                  <Typography sx={{ fontWeight: 700, color: benefit.color, mb: 1.5, fontSize: { xs: '1rem', sm: '1.2rem' }, fontFamily: "'Inter', sans-serif" }}>{benefit.title}</Typography>
                  <Typography sx={{ color: '#A1A1AA', fontSize: { xs: '0.8rem', sm: '0.9rem' }, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{benefit.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Tools Section */}
      <Container sx={{ py: { xs: 8, sm: 14 }, position: 'relative', zIndex: 2, background: '#1C1C3D', borderRadius: '40px' }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            mb: { xs: 6, sm: 10 },
            fontWeight: 800,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}
        >
          Công Cụ Hỗ Trợ Quản Lý Tài Chính
        </Typography>
        <Grid container spacing={{ xs: 3, sm: 5 }}>
          {[
            { title: 'Biểu Đồ Thu Chi', desc: 'Trực quan hóa thu nhập và chi tiêu hàng tháng.', icon: <BarChart />, color: '#A78BFA' },
            { title: 'Nhắc Nhở Thanh Toán', desc: 'Nhận thông báo cho các hóa đơn sắp đến hạn.', icon: <Savings />, color: '#60A5FA' },
            { title: 'Phân Tích Đầu Tư', desc: 'Đánh giá hiệu quả các khoản đầu tư của bạn.', icon: <TrendingUp />, color: '#34D399' },
            { title: 'Báo Cáo Tài Chính', desc: 'Tạo báo cáo chi tiết để theo dõi tiến độ tài chính.', icon: <Security />, color: '#F9A8D4' },
          ].map((tool, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <Card
                  sx={{
                    p: { xs: 3, sm: 4 },
                    background: '#2A2A4A',
                    borderRadius: '24px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${tool.color}20`,
                    '&:hover': { boxShadow: `0 12px 30px rgba(${parseInt(tool.color.slice(1, 3), 16)},${parseInt(tool.color.slice(3, 5), 16)},${parseInt(tool.color.slice(5, 7), 16)},0.2)` },
                  }}
                >
                  <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }}>
                    <Box sx={{ color: tool.color, mb: 2, fontSize: { xs: 35, sm: 45 } }}>{tool.icon}</Box>
                  </motion.div>
                  <Typography sx={{ fontWeight: 700, color: tool.color, mb: 1.5, fontSize: { xs: '1rem', sm: '1.2rem' }, fontFamily: "'Inter', sans-serif" }}>{tool.title}</Typography>
                  <Typography sx={{ color: '#A1A1AA', fontSize: { xs: '0.8rem', sm: '0.9rem' }, lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{tool.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Container sx={{ py: { xs: 8, sm: 14 }, position: 'relative', zIndex: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            mb: { xs: 6, sm: 10 },
            fontWeight: 800,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}
        >
          Đánh Giá Từ Người Dùng
        </Typography>
        <Grid container spacing={{ xs: 3, sm: 5 }}>
          {[
            {
              name: 'Nguyễn Văn A',
              review: 'FinanceFlow giúp tôi kiểm soát chi tiêu dễ dàng hơn bao giờ hết!',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
            },
            {
              name: 'Trần Thị B',
              review: 'Công cụ lập kế hoạch tài chính rất hữu ích, tôi đã tiết kiệm được nhiều hơn.',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
            },
            {
              name: 'Lê Văn C',
              review: 'Giao diện thân thiện, dễ sử dụng, tôi rất hài lòng!',
              avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
            },
          ].map((user, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <Card
                  sx={{
                    p: { xs: 3, sm: 4 },
                    background: '#1C1C3D',
                    borderRadius: '24px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    border: '1px solid #A78BFA20',
                    '&:hover': { boxShadow: '0 12px 30px rgba(167, 139, 250, 0.2)' },
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, mb: 2, border: '2px solid #A78BFA' }}
                  />
                  <Typography sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1, fontSize: { xs: '1rem', sm: '1.1rem' }, fontFamily: "'Inter', sans-serif" }}>{user.name}</Typography>
                  <Typography sx={{ color: '#A1A1AA', fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontStyle: 'italic', lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                    "{user.review}"
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} sx={{ color: '#F9A8D4', fontSize: { xs: 16, sm: 20 } }} />
                    ))}
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Interactive CTA */}
      <Container sx={{ py: { xs: 8, sm: 14 }, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ...springConfig }}
        >
          <Box
            sx={{
              p: { xs: 4, sm: 8 },
              borderRadius: '40px',
              background: 'linear-gradient(45deg, #A78BFA, #60A5FA, #34D399)',
              boxShadow: '0 15px 50px rgba(167, 139, 250, 0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              component={motion.div}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                zIndex: 0,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.2rem' },
                color: '#fff',
                mb: { xs: 3, sm: 5 },
                position: 'relative',
                zIndex: 1,
                letterSpacing: '-0.02em',
              }}
            >
              Còn Chần Chừ Gì Nữa? <br />
              Hãy Thử Ngay Dịch Vụ Của Chúng Tôi 💀
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <Button
                sx={{
                  borderRadius: 50,
                  px: { xs: 2.5, sm: 4 },
                  py: { xs: 0.8, sm: 1.2 },
                  background: 'transparent',
                  border: '2px solid #fff',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                  transition: 'all 0.3s ease',
                  fontFamily: "'Inter', sans-serif",
                  '&:hover': {
                    background: '#fff',
                    color: '#A78BFA',
                  },
                }}
                onClick={() => navigate('/login')}
              >
                Đăng Nhập
              </Button>
              <Button
                sx={{
                  borderRadius: 50,
                  px: { xs: 2.5, sm: 4 },
                  py: { xs: 0.8, sm: 1.2 },
                  background: '#fff',
                  color: '#A78BFA',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                  transition: 'all 0.3s ease',
                  fontFamily: "'Inter', sans-serif",
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.6)',
                  },
                }}
                onClick={() => navigate('/register')}
              >
                Đăng Ký
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Footer */}
      <Box sx={{ background: '#0A0A23', position: 'relative', zIndex: 2 }}>
        <Container
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: { xs: 1, sm: 2 },
            height: { xs: 50, sm: 60 },
            py: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 } }}>
            <Box
              component={motion.img}
              src={FinanceLogo}
              alt="Finance Manager Logo"
              sx={{
                height: { xs: 100, sm: 100 },
                width: 'auto',
                objectFit: 'contain',
                maxHeight: { xs: 50, sm: 60 },
              }}
              whileHover={{ scale: 1.1 }}
            />
            {['Về chúng tôi', 'Chính sách', 'Hỗ trợ'].map((text, idx) => (
              <motion.div key={idx} whileHover={{ y: -3 }}>
                <Button
                  component={Link}
                  to={text === 'Về chúng tôi' ? '/ve-chung-toi' : text === 'Chính sách' ? '/chinh-sach' : '/ho-tro'}
                  sx={{
                    color: '#A1A1AA',
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                    fontFamily: "'Inter', sans-serif",
                    textTransform: 'none',
                    '&:hover': { color: '#A78BFA' },
                  }}
                >
                  {text}
                </Button>
              </motion.div>
            ))}
          </Box>
          <Typography
            sx={{
              color: '#A1A1AA',
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              fontFamily: "'Inter', sans-serif",
              textAlign: 'right',
            }}
          >
            © 2025 FinanceFlow. All rights reserved.
          </Typography>
        </Container>
      </Box>

      <ChatBot />
    </Box>
  );
};

export default Landing;