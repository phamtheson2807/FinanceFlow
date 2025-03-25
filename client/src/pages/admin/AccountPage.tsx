import { Box, Button, Card, CardContent, CircularProgress, Divider, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AdminInfo {
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const AccountPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token không tồn tại');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminInfo(response.data);
      } catch (error) {
        console.error('❌ Lỗi khi lấy thông tin admin:', error);
        setError('Không thể tải thông tin admin. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminInfo();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!adminInfo) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: 'error.main', textAlign: 'center' }}>
          {error || 'Không thể tải thông tin tài khoản.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#f0f4f8', minHeight: 'calc(100vh - 64px)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            color: '#1E3A8A',
            textShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          Thông Tin Tài Khoản Admin
        </Typography>
      </motion.div>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: 'transparent',
                        border: '4px solid transparent',
                        background: 'linear-gradient(45deg, #10B981, #3B82F6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '3rem',
                          color: 'white',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 'bold',
                        }}
                      >
                        {adminInfo.name.charAt(0).toUpperCase()}
                      </Typography>
                    </Box>
                  </motion.div>
                  <Box sx={{ ml: 3 }}>
                    <Typography
                      variant="h4"
                      sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#1E3A8A' }}
                    >
                      {adminInfo.name}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#555', mt: 0.5 }}>
                      {adminInfo.email}
                    </Typography>
                    <Typography
                      sx={{ fontFamily: 'Poppins, sans-serif', color: '#777', mt: 0.5, fontStyle: 'italic' }}
                    >
                      Vai trò: {adminInfo.role}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3, bgcolor: 'rgba(0,0,0,0.1)' }} />

                <Box sx={{ px: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'medium', color: '#333', mb: 2 }}
                  >
                    Chi tiết tài khoản
                  </Typography>
                  {[
                    { label: 'Email', value: adminInfo.email },
                    {
                      label: 'Ngày tham gia',
                      value: new Date(adminInfo.createdAt || '').toLocaleDateString('vi-VN'),
                    },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        py: 1.5,
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 },
                        transition: 'background 0.3s ease',
                      }}
                    >
                      <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 'medium' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#777' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>

                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontFamily: 'Poppins, sans-serif',
                      background: 'linear-gradient(45deg, #3B82F6, #1E3A8A)',
                      '&:hover': { background: 'linear-gradient(45deg, #4B9EFF, #2A4D9E)' },
                      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
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
    </Box>
  );
};

export default AccountPage;