import {
  AttachMoney,
  CalendarToday,
  Delete,
  Description,
  MonetizationOn,
} from '@mui/icons-material';
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Snackbar,
  styled,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { Theme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Investment } from '../../components/investments/InvestmentCard';
import InvestmentDetails from '../../components/investments/InvestmentDetails';
import InvestmentForm from '../../components/investments/InvestmentForm';
import InvestmentHeader, { InvestmentType } from '../../components/investments/InvestmentHeader';
import InvestmentList from '../../components/investments/InvestmentList';
import InvestmentTabs from '../../components/investments/InvestmentTabs';
import { RootState } from '../../redux/store';

// Lazy load analytics component to improve initial load performance
const InvestmentAnalytics = lazy(() => import('../../components/investments/InvestmentAnalytics'));

// Animation styles
const FadeIn = styled(Box)(({ theme }) => ({
  animation: 'fadeIn 0.5s ease-in-out',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
}));

const ScaleIn = styled(Box)(({ theme }) => ({
  animation: 'scaleIn 0.4s ease-out',
  '@keyframes scaleIn': {
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' }
  }
}));

const SlideIn = styled(Box)(({ theme }) => ({
  animation: 'slideIn 0.5s ease-out',
  '@keyframes slideIn': {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' }
  }
}));

// Premium feature card
const StyledCard = styled(Box)(({ theme }: { theme: Theme }) => ({
  borderRadius: '12px',
  background: theme.palette.mode === 'dark' ? '#1e2a38' : '#fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  padding: theme.spacing(4, 5),
  textAlign: 'center',
  maxWidth: 600,
  margin: '0 auto',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.12)',
  },
}));

const GradientButton = styled(Button)(({ theme }: { theme: Theme }) => ({
  borderRadius: '10px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  boxShadow: '0 4px 10px rgba(0, 118, 255, 0.2)',
  color: '#fff',
  '&:hover': {
    boxShadow: '0 6px 14px rgba(0, 118, 255, 0.3)',
    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  },
}));

interface WithdrawalData {
  amount: string;
  reason: string;
  date: string;
}

// Investment type definitions
const INVESTMENT_TYPES: InvestmentType[] = [
  { value: 'stock', label: 'Cổ phiếu', color: '#4caf50', icon: <span>📈</span> },
  { value: 'crypto', label: 'Tiền điện tử', color: '#ff9800', icon: <span>₿</span> },
  { value: 'realestate', label: 'Bất động sản', color: '#2196f3', icon: <span>🏢</span> },
  { value: 'bonds', label: 'Trái phiếu', color: '#9c27b0', icon: <span>📊</span> },
  { value: 'savings', label: 'Tiết kiệm', color: '#00bcd4', icon: <span>💰</span> },
  { value: 'other', label: 'Khác', color: '#f44336', icon: <span>💼</span> },
];

// Thêm interface cho Category
interface Category {
  _id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  description?: string;
}

// Thêm hàm lấy giá tiền điện tử với retry và delay
const getCryptoPrice = async (cryptoId: string, retryCount = 3, delayMs = 2000): Promise<number> => {
  for (let i = 0; i < retryCount; i++) {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=vnd`
      );
      return response.data[cryptoId].vnd;
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Rate limit hit, wait and retry
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Không thể lấy giá tiền điện tử sau nhiều lần thử');
};

const Investments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { plan, loading: subscriptionLoading, error: subscriptionError } = useSelector((state: RootState) => state.subscription);

  // State
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalData>({
    amount: '',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [withdrawalError, setWithdrawalError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('profitDesc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Fetch investments from API
  const fetchInvestments = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/investments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInvestments(response.data);
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách đầu tư:', error.response?.data || error.message);
      showSnackbar('Không thể tải danh sách đầu tư', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load investments when component mounts
  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh mục:', error);
    }
  }, []);

  // Load categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter and sort investments
  const filteredInvestments = useMemo(() => {
    // First apply type filter
    let filtered = [...investments];
    if (filterType !== 'all') {
      filtered = filtered.filter((investment) => investment.type === filterType);
    }
    
    // Apply search term filter if present
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((inv) => 
        inv.name.toLowerCase().includes(term) || 
        getTypeDetails(inv.type).label.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'profitDesc':
        filtered.sort((a, b) => b.currentAmount - b.initialAmount - (a.currentAmount - a.initialAmount));
        break;
      case 'profitAsc':
        filtered.sort((a, b) => a.currentAmount - a.initialAmount - (b.currentAmount - b.initialAmount));
        break;
      case 'amountDesc':
        filtered.sort((a, b) => b.currentAmount - a.currentAmount);
        break;
      case 'amountAsc':
        filtered.sort((a, b) => a.currentAmount - b.currentAmount);
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return filtered;
  }, [investments, filterType, sortOption, searchTerm]);

  // Form submission
  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Tìm category đầu tư chi phí
      let investmentExpenseCategory = categories.find(cat => 
        (cat.name.toLowerCase().includes('đầu tư') || cat.name.toLowerCase().includes('investment')) &&
        cat.type === 'expense'
      );

      // Nếu không tìm thấy category chi phí, tạo mới
      if (!investmentExpenseCategory) {
        try {
          const newExpenseCategory = {
            name: 'Chi phí đầu tư',
            type: 'expense',
            icon: '📈',
            color: '#f44336',
            description: 'Danh mục cho các khoản chi đầu tư'
          };

          const categoryResponse = await axios.post(
            'http://localhost:5000/api/categories',
            newExpenseCategory,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          investmentExpenseCategory = categoryResponse.data;
        } catch (error) {
          console.error('❌ Lỗi khi thêm danh mục chi phí đầu tư:', error);
          throw new Error('Không thể tạo danh mục chi phí đầu tư');
        }
      }

      const data = {
        name: formData.name,
        type: formData.type,
        initialAmount: parseFloat(formData.initialAmount),
        currentAmount: parseFloat(formData.initialAmount),
        expectedReturn: parseFloat(formData.expectedReturn) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        quantity: formData.type === 'crypto' ? parseFloat(formData.quantity) : undefined,
        history: [],
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

        // Tạo giao dịch chi phí cho đầu tư mới
        const transactionData = {
          type: 'expense',
          amount: parseFloat(formData.initialAmount),
          category: investmentExpenseCategory._id,
          description: `Đầu tư mới: ${formData.name}`,
          date: formData.startDate,
          paymentMethod: 'Wallet',
          status: 'completed',
          notes: formData.notes || undefined
        };

        await axios.post(
          'http://localhost:5000/api/transactions',
          transactionData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        showSnackbar('Thêm khoản đầu tư thành công', 'success');
      }

      fetchInvestments();
      handleCloseDialog();
    } catch (error) {
      console.error('❌ Lỗi khi lưu đầu tư:', error);
      showSnackbar('Có lỗi xảy ra', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdrawal 
  const handleWithdrawal = async () => {
    if (!selectedInvestment) return;
    if (!withdrawalData.amount || parseFloat(withdrawalData.amount) <= 0) {
      setWithdrawalError('Số tiền phải lớn hơn 0');
      return;
    }

    const withdrawalAmount = parseFloat(withdrawalData.amount);
    if (withdrawalAmount > selectedInvestment.currentAmount) {
      setWithdrawalError(`Số tiền rút không được vượt quá ${formatCurrency(selectedInvestment.currentAmount)}`);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Nếu là tiền điện tử, cập nhật giá trị hiện tại
      let currentAmount = selectedInvestment.currentAmount;
      if (selectedInvestment.type === 'crypto') {
        try {
          const cryptoId = selectedInvestment.name.toLowerCase();
          const currentPrice = await getCryptoPrice(cryptoId);
          if (currentPrice && selectedInvestment.quantity) {
            currentAmount = currentPrice * selectedInvestment.quantity;
          }
        } catch (error) {
          console.warn('⚠️ Không thể lấy giá tiền điện tử:', error);
          // Tiếp tục với giá trị hiện tại nếu không lấy được giá mới
        }
      }

      // Kiểm tra lại số tiền rút với giá trị hiện tại
      if (withdrawalAmount > currentAmount) {
        setWithdrawalError(`Số tiền rút không được vượt quá ${formatCurrency(currentAmount)}`);
        return;
      }

      // Step 1: Cập nhật thông tin khoản đầu tư
      const updatedInvestment = {
        name: selectedInvestment.name,
        type: selectedInvestment.type,
        initialAmount: selectedInvestment.initialAmount,
        expectedReturn: selectedInvestment.expectedReturn,
        startDate: selectedInvestment.startDate,
        endDate: selectedInvestment.endDate,
        notes: selectedInvestment.notes,
        status: selectedInvestment.status,
        quantity: selectedInvestment.quantity,
        currentAmount: currentAmount - withdrawalAmount,
        history: [
          ...selectedInvestment.history,
          {
            date: withdrawalData.date,
            amount: withdrawalAmount,
            type: 'withdraw',
            reason: withdrawalData.reason || undefined,
          },
        ],
      };

      try {
        await axios.put(
          `http://localhost:5000/api/investments/${selectedInvestment._id}`,
          updatedInvestment,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error('❌ Lỗi khi cập nhật đầu tư:', error);
        throw new Error('Không thể cập nhật thông tin đầu tư');
      }

      // Tìm hoặc tạo category thu nhập đầu tư
      let investmentIncomeCategory;
      try {
        const categoriesResponse = await axios.get('http://localhost:5000/api/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        investmentIncomeCategory = categoriesResponse.data.find((cat: Category) => 
          (cat.name.toLowerCase().includes('đầu tư') || cat.name.toLowerCase().includes('investment')) &&
          cat.type === 'income'
        );

        if (!investmentIncomeCategory) {
          const newIncomeCategory = {
            name: 'Thu nhập đầu tư',
            type: 'income',
            icon: '💰',
            color: '#4caf50',
            description: 'Danh mục cho các khoản thu từ đầu tư'
          };

          const createResponse = await axios.post(
            'http://localhost:5000/api/categories',
            newIncomeCategory,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          investmentIncomeCategory = createResponse.data;
        }
      } catch (error) {
        console.error('❌ Lỗi khi xử lý danh mục:', error);
        throw new Error('Không thể xử lý danh mục đầu tư');
      }

      if (!investmentIncomeCategory?._id) {
        throw new Error('Không tìm thấy hoặc không thể tạo danh mục đầu tư');
      }

      // Step 2: Tạo giao dịch thu nhập
      const transactionData = {
        type: 'income',
        amount: withdrawalAmount,
        category: investmentIncomeCategory._id,
        description: `Rút tiền từ đầu tư ${selectedInvestment.name}`,
        date: withdrawalData.date,
        paymentMethod: 'Wallet',
        status: 'completed',
        notes: withdrawalData.reason || undefined
      };

      try {
        await axios.post(
          'http://localhost:5000/api/transactions',
          transactionData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error('❌ Lỗi khi tạo giao dịch:', error);
        throw new Error('Không thể tạo giao dịch rút tiền');
      }

      showSnackbar('Rút tiền về ví thành công', 'success');
      fetchInvestments();
      fetchCategories();
      handleCloseWithdrawDialog();
    } catch (error: any) {
      console.error('❌ Lỗi khi rút tiền:', error);
      let errorMessage = 'Có lỗi xảy ra khi rút tiền';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete investment
  const handleDelete = async (id: string) => {
    setSelectedInvestment(investments.find((inv) => inv._id === id) || null);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedInvestment) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/investments/${selectedInvestment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSnackbar('Xóa khoản đầu tư thành công', 'success');
      fetchInvestments();
      setOpenDeleteDialog(false);
      setSelectedInvestment(null);
    } catch (error) {
      console.error('❌ Lỗi khi xóa đầu tư:', error);
      showSnackbar('Không thể xóa khoản đầu tư', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Event Handlers
  const handleEdit = (investment: Investment) => {
    setSelectedInvestment(investment);
    setOpenDialog(true);
  };

  const handleDetails = (investment: Investment) => {
    setSelectedInvestment(investment);
    setOpenDetailsDialog(true);
  };

  const handleWithdraw = (investment: Investment) => {
    setSelectedInvestment(investment);
    setWithdrawalData({
      amount: '',
      reason: '',
      date: new Date().toISOString().split('T')[0],
    });
    setOpenWithdrawDialog(true);
  };

  const handleAddInvestment = () => {
    setSelectedInvestment(null);
    setOpenDialog(true);
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Dialog close handlers
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInvestment(null);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedInvestment(null);
  };

  const handleCloseWithdrawDialog = () => {
    setOpenWithdrawDialog(false);
    setSelectedInvestment(null);
    setWithdrawalData({
      amount: '',
      reason: '',
      date: new Date().toISOString().split('T')[0],
    });
    setWithdrawalError('');
  };

  // Utility functions
  const calculateProfitLoss = (investment: Investment) => {
    const difference = investment.currentAmount - investment.initialAmount;
    return {
      amount: difference,
      percentage: ((difference / investment.initialAmount) * 100).toFixed(2),
      isProfit: difference >= 0,
    };
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

  const getTypeDetails = (type: string) => {
    return INVESTMENT_TYPES.find((t) => t.value === type) || INVESTMENT_TYPES[5];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <ThemeProvider theme={theme}>
      {/* <Layout> */}
        <Box
          sx={{
            minHeight: '100vh',
            background: theme.palette.mode === 'dark' ? '#121212' : '#f8fafc',
            p: { xs: 2, sm: 2, md: 2 },
            pl: { xs: 2, sm: 2, md: 0 },
            width: '100%',
            borderRadius: { xs: 0, md: '16px' },
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
              }}
            >
              <ScaleIn>
                <CircularProgress size={60} thickness={4} />
              </ScaleIn>
            </Box>
          )}
  
          {/* Subscription loading and errors */}
          {subscriptionLoading && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Đang tải trạng thái subscription...
              </Typography>
            </Box>
          )}
  
          {subscriptionError && (
            <Typography variant="body1" color="error" align="center" sx={{ mb: 2 }}>
              Lỗi subscription: {subscriptionError}
            </Typography>
          )}
  
          {/* Main content */}
          {!subscriptionLoading && (
            <FadeIn sx={{ width: '100%', pl: { xs: 0, sm: 0, md: 2 } }}>
              {/* Header with filters */}
              <InvestmentHeader
                onAddInvestment={() => setOpenDialog(true)}
                filterType={filterType}
                onFilterChange={(type) => setFilterType(type)}
                sortOption={sortOption}
                onSortChange={(sort) => setSortOption(sort)}
                onSearch={handleSearchChange}
                investmentTypes={INVESTMENT_TYPES}
              />
              
              {/* Tabs */}
              <Box sx={{ mt: 2 }}>
              <InvestmentTabs activeTab={activeTab} onTabChange={handleTabChange} />
              </Box>
              
              {/* Tab content */}
              <Box sx={{ mt: 2 }}>
              {activeTab === 0 ? (
                <FadeIn>
                  <InvestmentList
                    investments={investments}
                    filteredInvestments={filteredInvestments}
                    filterType={filterType}
                    onViewDetails={handleDetails}
                    onWithdraw={handleWithdraw}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddInvestment={() => setOpenDialog(true)}
                    formatCurrency={formatCurrency}
                    calculateProfitLoss={calculateProfitLoss}
                    getTypeDetails={getTypeDetails}
                  />
                </FadeIn>
              ) : (
                <Suspense fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={40} />
                  </Box>
                }>
                  <FadeIn>
                    <InvestmentAnalytics
                      investments={investments}
                      investmentTypes={INVESTMENT_TYPES}
                      formatCurrency={formatCurrency}
                      calculateProfitLoss={calculateProfitLoss}
                      getTypeDetails={getTypeDetails}
                    />
                  </FadeIn>
                </Suspense>
              )}
              </Box>
            </FadeIn>
          )}

          {/* Investment Form Dialog */}
          <InvestmentForm
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleSubmit}
            selectedInvestment={selectedInvestment}
            investmentTypes={INVESTMENT_TYPES}
            isLoading={isLoading}
          />

          {/* Investment Details Dialog */}
          <InvestmentDetails
            open={openDetailsDialog}
            onClose={handleCloseDetailsDialog}
            investment={selectedInvestment}
            onEdit={handleEdit}
            formatCurrency={formatCurrency}
            calculateProfitLoss={calculateProfitLoss}
            getTypeDetails={getTypeDetails}
          />

          {/* Withdraw Dialog */}
          <Dialog
            open={openWithdrawDialog}
            onClose={handleCloseWithdrawDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{ 
              sx: { 
                borderRadius: 3, 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(145deg, rgba(30,42,56,0.95) 0%, rgba(38,50,63,0.95) 100%)' 
                  : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
                backdropFilter: 'blur(10px)',
              } 
            }}
          >
            {selectedInvestment && (
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.success.main, 0.15), 
                        color: theme.palette.success.main,
                        width: 48, 
                        height: 48,
                        border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      }}
                    >
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography 
                        component="div" 
                        variant="h5" 
                        sx={{ 
                          fontSize: '1.4rem',
                          fontWeight: 600,
                          color: theme.palette.success.main,
                          mb: 0.5
                        }}
                      >
                        Rút tiền về ví
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.95rem',
                          color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                        }}
                      >
                        Từ đầu tư: {selectedInvestment.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.9rem',
                        color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                        mb: 1
                      }}
                    >
                      Số dư khả dụng
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
                      }}
                    >
                      {formatCurrency(selectedInvestment.currentAmount)}
                    </Typography>
                  </Box>

                  <FormControl fullWidth sx={{ mb: 2.5 }}>
                    <InputLabel 
                      sx={{ 
                        fontSize: '0.95rem',
                        color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                      }}
                    >
                      Số tiền rút
                    </InputLabel>
                    <OutlinedInput
                      value={withdrawalData.amount}
                      onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                      startAdornment={
                        <InputAdornment position="start">
                          <MonetizationOn sx={{ color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b' }} />
                        </InputAdornment>
                      }
                      label="Số tiền rút"
                      type="number"
                      error={!!withdrawalError}
                      sx={{
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)',
                        },
                      }}
                    />
                    {withdrawalError && (
                      <Typography 
                        color="error" 
                        variant="caption" 
                        sx={{ mt: 0.5, fontSize: '0.85rem' }}
                      >
                        {withdrawalError}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2.5 }}>
                    <TextField
                      label="Ngày rút tiền"
                      type="date"
                      value={withdrawalData.date}
                      onChange={(e) => setWithdrawalData({ ...withdrawalData, date: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday sx={{ color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)',
                          },
                        },
                      }}
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <TextField
                      label="Ghi chú"
                      multiline
                      rows={3}
                      value={withdrawalData.reason}
                      onChange={(e) => setWithdrawalData({ ...withdrawalData, reason: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Description sx={{ color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)',
                          },
                        },
                      }}
                    />
                  </FormControl>

                  <Alert 
                    severity="info" 
                    variant="outlined"
                    sx={{ 
                      mt: 2.5, 
                      borderRadius: '12px',
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      '& .MuiAlert-icon': {
                        color: theme.palette.info.main,
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                      Số tiền sẽ được chuyển vào ví của bạn sau khi xác nhận rút tiền
                    </Typography>
                  </Alert>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2 }}>
                  <Button 
                    onClick={handleCloseWithdrawDialog}
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '10px',
                      px: 3,
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)',
                      color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
                    }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleWithdrawal} 
                    disabled={isLoading}
                    variant="contained"
                    color="success"
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '10px',
                      px: 3,
                      background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                      boxShadow: `0 4px 10px ${alpha(theme.palette.success.main, 0.25)}`,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                        boxShadow: `0 6px 15px ${alpha(theme.palette.success.main, 0.35)}`,
                      },
                    }}
                    startIcon={<AttachMoney />}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Rút tiền'}
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            PaperProps={{ 
              sx: { 
                borderRadius: 3, 
                p: 2,
                maxWidth: 450,
              } 
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
                  <Delete />
                </Avatar>
                <Typography component="div" variant="h6" fontWeight="bold" color="error" sx={{ fontSize: '1.3rem' }}>
                  Xác nhận xóa
                </Typography>
              </Box>
              <Divider sx={{ mt: 2 }} />
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mt: 1, fontSize: '0.95rem' }}>
                Bạn có chắc chắn muốn xóa khoản đầu tư{' '}
                <Typography component="span" fontWeight="bold">
                  {selectedInvestment?.name}
                </Typography>{' '}
                không?
              </Typography>
              <Alert 
                severity="warning" 
                variant="outlined" 
                sx={{ 
                  mt: 2, 
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    alignItems: 'center'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                  Thao tác này <strong>không thể hoàn tác</strong>. Tất cả dữ liệu liên quan đến khoản đầu tư này sẽ bị xóa vĩnh viễn.
                </Typography>
              </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 1 }}>
              <Button 
                onClick={() => setOpenDeleteDialog(false)}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '10px',
                  px: 3,
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={confirmDelete}
                color="error"
                variant="contained"
                disabled={isLoading}
                startIcon={<Delete />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '10px',
                  px: 3,
                }}
              >
                Xóa
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              variant="filled"
              sx={{ 
                width: '100%',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                alignItems: 'center',
                '& .MuiAlert-icon': {
                  fontSize: '1.2rem'
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                {snackbar.message}
              </Typography>
            </Alert>
          </Snackbar>
        </Box>
      {/* </Layout> */}
    </ThemeProvider>
  );
};

export default Investments;