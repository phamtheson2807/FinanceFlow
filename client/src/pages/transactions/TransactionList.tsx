import {
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
  Typography,
  Tooltip,
  Alert,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { darkMode } = useThemeContext();
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
          Danh Sách Giao Dịch
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard/transactions/new')}
        >
          Thêm giao dịch
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ bgcolor: darkMode ? '#1a2027' : '#fff' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell align="right">Số tiền</TableCell>
                <TableCell>Thanh toán</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString('vi-VN')}</TableCell>
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
                      {transaction.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                    </Box>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Sửa">
                      <IconButton
                        onClick={() => navigate(`/dashboard/transactions/edit/${transaction._id}`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
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