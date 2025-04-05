import { Add, ArrowUpward, Close, Delete, Edit, Savings as SavingsIcon } from '@mui/icons-material';
import {
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
  useTheme
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

// Interface for Savings Goal object
interface SavingGoal {
  _id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
}

// Interface for User object (thêm balance)
interface User {
  balance: number;
}

// Dialog types
type DialogType = 'addGoal' | 'editGoal' | 'addAmount' | 'deleteConfirm' | null;

// Custom Alert component
const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
  <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const Savings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State management
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0); // State cho số dư
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: new Date().toISOString().split('T')[0]
  });
  const [addAmount, setAddAmount] = useState('');
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Fetch savings goals and user balance from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsResponse, userResponse] = await Promise.all([
        axiosInstance.get('/api/savings'),
        axiosInstance.get('/api/user') // Giả sử có API để lấy thông tin user
      ]);
      setSavingGoals(goalsResponse.data || []);
      setUserBalance(userResponse.data.balance || 0); // Lấy số dư từ user
    } catch (err: any) {
      console.error('❌ Lỗi lấy dữ liệu:', err);
      showSnackbar(err.response?.data?.message || 'Lỗi tải dữ liệu', 'error');
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
    const token = localStorage.getItem('token');
    if (!token) {
      showSnackbar('Vui lòng đăng nhập để tiếp tục', 'error');
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate, fetchData]);

  // Show snackbar helper
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      target_amount: '',
      target_date: new Date().toISOString().split('T')[0]
    });
    setAddAmount('');
    setSelectedGoal(null);
  };

  // Handle dialog open
  const handleOpenDialog = (type: DialogType, goal?: SavingGoal) => {
    if (goal && (type === 'editGoal' || type === 'addAmount' || type === 'deleteConfirm')) {
      setSelectedGoal(goal);
      if (type === 'editGoal') {
        setFormData({
          name: goal.name,
          target_amount: goal.target_amount.toString(),
          target_date: new Date(goal.target_date).toISOString().split('T')[0]
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
        target_date: formData.target_date
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
        target_date: formData.target_date
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

  // Handle delete savings goal with balance update
  const handleDeleteSavingGoal = async () => {
    if (!selectedGoal) return;

    try {
      setLoading(true);
      // Xóa quỹ và cập nhật số dư user
      await axiosInstance.delete(`/api/savings/${selectedGoal._id}`, {
        data: { returnToBalance: true } // Gửi yêu cầu để trả số tiền về balance
      });
      await fetchData(); // Cập nhật lại danh sách quỹ và số dư
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

  // Handle add amount to goal
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
    
    try {
      setLoading(true);
      await axiosInstance.patch(`/api/savings/${selectedGoal._id}/add`, { amount });
      await fetchData();
      handleCloseDialog();
      showSnackbar('Thêm tiền thành công', 'success');
    } catch (err: any) {
      console.error('❌ Lỗi thêm tiền:', err);
      showSnackbar(err.response?.data?.message || 'Lỗi thêm tiền', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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
        pb: 8
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 4,
          px: 2,
          mb: 4,
          borderRadius: { xs: 0, sm: '0 0 24px 24px' },
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <SavingsIcon sx={{ fontSize: 36, mr: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              Quỹ Tiết Kiệm
            </Typography>
          </Box>
          
          <Typography 
            variant="subtitle1" 
            textAlign="center" 
            sx={{ mb: 3, opacity: 0.9 }}
          >
            Quản lý mục tiêu tiết kiệm và theo dõi tiến độ của bạn
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Số dư: {formatCurrency(userBalance)}
            </Typography>
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
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              Thêm Quỹ Mới
            </Button>
          </Box>
        </Container>
      </Box>

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
              
              return (
                <Grid item xs={12} sm={6} md={4} key={goal._id}>
                  <Card
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                      },
                      border: isCompleted 
                        ? `1px solid ${theme.palette.success.main}` 
                        : isOverdue 
                          ? `1px solid ${theme.palette.error.main}` 
                          : 'none'
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        pb: 1.5,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: isCompleted 
                          ? `${theme.palette.success.light}30` 
                          : isOverdue 
                            ? `${theme.palette.error.light}30` 
                            : 'transparent'
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
                                : theme.palette.primary.main
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
                            onClick={() => handleOpenDialog('deleteConfirm', goal)} // Mở dialog xác nhận
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ pt: 2 }}>
                      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', my: 1 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={100}
                            thickness={5}
                            sx={{ 
                              color: isCompleted 
                                ? theme.palette.success.main 
                                : isOverdue 
                                  ? theme.palette.error.main 
                                  : theme.palette.primary.main
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
                              flexDirection: 'column'
                            }}
                          >
                            <Typography variant="body2" fontWeight="bold" color="text.secondary">
                              {progress.toFixed(0)}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Tiết kiệm:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
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
                        <Grid item xs={12} sx={{ mt: 1 }}>
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

                      <Box sx={{ mt: 3 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<ArrowUpward />}
                          onClick={() => handleOpenDialog('addAmount', goal)}
                          sx={{ 
                            borderRadius: 2,
                            py: 1.2,
                            bgcolor: isCompleted ? theme.palette.success.main : theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: isCompleted ? theme.palette.success.dark : theme.palette.primary.dark
                            }
                          }}
                        >
                          Thêm Tiền
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8, 
              px: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
            }}
          >
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
          </Box>
        )}
      </Container>

      {/* Add/Edit Goal Dialog */}
      <Dialog
        open={openDialog === 'addGoal' || openDialog === 'editGoal'}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, px: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              {openDialog === 'addGoal' ? 'Thêm Quỹ Tiết Kiệm Mới' : 'Chỉnh Sửa Quỹ Tiết Kiệm'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ pb: 2 }}>
          <TextField
            label="Tên quỹ tiết kiệm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="normal"
            autoFocus
            placeholder="Ví dụ: Mua xe, Du lịch, Tiền học..."
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
          />
          
          <TextField
            label="Ngày hoàn thành"
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseDialog}
            sx={{ borderRadius: 2, px: 3 }}
          >
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
        PaperProps={{ sx: { borderRadius: 3, px: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              Thêm Tiền Vào Quỹ
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {selectedGoal && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Quỹ: {selectedGoal.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiện tại: {formatCurrency(selectedGoal.current_amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mục tiêu: {formatCurrency(selectedGoal.target_amount || 0)}
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
            InputProps={{ inputProps: { min: 1 } }}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseDialog}
            sx={{ borderRadius: 2, px: 3 }}
          >
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog === 'deleteConfirm' && !!selectedGoal}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, px: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              Xác Nhận Xóa Quỹ
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {selectedGoal && (
            <Typography variant="body1">
              Bạn có chắc muốn xóa quỹ "{selectedGoal.name}" không? Số tiền hiện tại (
              {formatCurrency(selectedGoal.current_amount)}) sẽ được chuyển vào số dư của bạn.
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseDialog}
            sx={{ borderRadius: 2, px: 3 }}
          >
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