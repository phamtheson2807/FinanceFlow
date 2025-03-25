import { Add, Close, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const HeaderBox = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  background: 'linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%)',
  padding: theme.spacing(2),
  borderRadius: '0 0 16px 16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: 'linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: '6px 16px',
  textTransform: 'none',
  fontWeight: 'bold',
}));

interface SavingGoal {
  _id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
}

const Alert = (props: AlertProps) => <MuiAlert elevation={6} variant="filled" {...props} />;

const Savings = () => {
  const navigate = useNavigate();
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [formData, setFormData] = useState({ name: '', target_amount: '', target_date: '' });
  const [addAmount, setAddAmount] = useState('');
  const [openDialog, setOpenDialog] = useState<'addGoal' | 'addAmount' | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [isMounted, setIsMounted] = useState(false); // Kiểm tra mount

  const fetchSavingGoals = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/savings');
      setSavingGoals(response.data || []);
    } catch (err: any) {
      console.error('❌ Lỗi lấy danh sách quỹ:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi tải dữ liệu', severity: 'error' });
      if (err.response?.status === 401) navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    setIsMounted(true); // Đánh dấu component đã mount
    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({ open: true, message: 'Vui lòng đăng nhập để tiếp tục', severity: 'error' });
      navigate('/login');
      return;
    }
    fetchSavingGoals();
  }, [navigate, fetchSavingGoals]);

  const handleAddSavingGoal = async () => {
    try {
      const target_amount = Number(formData.target_amount);
      if (!formData.name || !target_amount || !formData.target_date) {
        return setSnackbar({ open: true, message: 'Vui lòng điền đầy đủ thông tin', severity: 'error' });
      }
      if (target_amount <= 0) {
        return setSnackbar({ open: true, message: 'Số tiền phải lớn hơn 0', severity: 'error' });
      }
      await axiosInstance.post('/api/savings', { name: formData.name, target_amount, target_date: formData.target_date });
      fetchSavingGoals();
      setFormData({ name: '', target_amount: '', target_date: '' });
      setOpenDialog(null);
      setSnackbar({ open: true, message: 'Thêm quỹ thành công', severity: 'success' });
    } catch (err: any) {
      console.error('❌ Lỗi thêm quỹ:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi thêm quỹ', severity: 'error' });
    }
  };

  const handleDeleteSavingGoal = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/savings/${id}`);
      fetchSavingGoals();
      setSnackbar({ open: true, message: 'Xóa quỹ thành công', severity: 'success' });
    } catch (err: any) {
      console.error('❌ Lỗi xóa quỹ:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi xóa quỹ', severity: 'error' });
    }
  };

  const handleAddAmount = async () => {
    if (!selectedGoal) {
      setSnackbar({ open: true, message: 'Không có quỹ được chọn', severity: 'error' });
      setOpenDialog(null);
      return;
    }
    try {
      const amount = Number(addAmount);
      if (!amount || amount <= 0) {
        return setSnackbar({ open: true, message: 'Số tiền không hợp lệ', severity: 'error' });
      }
      await axiosInstance.patch(`/api/savings/${selectedGoal._id}/add`, { amount });
      fetchSavingGoals();
      setAddAmount('');
      setOpenDialog(null);
      setSelectedGoal(null);
      setSnackbar({ open: true, message: 'Thêm tiền thành công', severity: 'success' });
    } catch (err: any) {
      console.error('❌ Lỗi thêm tiền:', err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Lỗi thêm tiền', severity: 'error' });
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (!isMounted) return null; // Tránh render trước khi mount hoàn toàn

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 100%)', p: 2 }}>
      <HeaderBox>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
          🎯 Quỹ Tiết Kiệm
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <ActionButton
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              console.log('Mở dialog thêm quỹ mới');
              setOpenDialog('addGoal');
            }}
            sx={{ bgcolor: '#ffca28', '&:hover': { bgcolor: '#ffb300' } }}
          >
            Thêm Quỹ Mới
          </ActionButton>
        </Box>
      </HeaderBox>

      <Box sx={{ maxWidth: '1200px', mx: 'auto', mt: 4 }}>
        {savingGoals.length > 0 ? (
          <Grid container spacing={3}>
            {savingGoals.map((goal) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              return (
                <Grid item xs={12} sm={6} md={4} key={goal._id}>
                  <StyledCard>
                    <CardContent sx={{ position: 'relative', p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0288d1', mb: 2 }}>
                        {goal.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={80}
                            thickness={5}
                            sx={{ color: progress >= 100 ? '#4caf50' : '#0288d1' }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" color="text.secondary">
                              {`${progress.toFixed(1)}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#616161' }}>
                        Đã tiết kiệm: {formatCurrency(goal.current_amount || 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#616161' }}>
                        Mục tiêu: {formatCurrency(goal.target_amount)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#616161', mt: 1 }}>
                        Hạn: {new Date(goal.target_date).toLocaleDateString('vi-VN')}
                      </Typography>
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <ActionButton
                          variant="contained"
                          onClick={() => {
                            console.log('Mở dialog thêm tiền cho quỹ:', goal._id);
                            setSelectedGoal(goal);
                            setOpenDialog('addAmount');
                          }}
                          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                        >
                          Thêm Tiền
                        </ActionButton>
                        <ActionButton
                          variant="contained"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteSavingGoal(goal._id)}
                        >
                          Xóa
                        </ActionButton>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Typography variant="h6" sx={{ textAlign: 'center', color: '#757575', py: 5 }}>
            Chưa có quỹ tiết kiệm nào. Hãy thêm một quỹ mới!
          </Typography>
        )}
      </Box>

      {/* Dialog thêm quỹ mới */}
      <Dialog
        open={openDialog === 'addGoal'}
        onClose={() => setOpenDialog(null)}
        disableScrollLock={true} // Giữ disableScrollLock
        PaperProps={{ sx: { borderRadius: '16px', bgcolor: '#fff', p: 2 } }}
      >
        <DialogTitle sx={{ color: '#0288d1', fontWeight: 'bold', textAlign: 'center' }}>
          Thêm Quỹ Tiết Kiệm Mới
          <IconButton onClick={() => setOpenDialog(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Tên quỹ"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Số tiền mục tiêu (VND)"
            type="number"
            value={formData.target_amount}
            onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            label="Ngày hoàn thành"
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <ActionButton variant="contained" onClick={handleAddSavingGoal}>
            Tạo Quỹ
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Dialog thêm tiền */}
      <Dialog
        open={openDialog === 'addAmount' && !!selectedGoal}
        onClose={() => setOpenDialog(null)}
        disableScrollLock={true} // Giữ disableScrollLock
        PaperProps={{ sx: { borderRadius: '16px', bgcolor: '#fff', p: 2 } }}
      >
        <DialogTitle sx={{ color: '#0288d1', fontWeight: 'bold', textAlign: 'center' }}>
          Thêm Tiền Vào "{selectedGoal?.name || ''}"
          <IconButton onClick={() => setOpenDialog(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Số tiền (VND)"
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            InputProps={{ inputProps: { min: 0 } }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <ActionButton variant="contained" onClick={handleAddAmount}>
            Xác Nhận
          </ActionButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Savings;