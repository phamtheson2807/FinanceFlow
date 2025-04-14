import { Box, Button, Paper, Tab, Tabs, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';

interface TrendData {
  name: string;
  income: number;
  expense: number;
}

const Trends: React.FC = () => {
  const { darkMode } = useThemeContext();
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/transactions/trend?filter=${timeFilter}`);
        setTrendData(response.data || []);
      } catch (err) {
        console.error('Lỗi tải xu hướng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [timeFilter]);

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
          Phân tích xu hướng
        </Typography>
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
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4B5563' : '#E5E7EB'} />
                <XAxis dataKey="name" stroke={darkMode ? '#CBD5E1' : '#64748B'} />
                <YAxis
                  stroke={darkMode ? '#CBD5E1' : '#64748B'}
                  tickFormatter={(value) => formatCurrency(value).split(',')[0]}
                />
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Line type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} />
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
      </motion.div>
    </Box>
  );
};

export default Trends;