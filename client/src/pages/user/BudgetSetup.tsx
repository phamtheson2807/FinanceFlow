import {
    Add as AddIcon
} from '@mui/icons-material';
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
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    TextField,
    Typography
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

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

interface NewCategory {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

interface SavingsSuggestion {
  amount: number;
  percentage: number;
  description: string;
  monthlyIncome: number;
  monthlyExpense: number;
}

// Danh sách các danh mục cần loại trừ
const EXCLUDED_CATEGORIES = ['tiết kiệm', 'đầu tư', 'investment', 'savings', 'invest'];

const StyledPaper = styled(Box)(({ theme }) => ({
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

const BudgetSetup: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode, currency } = useThemeContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    type: 'expense',
    icon: '📊',
    color: '#2563eb'
  });
  const [savingsSuggestion, setSavingsSuggestion] = useState<SavingsSuggestion | null>(null);

  const calculateSavingsSuggestion = (transactions: Transaction[]) => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = totalIncome / Math.max(1, new Set(transactions.map(t => 
      new Date(t.date).getMonth() + '-' + new Date(t.date).getFullYear()
    )).size);

    const monthlyExpense = totalExpense / Math.max(1, new Set(transactions.map(t => 
      new Date(t.date).getMonth() + '-' + new Date(t.date).getFullYear()
    )).size);

    const disposableIncome = monthlyIncome - monthlyExpense;
    const savingsPercentage = Math.min(50, Math.max(10, Math.round((disposableIncome / monthlyIncome) * 100)));
    const suggestedSavings = Math.round(monthlyIncome * (savingsPercentage / 100));

    let description = '';
    if (savingsPercentage >= 30) {
      description = 'Bạn có thể tiết kiệm một khoản lớn! Hãy cân nhắc đầu tư dài hạn.';
    } else if (savingsPercentage >= 20) {
      description = 'Khả năng tiết kiệm tốt! Hãy duy trì thói quen chi tiêu hiện tại.';
    } else if (savingsPercentage >= 10) {
      description = 'Bạn có thể bắt đầu với một khoản tiết kiệm nhỏ và tăng dần theo thời gian.';
    } else {
      description = 'Hãy xem xét lại các khoản chi tiêu để tăng khả năng tiết kiệm.';
    }

    setSavingsSuggestion({
      amount: suggestedSavings,
      percentage: savingsPercentage,
      description,
      monthlyIncome,
      monthlyExpense
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsRes, categoriesRes] = await Promise.all([
          axiosInstance.get('/api/transactions'),
          axiosInstance.get('/api/categories')
        ]);
        
        setTransactions(transactionsRes.data.transactions || []);
        setCategories(categoriesRes.data || []);
        
        calculateSavingsSuggestion(transactionsRes.data.transactions || []);
        suggestBudgets(transactionsRes.data.transactions || [], categoriesRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const suggestBudgets = (transactions: Transaction[], categories: Category[]) => {
    const expenseCategories = categories.filter(cat => 
      cat.type === 'expense' && 
      !EXCLUDED_CATEGORIES.some(excluded => cat.name.toLowerCase().includes(excluded))
    );

    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    const categoryMap = new Map<string, { total: number; count: number; name: string }>();

    const categoryNameMap = new Map(categories.map(cat => [cat._id, cat.name]));

    expenseCategories.forEach(cat => {
      categoryMap.set(cat.name, { total: 0, count: 0, name: cat.name });
    });

    expenseTransactions.forEach((t) => {
      const categoryName = categoryNameMap.get(t.category) || 'Khác';
      
      if (!EXCLUDED_CATEGORIES.some(excluded => categoryName.toLowerCase().includes(excluded))) {
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, { total: 0, count: 0, name: categoryName });
        }
        const category = categoryMap.get(categoryName);
        if (category) {
          category.total += t.amount;
          category.count += 1;
        }
      }
    });

    const totalMonths = new Set(expenseTransactions.map((t) => 
      new Date(t.date).getMonth() + '-' + new Date(t.date).getFullYear()
    )).size || 1;

    const suggestions = Array.from(categoryMap.values()).map(({ total, name }) => ({
      name,
      suggestedAmount: Math.round(total / totalMonths)
    }));

    setBudgets(
      suggestions.map((suggestion) => ({
        category: suggestion.name,
        amount: suggestion.suggestedAmount,
        period: 'monthly'
      }))
    );
  };

  const handleSaveBudgets = async () => {
    try {
      if (budgets.some(b => !b.category || !b.amount)) {
        setError('Vui lòng điền đầy đủ thông tin cho tất cả ngân sách');
        return;
      }

      await axiosInstance.post('/api/budgets', { budgets });
      setSuccess('Lưu ngân sách thành công');
      setTimeout(() => {
        navigate('/dashboard/reports/budget');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lưu ngân sách');
    }
  };

  const handleBudgetChange = (index: number, field: keyof Budget, value: string | number) => {
    const newBudgets = [...budgets];
    newBudgets[index] = { ...newBudgets[index], [field]: value };
    setBudgets(newBudgets);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: currency === 'VND' ? 'VND' : 'USD' 
    }).format(amount);
  };

  const handleAddNewCategory = async () => {
    try {
      if (!newCategory.name) {
        setError('Vui lòng nhập tên danh mục');
        return;
      }

      if (EXCLUDED_CATEGORIES.some(excluded => 
        newCategory.name.toLowerCase().includes(excluded)
      )) {
        setError('Không thể thêm danh mục tiết kiệm hoặc đầu tư');
        return;
      }

      const response = await axiosInstance.post('/api/categories', newCategory);
      const addedCategory = response.data;

      setCategories(prev => [...prev, addedCategory]);
      setBudgets(prev => [...prev, {
        category: addedCategory.name,
        amount: 0,
        period: period
      }]);

      setSuccess('Thêm danh mục mới thành công');
      setOpenCategoryDialog(false);
      setNewCategory({
        name: '',
        type: 'expense',
        icon: '📊',
        color: '#2563eb'
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể thêm danh mục mới');
    }
  };

  const calculateBudgetProgress = (budget: Budget) => {
    const categoryTransactions = transactions.filter(t => {
      const categoryName = categories.find(c => c._id === t.category)?.name;
      return t.type === 'expense' && categoryName === budget.category;
    });
    
    const currentSpending = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentageUsed = budget.amount > 0 ? (currentSpending / budget.amount) * 100 : 0;
    const isOverBudget = currentSpending > budget.amount;

    return {
      currentSpending,
      percentageUsed,
      isOverBudget
    };
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      minHeight: '100vh',
      background: darkMode ? '#121212' : '#f8fafc',
    }}>
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
          Thiết lập Ngân sách Chi tiêu
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
          {success}
        </Alert>
      )}

      {savingsSuggestion && (
        <StyledPaper sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2
          }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Gợi ý tiết kiệm của bạn
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {savingsSuggestion.description}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Thu nhập hàng tháng: {formatCurrency(savingsSuggestion.monthlyIncome)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chi tiêu hàng tháng: {formatCurrency(savingsSuggestion.monthlyExpense)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: { xs: 'flex-start', sm: 'flex-end' }
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: '#2563eb',
                  mb: 1
                }}
              >
                {formatCurrency(savingsSuggestion.amount)}
              </Typography>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                }}
              >
                {savingsSuggestion.percentage}% thu nhập hàng tháng
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      )}

      <StyledPaper>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Thiết lập chu kỳ ngân sách
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Thiết lập ngân sách cho các khoản chi tiêu thông thường.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Chu kỳ</InputLabel>
            <Select
              value={period}
              onChange={(e) => {
                const newPeriod = e.target.value as 'monthly' | 'weekly';
                setPeriod(newPeriod);
                setBudgets(budgets.map(b => ({ ...b, period: newPeriod })));
              }}
              sx={{ borderRadius: '12px' }}
            >
              <MenuItem value="monthly">Hàng tháng</MenuItem>
              <MenuItem value="weekly">Hàng tuần</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Ngân sách theo danh mục
          </Typography>
          <Grid container spacing={3}>
            {budgets.map((budget, index) => {
              const { currentSpending, percentageUsed, isOverBudget } = calculateBudgetProgress(budget);
              
              return (
                <Grid item xs={12} md={6} key={index}>
                  <StyledPaper sx={{ 
                    p: 2,
                    border: isOverBudget ? '2px solid #ef4444' : undefined,
                  }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                        {budget.category}
                      </Typography>
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
                              backgroundColor: isOverBudget ? '#ef4444' : '#2563eb',
                            }
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(percentageUsed)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={budget.amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Remove leading zeros and convert to number
                          const cleanValue = value.replace(/^0+/, '') || '0';
                          handleBudgetChange(index, 'amount', Number(cleanValue));
                        }}
                        sx={{ 
                          width: '150px',
                          '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Đã chi: {formatCurrency(currentSpending)}
                      </Typography>
                    </Box>
                  </StyledPaper>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <StyledButton
            startIcon={<AddIcon />}
            onClick={() => setOpenCategoryDialog(true)}
            sx={{
              color: darkMode ? '#3b82f6' : '#2563eb',
            }}
          >
            Thêm danh mục
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleSaveBudgets}
            sx={{
              background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
              color: '#fff',
            }}
          >
            Lưu ngân sách
          </StyledButton>
        </Box>
      </StyledPaper>

      <Dialog 
        open={openCategoryDialog} 
        onClose={() => setOpenCategoryDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: darkMode 
              ? 'linear-gradient(135deg, #1e2a38 0%, #2d3748 100%)'
              : 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)',
          }
        }}
      >
        <DialogTitle>Thêm danh mục mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên danh mục"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Icon"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Màu sắc"
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setOpenCategoryDialog(false)}>
            Hủy
          </StyledButton>
          <StyledButton onClick={handleAddNewCategory} variant="contained">
            Thêm
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetSetup;