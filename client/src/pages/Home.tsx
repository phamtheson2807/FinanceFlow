import {
  AccountBalance, ArrowDownward, ArrowUpward, DirectionsCar, Home, LocalMovies, Restaurant, Savings, ShoppingCart,
} from '@mui/icons-material';
import {
  Alert, Box, Button,
  Grid, Modal, Paper, Skeleton,
  Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs,
  Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useThemeContext } from '../contexts/ThemeContext';
import axiosInstance from '../utils/axiosInstance';

// Interfaces (giữ nguyên từ code gốc)
interface DashboardData {
  stats: { income: number; expense: number; savings: number; investment: number };
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
    stats: { income: 0, expense: 0, savings: 0, investment: 0 },
    savingsProgress: [],
    investmentProgress: [],
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('week');

  // Fetch data từ API
  const fetchData = useCallback(async (endpoint: string, errorMessage: string) => {
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
  }, []);

  const fetchDashboardData = useCallback(async () => {
    const data = await fetchData('/api/dashboard', 'Không thể tải dữ liệu dashboard');
    data && setDashboardData((prev) => ({ ...prev, stats: { ...data.stats } }));
  }, [fetchData]);

  const fetchSavings = useCallback(async () => {
    const savingsData = await fetchData('/api/savings', 'Không thể tải dữ liệu tiết kiệm');
    if (savingsData) {
      const savingsProgress = savingsData.map((item: any) => ({
        name: item.name, current_amount: item.current_amount, target_amount: item.target_amount,
      }));
      const totalSavings = savingsData.reduce((sum: number, item: any) => sum + item.current_amount, 0);
      setDashboardData((prev) => ({ ...prev, stats: { ...prev.stats, savings: totalSavings }, savingsProgress }));
    }
  }, [fetchData]);

  const fetchInvestments = useCallback(async () => {
    const investments = await fetchData('/api/investments', 'Không thể tải dữ liệu đầu tư');
    if (investments) {
      const investmentProgress = investments.map((item: any) => ({
        name: item.name, initialAmount: item.initialAmount, currentAmount: item.currentAmount, type: item.type,
      }));
      const totalInvestment = investments.reduce((sum: number, item: any) => sum + item.currentAmount, 0);
      setDashboardData((prev) => ({ ...prev, stats: { ...prev.stats, investment: totalInvestment }, investmentProgress }));
    }
  }, [fetchData]);

  const fetchTransactions = useCallback(async () => {
    const data = await fetchData('/api/transactions', 'Không thể tải danh sách giao dịch');
    if (data?.transactions) {
      setTransactions(data.transactions);
      const totalExpense = data.transactions.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      setDashboardData((prev) => ({ ...prev, stats: { ...prev.stats, expense: totalExpense } }));
    }
  }, [fetchData]);

  const fetchNotifications = useCallback(async () => {
    const data = await fetchData('/api/notifications', 'Không thể tải thông báo');
    if (data) {
      setNotifications(data);
      const activeNotification = data.find((n: Notification) => n.isActive && !n.isRead);
      if (activeNotification && !localStorage.getItem(`notification_${activeNotification._id}_hiddenUntil`)) setShowNotification(true);
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
    Promise.all([fetchDashboardData(), fetchSavings(), fetchInvestments(), fetchTransactions(), fetchNotifications()])
      .finally(() => setLoading(false));
  }, [fetchDashboardData, fetchSavings, fetchInvestments, fetchTransactions, fetchNotifications]);

  // Dữ liệu biểu đồ phân bổ tài chính
  const financialData = [
    { name: 'Chi tiêu', value: dashboardData.stats.expense },
    { name: 'Tiết kiệm', value: dashboardData.stats.savings },
    { name: 'Đầu tư', value: dashboardData.stats.investment },
  ].filter((item) => item.value > 0);

  // Dữ liệu xu hướng chi tiêu
  const getTrendData = () => {
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

  const trendData = getTrendData();

  // Dữ liệu biểu đồ tiết kiệm
  const savingsData = dashboardData.savingsProgress?.map((s) => ({ name: s.name, value: s.current_amount })) || [];

  // Dữ liệu biểu đồ đầu tư
  const investmentData = dashboardData.investmentProgress?.map((i) => ({ name: i.name, value: i.currentAmount })) || [];

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  // Định dạng tiền tệ
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency === 'VND' ? 'VND' : 'USD' }).format(amount);

  // Icon danh mục
  const getCategoryIcon = (category: string) => ({
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
    p: 2.5,
    bgcolor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
    borderRadius: 3,
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
    '&:hover': { transform: 'translateY(-5px)' },
  };

  const buttonStyle = {
    bgcolor: darkMode ? '#7C3AED' : '#3B82F6',
    color: '#fff',
    borderRadius: 2,
    px: 3,
    py: 1,
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': { bgcolor: darkMode ? '#6D28D9' : '#2563EB' },
  };

  return (
    <Box sx={{ p: 3, bgcolor: darkMode ? '#0F172A' : '#F1F5F9', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '50%', bgcolor: darkMode ? 'rgba(124, 58, 237, 0.1)' : 'rgba(59, 130, 246, 0.1)', borderRadius: '0 0 50% 50%', zIndex: 0 }} />
      <Typography variant="h4" sx={{ mb: 4, color: darkMode ? '#E2E8F0' : '#1E293B', fontWeight: 700, textAlign: 'center', zIndex: 1, position: 'relative' }}>
        Bảng Điều Khiển Tài Chính
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Tổng quan tài chính */}
        <Grid item xs={12} md={8}>
          <Paper sx={cardStyle}>
            <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600 }}>Tổng Quan</Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Thu nhập', value: dashboardData.stats.income, icon: <ArrowUpward sx={{ color: '#22C55E' }} /> },
                { label: 'Chi tiêu', value: dashboardData.stats.expense, icon: <ArrowDownward sx={{ color: '#EF4444' }} /> },
                { label: 'Tiết kiệm', value: dashboardData.stats.savings, icon: <Savings sx={{ color: '#3B82F6' }} /> },
                { label: 'Đầu tư', value: dashboardData.stats.investment, icon: <AccountBalance sx={{ color: '#F59E0B' }} /> },
              ].map((item, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      {item.icon}
                      <Typography sx={{ ml: 1, color: darkMode ? '#CBD5E1' : '#64748B' }}>{item.label}</Typography>
                    </Box>
                    {loading ? <Skeleton width={100} /> : <Typography sx={{ fontSize: 20, fontWeight: 700, color: darkMode ? '#E2E8F0' : '#1E293B' }}>{formatCurrency(item.value)}</Typography>}
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Biểu đồ phân bổ tài chính */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ ...cardStyle, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600 }}>Phân Bổ Tài Chính</Typography>
            {loading ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={financialData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {financialData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: 4 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Biểu đồ xu hướng chi tiêu */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600 }}>Xu Hướng Chi Tiêu</Typography>
              <Tabs value={timeFilter} onChange={(_, newValue) => setTimeFilter(newValue)} sx={{ minHeight: 0 }}>
                <Tab label="Ngày" value="day" sx={{ minWidth: 60, p: 1 }} />
                <Tab label="Tuần" value="week" sx={{ minWidth: 60, p: 1 }} />
                <Tab label="Tháng" value="month" sx={{ minWidth: 60, p: 1 }} />
              </Tabs>
            </Box>
            {loading ? (
              <Skeleton variant="rectangular" height={200} />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4B5563' : '#E5E7EB'} />
                  <XAxis dataKey="name" stroke={darkMode ? '#CBD5E1' : '#64748B'} />
                  <YAxis stroke={darkMode ? '#CBD5E1' : '#64748B'} tickFormatter={(value) => formatCurrency(value)} />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: 4 }} />
                  <Line type="monotone" dataKey="value" stroke="#FF6B6B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Giao dịch gần đây */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600 }}>Giao Dịch Gần Đây</Typography>
              <Button sx={buttonStyle} onClick={() => navigate('/transactions')}>Xem Tất Cả</Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mô tả</TableCell>
                    <TableCell>Số tiền</TableCell>
                    <TableCell>Ngày</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={3}><Skeleton /></TableCell></TableRow>
                    ))
                  ) : transactions.slice(0, 3).map((t) => (
                    <TableRow key={t._id}>
                      <TableCell><Box display="flex" alignItems="center">{getCategoryIcon(t.category)} {t.description}</Box></TableCell>
                      <TableCell sx={{ color: t.type === 'income' ? '#22C55E' : '#EF4444' }}>{formatCurrency(t.amount)}</TableCell>
                      <TableCell>{new Date(t.date).toLocaleDateString('vi-VN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Biểu đồ tiết kiệm */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600 }}>Tiết Kiệm</Typography>
            {loading ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={savingsData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {savingsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: 4 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Biểu đồ đầu tư */}
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Typography variant="h6" sx={{ mb: 2, color: darkMode ? '#A5B4FC' : '#4B5563', fontWeight: 600 }}>Đầu Tư</Typography>
            {loading ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={investmentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {investmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: 4 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal thông báo */}
      {showNotification && (
        <Modal open={showNotification} onClose={() => closeNotification(notifications[0]?._id || '', false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: darkMode ? '#1E293B' : '#fff', p: 3, borderRadius: 3, boxShadow: 24 }}>
            <Typography variant="h6" sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>{notifications[0]?.title}</Typography>
            <Typography sx={{ mt: 2 }}>{notifications[0]?.content}</Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => closeNotification(notifications[0]?._id || '', true)} sx={{ color: darkMode ? '#A5B4FC' : '#3B82F6' }}>Ẩn 1 giờ</Button>
              <Button onClick={() => closeNotification(notifications[0]?._id || '', false)} sx={buttonStyle}>Đóng</Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default Dashboard;