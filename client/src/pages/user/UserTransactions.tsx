import {
    Add as AddIcon,
    ArrowBack as BackIcon,
    Category as CategoryIcon,
    Download as DownloadIcon,
    TrendingDown as ExpenseIcon,
    TrendingUp as IncomeIcon,
    AttachMoney as MoneyIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Tooltip as ChartTooltip,
    Legend,
    LinearScale,
    Title,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCallback, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../contexts/ThemeContext';
import { RootState } from '../../redux/store';
import axiosInstance from '../../utils/axiosInstance';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' ? '#1e2a38' : '#fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  },
}));

const StatCard = styled(StyledCard)(() => ({}));

const GlassContainer = styled(Box)(({ theme }) => ({
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(30, 42, 56, 0.9), rgba(45, 55, 72, 0.9))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(247, 250, 252, 0.9))',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
  padding: theme.spacing(3),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(0, 0, 0, 0.1)',
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

// Interfaces
interface SubscriptionState {
  plan: string | null;
  loading?: boolean;
  error?: string | null;
}

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

interface Transaction {
  _id: string;
  user: string;
  type: 'income' | 'expense';
  amount: number;
  category: string | { _id: string; name: string; icon: string } | null | undefined;
  description: string;
  date: string;
  paymentMethod: string;
  status: string;
}

interface Budget {
  category: string;
  amount: number;
  period: 'monthly' | 'weekly';
}

interface TrendData {
  labels: string[];
  incomeData: number[];
  expenseData: number[];
}

const UserTransactions = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { darkMode, currency } = useThemeContext();
  const subscription = useSelector((state: RootState) => state.subscription) as SubscriptionState;
  const { plan } = subscription;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    type: 'income' | 'expense';
    amount: string;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }>({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Tiền mặt',
  });
  const [stats, setStats] = useState<{ totalIncome: number; totalExpense: number; balance: number }>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [budgetAlert, setBudgetAlert] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendData>({ labels: [], incomeData: [], expenseData: [] });
  const [filterType, setFilterType] = useState<'range' | 'month' | 'all'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/transactions');
      const data: Transaction[] = response.data.transactions || [];
      console.log('📡 Raw API data:', JSON.stringify(data, null, 2));
      // Chuẩn hóa category
      const normalizedData = data.map((t, index) => {
        let normalizedCategory;
        if (typeof t.category === 'object' && t.category) {
          normalizedCategory = t.category._id;
        } else {
          normalizedCategory = t.category || '';
        }
        console.log(`Giao dịch ${index}: category trước =`, t.category, 'sau =', normalizedCategory);
        return {
          ...t,
          category: normalizedCategory,
        };
      });
      console.log('📡 Giao dịch sau khi chuẩn hóa:', JSON.stringify(normalizedData, null, 2));
      setTransactions(normalizedData);
      setFilteredTransactions(normalizedData);
      calculateStats(normalizedData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải giao dịch');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      const data: Category[] = response.data || [];
      console.log('📡 Danh mục lấy từ API:', JSON.stringify(data, null, 2));
      setCategories(data);
      setFormData((prev) => ({
        ...prev,
        category: data.length > 0 ? data[0]._id : ''
      }));
    } catch (err: any) {
      setCategories([]);
      setFormData((prev) => ({
        ...prev,
        category: ''
      }));
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/budgets');
      setBudgets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải ngân sách');
    }
  }, []);

  const fetchTrendData = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/transactions/trend');
      setTrendData(response.data as TrendData);
    } catch (err: any) {
      setError('Không thể tải xu hướng chi tiêu');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập');
      navigate('/login');
      return;
    }

    const stateTransactions = location.state?.transactions;
    if (stateTransactions && Array.isArray(stateTransactions)) {
      console.log('📡 State transactions:', JSON.stringify(stateTransactions, null, 2));
      const normalizedData = stateTransactions.map((t: Transaction, index: number) => {
        let normalizedCategory;
        if (typeof t.category === 'object' && t.category) {
          normalizedCategory = t.category._id;
        } else {
          normalizedCategory = t.category || '';
        }
        console.log(`State giao dịch ${index}: category trước =`, t.category, 'sau =', normalizedCategory);
        return {
          ...t,
          category: normalizedCategory,
        };
      });
      console.log('📡 State transactions sau khi chuẩn hóa:', JSON.stringify(normalizedData, null, 2));
      setTransactions(normalizedData);
      setFilteredTransactions(normalizedData);
      calculateStats(normalizedData);
      setLoading(false);
    } else {
      fetchTransactions();
    }

    fetchCategories();
    fetchBudgets();
    if (plan === 'pro') fetchTrendData();
  }, [fetchTransactions, fetchCategories, fetchBudgets, fetchTrendData, navigate, plan, location.state, location.key]);

  const calculateStats = (transactions: Transaction[]) => {
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    setStats({ totalIncome, totalExpense, balance });
  };

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency === 'VND' ? 'VND' : 'USD' }).format(amount);
  }, [currency]);

  const checkBudgetExceed = useCallback((transactions: Transaction[]) => {
    const expenseByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryId = typeof t.category === 'string' ? t.category : 
                          (t.category && typeof t.category === 'object') ? t.category._id : '';
        acc[categoryId] = (acc[categoryId] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const alerts: string[] = [];
    budgets.forEach((budget) => {
      const expense = expenseByCategory[budget.category] || 0;
      const category = categories.find((cat) => cat._id === budget.category);
      if (expense > budget.amount) {
        const categoryName = category ? category.name : 'Không xác định';
        alerts.push(
          `Chi tiêu cho "${categoryName}" (${formatCurrency(expense)}) đã vượt ngân sách (${formatCurrency(budget.amount)})!`
        );
      }
    });

    setBudgetAlert(alerts.length > 0 ? alerts.join('\n') : null);
  }, [budgets, categories, formatCurrency]);

  const filterTransactions = useCallback(() => {
    let filtered = [...transactions];
    if (filterType === 'range' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
    } else if (filterType === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1;
      });
    }
    setFilteredTransactions(filtered);
    calculateStats(filtered);
    checkBudgetExceed(filtered);
  }, [transactions, filterType, startDate, endDate, selectedMonth, checkBudgetExceed]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const groupTransactions = (transactions: Transaction[]) => {
    const groupedData: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      let key = '';
      if (groupBy === 'day') {
        key = date.toLocaleDateString('vi-VN');
      } else if (groupBy === 'week') {
        const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
        key = startOfWeek.toLocaleDateString('vi-VN');
      } else {
        key = date.toLocaleString('vi-VN', { month: 'short', year: 'numeric' });
      }
      if (!groupedData[key]) groupedData[key] = { income: 0, expense: 0 };
      if (t.type === 'income') groupedData[key].income += t.amount;
      else groupedData[key].expense += t.amount;
    });
    return groupedData;
  };

  const chartData = () => {
    const grouped = groupTransactions(filteredTransactions);
    const labels = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const incomeData = labels.map((key) => grouped[key].income);
    const expenseData = labels.map((key) => grouped[key].expense);

    // Kiểm tra trendData và plan trước khi sử dụng
    if (plan === 'pro' && trendData && trendData.labels && trendData.labels.length > 0) {
      return {
        labels: trendData.labels,
        datasets: [
          {
            label: 'Thu nhập',
            data: trendData.incomeData || [],
            backgroundColor: 'rgba(76, 175, 80, 0.7)',
            borderColor: '#4CAF50',
            borderWidth: 1,
          },
          {
            label: 'Chi tiêu',
            data: trendData.expenseData || [],
            backgroundColor: 'rgba(255, 87, 34, 0.7)',
            borderColor: '#FF5722',
            borderWidth: 1,
          },
        ],
      };
    }

    // Fallback to grouped data if no trend data available
    return {
      labels,
      datasets: [
        {
          label: 'Thu nhập',
          data: incomeData,
          backgroundColor: 'rgba(76, 175, 80, 0.7)',
          borderColor: '#4CAF50',
          borderWidth: 1,
        },
        {
          label: 'Chi tiêu',
          data: expenseData,
          backgroundColor: 'rgba(255, 87, 34, 0.7)',
          borderColor: '#FF5722',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: darkMode ? '#E0E0E0' : '#333', font: { size: 14 } },
      },
      title: {
        display: true,
        text: 'Biểu đồ Thu nhập & Chi tiêu',
        color: darkMode ? '#90CAF9' : '#1976D2',
        font: { size: 18 },
      },
      tooltip: {
        backgroundColor: darkMode ? '#333' : '#fff',
        titleColor: darkMode ? '#fff' : '#333',
        bodyColor: darkMode ? '#fff' : '#333',
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: groupBy === 'day' ? 'Ngày' : groupBy === 'week' ? 'Tuần' : 'Tháng', color: darkMode ? '#E0E0E0' : '#333' },
        ticks: { color: darkMode ? '#E0E0E0' : '#333' },
        grid: { color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
      },
      y: {
        title: { display: true, text: 'Số tiền', color: darkMode ? '#E0E0E0' : '#333' },
        ticks: { color: darkMode ? '#E0E0E0' : '#333', callback: (value: any) => formatCurrency(value).split(',')[0] },
        grid: { color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
      },
    },
  };

  const handleAddTransaction = async () => {
    try {
      const amount = Number(formData.amount);
      if (amount <= 0) throw new Error('Số tiền phải lớn hơn 0');
      const selectedCategory = categories.find((c) => c._id === formData.category);
      console.log('📡 Danh mục được chọn:', selectedCategory);
      if (!selectedCategory) throw new Error('Danh mục không hợp lệ');
      if (selectedCategory.type !== formData.type) {
        throw new Error(`Danh mục "${selectedCategory.name}" phải là ${selectedCategory.type}`);
      }

      const payload = {
        type: formData.type,
        amount,
        category: selectedCategory._id,
        description: formData.description || `${formData.type === 'income' ? 'Thu nhập' : 'Chi tiêu'} từ ${selectedCategory.name}`,
        date: new Date(formData.date).toISOString(),
        paymentMethod: formData.paymentMethod,
        status: 'completed',
      };

      console.log('📡 Payload gửi đi:', payload);
      const response = await axiosInstance.post('/api/transactions', payload);
      const newTransaction: Transaction = response.data;
      console.log('📡 Giao dịch mới từ API:', newTransaction);
      // Chuẩn hóa category của giao dịch mới
      const normalizedTransaction = {
        ...newTransaction,
        category: typeof newTransaction.category === 'object' && newTransaction.category ? newTransaction.category._id : newTransaction.category || '',
      };
      console.log('📡 Giao dịch mới sau chuẩn hóa:', normalizedTransaction);

      setFormData({
        type: 'expense',
        amount: '',
        category: categories[0]?._id || '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Tiền mặt',
      });
      setOpenDialog(false);
      // Cập nhật transactions với giao dịch mới
      setTransactions((prev) => [...prev, normalizedTransaction]);
      setFilteredTransactions((prev) => [...prev, normalizedTransaction]);
      calculateStats([...transactions, normalizedTransaction]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể thêm giao dịch');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Báo cáo Giao dịch Tài chính', 14, 20);
    doc.setFontSize(12);
    doc.text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['Ngày', 'Loại', 'Danh mục', 'Mô tả', 'Số tiền', 'Phương thức']],
      body: filteredTransactions.map((t) => {
        const categoryObj = categories.find((cat) => {
          return typeof t.category === 'string' ? cat._id === t.category : 
            (t.category && typeof t.category === 'object') ? cat._id === t.category._id : false;
        });
        const categoryName = categoryObj ? categoryObj.name : 'Không xác định';
        
        return [
          new Date(t.date).toLocaleDateString('vi-VN'),
          t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
          categoryName,
          t.description,
          formatCurrency(t.amount),
          t.paymentMethod,
        ];
      }),
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210] },
    });
    doc.save('bao-cao-giao-dich.pdf');
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  // Corrected getCategoryDisplay function to handle all possible types safely
  const getCategoryDisplay = (categoryData: string | { _id: string; name: string; icon?: string } | null | undefined): string => {
    if (!categoryData) {
      return 'Không xác định';
    }
    
    if (typeof categoryData === 'string') {
      const foundCategory = categories.find(cat => cat._id === categoryData);
      return foundCategory ? foundCategory.name : 'Không xác định';
    }
    
    if (typeof categoryData === 'object' && categoryData !== null) {
      return categoryData.name || 'Không xác định';
    }
    
    return 'Không xác định';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="50%" height={40} />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={300} sx={{ mt: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      minHeight: '100vh',
      background: darkMode ? '#121212' : '#f8fafc',
    }}>
      {/* Header */}
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
          Quản lý Giao dịch
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <StyledButton
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => navigate('/categories')}
            sx={{
              borderColor: darkMode ? '#3b82f6' : '#2563eb',
              color: darkMode ? '#3b82f6' : '#2563eb',
            }}
          >
            Danh mục
          </StyledButton>
          <StyledButton
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              borderColor: darkMode ? '#3b82f6' : '#2563eb',
              color: darkMode ? '#3b82f6' : '#2563eb',
            }}
          >
            Quay lại
          </StyledButton>
        </Box>
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>}
      {budgetAlert && <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px', whiteSpace: 'pre-line' }}>{budgetAlert}</Alert>}

      {/* Filters */}
      <GlassContainer sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Lọc theo</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setStartDate('');
                  setEndDate('');
                  setSelectedMonth('');
                  if (e.target.value === 'all') setFilteredTransactions(transactions);
                }}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="range">Khoảng thời gian</MenuItem>
                <MenuItem value="month">Tháng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {filterType === 'range' && (
            <>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Từ ngày"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Đến ngày"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </>
          )}
          {filterType === 'month' && (
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Chọn tháng"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={3}>
            <StyledButton
              fullWidth
              variant="contained"
              onClick={filterTransactions}
              sx={{
                background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
                color: '#fff',
                height: '56px',
              }}
            >
              Lọc
            </StyledButton>
          </Grid>
        </Grid>
      </GlassContainer>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IncomeIcon sx={{ color: '#4CAF50', mr: 1 }} />
                <Typography variant="h6">Thu nhập</Typography>
              </Box>
              <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                {formatCurrency(stats.totalIncome)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ExpenseIcon sx={{ color: '#FF5722', mr: 1 }} />
                <Typography variant="h6">Chi tiêu</Typography>
              </Box>
              <Typography variant="h5" sx={{ color: '#FF5722', fontWeight: 600 }}>
                {formatCurrency(stats.totalExpense)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon sx={{ color: stats.balance >= 0 ? '#2196F3' : '#F44336', mr: 1 }} />
                <Typography variant="h6">Số dư</Typography>
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: stats.balance >= 0 ? '#2196F3' : '#F44336',
                  fontWeight: 600 
                }}
              >
                {formatCurrency(stats.balance)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Chart */}
      <GlassContainer sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Biểu đồ Thu - Chi
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <StyledButton
              variant={groupBy === 'day' ? 'contained' : 'outlined'}
              onClick={() => setGroupBy('day')}
              sx={groupBy === 'day' ? {
                background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
                color: '#fff',
              } : {
                borderColor: darkMode ? '#3b82f6' : '#2563eb',
                color: darkMode ? '#3b82f6' : '#2563eb',
              }}
            >
              Ngày
            </StyledButton>
            <StyledButton
              variant={groupBy === 'week' ? 'contained' : 'outlined'}
              onClick={() => setGroupBy('week')}
              sx={groupBy === 'week' ? {
                background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
                color: '#fff',
              } : {
                borderColor: darkMode ? '#3b82f6' : '#2563eb',
                color: darkMode ? '#3b82f6' : '#2563eb',
              }}
            >
              Tuần
            </StyledButton>
            <StyledButton
              variant={groupBy === 'month' ? 'contained' : 'outlined'}
              onClick={() => setGroupBy('month')}
              sx={groupBy === 'month' ? {
                background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
                color: '#fff',
              } : {
                borderColor: darkMode ? '#3b82f6' : '#2563eb',
                color: darkMode ? '#3b82f6' : '#2563eb',
              }}
            >
              Tháng
            </StyledButton>
          </Box>
        </Box>
        <Box sx={{ height: 350 }}>
          <Bar data={chartData()} options={chartOptions} />
        </Box>
      </GlassContainer>

      {/* Transactions List */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Danh sách Giao dịch
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <StyledButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
              color: '#fff',
            }}
          >
            Thêm Giao dịch
          </StyledButton>
          <IconButton
            onClick={fetchTransactions}
            sx={{ 
              borderRadius: '12px',
              border: `1px solid ${darkMode ? '#3b82f6' : '#2563eb'}`,
              color: darkMode ? '#3b82f6' : '#2563eb',
            }}
          >
            <RefreshIcon />
          </IconButton>
          {(plan === 'premium' || plan === 'pro') && (
            <StyledButton
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              sx={{
                borderColor: darkMode ? '#3b82f6' : '#2563eb',
                color: darkMode ? '#3b82f6' : '#2563eb',
              }}
            >
              Xuất PDF
            </StyledButton>
          )}
        </Box>
      </Box>

      <GlassContainer>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 600,
                  background: darkMode ? '#1e2a38' : '#f8fafc',
                }}>Ngày</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600,
                  background: darkMode ? '#1e2a38' : '#f8fafc',
                }}>Loại</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600,
                  background: darkMode ? '#1e2a38' : '#f8fafc',
                }}>Danh mục</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600,
                  background: darkMode ? '#1e2a38' : '#f8fafc',
                }}>Mô tả</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600,
                  background: darkMode ? '#1e2a38' : '#f8fafc',
                }}>Số tiền</TableCell>
                <TableCell sx={{ 
                  fontWeight: 600,
                  background: darkMode ? '#1e2a38' : '#f8fafc',
                }}>Phương thức</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ py: 3 }}>
                      Không có giao dịch nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => (
                    <TableRow 
                      key={transaction._id} 
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: darkMode 
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                        }
                      }}
                    >
                      <TableCell>{new Date(transaction.date).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <Chip
                          icon={transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
                          label={transaction.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          size="small"
                          sx={{ borderRadius: '8px' }}
                        />
                      </TableCell>
                      <TableCell>
                        {getCategoryDisplay(transaction.category)}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell sx={{ 
                        color: transaction.type === 'income' ? '#4CAF50' : '#FF5722',
                        fontWeight: 600 
                      }}>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassContainer>

      {/* Add Transaction Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
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
          Thêm Giao dịch mới
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại giao dịch</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="income">Thu nhập</MenuItem>
                  <MenuItem value="expense">Chi tiêu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số tiền"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  sx={{ borderRadius: '12px' }}
                >
                  {categories
                    .filter((cat) => cat.type === formData.type)
                    .map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ngày"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phương thức thanh toán</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="Tiền mặt">Tiền mặt</MenuItem>
                  <MenuItem value="Chuyển khoản">Chuyển khoản</MenuItem>
                  <MenuItem value="Thẻ tín dụng">Thẻ tín dụng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <StyledButton
            onClick={() => setOpenDialog(false)}
            sx={{
              color: darkMode ? '#fff' : '#1a202c',
            }}
          >
            Hủy
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleAddTransaction}
            sx={{
              background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
              color: '#fff',
            }}
          >
            Thêm
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTransactions;