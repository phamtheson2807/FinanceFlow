import { CheckCircleOutline, EmojiEvents } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Grid, List, ListItem, ListItemIcon, Paper, styled, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '24px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-10px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(25, 118, 210, 0.18)',
  },
  position: 'relative',
  overflow: 'hidden',
}));

const ProCard = styled(StyledCard)(({ theme }) => ({
  border: `2.5px solid ${theme.palette.primary.main}`,
  background: 'linear-gradient(120deg, #e3f0ff 0%, #f0f7ff 100%)',
  position: 'relative',
  overflow: 'visible',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '150px',
    height: '150px',
    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.2) 0%, rgba(25, 118, 210, 0) 60%)',
    borderRadius: '0 24px 0 150px',
    zIndex: 0,
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '14px 32px',
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: '#fff',
  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.15)',
  '&:hover': {
    background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: '0 10px 30px rgba(25, 118, 210, 0.25)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: 'linear-gradient(90deg, #cccccc 0%, #aaaaaa 100%)',
    color: '#666',
  },
  transition: 'all 0.3s ease',
}));

const FeatureItem = styled(ListItem)(({ theme }) => ({
  paddingTop: 6,
  paddingBottom: 6,
  position: 'relative',
}));

const PriceBadge = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: -20,
  right: -20, 
  padding: '5px 15px',
  background: 'linear-gradient(90deg, #FF9800 0%, #FF5722 100%)',
  color: 'white',
  fontWeight: 'bold',
  transform: 'rotate(45deg)',
  zIndex: 10,
  boxShadow: '0 2px 10px rgba(255, 152, 0, 0.3)',
  borderRadius: 0,
  width: 140,
  textAlign: 'center',
}));

const proPlans = [
  {
    label: 'Pro tháng',
    price: 5,
    priceId: 'price_monthly_id', // Thay bằng priceId thực tế trên Stripe
    description: 'Gia hạn hàng tháng, hủy bất cứ lúc nào',
  },
  {
    label: 'Pro năm',
    price: 50,
    priceId: 'price_yearly_id', // Thay bằng priceId thực tế trên Stripe
    description: 'Tiết kiệm 2 tháng, thanh toán 1 lần/năm',
  },
];

const PricingPage = () => {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedPro, setSelectedPro] = useState(proPlans[0]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axiosInstance.get('/api/subscription');
        setCurrentPlan(response.data.plan || 'free');
      } catch (error) {
        setCurrentPlan('free');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  // Đã xóa hàm handleUpgrade vì không sử dụng
  // const handleUpgrade = async () => { ... }

  const plans = [
    {
      title: 'Free',
      price: '0',
      description: 'Bắt đầu hành trình quản lý tài chính cá nhân',
      features: [
        'Quản lý thu chi cơ bản',
        'Báo cáo tổng thu chi hàng tháng',
        'Tính năng đầu tư cơ bản',
        'Giới hạn 50 giao dịch/tháng',
        'Lưu trữ dữ liệu cơ bản',
      ],
      limitations: [
        'Không xuất được báo cáo PDF/Excel',
        'Không có phân tích chuyên sâu',
        'Không có hỗ trợ ưu tiên',
      ],
      buttonText: currentPlan === 'free' ? 'Gói hiện tại' : 'Chọn gói này',
      disabled: currentPlan === 'free' || currentPlan === 'pro',
      highlight: false,
    },
    {
      title: 'Pro',
      price: '20',
      description: 'Giải pháp toàn diện cho người dùng đầu tư chuyên nghiệp',
      features: [
        'Quản lý tài chính không giới hạn',
        'Tính năng đầu tư nâng cao',
        'Xuất báo cáo (PDF/Excel)',
        'Phân tích chuyên sâu và dự báo',
        'Quản lý nhiều tài khoản',
        'Tích hợp ngân hàng (API)',
        'Hỗ trợ ưu tiên 24/7',
        'Dữ liệu được sao lưu đám mây',
      ],
      buttonText: currentPlan === 'pro' ? 'Gói hiện tại' : 'Nâng cấp ngay',
      disabled: currentPlan === 'pro',
      highlight: true,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f9ff 0%, #ebf5ff 100%)',
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 6 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          width: '600px', 
          height: '600px', 
          background: 'radial-gradient(circle, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0) 70%)',
          top: '-300px',
          left: '-300px',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      
      <Box 
        sx={{ 
          position: 'absolute', 
          width: '400px', 
          height: '400px', 
          background: 'radial-gradient(circle, rgba(25,118,210,0.08) 0%, rgba(25,118,210,0) 70%)',
          bottom: '-200px',
          right: '-200px',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 800,
            color: '#1565c0',
            mb: 2,
            letterSpacing: 0.5,
            textShadow: '0 2px 10px rgba(25, 118, 210, 0.1)',
            fontSize: { xs: '2.2rem', md: '3rem' },
          }}
        >
          Nâng cấp & Mở khóa Sức mạnh Tài chính
        </Typography>
        
        <Typography
          align="center"
          sx={{
            color: '#546e7a',
            mb: 3,
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            maxWidth: '800px',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Chọn gói phù hợp với nhu cầu quản lý tài chính cá nhân của bạn.
          Với FinanceFlow, bạn có thể tối ưu hóa dòng tiền và đưa ra quyết định tài chính thông minh hơn.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 7,
          }}
        >
          <Chip 
            label="Mới cập nhật" 
            color="primary" 
            sx={{ 
              fontWeight: 'bold',
              borderRadius: '20px',
              px: 1,
            }} 
          />
          <Typography sx={{ color: '#1976d2', fontWeight: 500 }}>
            Gói Free đã hỗ trợ tính năng đầu tư cơ bản!
          </Typography>
        </Box>

        {loading ? (
          <Typography align="center">Đang tải dữ liệu gói...</Typography>
        ) : (
          <Grid container spacing={5} justifyContent="center">
            {plans.map((plan) => (
              <Grid item xs={12} sm={10} md={5} key={plan.title}>
                {plan.highlight ? (
                  <ProCard>
                    <PriceBadge>NỔI BẬT</PriceBadge>
                    <Box sx={{ position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                      <EmojiEvents sx={{ fontSize: 60, color: '#ff9800', filter: 'drop-shadow(0 3px 10px rgba(255, 152, 0, 0.3))' }} />
                    </Box>
                    <CardContent sx={{ textAlign: 'center', pt: 6, pb: 4, position: 'relative', zIndex: 5 }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 'bold', color: '#1565c0', mb: 1.5, letterSpacing: 1 }}
                      >
                        {plan.title}
                      </Typography>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 'bold',
                          color: '#1565c0',
                          mb: 1,
                          lineHeight: 1.1,
                          textShadow: '0 2px 12px rgba(21, 101, 192, 0.1)',
                        }}
                      >
                        ${plan.price}
                        <Typography
                          component="span"
                          variant="h6"
                          sx={{ fontWeight: 500, color: '#546e7a', ml: 1, fontSize: '1.1rem' }}
                        >
                          /tháng
                        </Typography>
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: '#37474f', mb: 3, fontWeight: 500, minHeight: '48px' }}
                      >
                        {plan.description}
                      </Typography>
                      <List sx={{ mb: 3, textAlign: 'left' }}>
                        {plan.features.map((feature, index) => (
                          <FeatureItem key={index} sx={{ py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircleOutline sx={{ color: '#4caf50', fontSize: 20 }} />
                            </ListItemIcon>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#37474f' }}>{feature}</Typography>
                          </FeatureItem>
                        ))}
                      </List>
                      <Box sx={{ mb: 2 }}>
                        {proPlans.map((pro) => (
                          <Button
                            key={pro.label}
                            variant={selectedPro.label === pro.label ? 'contained' : 'outlined'}
                            color="primary"
                            sx={{ mr: 1, mb: 1, fontWeight: 600, borderRadius: 3 }}
                            onClick={() => setSelectedPro(pro)}
                          >
                            {pro.label} (${pro.price}/{pro.label === 'Pro tháng' ? 'tháng' : 'năm'})
                          </Button>
                        ))}
                      </Box>
                      <StyledButton
                        size="large"
                        fullWidth
                        disabled={plan.disabled}
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const { data } = await axiosInstance.post(
                              '/api/subscription/create-checkout-session',
                              { plan: 'pro', priceId: selectedPro.priceId },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            window.location.href = data.url;
                          } catch (err) {
                            alert('Không thể kết nối Stripe!');
                          }
                        }}
                        sx={{ fontSize: '1.1rem', py: 2, mt: 2, boxShadow: '0 8px 30px rgba(25, 118, 210, 0.2)', fontWeight: 700, letterSpacing: 0.5 }}
                      >
                        {plan.buttonText}
                      </StyledButton>
                    </CardContent>
                  </ProCard>
                ) : (
                  <StyledCard>
                    <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 5 }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 'bold', color: '#546e7a', mb: 2 }}
                      >
                        {plan.title}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 'bold',
                          color: '#546e7a',
                          mb: 1,
                        }}
                      >
                        ${plan.price}
                        <Typography
                          component="span"
                          variant="body1"
                          sx={{ fontSize: '1rem', color: '#78909c', ml: 0.5 }}
                        >
                          /mãi mãi
                        </Typography>
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: '#546e7a', mb: 3, minHeight: '48px', fontWeight: 500 }}
                      >
                        {plan.description}
                      </Typography>
                      
                      <Box sx={{ textAlign: 'left', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4caf50', mb: 1 }}>
                          Bao gồm:
                        </Typography>
                        <List disablePadding>
                          {plan.features.map((feature, index) => (
                            <FeatureItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleOutline sx={{ color: '#4caf50', fontSize: 20 }} />
                              </ListItemIcon>
                              <Typography variant="body2" sx={{ color: '#455a64' }}>{feature}</Typography>
                            </FeatureItem>
                          ))}
                        </List>
                      </Box>
                      
                      {plan.limitations && (
                        <Box sx={{ textAlign: 'left', mb: 3 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#f44336', mb: 1 }}>
                            Giới hạn:
                          </Typography>
                          <List disablePadding>
                            {plan.limitations.map((limitation, index) => (
                              <FeatureItem key={index} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <CheckCircleOutline sx={{ color: '#f44336', fontSize: 20 }} />
                                </ListItemIcon>
                                <Typography variant="body2" sx={{ color: '#455a64' }}>{limitation}</Typography>
                              </FeatureItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      <StyledButton
                        disabled={plan.disabled}
                        fullWidth
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: '1rem', 
                          py: 1.5, 
                          mt: 1,
                          background: 'linear-gradient(90deg, #78909c 0%, #546e7a 100%)',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #546e7a 0%, #455a64 100%)',
                          },
                        }}
                      >
                        {plan.buttonText}
                      </StyledButton>
                    </CardContent>
                  </StyledCard>
                )}
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="body1" sx={{ color: '#546e7a', mb: 3 }}>
            Tất cả các gói đều bao gồm dịch vụ bảo mật và sao lưu dữ liệu. Bạn có thể nâng cấp hoặc hạ cấp bất kỳ lúc nào.
          </Typography>
          <Button
            variant="outlined"
            sx={{
              borderRadius: '30px',
              padding: '12px 32px',
              textTransform: 'none',
              color: '#1976d2',
              borderColor: '#1976d2',
              fontWeight: 600,
              fontSize: '1.1rem',
              '&:hover': { 
                backgroundColor: '#e3f2fd',
                borderColor: '#1565c0',
                color: '#1565c0',
              },
              transition: 'all 0.3s ease',
            }}
            onClick={() => navigate('/dashboard')}
          >
            Quay lại Dashboard
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PricingPage;