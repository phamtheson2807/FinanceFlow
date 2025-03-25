import { CloudDownload, InsertDriveFile } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import axios from 'axios';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Styled Paper với gradient và shadow
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

// Styled Button với hiệu ứng hover
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1, 3),
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
  },
}));

// Styled Dialog với animation
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    background: 'linear-gradient(to bottom right, #fff, #f9f9f9)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    padding: theme.spacing(2),
    animation: 'fadeIn 0.3s ease-in-out',
  },
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'scale(0.95)' },
    '100%': { opacity: 1, transform: 'scale(1)' },
  },
}));

// Định nghĩa interface cho giao dịch
interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
}

// Định nghĩa dữ liệu tổng hợp
interface ChartData {
  labels: string[];
  income: number[];
  expenses: number[];
}

interface CategoryChartData {
  labels: string[];
  expenses: number[];
}

const Reports = () => {
  const [overview, setOverview] = useState({ income: 0, expenses: 0, balance: 0 });
  const [monthlyData, setMonthlyData] = useState<ChartData>({ labels: [], income: [], expenses: [] });
  const [categoryData, setCategoryData] = useState<CategoryChartData>({ labels: [], expenses: [] });
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Form data cho thêm giao dịch
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    category: 'Ăn uống',
    date: new Date().toISOString().split('T')[0],
  });

  // Lấy dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      const now = new Date();
      let startDate: string | undefined;
      let endDate: string | undefined;
      if (timeRange === 'day') {
        startDate = now.toISOString().split('T')[0];
        endDate = startDate;
      } else if (timeRange === 'year') {
        startDate = `${now.getFullYear()}-01-01`;
        endDate = `${now.getFullYear()}-12-31`;
      }

      const query = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        limit: '1000',
      }).toString();
      const response = await axios.get(`http://localhost:5000/api/transactions?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: { transactions: Transaction[] } = response.data;
      console.log('Dữ liệu giao dịch:', data.transactions);
      setTransactions(data.transactions || []);

      const totalIncome = data.transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = data.transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      setOverview({
        income: totalIncome,
        expenses: totalExpense,
        balance: totalIncome - totalExpense,
      });

      const monthlyMap: { [key: string]: { income: number; expense: number } } = {};
      data.transactions.forEach((t) => {
        const date = new Date(t.date);
        const key = timeRange === 'day'
          ? date.toISOString().split('T')[0]
          : timeRange === 'month'
          ? `${date.getMonth() + 1}/${date.getFullYear()}`
          : `${date.getFullYear()}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = { income: 0, expense: 0 };
        }
        monthlyMap[key][t.type === 'income' ? 'income' : 'expense'] += t.amount;
      });
      const labels = Object.keys(monthlyMap).sort();
      const income = labels.map((key) => monthlyMap[key].income);
      const expenses = labels.map((key) => monthlyMap[key].expense);
      setMonthlyData({ labels, income, expenses });

      const categoryMap: { [key: string]: number } = {};
      data.transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });
      const expenseCategories = Object.entries(categoryMap).map(([category, amount]) => ({
        category,
        amount,
      }));
      setCategoryData({
        labels: expenseCategories.map((c) => c.category),
        expenses: expenseCategories.map((c) => c.amount),
      });
    } catch (error: unknown) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      if (error instanceof Error) {
        setError(error.message || 'Đã xảy ra lỗi khi tải dữ liệu.');
      } else {
        setError('Đã xảy ra lỗi không xác định khi tải dữ liệu.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  useEffect(() => {
    if (!transactions.length) return;

    const categoryMap: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === 'expense' && (!selectedCategory || t.category === selectedCategory))
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
    const filteredCategories = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
    }));
    setCategoryData({
      labels: filteredCategories.map((c) => c.category),
      expenses: filteredCategories.map((c) => c.amount),
    });
  }, [selectedCategory, transactions]);

  // Dữ liệu biểu đồ
  const overviewChartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Thu nhập',
        data: monthlyData.income,
        backgroundColor: 'rgba(103, 230, 220, 0.7)',
        borderColor: '#67E6DC',
        borderWidth: 1,
      },
      {
        label: 'Chi tiêu',
        data: monthlyData.expenses,
        backgroundColor: 'rgba(255, 111, 105, 0.7)',
        borderColor: '#FF6F69',
        borderWidth: 1,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.expenses,
        backgroundColor: ['#FF6F69', '#67E6DC', '#FFD166', '#6B728E', '#957FEF'],
        borderWidth: 0,
      },
    ],
  };

  // Xuất Excel với bố cục đẹp hơn
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan với thiết kế đẹp
    const summaryData = [
      ['', '', 'BÁO CÁO TÀI CHÍNH'], // Tiêu đề lớn
      ['', '', ''],
      ['Tổng thu', 'Tổng chi', 'Số dư'],
      [
        overview.income.toLocaleString(),
        overview.expenses.toLocaleString(),
        overview.balance.toLocaleString(),
      ],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Kiểm tra và áp dụng style cho sheet tổng quan
    if (summarySheet) {
      summarySheet['!merges'] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 2 } }]; // Gộp ô tiêu đề
      summarySheet['A1'] = { v: 'BÁO CÁO TÀI CHÍNH', t: 's' };
      summarySheet['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: 'FF6F69' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
      summarySheet['A3'] = { v: 'Tổng thu', t: 's' };
      summarySheet['B3'] = { v: 'Tổng chi', t: 's' };
      summarySheet['C3'] = { v: 'Số dư', t: 's' };
      summarySheet['A3'].s = {
        font: { bold: true, sz: 12, color: { rgb: '444444' } },
        fill: { fgColor: { rgb: 'F5F7FA' } },
        border: { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin' } },
      };
      summarySheet['B3'].s = { ...summarySheet['A3'].s };
      summarySheet['C3'].s = { ...summarySheet['A3'].s };
      summarySheet['A4'] = { v: overview.income, t: 'n' };
      summarySheet['B4'] = { v: overview.expenses, t: 'n' };
      summarySheet['C4'] = { v: overview.balance, t: 'n' };
      summarySheet['A4'].s = {
        font: { sz: 12, color: { rgb: '67E6DC' } },
        alignment: { horizontal: 'right' },
        numberFormat: '#,##0',
      };
      summarySheet['B4'].s = {
        font: { sz: 12, color: { rgb: 'FF6F69' } },
        alignment: { horizontal: 'right' },
        numberFormat: '#,##0',
      };
      summarySheet['C4'].s = {
        font: { sz: 12, color: { rgb: '6B728E' } },
        alignment: { horizontal: 'right' },
        numberFormat: '#,##0',
      };

      // Đặt độ rộng cột
      summarySheet['!cols'] = [
        { wch: 15 }, // Tổng thu
        { wch: 15 }, // Tổng chi
        { wch: 15 }, // Số dư
      ];
    }

    // Sheet 2: Chi tiết với thiết kế đẹp
    const detailData = [
      ['BÁO CÁO CHI TIẾT'], // Tiêu đề lớn
      [''],
      ['Thời gian', 'Thu nhập', 'Chi tiêu', 'Danh mục'],
      ...monthlyData.labels.map((label, index) => [
        label,
        monthlyData.income[index] || 0,
        monthlyData.expenses[index] || 0,
        '', // Placeholder cho danh mục
      ]),
      ...categoryData.labels.map((label, index) => [
        '', // Placeholder cho thời gian
        '', // Placeholder cho thu nhập
        categoryData.expenses[index] || 0,
        label,
      ]),
    ];
    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);

    // Kiểm tra và áp dụng style cho sheet chi tiết
    if (detailSheet) {
      detailSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }]; // Gộp ô tiêu đề
      detailSheet['A1'] = { v: 'BÁO CÁO CHI TIẾT', t: 's' };
      detailSheet['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: '67E6DC' } },
        alignment: { horizontal: 'center' },
      };
      detailSheet['A3'] = { v: 'Thời gian', t: 's' };
      detailSheet['B3'] = { v: 'Thu nhập', t: 's' };
      detailSheet['C3'] = { v: 'Chi tiêu', t: 's' };
      detailSheet['D3'] = { v: 'Danh mục', t: 's' };
      detailSheet['A3'].s = {
        font: { bold: true, sz: 12, color: { rgb: '444444' } },
        fill: { fgColor: { rgb: 'F5F7FA' } },
        border: { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin' } },
      };
      detailSheet['B3'].s = { ...detailSheet['A3'].s };
      detailSheet['C3'].s = { ...detailSheet['A3'].s };
      detailSheet['D3'].s = { ...detailSheet['A3'].s };

      for (let row = 4; row < detailData.length + 3; row++) {
        detailSheet[`A${row}`] = { v: detailData[row - 3][0], t: 's' };
        detailSheet[`B${row}`] = { v: detailData[row - 3][1], t: 'n' };
        detailSheet[`C${row}`] = { v: detailData[row - 3][2], t: 'n' };
        detailSheet[`D${row}`] = { v: detailData[row - 3][3], t: 's' };

        detailSheet[`A${row}`].s = { font: { sz: 12, color: { rgb: '444444' } }, alignment: { horizontal: 'left' } };
        detailSheet[`B${row}`].s = { font: { sz: 12, color: { rgb: '67E6DC' } }, alignment: { horizontal: 'right' }, numberFormat: '#,##0' };
        detailSheet[`C${row}`].s = { font: { sz: 12, color: { rgb: 'FF6F69' } }, alignment: { horizontal: 'right' }, numberFormat: '#,##0' };
        detailSheet[`D${row}`].s = { font: { sz: 12, color: { rgb: '6B728E' } }, alignment: { horizontal: 'left' } };
      }

      // Đặt độ rộng cột
      detailSheet['!cols'] = [
        { wch: 15 }, // Thời gian
        { wch: 15 }, // Thu nhập
        { wch: 15 }, // Chi tiêu
        { wch: 15 }, // Danh mục
      ];
    }

    // Thêm sheet vào workbook
    if (summarySheet) XLSX.utils.book_append_sheet(wb, summarySheet, 'Tổng quan');
    if (detailSheet) XLSX.utils.book_append_sheet(wb, detailSheet, 'Chi tiết');

    // Kiểm tra workbook có sheet không trước khi xuất
    if (wb.SheetNames.length === 0) {
      console.error('Workbook is empty - No sheets were added.');
      alert('Không thể xuất file Excel: Workbook rỗng. Vui lòng kiểm tra dữ liệu.');
      return;
    }

    // Xuất file Excel
    XLSX.writeFile(wb, 'Bao_cao_tai_chinh.xlsx');
  };

  // Xuất PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Báo cáo Tài chính', 10, 10);
    doc.setFontSize(12);
    doc.text(`Tổng thu nhập: ${overview.income.toLocaleString()} VND`, 10, 20);
    doc.text(`Tổng chi tiêu: ${overview.expenses.toLocaleString()} VND`, 10, 30);
    doc.text(`Số dư: ${overview.balance.toLocaleString()} VND`, 10, 40);

    let y = 50;
    monthlyData.labels.forEach((label, index) => {
      doc.text(`${label}: Thu ${monthlyData.income[index].toLocaleString()} - Chi ${monthlyData.expenses[index].toLocaleString()}`, 10, y);
      y += 10;
    });

    doc.save('Bao_cao_tai_chinh.pdf');
  };

  // Xử lý thêm giao dịch
  const handleAddTransaction = async () => {
    try {
      if (formData.amount <= 0) {
        alert('Số tiền phải lớn hơn 0.');
        return;
      }

      const token = localStorage.getItem('token');
      const payload = {
        type: formData.type,
        amount: Number(formData.amount),
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        description: '',
        paymentMethod: 'Tiền mặt',
        status: 'completed',
      };

      await axios.post('http://localhost:5000/api/transactions', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchData(); // Cập nhật dữ liệu sau khi thêm
      setOpenDialog(false);
    } catch (error: any) {
      console.error('❌ Lỗi khi thêm giao dịch:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#333', fontWeight: 500 }}>
          Báo cáo Tài chính
        </Typography>
        <Typography sx={{ mt: 2, color: '#666' }}>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#333', fontWeight: 500 }}>
          Báo cáo Tài chính
        </Typography>
        <Typography sx={{ mt: 2, color: '#FF6F69' }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(to bottom, #f0f4f8, #ffffff)', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: '#333',
          fontWeight: 600,
          textAlign: 'center',
          mb: 4,
          background: 'linear-gradient(90deg, #FF6F69, #67E6DC)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Báo cáo Tài chính
      </Typography>

      {/* 5.1 Báo cáo tổng quan */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledPaper>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', color: '#444', mb: 2 }}>
              Tổng quan
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#67E6DC', lineHeight: 1.8 }}>
              Thu nhập: {overview.income.toLocaleString()} VND
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#FF6F69', lineHeight: 1.8 }}>
              Chi tiêu: {overview.expenses.toLocaleString()} VND
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#6B728E', lineHeight: 1.8 }}>
              Số dư: {overview.balance.toLocaleString()} VND
            </Typography>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} sm={6} md={9}>
          <StyledPaper sx={{ height: '350px' }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', color: '#444', mb: 2 }}>
              Biểu đồ Thu - Chi
            </Typography>
            <Box sx={{ height: '280px' }}>
              <Bar
                data={overviewChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top', labels: { font: { size: 12 } } } },
                }}
              />
            </Box>
          </StyledPaper>
        </Grid>
        <Grid item xs={12}>
          <StyledPaper sx={{ height: '250px' }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', color: '#444', mb: 2 }}>
              Tỷ lệ Chi tiêu theo Danh mục
            </Typography>
            <Box sx={{ height: '180px', maxWidth: '450px', mx: 'auto' }}>
              <Pie
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } },
                }}
              />
            </Box>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* 5.2 Báo cáo theo thời gian */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontSize: '1.3rem', color: '#444', mb: 2 }}>
          Báo cáo theo Thời gian
        </Typography>
        <FormControl sx={{ minWidth: 120, mb: 2 }}>
          <InputLabel sx={{ fontSize: '0.95rem', color: '#666' }}>Khoảng thời gian</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'day' | 'month' | 'year')}
            sx={{
              height: '45px',
              fontSize: '0.95rem',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            }}
          >
            <MenuItem value="day" sx={{ fontSize: '0.95rem' }}>Ngày</MenuItem>
            <MenuItem value="month" sx={{ fontSize: '0.95rem' }}>Tháng</MenuItem>
            <MenuItem value="year" sx={{ fontSize: '0.95rem' }}>Năm</MenuItem>
          </Select>
        </FormControl>
        <StyledPaper sx={{ height: '400px' }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', color: '#444', mb: 2 }}>
            Xu hướng Thu nhập & Chi tiêu
          </Typography>
          <Box sx={{ height: '280px', mb: 2 }}>
            <Bar
              data={overviewChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { font: { size: 12 } } } },
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.95rem', color: '#67E6DC', lineHeight: 1.8 }}>
            Thu nhập: {overview.income.toLocaleString()} VND
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: '#FF6F69', lineHeight: 1.8 }}>
            Chi tiêu: {overview.expenses.toLocaleString()} VND
          </Typography>
        </StyledPaper>
      </Box>

      {/* 5.3 Báo cáo theo danh mục */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontSize: '1.3rem', color: '#444', mb: 2 }}>
          Báo cáo theo Danh mục
        </Typography>
        <FormControl sx={{ minWidth: 120, mb: 2 }}>
          <InputLabel sx={{ fontSize: '0.95rem', color: '#666' }}>Danh mục</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            sx={{
              height: '45px',
              fontSize: '0.95rem',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            }}
          >
            <MenuItem value="" sx={{ fontSize: '0.95rem' }}>Tất cả</MenuItem>
            {categoryData.labels.map((category) => (
              <MenuItem key={category} value={category} sx={{ fontSize: '0.95rem' }}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <StyledPaper sx={{ height: '250px' }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', color: '#444', mb: 2 }}>
            Chi tiêu theo Danh mục
          </Typography>
          <Box sx={{ height: '180px', maxWidth: '450px', mx: 'auto' }}>
            <Pie
              data={categoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } },
              }}
            />
          </Box>
        </StyledPaper>
      </Box>

      {/* 5.4 Xuất báo cáo */}
      <Box
        sx={{
          mt: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #FF6F69 0%, #67E6DC 100%)',
          borderRadius: '20px',
          p: 3,
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontSize: '1.5rem', color: '#fff', mb: 3, fontWeight: 600, textShadow: '0 2px 5px rgba(0, 0, 0, 0.2)' }}
        >
          Xuất Báo cáo
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
          <StyledButton
            variant="contained"
            onClick={exportToExcel}
            sx={{ background: '#4CAF50', '&:hover': { background: '#388E3C' } }}
            startIcon={<InsertDriveFile />}
          >
            Excel
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={exportToPDF}
            sx={{ background: '#2196F3', '&:hover': { background: '#1976D2' } }}
            startIcon={<CloudDownload />}
          >
            PDF
          </StyledButton>
        </Box>
      </Box>

      {/* Form thêm giao dịch */}
      <StyledDialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ fontSize: '1.5rem', color: '#444', textAlign: 'center', fontWeight: 600 }}>
          Thêm Giao dịch Mới
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel sx={{ color: '#666' }}>Loại</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
              sx={{ borderRadius: '10px', backgroundColor: '#f9f9f9' }}
            >
              <MenuItem value="income">Thu nhập</MenuItem>
              <MenuItem value="expense">Chi tiêu</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Số tiền"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            fullWidth
            sx={{ mt: 2, borderRadius: '10px', backgroundColor: '#f9f9f9' }}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel sx={{ color: '#666' }}>Danh mục</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{ borderRadius: '10px', backgroundColor: '#f9f9f9' }}
            >
              {['Ăn uống', 'Di chuyển', 'Mua sắm', 'Lương', 'Thưởng', 'Khác'].map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Ngày"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            fullWidth
            sx={{ mt: 2, borderRadius: '10px', backgroundColor: '#f9f9f9' }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <StyledButton
            onClick={() => setOpenDialog(false)}
            sx={{ background: '#B0BEC5', '&:hover': { background: '#90A4AE' } }}
          >
            Hủy
          </StyledButton>
          <StyledButton
            onClick={handleAddTransaction}
            sx={{ background: '#FF5722', '&:hover': { background: '#E64A19' } }}
          >
            Lưu
          </StyledButton>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
};

export default Reports;