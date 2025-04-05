import {
  Add as AddIcon,
  ArrowBack as BackIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  TrendingDown as ExpenseIcon,
  TrendingUp as IncomeIcon,
  AttachMoney as MoneyIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
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

// Styled components remain unchanged
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const StatCard = styled(StyledCard)(() => ({}));

const GlassContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

// Interfaces remain unchanged
interface SubscriptionState {
  plan: string | null;
  loading?: boolean;
  error?: string | null;
}

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

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
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

const DEFAULT_CATEGORIES: Category[] = [
  { _id: 'default-1', name: 'Ăn uống', type: 'expense', color: '#FF5722', icon: '🍔' },
  { _id: 'default-2', name: 'Di chuyển', type: 'expense', color: '#3F51B5', icon: '🚖' },
  { _id: 'default-3', name: 'Mua sắm', type: 'expense', color: '#9C27B0', icon: '🛍️' },
  { _id: 'default-4', name: 'Lương', type: 'income', color: '#4CAF50', icon: '💰' },
  { _id: 'default-5', name: 'Thưởng', type: 'income', color: '#FFC107', icon: '🎁' },
  { _id: 'default-6', name: 'Khác', type: 'expense', color: '#607D8B', icon: '❓' },
];

const UserTransactions = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { darkMode, currency } = useThemeContext();
  const subscription = useSelector((state: RootState) => state.subscription) as SubscriptionState;
  const { plan } = subscription;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
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
    category: DEFAULT_CATEGORIES[0].name,
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
      setTransactions(data);
      setFilteredTransactions(data);
      calculateStats(data);
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
      setCategories(data.length > 0 ? data : DEFAULT_CATEGORIES);
      setFormData((prev) => ({ ...prev, category: data.length > 0 ? data[0].name : DEFAULT_CATEGORIES[0].name }));
    } catch (err: any) {
      setCategories(DEFAULT_CATEGORIES);
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
      setTransactions(stateTransactions);
      setFilteredTransactions(stateTransactions);
      calculateStats(stateTransactions);
      setLoading(false);
    } else {
      fetchTransactions();
    }

    fetchCategories();
    fetchBudgets();
    if (plan === 'pro') fetchTrendData();
  }, [fetchTransactions, fetchCategories, fetchBudgets, fetchTrendData, navigate, plan, location.state]);

  const calculateStats = (transactions: Transaction[]) => {
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    setStats({ totalIncome, totalExpense, balance });
  };

  const checkBudgetExceed = (transactions: Transaction[]) => {
    const expenseByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const alerts: string[] = [];
    budgets.forEach((budget) => {
      const expense = expenseByCategory[budget.category] || 0;
      if (expense > budget.amount) {
        alerts.push(
          `Chi tiêu cho "${budget.category}" (${formatCurrency(expense)}) đã vượt ngân sách (${formatCurrency(budget.amount)})!`
        );
      }
    });

    setBudgetAlert(alerts.length > 0 ? alerts.join(' ') : null);
  };

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
  }, [transactions, filterType, startDate, endDate, selectedMonth, budgets]);

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

    return plan === 'pro' && trendData.labels.length > 0
      ? {
          labels: trendData.labels,
          datasets: [
            {
              label: 'Thu nhập',
              data: trendData.incomeData,
              backgroundColor: 'rgba(76, 175, 80, 0.7)',
              borderColor: '#4CAF50',
              borderWidth: 1,
            },
            {
              label: 'Chi tiêu',
              data: trendData.expenseData,
              backgroundColor: 'rgba(255, 87, 34, 0.7)',
              borderColor: '#FF5722',
              borderWidth: 1,
            },
          ],
        }
      : {
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
      const selectedCategory = categories.find((c) => c.name === formData.category);
      if (!selectedCategory) throw new Error('Danh mục không hợp lệ');

      const payload = {
        type: formData.type,
        amount,
        category: selectedCategory._id,
        description: formData.description || `${formData.type === 'income' ? 'Thu nhập' : 'Chi tiêu'} từ ${formData.category}`,
        date: new Date(formData.date).toISOString(),
        paymentMethod: formData.paymentMethod,
        status: 'completed',
      };

      await axiosInstance.post('/api/transactions', payload);
      setOpenDialog(false);
      setFormData({
        type: 'expense',
        amount: '',
        category: categories[0].name,
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Tiền mặt',
      });
      fetchTransactions();
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
      body: filteredTransactions.map((t) => [
        new Date(t.date).toLocaleDateString('vi-VN'),
        t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
        t.category,
        t.description,
        formatCurrency(t.amount),
        t.paymentMethod,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210] },
    });
    doc.save('bao-cao-giao-dich.pdf');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency === 'VND' ? 'VND' : 'USD' }).format(amount);
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
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: darkMode ? '#121212' : '#F5F7FA', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: darkMode ? '#90CAF9' : '#1976D2', fontWeight: 600 }}>
          <MoneyIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Quản lý Giao dịch
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: darkMode ? '#90CAF9' : '#1976D2', borderColor: darkMode ? '#90CAF9' : '#1976D2' }}
        >
          Quay lại
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {budgetAlert && <Alert severity="warning" sx={{ mb: 2 }}>{budgetAlert}</Alert>}

      <GlassContainer sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#E0E0E0' : '#333' }}>🔍 Bộ lọc</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: darkMode ? '#E0E0E0' : '#666' }}>Lọc theo</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setStartDate('');
                  setEndDate('');
                  setSelectedMonth('');
                  if (e.target.value === 'all') setFilteredTransactions(transactions);
                }}
                sx={{ color: darkMode ? '#E0E0E0' : '#333' }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="range">Khoảng thời gian</MenuItem>
                <MenuItem value="month">Tháng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {filterType === 'range' && (
            <>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Từ ngày"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: darkMode ? '#E0E0E0' : '#666' } }}
                  sx={{ '& .MuiInputBase-input': { color: darkMode ? '#E0E0E0' : '#333' } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Đến ngày"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: darkMode ? '#E0E0E0' : '#666' } }}
                  sx={{ '& .MuiInputBase-input': { color: darkMode ? '#E0E0E0' : '#333' } }}
                />
              </Grid>
            </>
          )}
          {filterType === 'month' && (
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: darkMode ? '#E0E0E0' : '#666' }}>Tháng</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  sx={{ color: darkMode ? '#E0E0E0' : '#333' }}
                >
                  {generateMonthOptions().map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </GlassContainer>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard sx={{ bgcolor: darkMode ? '#388E3C' : '#4CAF50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IncomeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Tổng Thu</Typography>
              </Box>
              <Typography variant="h5">{formatCurrency(stats.totalIncome)}</Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard sx={{ bgcolor: darkMode ? '#D32F2F' : '#FF5722' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ExpenseIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Tổng Chi</Typography>
              </Box>
              <Typography variant="h5">{formatCurrency(stats.totalExpense)}</Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard sx={{ bgcolor: stats.balance >= 0 ? (darkMode ? '#1976D2' : '#2196F3') : '#F44336' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Số dư</Typography>
              </Box>
              <Typography variant="h5">{formatCurrency(stats.balance)}</Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      <GlassContainer sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: darkMode ? '#E0E0E0' : '#333' }}>
            📊 Biểu đồ Tài chính
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant={groupBy === 'day' ? 'contained' : 'outlined'} onClick={() => setGroupBy('day')}>Ngày</Button>
            <Button variant={groupBy === 'week' ? 'contained' : 'outlined'} onClick={() => setGroupBy('week')}>Tuần</Button>
            <Button variant={groupBy === 'month' ? 'contained' : 'outlined'} onClick={() => setGroupBy('month')}>Tháng</Button>
            <IconButton onClick={fetchTransactions} sx={{ color: darkMode ? '#90CAF9' : '#1976D2' }}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ height: 400 }}>
          <Bar data={chartData()} options={chartOptions} />
        </Box>
        {plan !== 'pro' && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Chip
              label="Nâng cấp lên Pro để xem dữ liệu chi tiết hơn"
              color="primary"
              onClick={() => navigate('/pricing')}
              clickable
            />
          </Box>
        )}
      </GlassContainer>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: darkMode ? '#388E3C' : '#4CAF50', '&:hover': { bgcolor: darkMode ? '#2E7D32' : '#388E3C' } }}
        >
          Thêm Giao dịch
        </Button>
        {(plan === 'premium' || plan === 'pro') ? (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            sx={{ bgcolor: darkMode ? '#1976D2' : '#2196F3', '&:hover': { bgcolor: darkMode ? '#1565C0' : '#1976D2' } }}
          >
            Xuất PDF
          </Button>
        ) : (
          <Alert severity="info">Nâng cấp lên Premium/Pro để xuất PDF</Alert>
        )}
      </Box>

      <GlassContainer>
        <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#E0E0E0' : '#333' }}>
          📋 Lịch sử Giao dịch
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><CalendarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Ngày</TableCell>
                <TableCell><CategoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Loại</TableCell>
                <TableCell><CategoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Danh mục</TableCell>
                <TableCell><DescriptionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Mô tả</TableCell>
                <TableCell><MoneyIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Số tiền</TableCell>
                <TableCell><PaymentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Phương thức</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((t) => (
                <TableRow key={t._id} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' } }}>
                  <TableCell>{new Date(t.date).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                      color={t.type === 'income' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell sx={{ color: t.type === 'income' ? '#4CAF50' : '#FF5722' }}>{formatCurrency(t.amount)}</TableCell>
                  <TableCell>{t.paymentMethod}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: darkMode ? '#1976D2' : '#2196F3', color: '#fff' }}>
          <AddIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Thêm Giao dịch Mới
        </DialogTitle>
        <DialogContent sx={{ bgcolor: darkMode ? '#1A2027' : '#fff', pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
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
                InputProps={{ startAdornment: <MoneyIcon sx={{ mr: 1, color: 'gray' }} /> }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c.name}>
                      {c.icon} {c.name}
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
                InputProps={{ startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'gray' }} /> }}
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
                InputProps={{ startAdornment: <CalendarIcon sx={{ mr: 1, color: 'gray' }} /> }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Phương thức</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <MenuItem value="Tiền mặt">💵 Tiền mặt</MenuItem>
                  <MenuItem value="Chuyển khoản">🏦 Chuyển khoản</MenuItem>
                  <MenuItem value="Thẻ tín dụng">💳 Thẻ tín dụng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleAddTransaction} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTransactions;