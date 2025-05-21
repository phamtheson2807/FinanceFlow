import { CloudDownload, InsertDriveFile } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { RootState } from '../../redux/store';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e2a38 0%, #2d3748 100%)' 
    : 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 16px rgba(0,0,0,0.2)' 
    : '0 4px 20px rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 12px 24px rgba(0,0,0,0.3)' 
      : '0 12px 24px rgba(0,0,0,0.1)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5, 3),
  fontSize: '0.95rem',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s ease',
  border: '1px solid rgba(37, 99, 235, 0.1)',
  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 14px rgba(37, 99, 235, 0.2)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #1e2a38 0%, #2d3748 100%)' 
      : 'linear-gradient(135deg, #fff 0%, #f7fafc 100%)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    padding: theme.spacing(2),
  },
}));

const StyledSelect = styled(Select<string>)(({ theme }) => ({
  borderRadius: '12px',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(241, 245, 249, 0.8)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 0.8)'}`,
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(226, 232, 240, 0.8)',
  },
}));

const StyledLabel = styled(InputLabel)(({ theme }) => ({
  fontSize: '0.95rem',
  color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
}));

const StyledLoadingIndicatorContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
}));

const StyledReportsPageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' ? '#121212' : '#f8fafc',
  padding: theme.spacing(2),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
  },
}));

const StyledPageTitle = styled(StyledTypography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.02em',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.8rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
  },
}));

const StyledOverviewContentBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

// Interfaces (giữ nguyên)
interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  categoryDetails?: {
    name: string;
    color: string;
    icon: string;
  };
}

interface ChartData {
  labels: string[];
  income: number[];
  expenses: number[];
}

interface CategoryChartData {
  labels: string[];
  expenses: number[];
  colors: string[];
}

interface AutoTableHookData {
  cursor: { x: number; y: number };
}

// Định nghĩa kiểu cho danh mục màu sắc
type CategoryColorMap = {
  [key: string]: string;
};

// Định nghĩa bảng màu đẹp và dễ phân biệt cho các danh mục
const CATEGORY_COLORS: CategoryColorMap = {
  'Ăn uống': '#FF6B6B',      // Đỏ cam
  'Di chuyển': '#4ECDC4',    // Xanh ngọc
  'Mua sắm': '#45B7D1',      // Xanh dương
  'Giải trí': '#96CEB4',     // Xanh lá nhạt
  'Hóa đơn & Tiện ích': '#FFEEAD', // Vàng nhạt
  'Xăng xe': '#FFD93D',      // Vàng đậm
  'Tiết kiệm': '#6C5CE7',    // Tím
  'Lương': '#A8E6CF',        // Mint
  'Thưởng': '#DCEDC1',       // Xanh lá nhạt
  'Đầu tư': '#FFB6B9',       // Hồng
  'Khác': '#957DAD',         // Tím nhạt
};

// Fallback colors for any categories not in the predefined list
const FALLBACK_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#FFD93D', '#6C5CE7', '#A8E6CF', '#DCEDC1', '#FFB6B9',
  '#957DAD', '#D4A5A5', '#89C4F4', '#F5B7B1', '#82E0AA'
];

const Reports = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { plan } = useSelector((state: RootState) => state.subscription);
  const [overview, setOverview] = useState({ income: 0, expenses: 0, balance: 0 });
  const [monthlyData, setMonthlyData] = useState<ChartData>({ labels: [], income: [], expenses: [] });
  const [categoryData, setCategoryData] = useState<CategoryChartData>({ 
    labels: [], 
    expenses: [], 
    colors: [] 
  });
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    category: 'Ăn uống',
    date: new Date().toISOString().split('T')[0],
  });

  // fetchData (giữ nguyên)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      }

      // Fetch categories first
      const categoriesResponse = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categories = categoriesResponse.data;
      
      // Create a map of category details with predefined colors
      const categoryDetailsMap = categories.reduce((acc: any, cat: any, index: number) => {
        const categoryName = cat.name as string;
        acc[cat._id] = {
          name: categoryName,
          // Use predefined color if available, otherwise use fallback colors
          color: CATEGORY_COLORS[categoryName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
          icon: cat.icon || '📊'
        };
        return acc;
      }, {});

      // Fetch transactions with date range
      const now = new Date();
      let startDate: string | undefined;
      let endDate: string | undefined;

      switch (timeRange) {
        case 'day':
          startDate = now.toISOString().split('T')[0];
          endDate = startDate;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          break;
        case 'year':
          startDate = `${now.getFullYear()}-01-01`;
          endDate = `${now.getFullYear()}-12-31`;
          break;
      }

      const query = new URLSearchParams({
        startDate: startDate!,
        endDate: endDate!,
        limit: '1000',
      }).toString();
      
      const response = await axios.get(`http://localhost:5000/api/transactions?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const transactions: Transaction[] = response.data.transactions.map((t: any) => ({
        ...t,
        categoryDetails: categoryDetailsMap[t.category]
      }));

      setTransactions(transactions);

      // Calculate overview
      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);
      
      const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);

      setOverview({
        income: totalIncome,
        expenses: totalExpense,
        balance: totalIncome - totalExpense,
      });

      // Process monthly data
      const monthlyMap: { [key: string]: { income: number; expense: number } } = {};
      transactions.forEach((t) => {
        const date = new Date(t.date);
        const key = timeRange === 'day'
          ? date.toISOString().split('T')[0]
          : timeRange === 'month'
            ? `${date.getMonth() + 1}/${date.getFullYear()}`
            : `${date.getFullYear()}`;

        if (!monthlyMap[key]) {
          monthlyMap[key] = { income: 0, expense: 0 };
        }
        
        const amount = typeof t.amount === 'number' ? t.amount : 0;
        monthlyMap[key][t.type === 'income' ? 'income' : 'expense'] += amount;
      });

      const labels = Object.keys(monthlyMap).sort();
      const income = labels.map((key) => monthlyMap[key].income);
      const expenses = labels.map((key) => monthlyMap[key].expense);
      setMonthlyData({ labels, income, expenses });

      // Process category data
      const categoryMap: { [key: string]: { amount: number; color: string; name: string } } = {};
      transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          const categoryDetails = categoryDetailsMap[t.category] || {
            name: 'Khác',
            color: CATEGORY_COLORS['Khác'] || FALLBACK_COLORS[FALLBACK_COLORS.length - 1]
          };
          const categoryName = categoryDetails.name;
          
          if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = {
              amount: 0,
              color: categoryDetails.color,
              name: categoryName
            };
          }
          categoryMap[categoryName].amount += t.amount;
        });

      const expenseCategories = Object.values(categoryMap)
        .sort((a, b) => b.amount - a.amount);

      setCategoryData({
        labels: expenseCategories.map((c) => c.name),
        expenses: expenseCategories.map((c) => c.amount),
        colors: expenseCategories.map((c) => c.color)
      });

    } catch (error: unknown) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      if (error instanceof Error) {
        setError(error.message || 'Đã xảy ra lỗi khi tải dữ liệu.');
      } else {
        setError('Đã xảy ra lỗi không xác định khi tải dữ liệu.');
      }
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
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

    const categoryMap: { [key: string]: { amount: number; color: string; name: string } } = {};
    transactions
      .filter((t) => t.type === 'expense' && (!selectedCategory || t.categoryDetails?.name === selectedCategory))
      .forEach((t) => {
        const categoryDetails = t.categoryDetails || {
          name: 'Khác',
          color: CATEGORY_COLORS['Khác'] || FALLBACK_COLORS[FALLBACK_COLORS.length - 1]
        };
        const categoryName = categoryDetails.name;
        
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = {
            amount: 0,
            color: categoryDetails.color,
            name: categoryName
          };
        }
        categoryMap[categoryName].amount += t.amount;
      });

    const filteredCategories = Object.values(categoryMap)
      .sort((a, b) => b.amount - a.amount);

    setCategoryData({
      labels: filteredCategories.map((c) => c.name),
      expenses: filteredCategories.map((c) => c.amount),
      colors: filteredCategories.map((c) => c.color)
    });
  }, [selectedCategory, transactions]);

  // Chart data (giữ nguyên)
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
        backgroundColor: categoryData.colors,
        borderWidth: 0,
      },
    ],
  };

  // Xuất Excel (giữ nguyên)
  const exportToExcel = async () => {
    try {
      // First, check if the user has export permissions
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/reports/export', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.success) {
        alert('Bạn không có quyền xuất báo cáo. Vui lòng nâng cấp gói dịch vụ.');
        return;
      }
      
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ['', '', 'BÁO CÁO TÀI CHÍNH'],
        ['', '', `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`],
        ['', '', ''],
        ['Tổng thu nhập', 'Tổng chi tiêu', 'Số dư'],
        [
          `${overview.income.toLocaleString('vi-VN')} VND`,
          `${overview.expenses.toLocaleString('vi-VN')} VND`,
          `${overview.balance.toLocaleString('vi-VN')} VND`,
        ],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

      if (summarySheet) {
        summarySheet['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        ];
        summarySheet['A1'] = { v: 'BÁO CÁO TÀI CHÍNH', t: 's' };
        summarySheet['A1'].s = {
          font: { bold: true, sz: 16, color: { rgb: 'FF6F69' } },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
        summarySheet['A2'] = { v: `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`, t: 's' };
        summarySheet['A2'].s = {
          font: { sz: 12, color: { rgb: '6B728E' } },
          alignment: { horizontal: 'center' },
        };
        summarySheet['A4'] = { v: 'Tổng thu nhập', t: 's' };
        summarySheet['B4'] = { v: 'Tổng chi tiêu', t: 's' };
        summarySheet['C4'] = { v: 'Số dư', t: 's' };
        summarySheet['A4'].s = {
          font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '2196F3' } },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
          },
          alignment: { horizontal: 'center' },
        };
        summarySheet['B4'].s = { ...summarySheet['A4'].s };
        summarySheet['C4'].s = { ...summarySheet['A4'].s };
        summarySheet['A5'] = { v: `${overview.income.toLocaleString('vi-VN')} VND`, t: 's' };
        summarySheet['B5'] = { v: `${overview.expenses.toLocaleString('vi-VN')} VND`, t: 's' };
        summarySheet['C5'] = { v: `${overview.balance.toLocaleString('vi-VN')} VND`, t: 's' };
        summarySheet['A5'].s = {
          font: { sz: 12, color: { rgb: '67E6DC' } },
          alignment: { horizontal: 'right' },
          border: { bottom: { style: 'thin', color: { rgb: '000000' } } },
        };
        summarySheet['B5'].s = {
          font: { sz: 12, color: { rgb: 'FF6F69' } },
          alignment: { horizontal: 'right' },
          border: { bottom: { style: 'thin', color: { rgb: '000000' } } },
        };
        summarySheet['C5'].s = {
          font: { sz: 12, color: { rgb: '6B728E' } },
          alignment: { horizontal: 'right' },
          border: { bottom: { style: 'thin', color: { rgb: '000000' } } },
        };
        summarySheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];
      }

      const detailData = [
        ['BÁO CÁO CHI TIẾT'],
        [`Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`],
        [''],
        ['Thời gian', 'Thu nhập', 'Chi tiêu', 'Danh mục'],
        ...monthlyData.labels.map((label, index) => [
          label,
          `${monthlyData.income[index].toLocaleString('vi-VN')} VND`,
          `${monthlyData.expenses[index].toLocaleString('vi-VN')} VND`,
          '',
        ]),
        ['', '', '', ''],
        ...categoryData.labels.map((label, index) => [
          '',
          '',
          `${categoryData.expenses[index].toLocaleString('vi-VN')} VND`,
          label,
        ]),
      ];
      const detailSheet = XLSX.utils.aoa_to_sheet(detailData);

      if (detailSheet) {
        detailSheet['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        ];
        detailSheet['A1'] = { v: 'BÁO CÁO CHI TIẾT', t: 's' };
        detailSheet['A1'].s = {
          font: { bold: true, sz: 16, color: { rgb: '67E6DC' } },
          alignment: { horizontal: 'center' },
        };
        detailSheet['A2'] = { v: `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`, t: 's' };
        detailSheet['A2'].s = {
          font: { sz: 12, color: { rgb: '6B728E' } },
          alignment: { horizontal: 'center' },
        };
        detailSheet['A4'] = { v: 'Thời gian', t: 's' };
        detailSheet['B4'] = { v: 'Thu nhập', t: 's' };
        detailSheet['C4'] = { v: 'Chi tiêu', t: 's' };
        detailSheet['D4'] = { v: 'Danh mục', t: 's' };
        detailSheet['A4'].s = {
          font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: 'FF6F69' } },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
          },
          alignment: { horizontal: 'center' },
        };
        detailSheet['B4'].s = { ...detailSheet['A4'].s };
        detailSheet['C4'].s = { ...detailSheet['A4'].s };
        detailSheet['D4'].s = { ...detailSheet['A4'].s };

        for (let row = 5; row <= detailData.length; row++) {
          const rowData = detailData[row - 3] || ['', '', '', ''];
          detailSheet[`A${row}`] = { v: rowData[0], t: 's' };
          detailSheet[`B${row}`] = { v: rowData[1], t: 's' };
          detailSheet[`C${row}`] = { v: rowData[2], t: 's' };
          detailSheet[`D${row}`] = { v: rowData[3], t: 's' };

          detailSheet[`A${row}`].s = {
            font: { sz: 12, color: { rgb: '444444' } },
            alignment: { horizontal: 'left' },
            border: { bottom: { style: 'thin', color: { rgb: 'D3D3D3' } } },
          };
          detailSheet[`B${row}`].s = {
            font: { sz: 12, color: { rgb: '67E6DC' } },
            alignment: { horizontal: 'right' },
            border: { bottom: { style: 'thin', color: { rgb: 'D3D3D3' } } },
          };
          detailSheet[`C${row}`].s = {
            font: { sz: 12, color: { rgb: 'FF6F69' } },
            alignment: { horizontal: 'right' },
            border: { bottom: { style: 'thin', color: { rgb: 'D3D3D3' } } },
          };
          detailSheet[`D${row}`].s = {
            font: { sz: 12, color: { rgb: '6B728E' } },
            alignment: { horizontal: 'left' },
            border: { bottom: { style: 'thin', color: { rgb: 'D3D3D3' } } },
          };
        }

        detailSheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      }

      if (summarySheet) XLSX.utils.book_append_sheet(wb, summarySheet, 'Tổng quan');
      if (detailSheet) XLSX.utils.book_append_sheet(wb, detailSheet, 'Chi tiết');

      if (wb.SheetNames.length === 0) {
        console.error('Workbook is empty - No sheets were added.');
        alert('Không thể xuất file Excel: Workbook rỗng.');
        return;
      }

      XLSX.writeFile(wb, 'Bao_cao_tai_chinh.xlsx');
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        alert('Xuất báo cáo yêu cầu gói Premium hoặc Pro. Vui lòng nâng cấp!');
      } else {
        alert('Đã xảy ra lỗi khi xuất báo cáo. Vui lòng thử lại sau.');
      }
    }
  };

  // exportToPDF (đã sửa lỗi cú pháp)
  const exportToPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    try {
      // Dynamically import jsPDF and autoTable
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      // First, check if the user has export permissions
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/reports/export', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.success) {
        alert('Bạn không có quyền xuất báo cáo. Vui lòng nâng cấp gói dịch vụ.');
        return;
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Báo cáo Tài chính', 105, 15, { align: 'center', charSpace: 0 });

      doc.setFontSize(14);
      doc.setTextColor(33, 150, 243);
      doc.text('Tổng quan', 10, 30);

      let finalY = 35;
      autoTable(doc, {
        startY: finalY,
        head: [['Tổng thu nhập', 'Tổng chi tiêu', 'Số dư']],
        body: [
          [
            `${overview.income.toLocaleString('vi-VN')} VND`,
            `${overview.expenses.toLocaleString('vi-VN')} VND`,
            `${overview.balance.toLocaleString('vi-VN')} VND`,
          ],
        ],
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 10,
          textColor: [40, 40, 40],
          cellPadding: 3,
          halign: 'right',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: [255, 255, 255],
          fontSize: 11,
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'right' },
          1: { halign: 'right' },
          2: { halign: 'right' },
        },
        didDrawPage: (data: AutoTableHookData) => {
          finalY = data.cursor.y;
        },
      });

      doc.setFontSize(14);
      doc.setTextColor(255, 87, 34);
      doc.text('Chi tiết theo thời gian', 10, finalY + 10);

      autoTable(doc, {
        startY: finalY + 15,
        head: [['Thời gian', 'Thu nhập', 'Chi tiêu']],
        body: monthlyData.labels.map((label, index) => [
          label,
          `${monthlyData.income[index].toLocaleString('vi-VN')} VND`,
          `${monthlyData.expenses[index].toLocaleString('vi-VN')} VND`,
        ]),
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 10,
          textColor: [40, 40, 40],
          cellPadding: 3,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [255, 87, 34],
          textColor: [255, 255, 255],
          fontSize: 11,
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'right' },
          2: { halign: 'right' },
        },
        didDrawPage: (data: AutoTableHookData) => {
          finalY = data.cursor.y;
        },
      });

      doc.setFontSize(14);
      doc.setTextColor(107, 114, 142);
      doc.text('Chi tiết theo danh mục', 10, finalY + 10);

      autoTable(doc, {
        startY: finalY + 15,
        head: [['Danh mục', 'Chi tiêu']],
        body: categoryData.labels.map((label, index) => [
          label,
          `${categoryData.expenses[index].toLocaleString('vi-VN')} VND`,
        ]),
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 10,
          textColor: [40, 40, 40],
          cellPadding: 3,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [107, 114, 142],
          textColor: [255, 255, 255],
          fontSize: 11,
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'right' },
        },
        didDrawPage: (data: AutoTableHookData) => {
          finalY = data.cursor.y;
        },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Xuất báo cáo ngày: ${new Date().toLocaleDateString('vi-VN')}`, 10, 287);
        doc.text(`Trang ${i} / ${pageCount}`, 190, 287, { align: 'right' });
      }

      doc.save('Bao_cao_tai_chinh.pdf');
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        alert('Xuất báo cáo yêu cầu gói Premium hoặc Pro. Vui lòng nâng cấp!');
      } else {
        alert('Đã xảy ra lỗi khi xuất báo cáo. Vui lòng thử lại sau.');
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  // handleAddTransaction (giữ nguyên)
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

      fetchData();
      setOpenDialog(false);
    } catch (error: any) {
      console.error('❌ Lỗi khi thêm giao dịch:', error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  if (loading) {
    return (
      <StyledLoadingIndicatorContainer>
        <Typography variant="h5" sx={{ color: '#333', fontWeight: 500 }}>
          Báo cáo Tài chính
        </Typography>
        <Typography sx={{ mt: 2, color: '#666' }}>Đang tải dữ liệu...</Typography>
      </StyledLoadingIndicatorContainer>
    );
  }

  if (error) {
    return (
      <StyledLoadingIndicatorContainer>
        <Typography variant="h5" sx={{ color: '#333', fontWeight: 500 }}>
          Báo cáo Tài chính
        </Typography>
        <Typography sx={{ mt: 2, color: '#FF6F69' }}>{error}</Typography>
      </StyledLoadingIndicatorContainer>
    );
  }

  return (
    // <Layout>
      <StyledReportsPageWrapper>
        <StyledPageTitle variant="h4">
          Báo cáo Tài chính
        </StyledPageTitle>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <StyledTypography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 2 
                }}
              >
                Tổng quan
              </StyledTypography>
              <StyledOverviewContentBox>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StyledTypography>
                    Thu nhập
                  </StyledTypography>
                  <StyledTypography sx={{ fontWeight: 600, color: '#4caf50' }}>
                    {overview.income.toLocaleString()} VND
                  </StyledTypography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StyledTypography>
                    Chi tiêu
                  </StyledTypography>
                  <StyledTypography sx={{ fontWeight: 600, color: '#f44336' }}>
                    {overview.expenses.toLocaleString()} VND
                  </StyledTypography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StyledTypography>
                    Số dư
                  </StyledTypography>
                  <StyledTypography sx={{ fontWeight: 600 }}>
                    {overview.balance.toLocaleString()} VND
                  </StyledTypography>
                </Box>
              </StyledOverviewContentBox>
            </StyledPaper>

            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth>
                <StyledLabel>Khoảng thời gian</StyledLabel>
                <StyledSelect
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as 'day' | 'month' | 'year')}
                >
                  <MenuItem value="day">Ngày</MenuItem>
                  <MenuItem value="month">Tháng</MenuItem>
                  <MenuItem value="year">Năm</MenuItem>
                </StyledSelect>
              </FormControl>
            </Box>

            <StyledPaper sx={{ mt: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3 
              }}>
                <StyledTypography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  Xuất Báo cáo
                </StyledTypography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {plan === 'premium' || plan === 'pro' ? (
                  <>
                    <StyledButton
                      variant="contained"
                      onClick={exportToExcel}
                      startIcon={<InsertDriveFile />}
                      sx={{
                        background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
                        color: '#fff',
                      }}
                    >
                      Xuất Excel
                    </StyledButton>
                    <StyledButton
                      variant="contained"
                      onClick={exportToPDF}
                      startIcon={<CloudDownload />}
                      disabled={isExportingPDF}
                      sx={{
                        background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
                        color: '#fff',
                      }}
                    >
                      {isExportingPDF ? 'Đang xuất PDF...' : 'Xuất PDF'}
                    </StyledButton>
                  </>
                ) : (
                  <StyledButton
                    variant="contained"
                    onClick={() => navigate('/subscription')}
                    sx={{
                      background: `linear-gradient(45deg, #2563eb, #3b82f6)`,
                      color: '#fff',
                    }}
                  >
                    Nâng cấp ngay
                  </StyledButton>
                )}
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={8}>
            <StyledPaper sx={{ height: '400px' }}>
              <StyledTypography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  mb: 2 
                }}
              >
                Biểu đồ Thu - Chi
              </StyledTypography>
              <Box sx={{ height: 'calc(100% - 40px)' }}>
                <Bar
                  data={overviewChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: { size: 12 },
                          color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                        },
                        grid: {
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        }
                      },
                      x: {
                        ticks: {
                          color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                        },
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </Box>
            </StyledPaper>

            <StyledPaper sx={{ mt: 3, height: '400px' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3 
              }}>
                <StyledTypography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  Chi tiêu theo Danh mục
                </StyledTypography>
                <FormControl sx={{ minWidth: 200 }}>
                  <StyledLabel>Danh mục</StyledLabel>
                  <StyledSelect
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {categoryData.labels.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Box>
              <Box sx={{ height: 'calc(100% - 80px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          font: { size: 12 },
                          color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
                        }
                      }
                    }
                  }}
                />
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>

        <StyledDialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle sx={{ fontSize: '1.5rem', color: '#444', textAlign: 'center', fontWeight: 600 }}>
            Thêm Giao dịch Mới
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <StyledLabel>Loại</StyledLabel>
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
              <StyledLabel>Danh mục</StyledLabel>
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
      </StyledReportsPageWrapper>
    // </Layout>
  );
};

export default Reports;