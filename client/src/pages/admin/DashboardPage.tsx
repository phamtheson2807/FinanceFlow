import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Chart from '../../components/common/Chart';

interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
}

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

const DashboardPage = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: 'Xin chào! Tôi là chatbot hỗ trợ. Bạn cần hỏi gì về trang này?', sender: 'bot' },
  ]);
  const [userInput, setUserInput] = useState('');

  // Thay bằng API key của bạn
  const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Đặt key OpenAI của bạn vào đây

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token không tồn tại');
        const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('❌ Lỗi khi lấy thống kê dashboard:', error);
        setError('Không thể tải thống kê. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  // Xử lý gửi tin nhắn và gọi API OpenAI
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = { text: userInput, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // Hoặc gpt-4 nếu bạn có quyền truy cập
          messages: [
            { role: 'system', content: 'Bạn là chatbot hỗ trợ cho trang Bảng Điều Khiển Admin. Trả lời dựa trên thông tin: Tổng người dùng, giao dịch, thu nhập, chi tiêu.' },
            { role: 'user', content: `Dữ liệu hiện tại: Tổng người dùng: ${stats?.totalUsers}, Tổng giao dịch: ${stats?.totalTransactions}, Tổng thu nhập: ${stats?.totalIncome}, Tổng chi tiêu: ${stats?.totalExpense}. Câu hỏi: ${userInput}` },
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const botResponse = response.data.choices[0].message.content.trim();
      setMessages((prev) => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('❌ Lỗi khi gọi API OpenAI:', error);
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.error?.message
        ? error.response.data.error.message
        : 'Không thể liên kết với chatbot. Vui lòng thử lại.';
      setMessages((prev) => [...prev, { text: errorMessage, sender: 'bot' }]);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#f0f4f8', minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
      {error && (
        <Typography sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>{error}</Typography>
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            color: '#1E3A8A',
            textShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          Bảng Điều Khiển Admin
        </Typography>
      </motion.div>

      <Grid container spacing={4}>
        {[
          { label: 'Tổng người dùng', value: stats?.totalUsers, color: 'primary' },
          { label: 'Tổng giao dịch', value: stats?.totalTransactions, color: 'success' },
          { label: 'Tổng thu nhập', value: stats?.totalIncome, color: 'info' },
          { label: 'Tổng chi tiêu', value: stats?.totalExpense, color: 'error' },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card
                elevation={0}
                sx={{
                  bgcolor: (theme.palette[item.color as keyof typeof theme.palette] as { main: string }).main,
                  color: 'white',
                  borderRadius: 2,
                  p: 2,
                  height: '100%',
                  '&:hover': { transform: 'scale(1.05)', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', mt: 1 }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.value || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}

        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card
              elevation={0}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                p: 3,
                height: '100%',
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}
                >
                  Thống kê tài chính hệ thống
                </Typography>
                <Chart
                  data={{
                    labels: ['Thu nhập', 'Chi tiêu'],
                    datasets: [
                      {
                        label: 'Tài chính',
                        data: [stats?.totalIncome || 0, stats?.totalExpense || 0],
                        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top', labels: { font: { family: 'Poppins, sans-serif' } } },
                      title: { display: true, text: 'Thống kê tài chính', font: { family: 'Poppins, sans-serif', weight: 'bold' } },
                    },
                    scales: {
                      y: { beginAtZero: true, title: { display: true, text: 'Số tiền (VND)', font: { family: 'Poppins, sans-serif' } } },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Chatbot cố định */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: { xs: '90vw', sm: 350 },
          height: 400,
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            p: 1.5,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff' }}
          >
            Hỗ trợ Chatbot
          </Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            bgcolor: '#fafafa',
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Typography
                sx={{
                  bgcolor: msg.sender === 'user' ? theme.palette.primary.main : theme.palette.grey[200],
                  color: msg.sender === 'user' ? '#fff' : theme.palette.text.primary,
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: '80%',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.9rem',
                }}
              >
                {msg.text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#fff' }}>
          <TextField
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            fullWidth
            placeholder="Nhập câu hỏi của bạn..."
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f5f5f5',
                '& fieldset': { borderColor: theme.palette.grey[300] },
              },
            }}
          />
          <IconButton onClick={handleSendMessage} sx={{ ml: 1, color: theme.palette.primary.main }}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;