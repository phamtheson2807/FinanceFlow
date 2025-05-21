import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';

interface Budget {
  _id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly';
}

interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
}

// Danh sách các danh mục cần loại trừ
const EXCLUDED_CATEGORIES = ['tiết kiệm', 'đầu tư', 'investment', 'savings', 'invest'];

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e2a38 0%, #2d3748 100%)'
    : 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const Budget: React.FC = () => {
  const { darkMode } = useThemeContext();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, transactionsRes] = await Promise.all([
        axiosInstance.get('/api/budgets'),
        axiosInstance.get('/api/transactions')
      ]);
      
      // Filter out savings and investment budgets
      const filteredBudgets = (budgetsRes.data || []).filter((budget: Budget) => 
        !EXCLUDED_CATEGORIES.some(excluded => 
          budget.category.toLowerCase().includes(excluded)
        )
      );
      
      setBudgets(filteredBudgets);
      setTransactions(transactionsRes.data.transactions || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải ngân sách');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category: budget.category,
        amount: budget.amount.toString(),
        period: budget.period
      });
    } else {
      setEditingBudget(null);
      setFormData({
        category: '',
        amount: '',
        period: 'monthly'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
    setFormData({
      category: '',
      amount: '',
      period: 'monthly'
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.category || !formData.amount) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }

      // Check if category is savings or investment
      if (EXCLUDED_CATEGORIES.some(excluded => 
        formData.category.toLowerCase().includes(excluded)
      )) {
        setError('Không thể thêm danh mục tiết kiệm hoặc đầu tư');
        return;
      }

      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };

      if (editingBudget) {
        await axiosInstance.put(`/api/budgets/${editingBudget._id}`, payload);
        setSuccess('Cập nhật ngân sách thành công');
      } else {
        await axiosInstance.post('/api/budgets', { budgets: [payload] });
        setSuccess('Thêm ngân sách thành công');
      }

      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (budgetId: string) => {
    try {
      await axiosInstance.delete(`/api/budgets/${budgetId}`);
      setSuccess('Xóa ngân sách thành công');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa ngân sách');
    }
  };

  const calculateProgress = (budget: Budget) => {
    const relevantTransactions = transactions.filter(t => {
      const isCurrentPeriod = budget.period === 'monthly'
        ? new Date(t.date).getMonth() === new Date().getMonth()
        : true; // For weekly, we'll need more complex logic
      return t.type === 'expense' && t.category === budget.category && isCurrentPeriod;
    });

    const currentSpending = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentageUsed = (currentSpending / budget.amount) * 100;
    const remaining = budget.amount - currentSpending;

    return {
      currentSpending,
      percentageUsed,
      remaining,
      isOverBudget: currentSpending > budget.amount
    };
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        minHeight: '100vh',
        background: darkMode ? '#121212' : '#f8fafc',
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
              fontWeight: 600,
              background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Quản lý Ngân sách Chi tiêu
          </Typography>
          <StyledButton
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
              color: '#fff',
            }}
          >
            Thêm Ngân sách
          </StyledButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <StyledPaper>
          {loading ? (
            <Typography sx={{ textAlign: 'center', py: 3 }}>Đang tải...</Typography>
          ) : budgets.length > 0 ? (
            <Grid container spacing={3}>
              {budgets.map((budget) => {
                const { currentSpending, percentageUsed, remaining, isOverBudget } = calculateProgress(budget);
                
                return (
                  <Grid item xs={12} md={6} key={budget._id}>
                    <StyledPaper sx={{ 
                      p: 2,
                      border: isOverBudget ? '2px solid #ef4444' : undefined,
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2 
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {budget.category}
                        </Typography>
                        <Box>
                          <IconButton 
                            onClick={() => handleOpenDialog(budget)}
                            sx={{ color: darkMode ? '#3b82f6' : '#2563eb' }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(budget._id)}
                            sx={{ color: '#ef4444' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Ngân sách: {formatCurrency(budget.amount)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: isOverBudget ? '#ef4444' : remaining > 0 ? '#10b981' : '#f59e0b'
                            }}
                          >
                            {isOverBudget 
                              ? `Vượt ${formatCurrency(Math.abs(remaining))}` 
                              : `Còn lại ${formatCurrency(remaining)}`}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(100, percentageUsed)}
                            sx={{
                              flexGrow: 1,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: isOverBudget ? '#ef4444' : percentageUsed > 80 ? '#f59e0b' : '#10b981',
                              }
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(percentageUsed)}%
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Đã chi: {formatCurrency(currentSpending)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {budget.period === 'monthly' ? 'Hàng tháng' : 'Hàng tuần'}
                        </Typography>
                      </Box>
                    </StyledPaper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography sx={{ textAlign: 'center', py: 3 }}>
              Chưa có ngân sách nào. Hãy thêm ngân sách mới!
            </Typography>
          )}
        </StyledPaper>
      </motion.div>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: darkMode 
              ? 'linear-gradient(135deg, #1e2a38 0%, #2d3748 100%)'
              : 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.25rem',
          fontWeight: 600,
          color: darkMode ? '#fff' : '#1a202c',
        }}>
          {editingBudget ? 'Sửa Ngân sách' : 'Thêm Ngân sách Mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Danh mục"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số tiền"
                type="number"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Remove leading zeros and convert to number
                  const cleanValue = value.replace(/^0+/, '') || '0';
                  setFormData({ ...formData, amount: cleanValue });
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Chu kỳ</InputLabel>
                <Select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' })}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="monthly">Hàng tháng</MenuItem>
                  <MenuItem value="weekly">Hàng tuần</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <StyledButton
            onClick={handleCloseDialog}
            sx={{
              color: darkMode ? '#fff' : '#1a202c',
            }}
          >
            Hủy
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleSubmit}
            sx={{
              background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
              color: '#fff',
            }}
          >
            {editingBudget ? 'Cập nhật' : 'Thêm'}
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ borderRadius: '12px' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Budget;