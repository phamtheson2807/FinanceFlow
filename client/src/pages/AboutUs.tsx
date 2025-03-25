import MissionIcon from '@mui/icons-material/Flag';
import PeopleIcon from '@mui/icons-material/People';
import VisionIcon from '@mui/icons-material/Visibility'; // Icon mới cho phần "Tầm nhìn"
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import FinanceLogo from '../img/FinanceLogo.svg';

const MotionBox = motion(Box);

const AboutUs = () => {
  const navigate = useNavigate();
  const springConfig = { type: 'spring', stiffness: 200, damping: 20 };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', color: '#1E293B', position: 'relative' }}>
      {/* Header (Giữ nguyên từ phiên bản trước) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          zIndex: 100,
          background: '#FFFFFF',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Container
          sx={{
            py: { xs: 1, sm: 2 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component={motion.img}
                src={FinanceLogo}
                alt="Finance Manager Logo"
                sx={{ height: { xs: 40, sm: 50 }, width: 'auto' }}
                whileHover={{ scale: 1.2, rotate: 10 }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#1E293B',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                FinanceFlow
              </Typography>
            </Box>
          </motion.div>
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mt: { xs: 1, sm: 0 } }}>
            <Button
              sx={{
                borderRadius: 30,
                px: { xs: 2, sm: 4 },
                py: { xs: 0.8, sm: 1.2 },
                background: 'linear-gradient(45deg, #A78BFA, #60A5FA)',
                color: '#fff',
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '1rem' },
                boxShadow: '0 4px 15px rgba(167, 139, 250, 0.4)',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 20px rgba(167, 139, 250, 0.6)' },
              }}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
            <Button
              sx={{
                borderRadius: 30,
                px: { xs: 2, sm: 4 },
                py: { xs: 0.8, sm: 1.2 },
                border: '2px solid #A78BFA',
                color: '#A78BFA',
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '1rem' },
                '&:hover': { borderColor: '#60A5FA', color: '#60A5FA', transform: 'translateY(-3px)' },
              }}
              onClick={() => navigate('/register')}
            >
              Đăng ký
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Banner Section (Giữ nguyên từ phiên bản trước) */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '300px', sm: '400px' },
          background: 'linear-gradient(45deg, #A78BFA, #60A5FA)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#FFFFFF',
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
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ...springConfig }}
          sx={{ zIndex: 1 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '3rem', md: '4.5rem' },
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Về Chúng Tôi
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Đồng hành cùng bạn trên hành trình tài chính
          </Typography>
        </MotionBox>
      </Box>

      {/* About Us Content */}
      <Container sx={{ py: { xs: 8, sm: 12 }, position: 'relative', zIndex: 2 }}>
        {/* Phần "Chúng tôi là ai?" */}
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12}>
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ...springConfig }}
              sx={{
                p: { xs: 3, sm: 4 },
                background: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 15px 40px rgba(167, 139, 250, 0.2)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PeopleIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#A78BFA', mr: 2 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    color: '#A78BFA',
                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                  }}
                >
                  Chúng Tôi Là Ai?
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  color: '#64748B',
                  lineHeight: 1.8,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                }}
              >
                FinanceFlow là nền tảng quản lý tài chính cá nhân được thiết kế để giúp bạn tối ưu hóa chi tiêu, tiết kiệm và đầu tư một cách thông minh. Chúng tôi được thành lập với mục tiêu mang lại sự minh bạch và dễ dàng trong quản lý tài chính, giúp người dùng kiểm soát tài chính cá nhân một cách hiệu quả. Đội ngũ của chúng tôi bao gồm các chuyên gia tài chính và công nghệ, luôn nỗ lực cung cấp các công cụ hiện đại và trải nghiệm người dùng tuyệt vời. Với FinanceFlow, bạn không chỉ quản lý tài chính mà còn xây dựng một tương lai tài chính bền vững.
              </Typography>
            </MotionBox>
          </Grid>
        </Grid>

        {/* Phần "Sứ mệnh của chúng tôi" */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ...springConfig }}
          sx={{
            mt: { xs: 8, sm: 12 },
            p: { xs: 4, sm: 6 },
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            '&:hover': { boxShadow: '0 15px 40px rgba(167, 139, 250, 0.2)' },
            textAlign: 'center',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <MissionIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#A78BFA', mr: 2 }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                color: '#A78BFA',
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
              }}
            >
              Sứ Mệnh Của Chúng Tôi
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              color: '#64748B',
              lineHeight: 1.8,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            Chúng tôi tin rằng ai cũng xứng đáng có được sự tự do tài chính. FinanceFlow không chỉ là một công cụ, mà còn là người bạn đồng hành giúp bạn đạt được mục tiêu tài chính của mình. Chúng tôi cam kết cung cấp các giải pháp quản lý tài chính thông minh, giúp bạn lập kế hoạch chi tiêu, tiết kiệm hiệu quả và đầu tư an toàn. Sứ mệnh của chúng tôi là trao quyền cho bạn để kiểm soát tài chính cá nhân, từ đó xây dựng một cuộc sống tài chính ổn định và thịnh vượng.
          </Typography>
        </MotionBox>

        {/* Phần "Tầm nhìn của chúng tôi" (Mới) */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ...springConfig }}
          sx={{
            mt: { xs: 8, sm: 12 },
            p: { xs: 4, sm: 6 },
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            '&:hover': { boxShadow: '0 15px 40px rgba(167, 139, 250, 0.2)' },
            textAlign: 'center',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <VisionIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: '#A78BFA', mr: 2 }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                color: '#A78BFA',
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
              }}
            >
              Tầm Nhìn Của Chúng Tôi
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              color: '#64748B',
              lineHeight: 1.8,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            Chúng tôi hướng tới việc trở thành nền tảng quản lý tài chính hàng đầu, không chỉ tại Việt Nam mà còn trên toàn cầu. Tầm nhìn của FinanceFlow là xây dựng một cộng đồng tài chính thông minh, nơi mọi người đều có thể tiếp cận các công cụ và kiến thức cần thiết để quản lý tài chính hiệu quả. Chúng tôi mong muốn tạo ra một tương lai mà ở đó, tài chính không còn là nỗi lo, mà là đòn bẩy giúp bạn đạt được những ước mơ lớn lao.
          </Typography>
        </MotionBox>

        {/* CTA Section (Giữ nguyên từ phiên bản trước) */}
        <Box sx={{ mt: { xs: 8, sm: 12 }, textAlign: 'center' }}>
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ...springConfig }}
          >
            <Box
              sx={{
                p: { xs: 4, sm: 6 },
                borderRadius: '20px',
                background: 'linear-gradient(45deg, #A78BFA, #60A5FA)',
                boxShadow: '0 20px 60px rgba(167, 139, 250, 0.4)',
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
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' },
                  color: '#fff',
                  mb: { xs: 3, sm: 4 },
                  position: 'relative',
                  zIndex: 1,
                  letterSpacing: '-0.01em',
                }}
              >
                Khám Phá FinanceFlow
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: { xs: '1rem', sm: '1.2rem' },
                  color: '#FFFFFF',
                  mb: { xs: 3, sm: 4 },
                  position: 'relative',
                  zIndex: 1,
                  maxWidth: '600px',
                  mx: 'auto',
                }}
              >
                Bắt đầu hành trình quản lý tài chính của bạn ngay hôm nay với FinanceFlow!
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                <Button
                  component={Link}
                  to="/"
                  sx={{
                    borderRadius: 50,
                    px: { xs: 6, sm: 8 },
                    py: { xs: 1.5, sm: 2 },
                    background: '#fff',
                    color: '#A78BFA',
                    fontSize: { xs: '1rem', sm: '1.2rem' },
                    fontWeight: 700,
                    boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(255,255,255,0.5)' },
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Khám Phá Ngay
                </Button>
              </motion.div>
            </Box>
          </MotionBox>
        </Box>
      </Container>

      {/* Footer (Giữ nguyên từ phiên bản trước) */}
      <Box sx={{ py: { xs: 3, sm: 4 }, background: '#1E293B', position: 'relative', zIndex: 2 }}>
        <Container>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1, sm: 2 } }}>
                <Box component={motion.img} src={FinanceLogo} sx={{ height: { xs: 30, sm: 35 } }} whileHover={{ scale: 1.1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#A78BFA', fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                  FinanceFlow
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#A78BFA', mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Liên Hệ
              </Typography>
              <Typography sx={{ color: '#CBD5E1', fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                Email: <a href="mailto:contact@financeflow.com" style={{ color: '#60A5FA' }}>contact@financeflow.com</a>
              </Typography>
              <Typography sx={{ color: '#CBD5E1', fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                Hotline: 0123-456-789
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#A78BFA', mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Khám Phá
              </Typography>
              <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, justifyContent: { xs: 'center', sm: 'flex-end' }, mb: { xs: 1, sm: 2 } }}>
                {['Về chúng tôi', 'Chính sách', 'Hỗ trợ'].map((text, idx) => (
                  <motion.div key={idx} whileHover={{ y: -3 }}>
                    {text === 'Hỗ trợ' ? (
                      <Button
                        component={Link}
                        to="/ho-tro"
                        sx={{ color: '#CBD5E1', fontSize: { xs: '0.75rem', sm: '0.8rem' }, '&:hover': { color: '#A78BFA' } }}
                      >
                        {text}
                      </Button>
                    ) : (
                      <Button
                        component={Link}
                        to={text === 'Về chúng tôi' ? '/ve-chung-toi' : '/chinh-sach'}
                        sx={{ color: '#CBD5E1', fontSize: { xs: '0.75rem', sm: '0.8rem' }, '&:hover': { color: '#A78BFA' } }}
                      >
                        {text}
                      </Button>
                    )}
                  </motion.div>
                ))}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#A78BFA', mb: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Địa Chỉ
              </Typography>
              <Box sx={{ width: '100%', maxWidth: { xs: '200px', sm: '250px' }, height: { xs: '120px', sm: '150px' }, borderRadius: '8px', overflow: 'hidden', mx: { xs: 'auto', sm: 'auto', md: 0 }, ml: { md: 'auto' } }}>
                <iframe
                  title="Google Maps - 67 Phó Đức Chính"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096318164614!2d105.8411323154021!3d21.02851198599822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861b1b%3A0x5e6d7b3e6a1e1c1f!2s67%20Ph%C3%B3%20%C4%90%E1%BB%A9c%20Ch%C3%ADnh%2C%20Tr%C3%BAc%20B%E1%BA%A1ch%2C%20Ba%20%C4%90%C3%ACnh%2C%20H%C3%A0%20N%E1%BB%99i%2C%20Vietnam!5e0!3m2!1sen!2sus!4v1697041234567!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ color: '#64748B', fontSize: { xs: '0.75rem', sm: '0.8rem' }, textAlign: 'center', mt: { xs: 1, sm: 2 } }}>
                © 2025 FinanceFlow. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutUs;