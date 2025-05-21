import {
  AccountBalance,
  ArrowDownward,
  ArrowUpward,
  DirectionsCar,
  Home,
  LocalMovies,
  Restaurant,
  Savings,
  ShoppingCart,
  TrendingUp
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Modal,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography
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
  category: string; // ID danh mục
  type: 'income' | 'expense';
}

interface Category {
  _id: string;
  name: string;
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

interface TransactionStats {
  income: number;
  expense: number;
  balance: number;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');
  // Thêm state cho transactionStats
  const [transactionStats, setTransactionStats] = useState<TransactionStats>({
    income: 0,
    expense: 0,
    balance: 0,
  });

  // Styles mới
  const cardStyle = {
    background: darkMode 
      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    boxShadow: darkMode 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: darkMode 
        ? '0 12px 40px rgba(0, 0, 0, 0.4)'
        : '0 12px 40px rgba(0, 0, 0, 0.15)',
    },
  };

  const statCardStyle = {
    ...cardStyle,
    p: 3,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const buttonStyle = {
    background: 'linear-gradient(45deg, #3B82F6 30%, #7C3AED 90%)',
    color: '#fff',
    borderRadius: '12px',
    px: 3,
    py: 1,
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #2563EB 30%, #6D28D9 90%)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
    },
  };

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

      await updateUserBalance(balance);
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

      // Tính toán lại income, expense, balance từ transactions
      const totalIncome = sortedTransactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const totalExpense = sortedTransactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;

      // Cập nhật transactionStats
      setTransactionStats({ income: totalIncome, expense: totalExpense, balance });

      // Cập nhật dashboardData
      setDashboardData((prev) => ({
        ...prev,
        stats: { ...prev.stats, expense: totalExpense, income: totalIncome, balance },
      }));
    }
  }, [fetchData]);

  const fetchCategories = useCallback(async () => {
    const data = await fetchData('/api/categories', 'Không thể tải danh sách danh mục');
    if (data) {
      setCategories(data);
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
      fetchCategories(),
      fetchNotifications(),
    ]).finally(() => setLoading(false));
  }, [
    fetchDashboardData,
    fetchUserBalance,
    fetchSavings,
    fetchInvestments,
    fetchTransactions,
    fetchCategories,
    fetchNotifications,
  ]);

  // Hàm ánh xạ ID danh mục sang tên
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : 'Không xác định';
  };

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
      'Tiết kiệm': <Savings />,
    }[category] || <ShoppingCart />);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        background: darkMode
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Background Gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode
            ? 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.15), transparent 50%)'
            : 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: { xs: 3, sm: 4 },
            textAlign: 'center',
            fontWeight: 800,
            background: 'linear-gradient(45deg, #3B82F6, #7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
            letterSpacing: '-0.02em',
          }}
        >
          Tổng Quan Tài Chính
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              background: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 0.9)',
            }}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Thống kê chính */}
          <Grid item xs={12}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: darkMode ? '#E2E8F0' : '#1E293B',
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  }}
                >
                  Số Liệu Tổng Quan
                </Typography>
                <Grid container spacing={3}>
                  {[
                    {
                      label: 'Thu Nhập',
                      value: transactionStats.income,
                      icon: <ArrowUpward sx={{ color: '#22C55E', fontSize: 28 }} />,
                      trend: '+12%',
                      color: '#22C55E'
                    },
                    {
                      label: 'Chi Tiêu',
                      value: transactionStats.expense,
                      icon: <ArrowDownward sx={{ color: '#EF4444', fontSize: 28 }} />,
                      trend: '-8%',
                      color: '#EF4444'
                    },
                    {
                      label: 'Tiết Kiệm',
                      value: dashboardData.stats.savings,
                      icon: <Savings sx={{ color: '#3B82F6', fontSize: 28 }} />,
                      trend: '+5%',
                      color: '#3B82F6'
                    },
                    {
                      label: 'Đầu Tư',
                      value: dashboardData.stats.investment,
                      icon: <TrendingUp sx={{ color: '#F59E0B', fontSize: 28 }} />,
                      trend: '+15%',
                      color: '#F59E0B'
                    },
                    {
                      label: 'Số Dư',
                      value: transactionStats.balance,
                      icon: <AccountBalance sx={{ color: '#8B5CF6', fontSize: 28 }} />,
                      trend: '+10%',
                      color: '#8B5CF6'
                    },
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          sx={{
                            ...statCardStyle,
                            background: darkMode
                              ? `linear-gradient(135deg, ${item.color}15 0%, ${item.color}05 100%)`
                              : `linear-gradient(135deg, ${item.color}10 0%, ${item.color}05 100%)`,
                          }}
                        >
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              {item.icon}
                              <Typography
                                sx={{
                                  color: item.color,
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                }}
                              >
                                {item.trend}
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                color: darkMode ? '#E2E8F0' : '#1E293B',
                                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                fontWeight: 700,
                                mb: 0.5,
                              }}
                            >
                              {loading ? <Skeleton width={100} /> : formatCurrency(item.value)}
                            </Typography>
                            <Typography
                              sx={{
                                color: darkMode ? '#94A3B8' : '#64748B',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                              }}
                            >
                              {item.label}
                            </Typography>
                          </Box>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Biểu đồ */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: darkMode ? '#E2E8F0' : '#1E293B',
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                  }}
                >
                  Phân Bổ Chi Tiêu
                </Typography>
                {loading ? (
                  <Skeleton variant="circular" width="100%" height={300} />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={financialData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {financialData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={[
                              '#3B82F6',
                              '#F59E0B',
                              '#10B981',
                              '#8B5CF6',
                              '#EC4899'
                            ][index % 5]} 
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          background: darkMode ? '#1E293B' : '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Biểu đồ xu hướng */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: darkMode ? '#E2E8F0' : '#1E293B',
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    }}
                  >
                    Xu Hướng Chi Tiêu
                  </Typography>
                  <Tabs
                    value={timeFilter}
                    onChange={(_, newValue) => setTimeFilter(newValue)}
                    sx={{
                      '& .MuiTab-root': {
                        minWidth: 'auto',
                        px: 2,
                        color: darkMode ? '#94A3B8' : '#64748B',
                        '&.Mui-selected': {
                          color: darkMode ? '#3B82F6' : '#2563EB',
                        },
                      },
                    }}
                  >
                    <Tab label="Ngày" value="day" />
                    <Tab label="Tuần" value="week" />
                    <Tab label="Tháng" value="month" />
                  </Tabs>
                </Box>
                {loading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData()} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#E2E8F0'} />
                      <XAxis
                        dataKey="name"
                        stroke={darkMode ? '#94A3B8' : '#64748B'}
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke={darkMode ? '#94A3B8' : '#64748B'}
                        fontSize={12}
                        tickFormatter={(value) => formatCurrency(value)}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          background: darkMode ? '#1E293B' : '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', r: 4 }}
                        activeDot={{ r: 6, fill: '#2563EB' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Giao dịch gần đây */}
          <Grid item xs={12}>
            <Card sx={cardStyle}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: darkMode ? '#E2E8F0' : '#1E293B',
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    }}
                  >
                    Giao Dịch Gần Đây
                  </Typography>
                  <Button
                    variant="contained"
                    sx={buttonStyle}
                    onClick={() => navigate('/dashboard/transactions')}
                  >
                    Xem Tất Cả
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: darkMode ? '#94A3B8' : '#64748B', fontWeight: 600 }}>Ngày</TableCell>
                        <TableCell sx={{ color: darkMode ? '#94A3B8' : '#64748B', fontWeight: 600 }}>Loại</TableCell>
                        <TableCell sx={{ color: darkMode ? '#94A3B8' : '#64748B', fontWeight: 600 }}>Danh Mục</TableCell>
                        <TableCell sx={{ color: darkMode ? '#94A3B8' : '#64748B', fontWeight: 600 }}>Mô Tả</TableCell>
                        <TableCell sx={{ color: darkMode ? '#94A3B8' : '#64748B', fontWeight: 600 }}>Số Tiền</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading
                        ? Array(5).fill(0).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell colSpan={5}><Skeleton /></TableCell>
                            </TableRow>
                          ))
                        : transactions.slice(0, 5).map((t) => (
                            <TableRow
                              key={t._id}
                              sx={{
                                '&:hover': {
                                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                },
                              }}
                            >
                              <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>
                                {new Date(t.date).toLocaleDateString('vi-VN')}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{
                                    color: t.type === 'income' ? '#22C55E' : '#EF4444',
                                    fontWeight: 600,
                                  }}
                                >
                                  {t.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getCategoryIcon(getCategoryName(t.category))}
                                  <Typography>{getCategoryName(t.category)}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>
                                {t.description}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{
                                    color: t.type === 'income' ? '#22C55E' : '#EF4444',
                                    fontWeight: 600,
                                  }}
                                >
                                  {formatCurrency(t.amount)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Modal thông báo */}
      {showNotification && (
        <Modal
          open={showNotification}
          onClose={() => closeNotification(notifications[0]?._id || '', false)}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 400 },
              ...cardStyle,
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: darkMode ? '#E2E8F0' : '#1E293B',
                fontWeight: 700,
                mb: 2,
              }}
            >
              {notifications[0]?.title}
            </Typography>
            <Typography
              sx={{
                color: darkMode ? '#94A3B8' : '#64748B',
                mb: 3,
              }}
            >
              {notifications[0]?.content}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={() => closeNotification(notifications[0]?._id || '', true)}
                sx={{
                  color: darkMode ? '#94A3B8' : '#64748B',
                  '&:hover': {
                    color: darkMode ? '#E2E8F0' : '#1E293B',
                  },
                }}
              >
                Ẩn 1 giờ
              </Button>
              <Button
                variant="contained"
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