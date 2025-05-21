import { Box, Button, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Cell, Label, Legend, Line, LineChart, Pie, PieChart, Legend as PieLegend, Tooltip as PieTooltip, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';

interface TrendData {
  name: string;
  income: number;
  expense: number;
}

interface CategorySummary {
  category: string;
  amount: number;
  color: string;
  icon: string;
  transactionCount: number;
  percentage: number;
}

interface TrendResponse {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  trendData: Array<{
    name: string;
    income: number;
    expense: number;
  }>;
}

// Định nghĩa kiểu cho danh mục màu sắc
type CategoryColorMap = {
  [key: string]: string;
};

// Định nghĩa bảng màu đẹp và dễ phân biệt cho các danh mục
const CATEGORY_COLORS: CategoryColorMap = {
  'Ăn uống': '#FF6B6B',      // Đỏ cam
  'Di chuyển': '#4ECDC4',    // Xanh ngọc
  'Mua sắm': '#45B7D1',      // Xanh dương
  'Giải trí': '#96CEB4',     // Xanh lá nhạt
  'Hóa đơn & Tiện ích': '#FFEEAD', // Vàng nhạt
  'Xăng xe': '#FFD93D',      // Vàng đậm
  'Tiết kiệm': '#6C5CE7',    // Tím
  'Lương': '#A8E6CF',        // Mint
  'Thưởng': '#DCEDC1',       // Xanh lá nhạt
  'Đầu tư': '#FFB6B9',       // Hồng
  'Khác': '#957DAD',         // Tím nhạt
};

// Fallback colors for any categories not in the predefined list
const FALLBACK_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#FFD93D', '#6C5CE7', '#A8E6CF', '#DCEDC1', '#FFB6B9',
  '#957DAD', '#D4A5A5', '#89C4F4', '#F5B7B1', '#82E0AA'
];

const Trends: React.FC = () => {
  const { darkMode } = useThemeContext();
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('month');
  const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);
  const [trendData, setTrendData] = useState<TrendResponse>({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    trendData: []
  });

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/transactions/trend?filter=${timeFilter}`);
        setTrendData(response.data);
      } catch (err) {
        console.error('Lỗi khi lấy xu hướng:', err);
        setTrendData({
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          trendData: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [timeFilter]);

  useEffect(() => {
    const fetchCategorySummary = async () => {
      try {
        const res = await axiosInstance.get('/api/transactions/category-summary');
        const summaryData = res.data.map((item: any, index: number) => ({
          ...item,
          color: CATEGORY_COLORS[item.category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
        }));
        setCategoryData(summaryData);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu phân tích:', err);
        setCategoryData([]);
      }
    };
    fetchCategorySummary();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        background: darkMode
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
        minHeight: '100vh',
      }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: darkMode ? '#E2E8F0' : '#1E293B',
            background: 'linear-gradient(45deg, #3B82F6, #7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Phân tích xu hướng chi tiêu
        </Typography>
        {/* Summary Statistics */}
        <Box sx={{ display: 'flex', gap: 4, mb: 2, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 2, minWidth: 180, bgcolor: darkMode ? '#1E293B' : '#F1F5F9' }}>
            <Typography variant="subtitle2" color="primary">Tổng thu nhập</Typography>
            <Typography variant="h6" sx={{ color: '#22C55E' }}>{formatCurrency(trendData.totalIncome)}</Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 180, bgcolor: darkMode ? '#1E293B' : '#F1F5F9' }}>
            <Typography variant="subtitle2" color="error">Tổng chi tiêu</Typography>
            <Typography variant="h6" sx={{ color: '#EF4444' }}>{formatCurrency(trendData.totalExpense)}</Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 180, bgcolor: darkMode ? '#1E293B' : '#F1F5F9' }}>
            <Typography variant="subtitle2" color="secondary">Số dư ròng</Typography>
            <Typography variant="h6" sx={{ color: trendData.netBalance >= 0 ? '#22C55E' : '#EF4444' }}>
              {formatCurrency(trendData.netBalance)}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={timeFilter}
            onChange={(_, newValue) => setTimeFilter(newValue)}
            sx={{ '& .MuiTab-root': { color: darkMode ? '#CBD5E1' : '#64748B', fontWeight: 500 } }}
          >
            <Tab label="Ngày" value="day" />
            <Tab label="Tuần" value="week" />
            <Tab label="Tháng" value="month" />
          </Tabs>
        </Box>
        <Paper
          sx={{
            p: 3,
            borderRadius: '12px',
            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.1)',
          }}
        >
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : trendData.trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData.trendData} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4B5563' : '#E5E7EB'} />
                <XAxis dataKey="name" stroke={darkMode ? '#CBD5E1' : '#64748B'}>
                  <Label value={timeFilter === 'day' ? 'Ngày' : timeFilter === 'week' ? 'Tuần' : 'Tháng'} offset={-10} position="insideBottom" />
                </XAxis>
                <YAxis
                  stroke={darkMode ? '#CBD5E1' : '#64748B'}
                  tickFormatter={(value) => formatCurrency(value).split(',')[0]}
                >
                  <Label value="Số tiền (VND)" angle={-90} position="insideLeft" />
                </YAxis>
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="income" name="Thu nhập" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expense" name="Chi tiêu" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography sx={{ textAlign: 'center', color: darkMode ? '#CBD5E1' : '#64748B' }}>
              Chưa có dữ liệu xu hướng.
            </Typography>
          )}
          <Button
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: 'linear-gradient(45deg, #3B82F6 30%, #7C3AED 90%)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
            }}
            onClick={() => console.log('Tải báo cáo chi tiết')}
          >
            Tải báo cáo
          </Button>
        </Paper>
        {/* Phân tích chi tiêu theo danh mục */}
        <Paper
          sx={{
            p: 3,
            borderRadius: '12px',
            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.1)',
            mt: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Tỷ lệ chi tiêu theo danh mục
          </Typography>
          {categoryData.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              {/* Pie Chart */}
              <Box sx={{ flex: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <PieTooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                    />
                    <PieLegend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Category List */}
              <Box sx={{ flex: 1 }}>
                <Grid container spacing={2}>
                  {categoryData.map((category, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: category.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                          }}
                        >
                          {category.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {category.category}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {category.transactionCount} giao dịch
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {formatCurrency(category.amount)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: category.percentage > 20 ? '#EF4444' : '#22C55E' }}
                          >
                            {category.percentage}%
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          ) : (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
              Chưa có dữ liệu chi tiêu theo danh mục.
            </Typography>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Trends;