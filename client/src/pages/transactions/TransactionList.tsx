import { Delete, Edit } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';

interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
}

const TransactionList = () => {
  const navigate = useNavigate();
  const { darkMode, formatCurrency } = useThemeContext();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/transactions');
      setTransactions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa giao dịch này?')) return;
    try {
      await axiosInstance.delete(`/api/transactions/${id}`);
      fetchTransactions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa giao dịch');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ color: darkMode ? '#fff' : '#1a237e' }}>
          {t('transactions.title')}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard/transactions/new')}
        >
          {t('transactions.add')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ bgcolor: darkMode ? '#1a2027' : '#fff' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('transactions.date')}</TableCell>
                <TableCell>{t('transactions.type')}</TableCell>
                <TableCell>{t('transactions.category')}</TableCell>
                <TableCell>{t('transactions.description')}</TableCell>
                <TableCell align="right">{t('transactions.amount')}</TableCell>
                <TableCell>{t('transactions.payment_method')}</TableCell>
                <TableCell align="center">{t('transactions.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        bgcolor: transaction.type === 'income' ? '#4caf50' : '#f44336',
                        color: '#fff',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block',
                      }}
                    >
                      {transaction.type === 'income' ? t('transactions.types.income') : t('transactions.types.expense')}
                    </Box>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell align="center">
                    <Tooltip title={t('transactions.edit')}>
                      <IconButton
                        onClick={() => navigate(`/dashboard/transactions/edit/${transaction._id}`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('transactions.delete')}>
                      <IconButton
                        onClick={() => handleDelete(transaction._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default TransactionList;