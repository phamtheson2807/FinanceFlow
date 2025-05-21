import { Box, Card, CardContent, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';

interface MarketAsset {
  name: string;
  price: number;
  change: string;
  marketCap: number;
  symbol: string;
}

const Market: React.FC = () => {
  const { darkMode } = useThemeContext();
  const [marketData, setMarketData] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [topGainer, setTopGainer] = useState<MarketAsset | null>(null);
  const [topLoser, setTopLoser] = useState<MarketAsset | null>(null);
  const [totalMarketCap, setTotalMarketCap] = useState<number>(0);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
        );
        const data = await response.json();
        const mapped = data.map((item: any) => ({
          name: item.name,
          price: item.current_price,
          change: (item.price_change_percentage_24h > 0 ? '+' : '') + item.price_change_percentage_24h.toFixed(2) + '%',
          marketCap: item.market_cap,
          symbol: item.symbol.toUpperCase(),
        }));
        setMarketData(mapped);
        // Phân tích top tăng/giảm và tổng vốn hóa
        if (mapped.length > 0) {
          setTopGainer(
            mapped.reduce((max: MarketAsset, coin: MarketAsset) => parseFloat(coin.change) > parseFloat(max.change) ? coin : max, mapped[0])
          );
          setTopLoser(
            mapped.reduce((min: MarketAsset, coin: MarketAsset) => parseFloat(coin.change) < parseFloat(min.change) ? coin : min, mapped[0])
          );
          setTotalMarketCap(
            mapped.reduce((sum: number, coin: MarketAsset) => sum + coin.marketCap, 0)
          );
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu thị trường:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);

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
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: darkMode ? '#1E293B' : '#fff', color: darkMode ? '#E2E8F0' : '#1E293B', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Tổng vốn hóa 10 coin</Typography>
                <Typography variant="h6" fontWeight="bold">{formatCurrency(totalMarketCap)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Card sx={{ bgcolor: darkMode ? '#1E293B' : '#fff', color: darkMode ? '#E2E8F0' : '#1E293B', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Top tăng giá 24h</Typography>
                {topGainer ? (
                  <>
                    <Typography variant="h6" fontWeight="bold">{topGainer.name} ({topGainer.symbol})</Typography>
                    <Typography color="#22C55E">{topGainer.change}</Typography>
                  </>
                ) : (
                  <Typography>...</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Card sx={{ bgcolor: darkMode ? '#1E293B' : '#fff', color: darkMode ? '#E2E8F0' : '#1E293B', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Top giảm giá 24h</Typography>
                {topLoser ? (
                  <>
                    <Typography variant="h6" fontWeight="bold">{topLoser.name} ({topLoser.symbol})</Typography>
                    <Typography color="#EF4444">{topLoser.change}</Typography>
                  </>
                ) : (
                  <Typography>...</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
                    <TableCell sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>Thay đổi 24h</TableCell>
                    <TableCell sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>Vốn hóa</TableCell>
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
                      <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>{asset.name} ({asset.symbol})</TableCell>
                      <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>{formatCurrency(asset.price)}</TableCell>
                      <TableCell sx={{ color: asset.change.startsWith('+') ? '#22C55E' : '#EF4444' }}>
                        {asset.change}
                      </TableCell>
                      <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>{formatCurrency(asset.marketCap)}</TableCell>
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