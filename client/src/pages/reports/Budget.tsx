import { Add } from '@mui/icons-material';
import { Box, Button, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';

interface Budget {
  _id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly';
}

const Budget: React.FC = () => {
  const { darkMode } = useThemeContext();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [formData, setFormData] = useState({ category: '', amount: '', period: 'monthly' as 'monthly' | 'weekly' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/budgets');
        setBudgets(response.data || []);
      } catch (err) {
        console.error('Lỗi tải ngân sách:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  const handleAddBudget = async () => {
    try {
      if (!formData.category || !formData.amount) return;
      const payload = { ...formData, amount: Number(formData.amount) };
      await axiosInstance.post('/api/budgets', payload);
      setFormData({ category: '', amount: '', period: 'monthly' });
      const response = await axiosInstance.get('/api/budgets');
      setBudgets(response.data || []);
    } catch (err) {
      console.error('Lỗi thêm ngân sách:', err);
    }
  };

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
          Ngân sách
        </Typography>
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '12px',
            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>
            Thêm ngân sách
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Danh mục"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
              sx={{ flex: 1, minWidth: 200, bgcolor: darkMode ? '#1E293B' : '#fff' }}
            />
            <TextField
              label="Số tiền"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              sx={{ flex: 1, minWidth: 200, bgcolor: darkMode ? '#1E293B' : '#fff' }}
            />
            <TextField
              select
              label="Chu kỳ"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'weekly' })}
              fullWidth
              sx={{ flex: 1, minWidth: 200, bgcolor: darkMode ? '#1E293B' : '#fff' }}
            >
              <MenuItem value="monthly">Hàng tháng</MenuItem>
              <MenuItem value="weekly">Hàng tuần</MenuItem>
            </TextField>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: 'linear-gradient(45deg, #3B82F6 30%, #7C3AED 90%)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
              }}
              onClick={handleAddBudget}
            >
              Thêm
            </Button>
          </Box>
        </Paper>
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
          ) : budgets.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>Danh mục</TableCell>
                    <TableCell sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>Số tiền</TableCell>
                    <TableCell sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>Chu kỳ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {budgets.map((budget) => (
                    <motion.tr
                      key={budget._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>{budget.category}</TableCell>
                      <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>{formatCurrency(budget.amount)}</TableCell>
                      <TableCell sx={{ color: darkMode ? '#E2E8F0' : '#1E293B' }}>
                        {budget.period === 'monthly' ? 'Hàng tháng' : 'Hàng tuần'}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ textAlign: 'center', color: darkMode ? '#CBD5E1' : '#64748B' }}>
              Chưa có ngân sách nào.
            </Typography>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Budget;