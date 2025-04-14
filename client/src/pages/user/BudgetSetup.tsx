import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';
  
  interface Transaction {
    _id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
  }
  
  interface Budget {
    category: string;
    amount: number;
    period: 'monthly' | 'weekly';
  }
  
  interface CategorySuggestion {
    name: string;
    suggestedAmount: number;
  }
  
  const GlassContainer = styled(Box)(({ theme }) => ({
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: theme.spacing(3),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  }));
  
  const BudgetSetup: React.FC = () => {
    const navigate = useNavigate();
    const { darkMode, currency } = useThemeContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  
    // Lấy dữ liệu giao dịch từ backend
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/transactions');
        const data: Transaction[] = response.data.transactions || [];
        setTransactions(data);
        suggestBudgets(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải giao dịch');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
  
    // Tính toán ngân sách gợi ý dựa trên chi tiêu trung bình
    const suggestBudgets = (transactions: Transaction[]) => {
      const expenseTransactions = transactions.filter((t) => t.type === 'expense');
      const groupedByCategory = expenseTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  
      const totalMonths = new Set(expenseTransactions.map((t) => new Date(t.date).getMonth())).size || 1;
      const suggestions: CategorySuggestion[] = Object.entries(groupedByCategory).map(([category, total]) => ({
        name: category,
        suggestedAmount: Math.round(total / totalMonths), // Trung bình mỗi tháng
      }));
  
      setBudgets(
        suggestions.map((suggestion) => ({
          category: suggestion.name,
          amount: suggestion.suggestedAmount,
          period: 'monthly',
        }))
      );
    };
  
    useEffect(() => {
      fetchTransactions();
    }, []);
  
    // Xử lý thay đổi ngân sách
    const handleBudgetChange = (index: number, field: keyof Budget, value: string | number) => {
      const newBudgets = [...budgets];
      newBudgets[index] = { ...newBudgets[index], [field]: value };
      setBudgets(newBudgets);
    };
  
    // Lưu ngân sách vào backend
    const handleSaveBudgets = async () => {
      try {
        await axiosInstance.post('/api/budgets', { budgets });
        navigate('/dashboard/reports/budget');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể lưu ngân sách');
      }
    };
  
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency === 'VND' ? 'VND' : 'USD' }).format(amount);
    };
  
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
  
    return (
      <Box sx={{ p: 3, bgcolor: darkMode ? '#121212' : '#F5F7FA', minHeight: '100vh' }}>
        <Typography variant="h4" sx={{ mb: 3, color: darkMode ? '#90CAF9' : '#1976D2' }}>
          Thiết lập Ngân sách Tự động
        </Typography>
  
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
  
        <GlassContainer>
          <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#E0E0E0' : '#333' }}>
            Ngân sách Gợi ý
          </Typography>
  
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: darkMode ? '#E0E0E0' : '#666' }}>Chu kỳ</InputLabel>
            <Select
              value={period}
              onChange={(e) => {
                const newPeriod = e.target.value as 'monthly' | 'weekly';
                setPeriod(newPeriod);
                setBudgets(budgets.map((b) => ({ ...b, period: newPeriod })));
              }}
              sx={{ color: darkMode ? '#E0E0E0' : '#333' }}
            >
              <MenuItem value="monthly">Hàng tháng</MenuItem>
              <MenuItem value="weekly">Hàng tuần</MenuItem>
            </Select>
          </FormControl>
  
          {budgets.map((budget, index) => (
            <Box key={budget.category} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: darkMode ? '#E0E0E0' : '#333' }}>
                {budget.category}
              </Typography>
              <TextField
                label="Số tiền"
                type="number"
                value={budget.amount}
                onChange={(e) => handleBudgetChange(index, 'amount', Number(e.target.value))}
                fullWidth
                InputProps={{ inputProps: { min: 0 }, endAdornment: <Typography>{currency}</Typography> }}
                sx={{ bgcolor: darkMode ? '#4A5568' : 'transparent', '& .MuiInputBase-input': { color: darkMode ? '#FFFFFF' : '#333' } }}
              />
            </Box>
          ))}
  
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="contained" color="primary" onClick={handleSaveBudgets}>
              Lưu Ngân sách
            </Button>
            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
              Hủy
            </Button>
          </Box>
        </GlassContainer>
      </Box>
    );
  };
  
  export default BudgetSetup;