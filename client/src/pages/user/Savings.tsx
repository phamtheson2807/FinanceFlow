import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Close,
  Delete,
  Edit,
  Refresh,
  Savings as SavingsIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const GlassContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

// Interface for Savings Goal object
interface SavingGoal {
  _id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
}

// Interface for Transaction object
interface Transaction {
  _id: string;
  user: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
  status: string;
}

// Interface for Category object
interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
}

// Dialog types
type DialogType = 'addGoal' | 'editGoal' | 'addAmount' | 'withdrawAmount' | 'deleteConfirm' | null;

// Custom Alert component
const AlertSnackbar = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const Savings = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State management
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: new Date().toISOString().split('T')[0],
  });
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Fetch savings goals, transactions, and categories
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
      }

      const [goalsResponse, transactionsResponse] = await Promise.all([
        axiosInstance.get('/api/savings'),
        axiosInstance.get('/api/transactions'),
      ]);

      setSavingGoals(goalsResponse.data || []);
      // Tính số dư từ transactions
      const totalIncome = transactionsResponse.data.transactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const totalExpense = transactionsResponse.data.transactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      setBalance(totalIncome - totalExpense);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.';
      setError(message);
      setSnackbar({ open: true, message, severity: 'error' });
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initialize component
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Show snackbar helper
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      target_amount: '',
      target_date: new Date().toISOString().split('T')[0],
    });
    setAddAmount('');
    setWithdrawAmount('');
    setSelectedGoal(null);
  };

  // Handle dialog open
  const handleOpenDialog = (type: DialogType, goal?: SavingGoal) => {
    if (goal && (type === 'editGoal' || type === 'addAmount' || type === 'withdrawAmount' || type === 'deleteConfirm')) {
      setSelectedGoal(goal);
      if (type === 'editGoal') {
        setFormData({
          name: goal.name,
          target_amount: goal.target_amount.toString(),
          target_date: new Date(goal.target_date).toISOString().split('T')[0],
        });
      }
    }
    setOpenDialog(type);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(null);
    resetFormData();
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      showSnackbar('Vui lòng nhập tên quỹ', 'error');
      return false;
    }

    const amount = Number(formData.target_amount);
    if (isNaN(amount) || amount <= 0) {
      showSnackbar('Số tiền mục tiêu phải lớn hơn 0', 'error');
      return false;
    }

    if (!formData.target_date) {
      showSnackbar('Vui lòng chọn ngày hoàn thành', 'error');
      return false;
    }

    return true;
  };

  // Handle add savings goal
  const handleAddSavingGoal = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await axiosInstance.post('/api/savings', {
        name: formData.name,
        target_amount: Number(formData.target_amount),
        target_date: formData.target_date,
      });

      await fetchData();
      handleCloseDialog();
      showSnackbar('Thêm quỹ tiết kiệm thành công', 'success');
    } catch (err: any) {
      console.error('❌ Lỗi thêm quỹ:', err);
      showSnackbar(err.response?.data?.message || 'Lỗi thêm quỹ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit savings goal
  const handleEditSavingGoal = async () => {
    if (!selectedGoal || !validateForm()) return;

    try {
      setLoading(true);
      await axiosInstance.put(`/api/savings/${selectedGoal._id}`, {
        name: formData.name,
        target_amount: Number(formData.target_amount),
        target_date: formData.target_date,
      });

      await fetchData();
      handleCloseDialog();
      showSnackbar('Cập nhật quỹ tiết kiệm thành công', 'success');
    } catch (err: any) {
      console.error('❌ Lỗi cập nhật quỹ:', err);
      showSnackbar(err.response?.data?.message || 'Lỗi cập nhật quỹ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete savings goal
  const handleDeleteSavingGoal = async () => {
    if (!selectedGoal) return;

    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/api/savings/${selectedGoal._id}`, {
        data: { returnToBalance: true },
      });
      
      // Cập nhật số dư nếu server trả về
      if (response.data.newBalance !== undefined) {
        setBalance(response.data.newBalance);
      } else {
        await fetchData(); // Fallback to fetching all data if newBalance is not provided
      }
      
      // Xóa quỹ khỏi danh sách
      setSavingGoals(prevGoals => prevGoals.filter(goal => goal._id !== selectedGoal._id));
      
      handleCloseDialog();
      showSnackbar(
        `Xóa quỹ tiết kiệm thành công. ${formatCurrency(selectedGoal.current_amount)} đã được thêm vào số dư.`,
        'success'
      );
    } catch (err: any) {
      console.error('❌ Lỗi xóa quỹ:', err);
      showSnackbar(err.response?.data?.message || 'Lỗi xóa quỹ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle add amount to savings goal
  const handleAddAmount = async () => {
    if (!selectedGoal) {
      showSnackbar('Không có quỹ được chọn', 'error');
      handleCloseDialog();
      return;
    }

    const amount = Number(addAmount);
    if (isNaN(amount) || amount <= 0) {
      showSnackbar('Số tiền không hợp lệ', 'error');
      return;
    }

    if (amount > balance) {
      showSnackbar('Số dư ví không đủ để thêm vào quỹ', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.patch(`/api/savings/${selectedGoal._id}/add`, { amount });
      
      // Cập nhật số dư mới từ response
      if (response.data.newBalance !== undefined) {
        setBalance(response.data.newBalance);
      }
      
      // Cập nhật quỹ tiết kiệm trong state
      setSavingGoals(prevGoals => 
        prevGoals.map(goal => 
          goal._id === selectedGoal._id ? response.data.saving : goal
        )
      );
      
      handleCloseDialog();
      showSnackbar(`Thêm ${formatCurrency(amount)} vào quỹ thành công`, 'success');
    } catch (err: any) {
      console.error('❌ Lỗi thêm tiền:', err);
      const message =
        err.response?.status === 404
          ? 'Quỹ tiết kiệm không tồn tại'
          : err.response?.status === 400
          ? err.response.data.message || 'Số dư ví không đủ hoặc dữ liệu không hợp lệ'
          : err.response?.status === 500
          ? 'Lỗi server: Vui lòng kiểm tra cấu hình hoặc liên hệ hỗ trợ.'
          : 'Không thể thêm tiền vào quỹ. Vui lòng thử lại.';
      showSnackbar(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle withdraw amount from savings goal
  const handleWithdrawAmount = async () => {
    if (!selectedGoal) {
      showSnackbar('Không có quỹ được chọn', 'error');
      handleCloseDialog();
      return;
    }

    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      showSnackbar('Số tiền không hợp lệ', 'error');
      return;
    }

    if (amount > selectedGoal.current_amount) {
      showSnackbar('Số tiền rút vượt quá số dư quỹ', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.patch(`/api/savings/${selectedGoal._id}/withdraw`, { amount });
      
      // Cập nhật số dư mới từ response
      if (response.data.newBalance !== undefined) {
        setBalance(response.data.newBalance);
      }
      
      // Cập nhật quỹ tiết kiệm trong state
      setSavingGoals(prevGoals => 
        prevGoals.map(goal => 
          goal._id === selectedGoal._id ? response.data.saving : goal
        )
      );
      
      handleCloseDialog();
      showSnackbar(`Rút ${formatCurrency(amount)} từ quỹ thành công`, 'success');
    } catch (err: any) {
      console.error('❌ Lỗi rút tiền:', err);
      const message =
        err.response?.status === 404
          ? 'Quỹ tiết kiệm không tồn tại'
          : err.response?.status === 400
          ? err.response.data.message || 'Dữ liệu không hợp lệ'
          : err.response?.status === 500
          ? 'Lỗi server: Vui lòng kiểm tra cấu hình hoặc liên hệ hỗ trợ.'
          : 'Không thể rút tiền từ quỹ. Vui lòng thử lại.';
      showSnackbar(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);

  // Format date
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  // Calculate remaining days
  const calculateRemainingDays = (targetDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.background.default} 100%)`,
        pb: 8,
      }}
    >
      {/* Header */}
      <GlassContainer
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 4,
          px: 2,
          mb: 4,
          borderRadius: { xs: 0, sm: '0 0 24px 24px' },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <SavingsIcon sx={{ fontSize: 36, mr: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              Quỹ Tiết Kiệm
            </Typography>
          </Box>
          <Typography variant="subtitle1" textAlign="center" sx={{ mb: 3, opacity: 0.9 }}>
            Quản lý mục tiêu tiết kiệm và theo dõi tiến độ của bạn
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {loading ? (
              <Typography variant="h6" fontWeight="bold">
                Số dư: <CircularProgress size={20} color="inherit" />
              </Typography>
            ) : error ? (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            ) : (
              <Typography variant="h6" fontWeight="bold">
                Số dư ví: {formatCurrency(balance)}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={fetchData}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
              >
                <Refresh />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('addGoal')}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                Thêm Quỹ Mới
              </Button>
            </Box>
          </Box>
        </Container>
      </GlassContainer>

      {/* Main content */}
      <Container maxWidth="lg">
        {loading && savingGoals.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : savingGoals.length > 0 ? (
          <Grid container spacing={3}>
            {savingGoals.map((goal) => {
              const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              const remainingDays = calculateRemainingDays(goal.target_date);
              const isCompleted = progress >= 100;
              const isOverdue = remainingDays < 0;
              const remainingAmount = goal.target_amount - goal.current_amount;

              return (
                <Grid item xs={12} sm={6} md={4} key={goal._id}>
                  <StyledCard
                    sx={{
                      border: isCompleted
                        ? `2px solid ${theme.palette.success.main}`
                        : isOverdue
                        ? `2px solid ${theme.palette.error.main}`
                        : `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: isCompleted
                          ? `${theme.palette.success.light}20`
                          : isOverdue
                          ? `${theme.palette.error.light}20`
                          : theme.palette.background.paper,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color: isCompleted
                              ? theme.palette.success.dark
                              : isOverdue
                              ? theme.palette.error.dark
                              : theme.palette.primary.main,
                          }}
                        >
                          {goal.name}
                        </Typography>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog('editGoal', goal)}
                            sx={{ mr: 0.5 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDialog('deleteConfirm', goal)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={120}
                            thickness={5}
                            sx={{
                              color: isCompleted
                                ? theme.palette.success.main
                                : isOverdue
                                ? theme.palette.error.main
                                : theme.palette.primary.main,
                            }}
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
                              flexDirection: 'column',
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold" color="text.primary">
                              {progress.toFixed(0)}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Đã tiết kiệm:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            {formatCurrency(goal.current_amount || 0)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Mục tiêu:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {formatCurrency(goal.target_amount)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Còn lại:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" color="warning.main">
                            {formatCurrency(remainingAmount > 0 ? remainingAmount : 0)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Hạn hoàn thành:
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            color={isOverdue ? 'error.main' : 'text.primary'}
                          >
                            {formatDate(goal.target_date)}
                            {isOverdue ? (
                              <Typography component="span" color="error" fontWeight="medium">
                                {' '}(Quá hạn {Math.abs(remainingDays)} ngày)
                              </Typography>
                            ) : (
                              <Typography component="span" color="text.secondary" fontWeight="medium">
                                {' '}(Còn {remainingDays} ngày)
                              </Typography>
                            )}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<ArrowUpward />}
                          onClick={() => handleOpenDialog('addAmount', goal)}
                          disabled={isCompleted}
                          sx={{
                            borderRadius: 2,
                            py: 1.2,
                            bgcolor: isCompleted ? theme.palette.success.main : theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: isCompleted ? theme.palette.success.dark : theme.palette.primary.dark,
                            },
                          }}
                        >
                          Thêm Tiền
                        </Button>
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<ArrowDownward />}
                          onClick={() => handleOpenDialog('withdrawAmount', goal)}
                          disabled={goal.current_amount <= 0}
                          sx={{
                            borderRadius: 2,
                            py: 1.2,
                            borderColor: theme.palette.grey[400],
                            color: theme.palette.text.primary,
                            '&:hover': {
                              borderColor: theme.palette.grey[600],
                              bgcolor: theme.palette.grey[100],
                            },
                          }}
                        >
                          Rút Tiền
                        </Button>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <GlassContainer sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <SavingsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có quỹ tiết kiệm nào
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Hãy bắt đầu bằng việc tạo một quỹ tiết kiệm cho mục tiêu của bạn!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog('addGoal')}
              sx={{ borderRadius: 2, px: 3, py: 1 }}
            >
              Thêm Quỹ Mới
            </Button>
          </GlassContainer>
        )}
      </Container>

      {/* Add/Edit Goal Dialog */}
      <Dialog
        open={openDialog === 'addGoal' || openDialog === 'editGoal'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              {openDialog === 'addGoal' ? 'Thêm Quỹ Tiết Kiệm Mới' : 'Chỉnh Sửa Quỹ Tiết Kiệm'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Tên quỹ tiết kiệm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="normal"
            autoFocus
            placeholder="Ví dụ: Mua xe, Du lịch, Tiền học..."
            variant="outlined"
          />
          <TextField
            label="Số tiền mục tiêu (VND)"
            type="number"
            value={formData.target_amount}
            onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
            fullWidth
            margin="normal"
            placeholder="Ví dụ: 10000000"
            InputProps={{ inputProps: { min: 1 } }}
            variant="outlined"
          />
          <TextField
            label="Ngày hoàn thành"
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={handleCloseDialog} sx={{ borderRadius: 2, px: 3 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={openDialog === 'addGoal' ? handleAddSavingGoal : handleEditSavingGoal}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {openDialog === 'addGoal' ? 'Tạo Quỹ' : 'Cập Nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Amount Dialog */}
      <Dialog
        open={openDialog === 'addAmount' && !!selectedGoal}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              Thêm Tiền Vào Quỹ
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedGoal && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Quỹ: {selectedGoal.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiện tại: {formatCurrency(selectedGoal.current_amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mục tiêu: {formatCurrency(selectedGoal.target_amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số dư ví: {formatCurrency(balance)}
              </Typography>
            </Box>
          )}
          <TextField
            label="Số tiền thêm vào (VND)"
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            fullWidth
            autoFocus
            helperText="Nhập số tiền bạn muốn thêm vào quỹ"
            InputProps={{ inputProps: { min: 1, max: balance } }}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={handleCloseDialog} sx={{ borderRadius: 2, px: 3 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleAddAmount}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Xác Nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Amount Dialog */}
      <Dialog
        open={openDialog === 'withdrawAmount' && !!selectedGoal}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              Rút Tiền Từ Quỹ
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedGoal && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Quỹ: {selectedGoal.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiện tại: {formatCurrency(selectedGoal.current_amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mục tiêu: {formatCurrency(selectedGoal.target_amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số dư ví: {formatCurrency(balance)}
              </Typography>
            </Box>
          )}
          <TextField
            label="Số tiền rút (VND)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            fullWidth
            autoFocus
            helperText="Nhập số tiền bạn muốn rút từ quỹ"
            InputProps={{ inputProps: { min: 1, max: selectedGoal?.current_amount } }}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={handleCloseDialog} sx={{ borderRadius: 2, px: 3 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleWithdrawAmount}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Xác Nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog === 'deleteConfirm' && !!selectedGoal}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              Xác Nhận Xóa Quỹ
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedGoal && (
            <Typography variant="body1">
              Bạn có chắc muốn xóa quỹ "<strong>{selectedGoal.name}</strong>" không? Số tiền hiện tại (
              <strong>{formatCurrency(selectedGoal.current_amount)}</strong>) sẽ được chuyển vào số dư ví của bạn.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={handleCloseDialog} sx={{ borderRadius: 2, px: 3 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSavingGoal}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <AlertSnackbar
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </AlertSnackbar>
      </Snackbar>
    </Box>
  );
};

export default Savings;