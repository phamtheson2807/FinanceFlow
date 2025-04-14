import { CheckCircleOutline } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Grid, List, ListItem, ListItemIcon, styled, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import SubscriptionDialog from './SubscriptionDialog';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '24px',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 'bold',
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: '#fff',
  '&:hover': {
    background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  '&:disabled': {
    background: 'linear-gradient(90deg, #cccccc 0%, #aaaaaa 100%)',
    color: '#666',
  },
}));

const PricingPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'pro' | ''>('');
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axiosInstance.get('/api/subscription');
        setCurrentPlan(response.data.plan || 'free');
      } catch (error) {
        console.error('❌ Lỗi khi lấy subscription:', error);
        setCurrentPlan('free');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const handleUpgrade = (plan: string) => {
    if (plan === 'premium' || plan === 'pro') {
      setSelectedPlan(plan as 'premium' | 'pro');
      setOpen(true);
    }
  };

  const plans = [
    {
      title: 'Free',
      price: '0',
      description: 'Các tính năng cơ bản miễn phí mãi mãi',
      features: [
        'Quản lý thu chi cơ bản',
        'Báo cáo tổng thu chi hàng tháng',
        'Giới hạn 50 giao dịch',
      ],
      buttonText: currentPlan === 'free' ? 'Đã kích hoạt' : 'Chọn gói này',
      disabled: currentPlan === 'free' || currentPlan === 'premium' || currentPlan === 'pro',
    },
    {
      title: 'Premium',
      price: '10',
      description: 'Truy cập tính năng nâng cao và hỗ trợ ưu tiên',
      features: [
        'Quản lý giao dịch không giới hạn',
        'Xuất báo cáo (PDF/Excel)',
        'Hỗ trợ ưu tiên qua chat',
      ],
      buttonText: currentPlan === 'premium' ? 'Đã kích hoạt' : 'Nâng cấp ngay',
      disabled: currentPlan === 'premium' || currentPlan === 'pro',
    },
    {
      title: 'Pro',
      price: '20',
      description: 'Tất cả tính năng + phân tích chuyên sâu',
      features: [
        'Phân tích chuyên sâu (biểu đồ, dự đoán)',
        'Tích hợp ngân hàng (giả lập)',
        'Quản lý nhiều tài khoản',
      ],
      buttonText: currentPlan === 'pro' ? 'Đã kích hoạt' : 'Nâng cấp ngay',
      disabled: currentPlan === 'pro',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
        py: 8,
        px: 4,
      }}
    >
      <Typography
        variant="h3"
        align="center"
        sx={{
          fontWeight: 'bold',
          color: '#1976d2',
          mb: 6,
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        Chọn gói phù hợp với bạn
      </Typography>

      {loading ? (
        <Typography align="center">Đang tải dữ liệu gói...</Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.title}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 'bold', color: '#424242', mb: 2 }}
                  >
                    {plan.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 'bold',
                      color: plan.title === 'Free' ? '#757575' : '#1976d2',
                      mb: 1,
                    }}
                  >
                    ${plan.price}
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{ fontSize: '1rem', color: '#757575' }}
                    >
                      /tháng
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: '#616161', mb: 2, minHeight: '48px' }}
                  >
                    {plan.description}
                  </Typography>
                  <List sx={{ mb: 3 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon>
                          <CheckCircleOutline sx={{ color: '#1976d2' }} />
                        </ListItemIcon>
                        <Typography variant="body2">{feature}</Typography>
                      </ListItem>
                    ))}
                  </List>
                  <StyledButton
                    disabled={plan.disabled}
                    onClick={() => !plan.disabled && handleUpgrade(plan.title.toLowerCase())}
                  >
                    {plan.buttonText}
                  </StyledButton>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button
          variant="outlined"
          sx={{
            borderRadius: '24px',
            padding: '10px 20px',
            textTransform: 'none',
            color: '#1976d2',
            borderColor: '#1976d2',
            '&:hover': { backgroundColor: '#e3f2fd' },
          }}
          onClick={() => navigate('/dashboard')}
        >
          Quay lại Dashboard
        </Button>
      </Box>

      {selectedPlan && (
        <SubscriptionDialog
          open={open}
          onClose={() => setOpen(false)}
          plan={selectedPlan}
        />
      )}
    </Box>
  );
};

export default PricingPage;