import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import jsPDF from 'jspdf';
import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

// Đăng ký các thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Reports = () => {
  const [overview, setOverview] = useState({ income: 0, expenses: 0, balance: 0 });
  const [monthlyData, setMonthlyData] = useState({ labels: [], income: [], expenses: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], expenses: [] });
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [rawData, setRawData] = useState({}); // Lưu dữ liệu thô từ API

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/financial-statistics', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Giả sử mày lưu token trong localStorage
          },
        });
        const data = await res.json();
        setRawData(data);

        // Tổng quan
        setOverview({
          income: data.totalIncome || 0,
          expenses: data.totalExpense || 0,
          balance: (data.totalIncome || 0) - (data.totalExpense || 0),
        });

        // Dữ liệu theo tháng
        const monthlyLabels = data.monthlyStats.map((stat) => `Tháng ${stat._id.month}/${stat._id.year}`);
        const monthlyIncome = data.monthlyStats.map((stat) => stat.income);
        const monthlyExpenses = data.monthlyStats.map((stat) => stat.expense);
        setMonthlyData({
          labels: monthlyLabels,
          income: monthlyIncome,
          expenses: monthlyExpenses,
        });

        // Dữ liệu theo danh mục (chỉ lấy chi tiêu)
        const expenseCategories = data.categoryStats.filter((cat) => cat.totalAmount > 0); // Loại bỏ danh mục không có chi tiêu
        setCategoryData({
          labels: expenseCategories.map((cat) => cat._id),
          expenses: expenseCategories.map((cat) => cat.totalAmount),
        });
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ API:', error);
      }
    };

    fetchReports();
  }, []); // Chỉ gọi một lần khi mount

  // Lọc dữ liệu theo timeRange
  useEffect(() => {
    if (!rawData.monthlyStats) return;

    let filteredMonthly = rawData.monthlyStats;
    const currentDate = new Date();
    
    if (timeRange === 'day') {
      // Lọc theo ngày (giả sử cần thêm logic date trong Transaction, hiện tại chưa hỗ trợ)
      filteredMonthly = rawData.monthlyStats.slice(-1); // Lấy tháng gần nhất làm ví dụ
    } else if (timeRange === 'year') {
      filteredMonthly = rawData.monthlyStats.filter(
        (stat) => stat._id.year === currentDate.getFullYear()
      );
    } // 'month' sẽ giữ nguyên toàn bộ dữ liệu

    setMonthlyData({
      labels: filteredMonthly.map((stat) => `Tháng ${stat._id.month}/${stat._id.year}`),
      income: filteredMonthly.map((stat) => stat.income),
      expenses: filteredMonthly.map((stat) => stat.expense),
    });
  }, [timeRange, rawData]);

  // Lọc dữ liệu theo danh mục
  useEffect(() => {
    if (!rawData.categoryStats) return;

    const filteredCategories = selectedCategory
      ? rawData.categoryStats.filter((cat) => cat._id === selectedCategory)
      : rawData.categoryStats.filter((cat) => cat.totalAmount > 0); // Chỉ lấy chi tiêu

    setCategoryData({
      labels: filteredCategories.map((cat) => cat._id),
      expenses: filteredCategories.map((cat) => cat.totalAmount),
    });
  }, [selectedCategory, rawData]);

  // Dữ liệu cho biểu đồ tổng quan thu - chi
  const overviewChartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Thu nhập',
        data: monthlyData.income,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Chi tiêu',
        data: monthlyData.expenses,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  // Dữ liệu cho biểu đồ tỷ lệ chi tiêu theo danh mục
  const categoryChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.expenses,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  // Hàm xuất báo cáo Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Tổng thu nhập': overview.income, 'Tổng chi tiêu': overview.expenses, 'Số dư': overview.balance },
      ...monthlyData.labels.map((label, index) => ({
        'Thời gian': label,
        'Thu nhập': monthlyData.income[index],
        'Chi tiêu': monthlyData.expenses[index],
      })),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');
    XLSX.writeFile(wb, 'Bao_cao_tai_chinh.xlsx');
  };

  // Hàm xuất báo cáo PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Báo cáo Tài chính', 10, 10);
    doc.text(`Tổng thu nhập: ${overview.income.toLocaleString()} VND`, 10, 20);
    doc.text(`Tổng chi tiêu: ${overview.expenses.toLocaleString()} VND`, 10, 30);
    doc.text(`Số dư: ${overview.balance.toLocaleString()} VND`, 10, 40);
    doc.save('Bao_cao_tai_chinh.pdf');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Báo cáo
      </Typography>

      {/* 5.1 Báo cáo tổng quan */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tổng quan</Typography>
            <Typography>Tổng thu nhập: {overview.income.toLocaleString()} VND</Typography>
            <Typography>Tổng chi tiêu: {overview.expenses.toLocaleString()} VND</Typography>
            <Typography>Số dư: {overview.balance.toLocaleString()} VND</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Biểu đồ thu - chi</Typography>
            <Bar data={overviewChartData} options={{ responsive: true }} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tỷ lệ chi tiêu theo danh mục</Typography>
            <Pie data={categoryChartData} options={{ responsive: true }} />
          </Paper>
        </Grid>
      </Grid>

      {/* 5.2 Báo cáo theo thời gian */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Báo cáo theo thời gian
        </Typography>
        <FormControl sx={{ minWidth: 120, mb: 2 }}>
          <InputLabel>Khoảng thời gian</InputLabel>
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <MenuItem value="day">Ngày</MenuItem>
            <MenuItem value="month">Tháng</MenuItem>
            <MenuItem value="year">Năm</MenuItem>
          </Select>
        </FormControl>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Xu hướng thu nhập và chi tiêu</Typography>
          <Bar data={overviewChartData} options={{ responsive: true }} />
          <Typography>Tổng thu nhập: {overview.income.toLocaleString()} VND</Typography>
          <Typography>Tổng chi tiêu: {overview.expenses.toLocaleString()} VND</Typography>
          <Typography>Số dư: {overview.balance.toLocaleString()} VND</Typography>
        </Paper>
      </Box>

      {/* 5.3 Báo cáo theo danh mục */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Báo cáo theo danh mục
        </Typography>
        <FormControl sx={{ minWidth: 120, mb: 2 }}>
          <InputLabel>Danh mục</InputLabel>
          <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            {rawData.categoryStats?.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat._id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Chi tiêu theo danh mục</Typography>
          <Pie data={categoryChartData} options={{ responsive: true }} />
        </Paper>
      </Box>

      {/* 5.4 Xuất báo cáo */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Xuất báo cáo
        </Typography>
        <Button variant="contained" color="primary" onClick={exportToExcel} sx={{ mr: 2 }}>
          Xuất Excel
        </Button>
        <Button variant="contained" color="secondary" onClick={exportToPDF}>
          Xuất PDF
        </Button>
      </Box>
    </Box>
  );
};

export default Reports;