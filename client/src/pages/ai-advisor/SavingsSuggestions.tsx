import { Savings } from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Typography,
    useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import geminiService from '../../services/geminiService';
import axiosInstance from '../../utils/axiosInstance';

const markdownStyles = {
  heading1: {
    color: '#A78BFA',
    fontWeight: 700,
    marginTop: '24px',
    marginBottom: '16px',
    fontSize: '1.5rem'
  },
  heading2: {
    color: '#A78BFA',
    fontWeight: 600,
    marginTop: '24px',
    marginBottom: '16px',
    fontSize: '1.2rem'
  },
  heading3: {
    color: '#A78BFA',
    fontWeight: 600,
    marginTop: '16px',
    marginBottom: '8px',
    fontSize: '1.1rem'
  },
  paragraph: {
    color: '#A1A1AA',
    marginBottom: '8px',
    lineHeight: 1.7
  },
  listItem: {
    color: '#A1A1AA',
    marginBottom: '6px',
    fontSize: '1rem',
    marginLeft: '16px'
  },
  strong: {
    color: '#A78BFA',
    fontWeight: 600
  }
} as const;

const SavingsSuggestions: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [savings, setSavings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch financial data
        const [transactionsRes, savingsRes] = await Promise.all([
          axiosInstance.get('/api/transactions').catch(err => ({ data: { transactions: [] } })),
          axiosInstance.get('/api/savings').catch(err => ({ data: [] }))
        ]);

        const transactions = transactionsRes.data.transactions || [];
        const savings = savingsRes.data || [];

        setTransactions(transactions);
        setSavings(savings);

        if (transactions.length > 0) {
          // Generate AI savings suggestions
          const aiSuggestions = await geminiService.generateFinancialAdvice(
            { transactions, savings, investments: [], budget: null },
            'Dựa trên lịch sử giao dịch và tiết kiệm của tôi, hãy đưa ra các gợi ý tiết kiệm chi tiết bao gồm:\n1. Phân tích thói quen chi tiêu hiện tại\n2. Đề xuất các khoản có thể cắt giảm\n3. Kế hoạch tiết kiệm phù hợp\n4. Các mục tiêu tiết kiệm ngắn và dài hạn'
          );
          setSuggestions(aiSuggestions);
        }
      } catch (error: any) {
        console.error('Error:', error);
        setError(error.message || 'Không thể tải dữ liệu gợi ý');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatMessage = (content: string | null) => {
    if (!content) return null;
    return (
      <Box className="markdown-content">
        <style>
          {`
            .markdown-content h1 { 
              color: ${markdownStyles.heading1.color};
              font-weight: ${markdownStyles.heading1.fontWeight};
              margin-top: ${markdownStyles.heading1.marginTop};
              margin-bottom: ${markdownStyles.heading1.marginBottom};
              font-size: ${markdownStyles.heading1.fontSize};
            }
            .markdown-content h2 {
              color: ${markdownStyles.heading2.color};
              font-weight: ${markdownStyles.heading2.fontWeight};
              margin-top: ${markdownStyles.heading2.marginTop};
              margin-bottom: ${markdownStyles.heading2.marginBottom};
              font-size: ${markdownStyles.heading2.fontSize};
            }
            .markdown-content h3 {
              color: ${markdownStyles.heading3.color};
              font-weight: ${markdownStyles.heading3.fontWeight};
              margin-top: ${markdownStyles.heading3.marginTop};
              margin-bottom: ${markdownStyles.heading3.marginBottom};
              font-size: ${markdownStyles.heading3.fontSize};
            }
            .markdown-content p {
              color: ${markdownStyles.paragraph.color};
              margin-bottom: ${markdownStyles.paragraph.marginBottom};
              line-height: ${markdownStyles.paragraph.lineHeight};
            }
            .markdown-content li {
              color: ${markdownStyles.listItem.color};
              margin-bottom: ${markdownStyles.listItem.marginBottom};
              font-size: ${markdownStyles.listItem.fontSize};
              margin-left: ${markdownStyles.listItem.marginLeft};
            }
            .markdown-content strong {
              color: ${markdownStyles.strong.color};
              font-weight: ${markdownStyles.strong.fontWeight};
            }
          `}
        </style>
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            background: 'linear-gradient(45deg, #A78BFA, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Gợi Ý Tiết Kiệm
        </Typography>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          background: '#1C1C3D'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Savings sx={{ fontSize: 32, color: '#A78BFA', mr: 2 }} />
              <Typography variant="h6" sx={{ color: '#FFFFFF' }}>Kế Hoạch Tiết Kiệm Thông Minh</Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress sx={{ color: '#A78BFA' }} />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Box sx={{ color: '#A1A1AA', maxHeight: 350, overflowY: 'auto' }}>
                {formatMessage(suggestions) || 'Chưa có dữ liệu gợi ý'}
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default SavingsSuggestions; 