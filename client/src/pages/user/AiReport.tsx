import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Chip, Divider, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';

interface AIReporter {
  income: number;
  expense: number;
  savings: { current: number; target: number };
  investment: { total: number; profit: number };
  tips: { suggestion: string; action: string; impact: string }[];
}

const AiReport = () => {
  const [report, setReport] = useState<AIReporter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { darkMode, currency } = useThemeContext();

  const getToken = () => localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : null;

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) throw new Error('Không tìm thấy token');

        const apiUrl = 'http://localhost:5000/api/ai/report';
        console.log('📌 Gọi API:', apiUrl);
        const response = await axios.get(apiUrl, {
          headers: { Authorization: token },
        });

        console.log('📌 Dữ liệu từ GET /api/ai/report:', JSON.stringify(response.data, null, 2));

        if (response.data.tips.length === 0) {
          console.warn('⚠️ Không có gợi ý nào từ AI.');
        }

        setReport(response.data);
        setError(null);
      } catch (error: any) {
        console.error('❌ Lỗi khi lấy báo cáo AI:', error.message, error.response?.status);
        setError(error.response?.data?.message || 'Không thể tải báo cáo AI. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD',
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography sx={{ color: darkMode ? '#FFFFFF' : '#333' }}>Đang tải báo cáo tài chính...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography sx={{ color: darkMode ? '#FFFFFF' : '#DC143C' }}>{error}</Typography>
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography sx={{ color: darkMode ? '#FFFFFF' : '#333' }}>Không có dữ liệu báo cáo.</Typography>
      </Box>
    );
  }

  // Tính toán một số chỉ số tài chính cơ bản
  const savingsRatio = report.income > 0 ? ((report.income - report.expense) / report.income) * 100 : 0;
  const savingsProgress = report.savings.target > 0 ? (report.savings.current / report.savings.target) * 100 : 0;
  const returnOnInvestment = report.investment.total > 0 ? (report.investment.profit / report.investment.total) * 100 : 0;

  return (
    <Box sx={{ p: 3, bgcolor: darkMode ? '#1A2027' : '#FFFFFF', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: darkMode ? '#FFFFFF' : '#333' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1E90FF', mb: 2 }}>
        Phân Tích Tài Chính Cá Nhân
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 2, mb: 4 }}>
        <Box sx={{ p: 2, bgcolor: darkMode ? '#2D3748' : '#F5F7FA', borderRadius: 2, border: `1px solid ${darkMode ? '#4A5568' : '#E6F3FF'}` }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Tổng quan tài chính</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography><strong>Thu nhập:</strong> {formatCurrency(report.income)}</Typography>
          <Typography><strong>Chi tiêu:</strong> {formatCurrency(report.expense)}</Typography>
          <Typography><strong>Tiết kiệm:</strong> {formatCurrency(report.income - report.expense)} ({savingsRatio.toFixed(1)}% thu nhập)</Typography>
        </Box>
        
        <Box sx={{ p: 2, bgcolor: darkMode ? '#2D3748' : '#F5F7FA', borderRadius: 2, border: `1px solid ${darkMode ? '#4A5568' : '#E6F3FF'}` }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Tiết kiệm & Đầu tư</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>
            <strong>Tiết kiệm:</strong> {formatCurrency(report.savings.current)} / {formatCurrency(report.savings.target)} 
            <Chip 
              size="small" 
              label={`${savingsProgress.toFixed(1)}%`} 
              sx={{ ml: 1, bgcolor: savingsProgress > 50 ? '#4CAF50' : '#FF9800', color: 'white' }} 
            />
          </Typography>
          <Typography>
            <strong>Đầu tư:</strong> {formatCurrency(report.investment.total)} 
            <Chip 
              size="small" 
              icon={report.investment.profit >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${report.investment.profit >= 0 ? '+' : ''}${formatCurrency(report.investment.profit)}`} 
              sx={{ 
                ml: 1, 
                bgcolor: report.investment.profit >= 0 ? '#4CAF50' : '#F44336', 
                color: 'white' 
              }} 
            />
          </Typography>
          {report.investment.total > 0 && (
            <Typography>
              <strong>ROI:</strong> {returnOnInvestment.toFixed(2)}%
            </Typography>
          )}
        </Box>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1E90FF', mt: 3, mb: 2, display: 'flex', alignItems: 'center' }}>
        <LightbulbIcon sx={{ mr: 1, color: '#FFD700' }} />
        Gợi ý tài chính cho bạn
      </Typography>
      
      {report.tips && report.tips.length > 0 ? (
        report.tips.map((tip, index) => (
          <Box key={index} sx={{ 
            mb: 2, 
            p: 2, 
            bgcolor: darkMode ? '#2D3748' : '#F5F7FA', 
            borderRadius: 2, 
            border: `1px solid ${darkMode ? '#4A5568' : '#E6F3FF'}`,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }
          }}>
            <Typography sx={{ fontWeight: 'bold', color: darkMode ? '#90CDF4' : '#1E88E5' }}>{tip.suggestion}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography><strong>Hành động:</strong> {tip.action}</Typography>
            <Typography><strong>Tác động:</strong> {tip.impact}</Typography>
          </Box>
        ))
      ) : (
        <Typography sx={{ fontStyle: 'italic', color: '#FF5733' }}>
          ⚠️ AI chưa tạo được gợi ý phù hợp. Vui lòng thử lại sau.
        </Typography>
      )}
    </Box>
  );
};

export default AiReport;
