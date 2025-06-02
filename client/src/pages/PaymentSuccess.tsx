import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) {
      setError('Không tìm thấy session_id!');
      setLoading(false);
      return;
    }
    // Gọi backend xác nhận thanh toán thành công (nếu cần)
    axiosInstance.post('/api/subscription/confirm-checkout', { sessionId })
      .then(() => {
        setSuccess(true);
      })
      .catch(() => {
        setError('Không xác nhận được thanh toán.');
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      ) : success ? (
        <>
          <Typography variant="h5" color="success.main" sx={{ mb: 2, fontWeight: 600 }}>
            Thanh toán thành công! Bạn đã nâng cấp gói Pro 🎉
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>Về trang chủ</Button>
        </>
      ) : null}
    </Box>
  );
};

export default PaymentSuccess; 