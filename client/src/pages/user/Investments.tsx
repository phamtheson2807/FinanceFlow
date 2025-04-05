import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Snackbar,
  styled,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Cell, Legend, Pie, PieChart, Tooltip as RechartsTooltip } from 'recharts';
import { RootState } from '../../redux/store';

interface Investment {
  _id: string;
  name: string;
  type: string;
  initialAmount: number;
  currentAmount: number;
  expectedReturn: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  quantity?: number;
  history: {
    date: string;
    amount: number;
    type: 'deposit' | 'withdraw' | 'profit' | 'loss';
  }[];
}

const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Cổ phiếu' },
  { value: 'crypto', label: 'Tiền điện tử' },
  { value: 'realestate', label: 'Bất động sản' },
  { value: 'bonds', label: 'Trái phiếu' },
  { value: 'savings', label: 'Tiết kiệm' },
  { value: 'other', label: 'Khác' },
];

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  boxShadow: `0 4px 15px ${theme.palette.grey[400]}`,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 25px ${theme.palette.grey[500]}`,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '24px',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: 'bold',
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: '#fff',
  '&:hover': {
    background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: `0 4px 15px ${theme.palette.grey[600]}`,
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  textShadow: `1px 1px 3px ${theme.palette.grey[400]}`,
}));

const Investments = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plan, loading, error } = useSelector((state: RootState) => state.subscription);

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    initialAmount: '',
    expectedReturn: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    status: 'active' as 'active' | 'completed' | 'cancelled',
    quantity: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const fetchInvestments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token gửi đi:', token); // Debug token
      const response = await axios.get('http://localhost:5000/api/investments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('📡 Dữ liệu đầu tư từ backend:', JSON.stringify(response.data, null, 2));
      setInvestments(response.data);
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách đầu tư:', error.response?.data || error.message);
      showSnackbar('Không thể tải danh sách đầu tư', 'error');
    }
  }, []);

  useEffect(() => {
    console.log('Redux subscription state:', { plan, loading, error }); // Debug Redux state
    if (!loading && plan !== 'free') {
      fetchInvestments();
    }
  }, [fetchInvestments, loading, plan]);

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.type || !formData.initialAmount) {
        showSnackbar('Vui lòng điền đầy đủ thông tin', 'error');
        return;
      }
      if (formData.type === 'crypto' && (!formData.quantity || parseFloat(formData.quantity) <= 0)) {
        showSnackbar('Vui lòng nhập số lượng coin lớn hơn 0 cho đầu tư crypto', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      const data = {
        name: formData.name,
        type: formData.type,
        initialAmount: parseFloat(formData.initialAmount),
        expectedReturn: parseFloat(formData.expectedReturn) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        quantity: formData.type === 'crypto' ? parseFloat(formData.quantity) : undefined,
      };

      if (selectedInvestment) {
        await axios.put(`http://localhost:5000/api/investments/${selectedInvestment._id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showSnackbar('Cập nhật khoản đầu tư thành công', 'success');
      } else {
        await axios.post('http://localhost:5000/api/investments', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showSnackbar('Thêm khoản đầu tư thành công', 'success');
      }

      fetchInvestments();
      handleCloseDialog();
    } catch (error) {
      console.error('❌ Lỗi khi lưu đầu tư:', error);
      showSnackbar('Có lỗi xảy ra', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/investments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSnackbar('Xóa khoản đầu tư thành công', 'success');
      fetchInvestments();
    } catch (error) {
      console.error('❌ Lỗi khi xóa đầu tư:', error);
      showSnackbar('Không thể xóa khoản đầu tư', 'error');
    }
  };

  const handleEdit = (investment: Investment) => {
    setSelectedInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      initialAmount: investment.initialAmount.toString(),
      expectedReturn: investment.expectedReturn.toString(),
      startDate: investment.startDate.split('T')[0],
      endDate: investment.endDate ? investment.endDate.split('T')[0] : '',
      notes: investment.notes || '',
      status: investment.status,
      quantity: investment.quantity?.toString() || '',
    });
    setOpenDialog(true);
  };

  const calculateProfitLoss = (investment: Investment) => {
    const difference = investment.currentAmount - investment.initialAmount;
    return {
      amount: difference,
      percentage: ((difference / investment.initialAmount) * 100).toFixed(2),
      isProfit: difference >= 0,
    };
  };

  const calculateAverageBuyPrice = (investment: Investment) => {
    if (investment.type === 'crypto' && investment.quantity) {
      return investment.initialAmount / investment.quantity;
    }
    return null;
  };

  const calculateCurrentPrice = (investment: Investment) => {
    if (investment.type === 'crypto' && investment.quantity) {
      return investment.currentAmount / investment.quantity;
    }
    return null;
  };

  const calculateTotalProfitLoss = () => {
    const total = investments.reduce(
      (acc, inv) => {
        const { amount, isProfit } = calculateProfitLoss(inv);
        return {
          profit: isProfit ? acc.profit + amount : acc.profit,
          loss: !isProfit ? acc.loss + Math.abs(amount) : acc.loss,
          totalInvested: acc.totalInvested + inv.initialAmount,
          totalCurrent: acc.totalCurrent + inv.currentAmount,
        };
      },
      { profit: 0, loss: 0, totalInvested: 0, totalCurrent: 0 }
    );
    return total;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInvestment(null);
    setFormData({
      name: '',
      type: '',
      initialAmount: '',
      expectedReturn: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      status: 'active' as 'active' | 'completed' | 'cancelled',
      quantity: '',
    });
  };

  const pieData = investments.map((inv) => ({
    name: inv.name,
    value: inv.currentAmount,
    color:
      inv.type === 'stock'
        ? '#4caf50'
        : inv.type === 'crypto'
        ? '#ff9800'
        : inv.type === 'realestate'
        ? '#2196f3'
        : inv.type === 'bonds'
        ? '#9c27b0'
        : inv.type === 'savings'
        ? '#00bcd4'
        : '#f44336',
  }));

  const totalProfitLoss = calculateTotalProfitLoss();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
        p: 4,
      }}
    >
      {loading && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Đang tải trạng thái subscription...</Typography>
        </Box>
      )}
      {error && (
        <Typography variant="body1" color="error" align="center" sx={{ mb: 2 }}>
          Lỗi subscription: {error}
        </Typography>
      )}
      {plan === 'free' && !loading && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <StyledTypography variant="h5" color="error">
            Bạn cần nâng cấp lên gói Premium hoặc Pro để sử dụng tính năng đầu tư!
          </StyledTypography>
          <StyledButton sx={{ mt: 3 }} onClick={() => navigate('/pricing')}>
            Nâng cấp ngay
          </StyledButton>
        </Box>
      )}
      {plan !== 'free' && !loading && (
        <>
          <StyledTypography variant="h4" gutterBottom align="center">
            Quản Lý Đầu Tư
          </StyledTypography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <StyledButton startIcon={<Add />} onClick={() => setOpenDialog(true)}>
              Thêm Đầu Tư Mới
            </StyledButton>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {investments.length > 0 ? (
                investments.map((investment) => {
                  const profitLoss = calculateProfitLoss(investment);
                  const avgBuyPrice = calculateAverageBuyPrice(investment);
                  const currentPrice = calculateCurrentPrice(investment);
                  return (
                    <StyledCard key={investment._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <StyledTypography variant="h6">{investment.name}</StyledTypography>
                            <Typography variant="body2" color="text.secondary">
                              Loại:{' '}
                              {INVESTMENT_TYPES.find((t) => t.value === investment.type)?.label || 'Khác'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Số tiền ban đầu: {formatCurrency(investment.initialAmount)}
                            </Typography>
                            {investment.type === 'crypto' ? (
                              investment.quantity && investment.quantity > 0 ? (
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    Số lượng: {investment.quantity} coin
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Giá mua trung bình: {formatCurrency(avgBuyPrice!)} / coin
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Giá hiện tại: {formatCurrency(currentPrice!)} / coin
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="body2" color="orange">
                                  Vui lòng cập nhật số lượng coin để tính giá và lợi nhuận
                                </Typography>
                              )
                            ) : null}
                            <Typography variant="body2" color="text.secondary">
                              Hiện tại: {formatCurrency(investment.currentAmount)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: profitLoss.isProfit
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                              }}
                            >
                              {profitLoss.isProfit ? 'Lợi nhuận' : 'Thua lỗ'}: {formatCurrency(profitLoss.amount)} (
                              {profitLoss.percentage}%)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Trạng thái:{' '}
                              {investment.status === 'active'
                                ? 'Đang hoạt động'
                                : investment.status === 'completed'
                                ? 'Hoàn thành'
                                : 'Hủy'}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton color="primary" onClick={() => handleEdit(investment)}>
                              <Edit />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(investment._id)}>
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  );
                })
              ) : (
                <Typography variant="body1" color="text.secondary" align="center">
                  Chưa có khoản đầu tư nào. Hãy thêm một khoản đầu tư mới!
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardContent>
                  <StyledTypography variant="h6" align="center">
                    Tổng Hợp Đầu Tư
                  </StyledTypography>
                  {pieData.length > 0 ? (
                    <PieChart width={300} height={300}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      Chưa có dữ liệu để hiển thị
                    </Typography>
                  )}
                </CardContent>
              </StyledCard>
              <StyledCard sx={{ mt: 3 }}>
                <CardContent>
                  <StyledTypography variant="h6" align="center" gutterBottom>
                    Thống Kê Lợi Nhuận/Thua Lỗ
                  </StyledTypography>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ color: theme.palette.success.main, mb: 1 }}>
                      Tổng lợi nhuận: {formatCurrency(totalProfitLoss.profit)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.error.main, mb: 1 }}>
                      Tổng thua lỗ: {formatCurrency(totalProfitLoss.loss)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          totalProfitLoss.profit - totalProfitLoss.loss >= 0
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                        fontWeight: 'bold',
                      }}
                    >
                      Lợi nhuận ròng: {formatCurrency(totalProfitLoss.profit - totalProfitLoss.loss)} (
                      {totalProfitLoss.totalInvested > 0
                        ? (
                            ((totalProfitLoss.profit - totalProfitLoss.loss) / totalProfitLoss.totalInvested) *
                            100
                          ).toFixed(2)
                        : '0.00'}
                      %)
                    </Typography>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </>
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: { borderRadius: '16px', background: '#fff', boxShadow: `0 4px 20px ${theme.palette.grey[400]}` },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          {selectedInvestment ? 'Sửa Đầu Tư' : 'Thêm Đầu Tư Mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên đầu tư (VD: bitcoin, ethereum nếu là crypto)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: '#f5f7fa', borderRadius: '8px' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Loại đầu tư"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: '#f5f7fa', borderRadius: '8px' }}
              >
                {INVESTMENT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số tiền ban đầu (VND)"
                type="number"
                value={formData.initialAmount}
                onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: '#f5f7fa', borderRadius: '8px' }}
              />
            </Grid>
            {formData.type === 'crypto' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số lượng coin"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  variant="outlined"
                  sx={{ backgroundColor: '#f5f7fa', borderRadius: '8px' }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lợi nhuận kỳ vọng (%)"
                type="number"
                value={formData.expectedReturn}
                onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: '#f5f7fa', borderRadius: '8px' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: '#f5f7fa', borderRadius: '8px' }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc (nếu có)"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: '#f5f7fa', borderRadius: '8px' }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                variant="outlined"
                sx={{ backgroundColor: '#f5f7fa', borderRadius: '8px' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: theme.palette.grey[600] }}>
            Hủy
          </Button>
          <StyledButton onClick={handleSubmit}>
            {selectedInvestment ? 'Cập nhật' : 'Thêm'}
          </StyledButton>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', boxShadow: `0 2px 8px ${theme.palette.grey[400]}` }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Investments;