import {
    Add,
    ArrowDownward,
    ArrowUpward,
    Delete,
    Edit,
    Refresh,
    ShowChart
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import axiosInstance from '../../utils/axiosInstance';

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  backdropFilter: 'blur(10px)',
  height: '100%',
}));

interface Investment {
  _id: string;
  name: string;
  type: string;
  amount: number;
  initialAmount: number;
  currentAmount: number;
  startDate: string;
  endDate?: string;
  status: string;
  history: {
    date: string;
    amount: number;
    type: string;
    description?: string;
  }[];
}

const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Cổ phiếu', color: '#4CAF50', icon: '📈' },
  { value: 'crypto', label: 'Tiền điện tử', color: '#FF9800', icon: '₿' },
  { value: 'realestate', label: 'Bất động sản', color: '#2196F3', icon: '🏢' },
  { value: 'bonds', label: 'Trái phiếu', color: '#9C27B0', icon: '📊' },
  { value: 'savings', label: 'Tiết kiệm', color: '#00BCD4', icon: '💰' },
  { value: 'other', label: 'Khác', color: '#F44336', icon: '💼' },
];

const Investments = () => {
  const theme = useTheme();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active'
  });

  // Fetch investments
  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/investments');
      setInvestments(response.data);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  // Calculate statistics
  const stats = {
    totalInvested: investments.reduce((sum, inv) => sum + inv.initialAmount, 0),
    currentValue: investments.reduce((sum, inv) => sum + inv.currentAmount, 0),
    totalProfit: investments.reduce((sum, inv) => sum + (inv.currentAmount - inv.initialAmount), 0),
    investmentCount: investments.length
  };

  // Chart data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Giá trị đầu tư',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: theme.palette.primary.main,
        tension: 0.1
      }
    ]
  };

  const pieChartData = {
    labels: INVESTMENT_TYPES.map(type => type.label),
    datasets: [{
      data: INVESTMENT_TYPES.map(type => 
        investments
          .filter(inv => inv.type === type.value)
          .reduce((sum, inv) => sum + inv.currentAmount, 0)
      ),
      backgroundColor: INVESTMENT_TYPES.map(type => type.color),
    }]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a237e 0%, #121212 100%)'
        : 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%)',
      display: 'flex',
      flexDirection: 'column',
      m: 0,
      p: 0,
      width: '100%'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ 
            color: theme.palette.mode === 'dark' ? '#fff' : '#1a237e',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <ShowChart /> Quản lý Đầu tư
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={fetchInvestments} sx={{ bgcolor: 'background.paper' }}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedInvestment(null);
              setOpenDialog(true);
            }}
            sx={{ 
              borderRadius: 2,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Thêm Đầu tư
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1,
        p: 2,
        overflow: 'auto'
      }}>
        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Tổng đầu tư</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                  {formatCurrency(stats.totalInvested)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {stats.investmentCount} khoản đầu tư
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Giá trị hiện tại</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                  {formatCurrency(stats.currentValue)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Cập nhật mới nhất
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">Lợi nhuận/Thua lỗ</Typography>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  sx={{ 
                    mt: 1,
                    color: stats.totalProfit >= 0 ? 'success.main' : 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {stats.totalProfit >= 0 ? <ArrowUpward color="success" /> : <ArrowDownward color="error" />}
                  {formatCurrency(Math.abs(stats.totalProfit))}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    color: stats.totalProfit >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {((stats.totalProfit / stats.totalInvested) * 100).toFixed(2)}%
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">ROI Trung bình</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                  {((stats.totalProfit / stats.totalInvested) * 100).toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Hiệu suất đầu tư
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} lg={8}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>Biến động giá trị đầu tư</Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={lineChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      }
                    }
                  }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>Phân bổ đầu tư</Typography>
                <Box sx={{ height: 300 }}>
                  <Pie data={pieChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Investment List */}
        <Paper sx={{ 
          p: 2,
          borderRadius: 2,
          height: 'calc(100vh - 450px)',
          overflow: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Danh mục đầu tư</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Loại đầu tư</InputLabel>
                <Select
                  value="all"
                  label="Loại đầu tư"
                  size="small"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {INVESTMENT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value="profit"
                  label="Sắp xếp"
                  size="small"
                >
                  <MenuItem value="profit">Lợi nhuận</MenuItem>
                  <MenuItem value="amount">Số tiền</MenuItem>
                  <MenuItem value="name">Tên</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : investments.length === 0 ? (
            <Alert severity="info">Chưa có khoản đầu tư nào. Hãy thêm khoản đầu tư đầu tiên của bạn!</Alert>
          ) : (
            <Grid container spacing={2}>
              {investments.map((investment) => (
                <Grid item xs={12} sm={6} lg={4} key={investment._id}>
                  <StyledCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{investment.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedInvestment(investment);
                              setOpenDialog(true);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => {
                              // Handle delete
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {INVESTMENT_TYPES.find(t => t.value === investment.type)?.label}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary">Số tiền đầu tư</Typography>
                        <Typography variant="h6">{formatCurrency(investment.initialAmount)}</Typography>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="textSecondary">Giá trị hiện tại</Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: investment.currentAmount >= investment.initialAmount 
                              ? 'success.main' 
                              : 'error.main'
                          }}
                        >
                          {formatCurrency(investment.currentAmount)}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="textSecondary">Lợi nhuận/Thua lỗ</Typography>
                        <Typography 
                          variant="body1"
                          sx={{ 
                            color: investment.currentAmount >= investment.initialAmount 
                              ? 'success.main' 
                              : 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          {investment.currentAmount >= investment.initialAmount ? (
                            <ArrowUpward fontSize="small" color="success" />
                          ) : (
                            <ArrowDownward fontSize="small" color="error" />
                          )}
                          {formatCurrency(Math.abs(investment.currentAmount - investment.initialAmount))}
                          ({((investment.currentAmount - investment.initialAmount) / investment.initialAmount * 100).toFixed(2)}%)
                        </Typography>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedInvestment ? 'Chỉnh sửa đầu tư' : 'Thêm đầu tư mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên khoản đầu tư"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại đầu tư</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Loại đầu tư"
                >
                  {INVESTMENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số tiền đầu tư"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc (tùy chọn)"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Handle save
              setOpenDialog(false);
            }}
          >
            {selectedInvestment ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Investments; 