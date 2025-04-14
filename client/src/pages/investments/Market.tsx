import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';

interface MarketAsset {
  name: string;
  price: number;
  change: string;
}

const Market: React.FC = () => {
  const { darkMode } = useThemeContext();
  const [marketData, setMarketData] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        // Giả lập API, có thể thay bằng CoinGecko hoặc API của bạn
        const response = await axiosInstance.get('/api/market');
        setMarketData(response.data || []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu thị trường:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
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
          Theo dõi thị trường
        </Typography>
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
          ) : marketData.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>Tài sản</TableCell>
                    <TableCell sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>Giá</TableCell>
                    <TableCell sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>Thay đổi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marketData.map((asset, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>{asset.name}</TableCell>
                      <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>{formatCurrency(asset.price)}</TableCell>
                      <TableCell sx={{ color: asset.change.startsWith('+') ? '#22C55E' : '#EF4444' }}>
                        {asset.change}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ textAlign: 'center', color: darkMode ? '#CBD5E1' : '#64748B' }}>
              Chưa có dữ liệu thị trường.
            </Typography>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Market;