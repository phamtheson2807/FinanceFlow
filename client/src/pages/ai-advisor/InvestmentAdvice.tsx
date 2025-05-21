import { TrendingUp } from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Typography
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

const ReactMarkdownWrapper = ReactMarkdown as any;

const InvestmentAdvice: React.FC = () => {
  // const theme = useTheme(); // Removed unused theme variable
  const [loading, setLoading] = useState(true);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Removed unused states: transactions, investments
  // const [transactions, setTransactions] = useState<any[]>([]);
  // const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDataAndAdvise = async () => { // Renamed function for clarity
      try {
        setLoading(true);
        // Fetch financial data
        const [transactionsRes, investmentsRes] = await Promise.all([
          axiosInstance.get('/api/transactions').catch(err => ({ data: { transactions: [] } })),
          axiosInstance.get('/api/investments').catch(err => ({ data: [] }))
        ]);

        // Directly use fetched data without setting to state
        const fetchedTransactions = transactionsRes.data.transactions || [];
        const fetchedInvestments = investmentsRes.data || [];

        // setTransactions(fetchedTransactions); // No longer needed
        // setInvestments(fetchedInvestments); // No longer needed

        if (fetchedTransactions.length > 0) {
          // Generate AI investment advice
          const aiAdvice = await geminiService.generateFinancialAdvice(
            { transactions: fetchedTransactions, savings: [], investments: fetchedInvestments, budget: null },
            'Dựa trên lịch sử giao dịch và đầu tư của tôi, hãy đưa ra tư vấn đầu tư chi tiết bao gồm:\n1. Phân tích danh mục đầu tư hiện tại\n2. Đề xuất các cơ hội đầu tư mới\n3. Chiến lược phân bổ tài sản\n4. Mức độ rủi ro và cách quản lý rủi ro'
          );
          setAdvice(aiAdvice);
        } else {
          setAdvice('Không có đủ dữ liệu giao dịch để tạo tư vấn đầu tư.');
        }
      } catch (error: any) {
        console.error('Error:', error);
        setError(error.message || 'Không thể tải dữ liệu tư vấn');
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndAdvise(); // Call the renamed function
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
        <ReactMarkdownWrapper children={content || ''} />
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
          Tư Vấn Đầu Tư
        </Typography>

        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          background: '#1C1C3D'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ fontSize: 32, color: '#A78BFA', mr: 2 }} />
              <Typography variant="h6" sx={{ color: '#FFFFFF' }}>Tư Vấn Đầu Tư Thông Minh</Typography>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress sx={{ color: '#A78BFA' }} />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Box sx={{ color: '#A1A1AA', maxHeight: 350, overflowY: 'auto' }}>
                {formatMessage(advice) || 'Chưa có dữ liệu tư vấn'}
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default InvestmentAdvice; 