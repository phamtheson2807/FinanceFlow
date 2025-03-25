import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
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
import { BarElement, CategoryScale, Chart as ChartJS, Tooltip as ChartTooltip, Legend, LinearScale, Title } from 'chart.js';
import { useCallback, useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../contexts/ThemeContext';
import axiosInstance from '../utils/axiosInstance';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

interface Transaction {
  _id: string;
  user_id: string;
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

const DEFAULT_CATEGORIES: Category[] = [
  { _id: 'default-1', name: 'Ăn uống', type: 'expense', color: '#FF5722', icon: '🍔' },
  { _id: 'default-2', name: 'Di chuyển', type: 'expense', color: '#3F51B5', icon: '🚖' },
  { _id: 'default-3', name: 'Mua sắm', type: 'expense', color: '#9C27B0', icon: '🛍️' },
  { _id: 'default-4', name: 'Lương', type: 'income', color: '#4CAF50', icon: '💰' },
  { _id: 'default-5', name: 'Thưởng', type: 'income', color: '#FFC107', icon: '🎁' },
  { _id: 'default-6', name: 'Khác', type: 'expense', color: '#607D8B', icon: '❓' },
];

const Transactions = () => {
  const navigate = useNavigate();
  const { darkMode, currency } = useThemeContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: DEFAULT_CATEGORIES[0].name,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Tiền mặt',
  });
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0 });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/transactions');
      const data = response.data.transactions || [];
      setTransactions(data);
      calculateStats(data);
    } catch (err: any) {
      console.error('❌ Lỗi lấy giao dịch:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách giao dịch');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/categories');
      const data = response.data || [];
      if (data.length > 0) {
        setCategories(data);
        setFormData((prev) => ({ ...prev, category: data[0].name }));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        setFormData((prev) => ({ ...prev, category: DEFAULT_CATEGORIES[0].name }));
      }
    } catch (err: any) {
      console.error('❌ Lỗi lấy danh mục:', err);
      setCategories(DEFAULT_CATEGORIES); // Fallback khi API lỗi
      setFormData((prev) => ({ ...prev, category: DEFAULT_CATEGORIES[0].name }));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập để tiếp tục.');
      navigate('/login');
      return;
    }
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories, navigate]);

  const calculateStats = (transactions: Transaction[]) => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    setStats({ totalIncome, totalExpense });
  };

  const groupTransactions = (transactions: Transaction[], groupBy: 'day' | 'week' | 'month') => {
    const groupedData: Record<string, Transaction[]> = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      let key = '';
      if (groupBy === 'day') {
        key = date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
      } else if (groupBy === 'week') {
        const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
        key = startOfWeek.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
      } else if (groupBy === 'month') {
        key = date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' });
      }
      if (!groupedData[key]) groupedData[key] = [];
      groupedData[key].push(t);
    });
    return groupedData;
  };

  const groupedTransactions = groupTransactions(transactions, groupBy);

  const expenseTrendData = {
    labels: Object.keys(groupedTransactions),
    datasets: [
      {
        label: 'Chi tiêu',
        data: Object.values(groupedTransactions).map((group) =>
          group.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0)
        ),
        backgroundColor: darkMode ? '#FF7043' : '#FF5722',
        borderColor: darkMode ? '#FF7043' : '#FF5722',
        borderWidth: 1,
      },
    ],
  };

  const handleAddTransaction = async () => {
    try {
      const amount = Number(formData.amount);
      if (amount <= 0) throw new Error('Số tiền phải lớn hơn 0');
      if (!formData.category) throw new Error('Vui lòng chọn danh mục');
      const payload = {
        type: formData.type,
        amount,
        category: formData.category,
        description: formData.description || `${formData.type === 'income' ? 'Thu nhập' : 'Chi tiêu'} từ ${formData.category}`,
        date: new Date(formData.date).toISOString(),
        paymentMethod: formData.paymentMethod,
        status: 'completed',
      };
      console.log('📡 Payload gửi lên:', payload);
      await axiosInstance.post('/api/transactions', payload);
      setOpenDialog(false);
      fetchTransactions();
      setError(null);
    } catch (err: any) {
      console.error('❌ Lỗi khi thêm giao dịch:', err);
      setError(err.response?.data?.message || err.message || 'Không thể thêm giao dịch');
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency === 'VND' ? 'VND' : 'USD' }).format(amount);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: darkMode ? '#FFFFFF' : '#333' } },
      title: { display: true, text: 'Xu hướng chi tiêu', color: darkMode ? '#FFFFFF' : '#1E90FF' },
    },
    scales: {
      x: { title: { display: true, text: groupBy === 'day' ? 'Ngày' : groupBy === 'week' ? 'Tuần' : 'Tháng', color: darkMode ? '#FFFFFF' : '#333' }, ticks: { color: darkMode ? '#FFFFFF' : '#333' } },
      y: { title: { display: true, text: 'Số tiền', color: darkMode ? '#FFFFFF' : '#333' }, ticks: { color: darkMode ? '#FFFFFF' : '#333' } },
    },
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Skeleton height={40} width="50%" />
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}><Skeleton variant="rectangular" height={100} /></Grid>
          <Grid item xs={12} sm={4}><Skeleton variant="rectangular" height={100} /></Grid>
          <Grid item xs={12} sm={4}><Skeleton variant="rectangular" height={100} /></Grid>
        </Grid>
        <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: darkMode ? '#1A2027' : '#F5F7FA', color: darkMode ? '#FFFFFF' : '#333' }}>
      <Typography variant="h4" sx={{ mb: { xs: 2, sm: 3 }, color: '#1E90FF', textAlign: 'center', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        📊 Quản lý giao dịch tài chính
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={{ xs: 1, sm: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: darkMode ? '#388E3C' : '#4CAF50', color: '#fff', '&:hover': { bgcolor: darkMode ? '#2E7D32' : '#388E3C' } }}>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tổng thu</Typography>
              <Typography variant="h5" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{formatCurrency(stats.totalIncome)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: darkMode ? '#E64A19' : '#FF5722', color: '#fff', '&:hover': { bgcolor: darkMode ? '#D32F2F' : '#E64A19' } }}>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tổng chi</Typography>
              <Typography variant="h5" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{formatCurrency(stats.totalExpense)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: darkMode ? '#1976D2' : '#2196F3', color: '#fff', '&:hover': { bgcolor: darkMode ? '#1565C0' : '#1976D2' } }}>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Số dư hiện tại</Typography>
              <Typography variant="h5" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{formatCurrency(stats.totalIncome - stats.totalExpense)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 }, bgcolor: darkMode ? '#2D3748' : '#FFFFFF' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}>📈 Xu hướng chi tiêu</Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
            <Button variant={groupBy === 'day' ? 'contained' : 'outlined'} onClick={() => setGroupBy('day')} sx={{ mb: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' }, bgcolor: groupBy === 'day' ? (darkMode ? '#4A5568' : '#1E90FF') : 'transparent' }}>Theo ngày</Button>
            <Button variant={groupBy === 'week' ? 'contained' : 'outlined'} onClick={() => setGroupBy('week')} sx={{ mb: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' }, bgcolor: groupBy === 'week' ? (darkMode ? '#4A5568' : '#1E90FF') : 'transparent' }}>Theo tuần</Button>
            <Button variant={groupBy === 'month' ? 'contained' : 'outlined'} onClick={() => setGroupBy('month')} sx={{ width: { xs: '100%', sm: 'auto' }, bgcolor: groupBy === 'month' ? (darkMode ? '#4A5568' : '#1E90FF') : 'transparent' }}>Theo tháng</Button>
          </Box>
          <Box sx={{ height: { xs: '200px', sm: '300px' } }}>
            <Bar data={expenseTrendData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>

      <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ mt: { xs: 2, sm: 3 }, bgcolor: darkMode ? '#E64A19' : '#FF5722', '&:hover': { bgcolor: darkMode ? '#D32F2F' : '#E64A19' } }}>➕ Thêm giao dịch</Button>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', bgcolor: darkMode ? '#2D3748' : '#FFFFFF', color: darkMode ? '#FFFFFF' : '#333' } }}>
        <DialogTitle sx={{ color: '#1E90FF', textAlign: 'center', fontWeight: 600 }}>Thêm giao dịch</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Số tiền"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            fullWidth
            sx={{ mb: 2, bgcolor: darkMode ? '#4A5568' : 'transparent', '& .MuiInputBase-input': { color: darkMode ? '#FFFFFF' : '#333' } }}
            InputProps={{ inputProps: { min: 0 } }}
            InputLabelProps={{ style: { color: darkMode ? '#D1D5DB' : '#666' } }}
          />
          <FormControl fullWidth sx={{ mb: 2, bgcolor: darkMode ? '#4A5568' : 'transparent' }}>
            <InputLabel sx={{ color: darkMode ? '#D1D5DB' : '#666' }}>Danh mục</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => {
                const selectedCategory = e.target.value as string;
                const category = categories.find((c) => c.name === selectedCategory);
                const updatedType = category?.type || 'expense';
                setFormData({ ...formData, category: selectedCategory, type: updatedType });
              }}
              sx={{ '& .MuiSelect-select': { color: darkMode ? '#FFFFFF' : '#333' } }}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c.name}>{c.icon} {c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            sx={{ mb: 2, bgcolor: darkMode ? '#4A5568' : 'transparent', '& .MuiInputBase-input': { color: darkMode ? '#FFFFFF' : '#333' } }}
            InputLabelProps={{ style: { color: darkMode ? '#D1D5DB' : '#666' } }}
          />
          <TextField
            label="Ngày"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            fullWidth
            sx={{ mb: 2, bgcolor: darkMode ? '#4A5568' : 'transparent', '& .MuiInputBase-input': { color: darkMode ? '#FFFFFF' : '#333' } }}
            InputLabelProps={{ shrink: true, style: { color: darkMode ? '#D1D5DB' : '#666' } }}
          />
          <FormControl fullWidth sx={{ mb: 2, bgcolor: darkMode ? '#4A5568' : 'transparent' }}>
            <InputLabel sx={{ color: darkMode ? '#D1D5DB' : '#666' }}>Phương thức thanh toán</InputLabel>
            <Select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as string })}
              sx={{ '& .MuiSelect-select': { color: darkMode ? '#FFFFFF' : '#333' } }}
            >
              <MenuItem value="Tiền mặt">💵 Tiền mặt</MenuItem>
              <MenuItem value="Chuyển khoản">💳 Chuyển khoản</MenuItem>
              <MenuItem value="Thẻ tín dụng">💳 Thẻ tín dụng</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={handleAddTransaction} variant="contained" sx={{ bgcolor: darkMode ? '#388E3C' : '#4CAF50', '&:hover': { bgcolor: darkMode ? '#2E7D32' : '#388E3C' } }}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Card} sx={{ mt: { xs: 2, sm: 3 }, bgcolor: darkMode ? '#2D3748' : '#FFFFFF' }}>
        <Table sx={{ minWidth: 300 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#FFFFFF' : '#333' }}>📅 Ngày</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#FFFFFF' : '#333' }}>📊 Loại</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#FFFFFF' : '#333' }}>📁 Danh mục</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#FFFFFF' : '#333' }}>📝 Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: darkMode ? '#FFFFFF' : '#333' }}>💰 Số tiền</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t._id}>
                <TableCell sx={{ color: darkMode ? '#FFFFFF' : '#333' }}>{new Date(t.date).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell sx={{ color: darkMode ? '#FFFFFF' : '#333' }}>{t.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</TableCell>
                <TableCell sx={{ color: darkMode ? '#FFFFFF' : '#333' }}>{t.category}</TableCell>
                <TableCell sx={{ color: darkMode ? '#FFFFFF' : '#333' }}>{t.description}</TableCell>
                <TableCell sx={{ color: darkMode ? '#FFFFFF' : '#333' }}>{formatCurrency(t.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ bgcolor: darkMode ? '#1976D2' : '#2196F3', '&:hover': { bgcolor: darkMode ? '#1565C0' : '#1976D2' } }}>Quay lại Dashboard</Button>
      </Box>
    </Box>
  );
};

export default Transactions;