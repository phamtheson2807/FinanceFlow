import GetAppIcon from '@mui/icons-material/GetApp';
import { Box, Button, Card, CardContent, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Chart from '../../components/common/Chart';

interface AnalyticsStats {
  totalUsers: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  usersByMonth: { month: string; count: number }[];
  transactionsByMonth: { month: string; count: number }[];
}

const AnalyticsPage = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchAnalyticsStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Bạn cần đăng nhập để xem thống kê.');
        const response = await axios.get('http://localhost:5000/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('❌ Lỗi khi lấy thống kê:', error);
        setError(
          axios.isAxiosError(error)
            ? error.response?.data?.message || 'Không thể tải thống kê. Vui lòng thử lại.'
            : 'Không thể tải thống kê. Vui lòng thử lại.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsStats();
  }, []);

  const exportReport = () => {
    if (!stats) return;

    const overviewData = [
      ['Thống kê', 'Giá trị'],
      ['Tổng số người dùng', stats.totalUsers],
      ['Tổng số giao dịch', stats.totalTransactions],
      ['Tổng thu nhập', stats.totalIncome],
      ['Tổng chi tiêu', stats.totalExpense],
    ];

    const usersByMonthData = [['Tháng', 'Số lượng'], ...stats.usersByMonth.map(item => [item.month, item.count])];
    const transactionsByMonthData = [
      ['Tháng', 'Số lượng'],
      ...stats.transactionsByMonth.map(item => [item.month, item.count]),
    ];

    const wb = XLSX.utils.book_new();
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    const usersSheet = XLSX.utils.aoa_to_sheet(usersByMonthData);
    const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsByMonthData);

    overviewSheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
    overviewSheet['A1'].s = { font: { bold: true } };
    overviewSheet['B1'].s = { font: { bold: true } };

    usersSheet['!cols'] = [{ wch: 15 }, { wch: 12 }];
    usersSheet['A1'].s = { font: { bold: true } };
    usersSheet['B1'].s = { font: { bold: true } };

    transactionsSheet['!cols'] = [{ wch: 15 }, { wch: 12 }];
    transactionsSheet['A1'].s = { font: { bold: true } };
    transactionsSheet['B1'].s = { font: { bold: true } };

    XLSX.utils.book_append_sheet(wb, overviewSheet, 'Tổng quan');
    XLSX.utils.book_append_sheet(wb, usersSheet, 'Người dùng theo tháng');
    XLSX.utils.book_append_sheet(wb, transactionsSheet, 'Giao dịch theo tháng');

    XLSX.writeFile(wb, `BaoCao_ThongKe_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress
            size={40}
            sx={{
              color: theme.palette.primary.main,
              [theme.breakpoints.up('sm')]: { width: '60px !important', height: '60px !important' },
            }}
          />
          <Typography
            sx={{
              mt: 2,
              fontFamily: 'Poppins, sans-serif',
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            Đang tải dữ liệu...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  const fontSize = isMobile ? 10 : 12;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f5f7fa', minHeight: 'calc(100vh - 64px)', overflowX: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 150, damping: 20 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: { xs: 2, sm: 4 },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              color: '#1E3A8A',
              textShadow: '0 2px 6px rgba(0,0,0,0.1)',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            }}
          >
            Thống Kê Hệ Thống
          </Typography>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={exportReport}
              disabled={!stats}
              sx={{
                fontFamily: 'Poppins, sans-serif',
                background: 'linear-gradient(45deg, #10B981, #047857)',
                borderRadius: '8px',
                px: { xs: 2, sm: 3 },
                py: 1,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                '&:hover': { background: 'linear-gradient(45deg, #34D399, #059669)' },
              }}
            >
              Xuất báo cáo Excel
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {error && (
        <Typography
          sx={{
            color: theme.palette.error.main,
            mb: { xs: 2, sm: 3 },
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif',
            fontSize: { xs: '0.9rem', sm: '1rem' },
          }}
        >
          {error}
        </Typography>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
        {[
          { label: 'Tổng người dùng', value: stats?.totalUsers || 0, color: '#3B82F6' },
          { label: 'Tổng giao dịch', value: stats?.totalTransactions || 0, color: '#10B981' },
          { label: 'Tổng thu nhập', value: stats?.totalIncome || 0, color: '#F59E0B' },
          { label: 'Tổng chi tiêu', value: stats?.totalExpense || 0, color: '#EF4444' },
        ].map((item, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: 'easeOut' }}
            >
              <Card
                elevation={4}
                sx={{
                  bgcolor: item.color,
                  color: '#fff',
                  borderRadius: '12px',
                  p: { xs: 1.5, sm: 2 },
                  height: { xs: '120px', sm: '140px' },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                      fontSize: { xs: '0.85rem', sm: '1rem' },
                      mb: 1,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 700,
                      fontSize: { xs: '1.2rem', sm: '1.5rem' },
                    }}
                  >
                    {item.label.includes('Tổng thu') || item.label.includes('Tổng chi')
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.value)
                      : item.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 2, sm: 4 } }}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          >
            <Card
              elevation={3}
              sx={{
                bgcolor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                p: { xs: 2, sm: 3 },
                height: { xs: '320px', sm: '400px' },
              }}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#1E3A8A',
                    mb: 2,
                    textAlign: 'center',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  Người dùng theo tháng
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <Chart
                    data={{
                      labels: stats?.usersByMonth.map((item) => item.month) || [],
                      datasets: [
                        {
                          label: 'Số lượng người dùng',
                          data: stats?.usersByMonth.map((item) => item.count) || [],
                          backgroundColor: ['rgba(59, 130, 246, 0.5)'],
                          borderColor: ['rgba(59, 130, 246, 1)'],
                          borderWidth: 2,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: { font: { family: 'Poppins, sans-serif', size: fontSize } },
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Tháng',
                            font: { family: 'Poppins, sans-serif', size: fontSize },
                            color: theme.palette.text.secondary,
                          },
                          grid: { display: false },
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Số lượng',
                            font: { family: 'Poppins, sans-serif', size: fontSize },
                            color: theme.palette.text.secondary,
                          },
                          beginAtZero: true,
                          grid: { color: 'rgba(0,0,0,0.05)' },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
          >
            <Card
              elevation={3}
              sx={{
                bgcolor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                p: { xs: 2, sm: 3 },
                height: { xs: '320px', sm: '400px' },
              }}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    color: '#1E3A8A',
                    mb: 2,
                    textAlign: 'center',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                  }}
                >
                  Giao dịch theo tháng
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <Chart
                    data={{
                      labels: stats?.transactionsByMonth.map((item) => item.month) || [],
                      datasets: [
                        {
                          label: 'Số lượng giao dịch',
                          data: stats?.transactionsByMonth.map((item) => item.count) || [],
                          backgroundColor: ['rgba(16, 185, 129, 0.5)'],
                          borderColor: ['rgba(16, 185, 129, 1)'],
                          borderWidth: 2,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                          labels: { font: { family: 'Poppins, sans-serif', size: fontSize } },
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'Tháng',
                            font: { family: 'Poppins, sans-serif', size: fontSize },
                            color: theme.palette.text.secondary,
                          },
                          grid: { display: false },
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Số lượng',
                            font: { family: 'Poppins, sans-serif', size: fontSize },
                            color: theme.palette.text.secondary,
                          },
                          beginAtZero: true,
                          grid: { color: 'rgba(0,0,0,0.05)' },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;