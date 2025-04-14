import { Add, Close } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';
  
  interface SavingsAccount {
    _id: string;
    name: string;
    balance: number;
    interestRate: number;
    maturityDate: string;
  }
  
  const SavingsAccounts: React.FC = () => {
    const { darkMode } = useThemeContext();
    const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      balance: '',
      interestRate: '',
      maturityDate: '',
    });
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchAccounts = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get('/api/savings-accounts');
          setAccounts(response.data || []);
        } catch (err) {
          console.error('Lỗi tải sổ tiết kiệm:', err);
          setError('Không thể tải danh sách sổ tiết kiệm.');
        } finally {
          setLoading(false);
        }
      };
      fetchAccounts();
    }, []);
  
    const handleOpenDialog = () => {
      setOpenDialog(true);
      setFormData({ name: '', balance: '', interestRate: '', maturityDate: '' });
      setError(null);
    };
  
    const handleCloseDialog = () => {
      setOpenDialog(false);
      setError(null);
    };
  
    const handleAddAccount = async () => {
      try {
        // Validate form
        if (!formData.name.trim()) {
          setError('Tên sổ tiết kiệm không được để trống.');
          return;
        }
        const balance = Number(formData.balance);
        if (isNaN(balance) || balance <= 0) {
          setError('Số dư ban đầu phải lớn hơn 0.');
          return;
        }
        const interestRate = Number(formData.interestRate);
        if (isNaN(interestRate) || interestRate < 0) {
          setError('Lãi suất không hợp lệ.');
          return;
        }
        if (!formData.maturityDate) {
          setError('Vui lòng chọn ngày đáo hạn.');
          return;
        }
  
        // Gửi yêu cầu POST
        const payload = {
          name: formData.name,
          balance,
          interestRate,
          maturityDate: formData.maturityDate,
        };
        await axiosInstance.post('/api/savings-accounts', payload);
  
        // Cập nhật danh sách
        const response = await axiosInstance.get('/api/savings-accounts');
        setAccounts(response.data || []);
        handleCloseDialog();
      } catch (err: any) {
        console.error('Lỗi thêm sổ tiết kiệm:', err);
        setError(err.response?.data?.message || 'Không thể thêm sổ tiết kiệm.');
      }
    };
  
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  
    const formatDate = (date: string) =>
      new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
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
            Sổ tiết kiệm
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              mb: 2,
              bgcolor: 'linear-gradient(45deg, #3B82F6 30%, #7C3AED 90%)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
            }}
            onClick={handleOpenDialog}
          >
            Thêm sổ mới
          </Button>
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
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : accounts.length > 0 ? (
              <List>
                {accounts.map((account) => (
                  <motion.div
                    key={account._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ListItem>
                      <ListItemText
                        primary={account.name}
                        secondary={`Số dư: ${formatCurrency(account.balance)} | Lãi suất: ${account.interestRate}% | Đáo hạn: ${formatDate(account.maturityDate)}`}
                        primaryTypographyProps={{ fontWeight: 500, color: darkMode ? '#E2E8F0' : '#1E293B' }}
                        secondaryTypographyProps={{ color: darkMode ? '#CBD5E1' : '#64748B' }}
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            ) : (
              <Typography sx={{ textAlign: 'center', color: darkMode ? '#CBD5E1' : '#64748B' }}>
                Chưa có sổ tiết kiệm nào.
              </Typography>
            )}
          </Paper>
        </motion.div>
  
        {/* Dialog thêm sổ tiết kiệm */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: '12px', bgcolor: darkMode ? '#1E293B' : '#fff' } }}
        >
          <DialogTitle sx={{ color: darkMode ? '#A5B4FC' : '#4B5563', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Thêm sổ tiết kiệm mới
            <IconButton onClick={handleCloseDialog} sx={{ color: darkMode ? '#CBD5E1' : '#64748B' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label="Tên sổ tiết kiệm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              margin="normal"
              autoFocus
              placeholder="Ví dụ: Sổ tiết kiệm 6 tháng"
              sx={{ bgcolor: darkMode ? '#2D3748' : '#F9FAFB' }}
            />
            <TextField
              label="Số dư ban đầu (VND)"
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              fullWidth
              margin="normal"
              placeholder="Ví dụ: 10000000"
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ bgcolor: darkMode ? '#2D3748' : '#F9FAFB' }}
            />
            <TextField
              label="Lãi suất (%)"
              type="number"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              fullWidth
              margin="normal"
              placeholder="Ví dụ: 5.5"
              InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              sx={{ bgcolor: darkMode ? '#2D3748' : '#F9FAFB' }}
            />
            <TextField
              label="Ngày đáo hạn"
              type="date"
              value={formData.maturityDate}
              onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: darkMode ? '#2D3748' : '#F9FAFB' }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{ color: darkMode ? '#CBD5E1' : '#64748B', borderRadius: '8px' }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleAddAccount}
              sx={{
                bgcolor: 'linear-gradient(45deg, #3B82F6 30%, #7C3AED 90%)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              Tạo sổ
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };
  
  export default SavingsAccounts;