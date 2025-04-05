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
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { RootState } from '../../redux/store';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Styled components (giữ nguyên)
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

// Interfaces (giữ nguyên)
interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
}

interface ChartData {
  labels: string[];
  income: number[];
  expenses: number[];
}

interface CategoryChartData {
  labels: string[];
  expenses: number[];
}

interface AutoTableHookData {
  cursor: { x: number; y: number };
}

const Reports = () => {
  const navigate = useNavigate();
  const { plan } = useSelector((state: RootState) => state.subscription);
  const [overview, setOverview] = useState({ income: 0, expenses: 0, balance: 0 });
  const [monthlyData, setMonthlyData] = useState<ChartData>({ labels: [], income: [], expenses: [] });
  const [categoryData, setCategoryData] = useState<CategoryChartData>({ labels: [], expenses: [] });
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

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
        const key =
          timeRange === 'day'
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
        backgroundColor: ['#FF6F69', '#67E6DC', '#FFD166', '#6B728E', '#957FEF'],
        borderWidth: 0,
      },
    ],
  };

  // Xuất Excel (giữ nguyên)
  const exportToExcel = () => {
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
  };

  // exportToPDF (đã sửa lỗi cú pháp)
  const exportToPDF = () => {
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
          <Typography sx={{ fontSize: '0.95rem', color: '#67E6DC', lineHeight: '1.8' }}>
            Thu nhập: {overview.income.toLocaleString()} VND
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: '#FF6F69', lineHeight: '1.8' }}>
            Chi tiêu: {overview.expenses.toLocaleString()} VND
          </Typography>
        </StyledPaper>
      </Box>

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
          sx={{
            fontSize: '1.5rem',
            color: '#fff',
            mb: 3,
            fontWeight: 600,
            textShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          Xuất Báo cáo
        </Typography>
        {plan === 'premium' || plan === 'pro' ? (
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
        ) : (
          <Typography sx={{ color: '#fff', fontSize: '1rem' }}>
            Nâng cấp lên gói Premium hoặc Pro để xuất báo cáo!{' '}
            <Button onClick={() => navigate('/pricing')} sx={{ color: '#fff', textDecoration: 'underline' }}>
              Nâng cấp ngay
            </Button>
          </Typography>
        )}
      </Box>

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