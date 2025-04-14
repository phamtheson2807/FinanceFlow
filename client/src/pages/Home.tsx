import {
  AccountBalance,
  ArrowDownward,
  ArrowUpward,
  DirectionsCar,
  Home,
  LocalMovies,
  Restaurant,
  Savings,
  ShoppingCart
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Grid,
  Modal,
  Paper,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import ChatBot from '../components/ChatBot';
import { useThemeContext } from '../contexts/ThemeContext';
import axiosInstance from '../utils/axiosInstance';

// Interfaces
interface DashboardData {
  stats: { income: number; expense: number; savings: number; investment: number; balance: number };
  savingsProgress?: { name: string; current_amount: number; target_amount: number }[];
  investmentProgress?: { name: string; initialAmount: number; currentAmount: number; type: string }[];
}

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

interface Notification {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdBy: { name: string };
  createdAt: Date;
  isRead?: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode, currency } = useThemeContext();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: { income: 0, expense: 0, savings: 0, investment: 0, balance: 0 },
    savingsProgress: [],
    investmentProgress: [],
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');

  // Fetch data từ API
  const fetchData = useCallback(
    async (endpoint: string, errorMessage: string) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Không tìm thấy token');
        const response = await axiosInstance.get(endpoint);
        return response.data;
      } catch (error) {
        console.error(`❌ Lỗi ${endpoint}:`, error);
        setError(errorMessage);
        return null;
      }
    },
    []
  );
  // Hàm cập nhật balance trên server
  const updateUserBalance = useCallback(async (calculatedBalance: number) => {
    try {
      await axiosInstance.put('/api/auth/balance', { balance: calculatedBalance });
      console.log('✅ Đã cập nhật balance lên server');
    } catch (err) {
      console.error('❌ Không thể cập nhật balance:', err);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    const data = await fetchData('/api/dashboard', 'Không thể tải dữ liệu dashboard');
    if (data?.stats) {
      const { income = 0, expense = 0, investment = 0, savings = 0 } = data.stats;
      const balance = income - expense - investment - savings;
  
      setDashboardData((prev) => ({
        ...prev,
        stats: { income, expense, investment, savings, balance },
      }));
  
      await updateUserBalance(balance); // 🆕 Gọi API cập nhật balance
    }
  }, [fetchData, updateUserBalance]);
  

  const fetchUserBalance = useCallback(async () => {
    const userData = await fetchData('/api/auth/me', 'Không thể tải số dư người dùng');
    if (userData?.balance !== undefined) {
      setDashboardData((prev) => ({
        ...prev,
        stats: { ...prev.stats, balance: userData.balance },
      }));
    }
  }, [fetchData]);

  const fetchSavings = useCallback(async () => {
    const savingsData = await fetchData('/api/savings', 'Không thể tải dữ liệu tiết kiệm');
    if (savingsData) {
      const savingsProgress = savingsData.map((item: any) => ({
        name: item.name,
        current_amount: item.current_amount,
        target_amount: item.target_amount,
      }));
      const totalSavings = savingsData.reduce((sum: number, item: any) => sum + item.current_amount, 0);
      setDashboardData((prev) => ({ ...prev, stats: { ...prev.stats, savings: totalSavings }, savingsProgress }));
    }
  }, [fetchData]);

  const fetchInvestments = useCallback(async () => {
    const investments = await fetchData('/api/investments', 'Không thể tải dữ liệu đầu tư');
    console.log('📡 Dữ liệu đầu tư từ backend:', investments);
    if (investments && investments.length > 0) {
      const investmentProgress = investments.map((item: any) => ({
        name: item.name,
        initialAmount: item.initialAmount,
        currentAmount: item.currentAmount,
        type: item.type,
      }));
      const totalInvestment = investments.reduce((sum: number, item: any) => sum + item.currentAmount, 0);
      setDashboardData((prev) => ({
        ...prev,
        stats: { ...prev.stats, investment: totalInvestment },
        investmentProgress,
      }));
      console.log('📊 Investment Progress:', investmentProgress);
    } else {
      console.log('⚠️ Không có dữ liệu đầu tư để hiển thị');
      setDashboardData((prev) => ({ ...prev, investmentProgress: [] }));
    }
  }, [fetchData]);

  const fetchTransactions = useCallback(async () => {
    const data = await fetchData('/api/transactions', 'Không thể tải danh sách giao dịch');
    if (data?.transactions) {
      const sortedTransactions = data.transactions.sort(
        (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sortedTransactions);
      const totalExpense = sortedTransactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const totalIncome = sortedTransactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      setDashboardData((prev) => ({
        ...prev,
        stats: { ...prev.stats, expense: totalExpense, income: totalIncome },
      }));
    }
  }, [fetchData]);

  const fetchNotifications = useCallback(async () => {
    const data = await fetchData('/api/notifications', 'Không thể tải thông báo');
    if (data) {
      setNotifications(data);
      const activeNotification = data.find((n: Notification) => n.isActive && !n.isRead);
      if (activeNotification && !localStorage.getItem(`notification_${activeNotification._id}_hiddenUntil`)) {
        setShowNotification(true);
      }
    }
  }, [fetchData]);

  const closeNotification = (id: string, hideForOneHour: boolean) => {
    setShowNotification(false);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    if (hideForOneHour) {
      const oneHourLater = new Date(Date.now() + 3600000).toISOString();
      localStorage.setItem(`notification_${id}_hiddenUntil`, oneHourLater);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboardData(),
      fetchUserBalance(),
      fetchSavings(),
      fetchInvestments(),
      fetchTransactions(),
      fetchNotifications(),
    ]).finally(() => setLoading(false));
  }, [fetchDashboardData, fetchUserBalance, fetchSavings, fetchInvestments, fetchTransactions, fetchNotifications]);

  // Dữ liệu biểu đồ
  const financialData = [
    { name: 'Chi tiêu', value: dashboardData.stats.expense },
    { name: 'Tiết kiệm', value: dashboardData.stats.savings },
    { name: 'Đầu tư', value: dashboardData.stats.investment },
  ].filter((item) => item.value > 0);

  const trendData = () => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const groupByTime = (date: string) => {
      const d = new Date(date);
      if (timeFilter === 'day') return d.toLocaleDateString('vi-VN');
      if (timeFilter === 'week') return `Tuần ${Math.ceil(d.getDate() / 7)}/${d.getMonth() + 1}`;
      return `${d.getMonth() + 1}/${d.getFullYear()}`;
    };
    const grouped = expenses.reduce((acc: any, t) => {
      const key = groupByTime(t.date);
      acc[key] = (acc[key] || 0) + t.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  };

  const savingsData =
    dashboardData.savingsProgress?.map((s) => ({
      name: s.name,
      value: s.current_amount,
      target: s.target_amount,
    })) || [];

    
  const investmentData =
    dashboardData.investmentProgress?.map((i) => ({
      name: i.name,
      value: i.currentAmount,
    })) || [];

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  // Định dạng tiền tệ
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency === 'VND' ? 'VND' : 'USD' }).format(amount);

  // Icon danh mục
  const getCategoryIcon = (category: string) =>
    ({
      'Ăn uống': <Restaurant />,
      'Di chuyển': <DirectionsCar />,
      'Mua sắm': <ShoppingCart />,
      'Giải trí': <LocalMovies />,
      'Tiện ích': <Home />,
      'Khác': <ShoppingCart />,
      'Lương': <AccountBalance />,
    }[category] || <ShoppingCart />);

  // Styles
  const cardStyle = {
    p: { xs: 1, sm: 2 },
    bgcolor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    borderRadius: '12px',
    boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': { transform: 'scale(1.02)', boxShadow: darkMode ? '0 10px 20px rgba(0,0,0,0.7)' : '0 10px 20px rgba(0,0,0,0.15)' },
    backdropFilter: 'blur(5px)',
  };

  const buttonStyle = {
    bgcolor: 'linear-gradient(45deg, #3B82F6 30%, #7C3AED 90%)',
    color: '#000',
    borderRadius: '8px',
    px: { xs: 1.5, sm: 2 },
    py: 1,
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: '0 2px 10px rgba(59, 130, 246, 0.4)',
    '&:hover': { bgcolor: 'linear-gradient(45deg, #2563EB 30%, #6D28D9 90%)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.6)' },
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        background: darkMode
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '140%',
          height: '140%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, rgba(15, 23, 42, 0) 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(241, 245, 249, 0) 70%)',
          zIndex: 0,
          transform: 'rotate(-20deg)',
        }}
      />

      <Typography
        variant="h4"
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          color: darkMode ? '#E2E8F0' : '#1E293B',
          fontWeight: 700,
          textAlign: 'center',
          zIndex: 1,
          background: 'linear-gradient(45deg, #3B82F6, #7C3AED)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
        }}
      >
        Bảng Điều Khiển Tài Chính
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', bgcolor: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', zIndex: 1 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ zIndex: 1 }}>
        {/* Tổng quan tài chính */}
        <Grid item xs={12}>
          <Paper sx={cardStyle}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Tổng Quan
            </Typography>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {[
                { label: 'Thu nhập', value: dashboardData.stats.income, icon: < ArrowUpward sx={{ color: '#22C55E', fontSize: { xs: 20, sm: 24 } }} /> },
                { label: 'Chi tiêu', value: dashboardData.stats.expense, icon: <ArrowDownward sx={{ color: '#EF4444', fontSize: { xs: 20, sm: 24 } }} /> },
                { label: 'Tiết kiệm', value: dashboardData.stats.savings, icon: <Savings sx={{ color: '#3B82F6', fontSize: { xs: 20, sm: 24 } }} /> },
                { label: 'Đầu tư', value: dashboardData.stats.investment, icon: <AccountBalance sx={{ color: '#F59E0B', fontSize: { xs: 20, sm: 24 } }} /> },
                { label: 'Số dư', value: dashboardData.stats.balance, icon: <AccountBalance sx={{ color: '#8B5CF6', fontSize: { xs: 20, sm: 24 } }} /> },
              ].map((item, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                  >
                    <Box display="flex" alignItems="center" mb={1}>
                      {item.icon}
                      <Typography
                        sx={{ ml: 1, color: darkMode ? '#CBD5E1' : '#64748B', fontSize: { xs: '0.8rem', sm: '1rem' }, fontWeight: 500 }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                    {loading ? (
                      <Skeleton width={100} height={30} />
                    ) : (
                      <Typography
                        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, fontWeight: 600, color: darkMode ? '#E2E8F0' : '#1E293B' }}
                      >
                        {formatCurrency(item.value)}
                      </Typography>
                    )}
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Biểu đồ phân bổ tài chính */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Phân Bổ Tài Chính
            </Typography>
            {loading ? (
              <Skeleton variant="circular" width="100%" height={200} sx={{ mx: 'auto' }} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={financialData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine
                  >
                    {financialData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: '8px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Biểu đồ xu hướng chi tiêu */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Typography
                variant="h6"
                sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' }, mb: { xs: 1, sm: 0 } }}
              >
                Xu Hướng Chi Tiêu
              </Typography>
              <Tabs
                value={timeFilter}
                onChange={(_, newValue) => setTimeFilter(newValue)}
                sx={{ '& .MuiTab-root': { color: darkMode ? '#CBD5E1' : '#64748B', fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.9rem' } } }}
              >
                <Tab label="Ngày" value="day" />
                <Tab label="Tuần" value="week" />
                <Tab label="Tháng" value="month" />
              </Tabs>
            </Box>
            {loading ? (
              <Skeleton variant="rectangular" height={200} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData()} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4B5563' : '#E5E7EB'} />
                  <XAxis dataKey="name" stroke={darkMode ? '#CBD5E1' : '#64748B'} fontSize={12} />
                  <YAxis
                    stroke={darkMode ? '#CBD5E1' : '#64748B'}
                    tickFormatter={(value) => formatCurrency(value)}
                    fontSize={12}
                    width={60}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Giao dịch gần đây */}
        <Grid item xs={12}>
          <Paper sx={cardStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Typography
                variant="h6"
                sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' }, mb: { xs: 1, sm: 0 } }}
              >
                Giao Dịch Gần Đây
              </Typography>
              <Button
                sx={buttonStyle}
                onClick={() => {
                  const recentTransactions = transactions.slice(0, 10);
                  navigate('/dashboard/transactions', { state: { transactions: recentTransactions } });
                }}
              >
                Xem Tất Cả
              </Button>
            </Box>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                    >
                      📅 Ngày
                    </TableCell>
                    <TableCell
                      sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                    >
                      📊 Loại
                    </TableCell>
                    <TableCell
                      sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                    >
                      📁 Danh mục
                    </TableCell>
                    <TableCell
                      sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                    >
                      📝 Mô tả
                    </TableCell>
                    <TableCell
                      sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                    >
                      💰 Số tiền
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5}>
                            <Skeleton />
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    transactions.slice(0, 5).map((t) => (
                      <TableRow
                        key={t._id}
                        component={motion.tr}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell
                          sx={{ color: darkMode ? '#E2E8F0' : '#1E293B', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                        >
                          {new Date(t.date).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell
                          sx={{ color: darkMode ? '#E2E8F0' : '#1E293B', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                        >
                          {t.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                        </TableCell>
                        <TableCell
                          sx={{ color: darkMode ? '#E2E8F0' : '#1E293B', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                        >
                          {t.category}
                        </TableCell>
                        <TableCell
                          sx={{ color: darkMode ? '#E2E8F0' : '#1E293B', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                        >
                          <Box display="flex" alignItems="center">
                            {getCategoryIcon(t.category)} {t.description}
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: t.type === 'income' ? '#22C55E' : '#EF4444',
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                          }}
                        >
                          {formatCurrency(t.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Tiết kiệm */}
        <Grid item xs={12} sm={6}>
          <Paper sx={cardStyle}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Tiết Kiệm
            </Typography>
            {loading ? (
              <Skeleton variant="circular" width="100%" height={200} sx={{ mx: 'auto' }} />
            ) : savingsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={savingsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine
                  >
                    {savingsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: '8px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography sx={{ textAlign: 'center', color: darkMode ? '#CBD5E1' : '#64748B' }}>Chưa có dữ liệu tiết kiệm</Typography>
            )}
          </Paper>
        </Grid>

        {/* Đầu tư */}
        <Grid item xs={12} sm={6}>
          <Paper sx={cardStyle}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Đầu Tư
            </Typography>
            {loading ? (
              <Skeleton variant="circular" width="100%" height={200} sx={{ mx: 'auto' }} />
            ) : investmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={investmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine
                  >
                    {investmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: '8px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography sx={{ textAlign: 'center', color: darkMode ? '#CBD5E1' : '#64748B' }}>Chưa có dữ liệu đầu tư</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal thông báo */}
      {showNotification && (
        <Modal open={showNotification} onClose={() => closeNotification(notifications[0]?._id || '', false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '80%', sm: 350 },
              bgcolor: darkMode ? '#1E293B' : '#fff',
              p: { xs: 1, sm: 2 },
              borderRadius: '12px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              {notifications[0]?.title}
            </Typography>
            <Typography
              sx={{ mt: 1, color: darkMode ? '#E2E8F0' : '#1E293B', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
            >
              {notifications[0]?.content}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                onClick={() => closeNotification(notifications[0]?._id || '', true)}
                sx={{ color: darkMode ? '#A5B4FC' : '#3B82F6', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
              >
                Ẩn 1 giờ
              </Button>
              <Button
                onClick={() => closeNotification(notifications[0]?._id || '', false)}
                sx={buttonStyle}
              >
                Đóng
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
      <ChatBot />
    </Box>
  );
};

export default Dashboard;