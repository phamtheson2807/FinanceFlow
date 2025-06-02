import {
    Analytics,
    Psychology,
    Savings,
    Send as SendIcon,
    TrendingUp
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import geminiService from '../../services/geminiService';
import axiosInstance from '../../utils/axiosInstance';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FinancialContext {
  transactions: any[];
  savings: any[];
  investments: any[];
  budget: any;
}

const AIAdvisor: React.FC = () => {
  // const theme = useTheme(); // Đã comment hoặc xóa do không sử dụng
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là AI Tư vấn tài chính của FinanceFlow. Tôi có thể giúp bạn:\n\n1. Phân tích chi tiêu và đưa ra gợi ý tối ưu\n2. Đề xuất kế hoạch tiết kiệm phù hợp\n3. Tư vấn chiến lược đầu tư\n4. Giải đáp các thắc mắc về tài chính\n\nBạn cần hỗ trợ gì?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<FinancialContext>({
    transactions: [],
    savings: [],
    investments: [],
    budget: null
  });

  const features = [
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#3B82F6' }} />,
      title: 'Phân tích chi tiêu',
      description: 'Phân tích chi tiết thói quen chi tiêu và đưa ra gợi ý tối ưu',
      path: '/dashboard/ai-advisor/spending-analysis'
    },
    {
      icon: <Savings sx={{ fontSize: 40, color: '#10B981' }} />,
      title: 'Gợi ý tiết kiệm',
      description: 'Đề xuất kế hoạch tiết kiệm phù hợp với mục tiêu của bạn',
      path: '/dashboard/ai-advisor/savings-suggestions'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#F59E0B' }} />,
      title: 'Tư vấn đầu tư',
      description: 'Tư vấn chiến lược đầu tư dựa trên mục tiêu và mức độ rủi ro',
      path: '/dashboard/ai-advisor/investment-advice'
    }
  ];

  // Fetch financial data
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const [transactionsRes, savingsRes, investmentsRes, budgetRes] = await Promise.all([
          axiosInstance.get('/api/transactions').catch(err => ({ data: { transactions: [] } })),
          axiosInstance.get('/api/savings').catch(err => ({ data: [] })),
          axiosInstance.get('/api/investments').catch(err => ({ data: [] })),
          axiosInstance.get('/api/budgets').catch(err => ({ data: null }))
        ]);

        setContext({
          transactions: transactionsRes.data.transactions || [],
          savings: savingsRes.data || [],
          investments: investmentsRes.data || [],
          budget: budgetRes.data || null
        });
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setContext({
          transactions: [],
          savings: [],
          investments: [],
          budget: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await geminiService.generateFinancialAdvice(context, input);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI Response Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: error.message || 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <Typography key={index} variant="body1" sx={{ mb: 1 }}>
        {line}
      </Typography>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Tính năng chính */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #3B82F6, #2563EB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 4
              }}
            >
              AI Tư vấn Tài chính
            </Typography>

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                        }
                      }}
                      onClick={() => navigate(feature.path)}
                    >
                      <CardContent>
                        <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                        <Typography variant="h6" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Grid>

        {/* Chat với AI */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              height: '600px',
              display: 'flex',
              flexDirection: 'column',
              background: '#1C1C3D'
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '420px', pr: 1 }}>
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        maxWidth: '70%'
                      }}
                    >
                      {message.role === 'assistant' && (
                        <Avatar
                          sx={{
                            bgcolor: '#A78BFA',
                            mr: 1,
                            width: 32,
                            height: 32
                          }}
                        >
                          <Psychology fontSize="small" />
                        </Avatar>
                      )}
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: message.role === 'user' ? '#A78BFA' : '#2A2A4A',
                          color: message.role === 'user' ? 'white' : '#A1A1AA',
                          borderRadius: 3,
                          borderTopRightRadius: message.role === 'user' ? 0 : 3,
                          borderTopLeftRadius: message.role === 'assistant' ? 0 : 3,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {formatMessage(message.content)}
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : 'rgba(161,161,170,0.7)'
                          }}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Paper>
                      {message.role === 'user' && (
                        <Avatar
                          sx={{
                            ml: 1,
                            width: 32,
                            height: 32,
                            bgcolor: '#A78BFA'
                          }}
                        >
                          U
                        </Avatar>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Nhập câu hỏi của bạn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  multiline
                  maxRows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      background: '#2A2A4A',
                      color: '#FFFFFF',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.1)'
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.2)'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#A78BFA'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#FFFFFF'
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  sx={{
                    borderRadius: 3,
                    minWidth: 100,
                    bgcolor: '#A78BFA',
                    '&:hover': {
                      bgcolor: '#8B5CF6'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    <SendIcon />
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AIAdvisor; 