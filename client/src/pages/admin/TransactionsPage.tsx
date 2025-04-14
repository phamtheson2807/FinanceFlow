import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme } from '@mui/material';
import Grow from '@mui/material/Grow';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import TransactionTable from '../../components/transactions/TransactionTable';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface Transaction {
    _id: string;
    user: User | null;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
    description: string;
    isViolating?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface Pagination {
    total: number;
    page: number;
    totalPages: number;
}

interface ApiResponse {
    transactions: Transaction[];
    pagination: Pagination;
}

const TransactionsPage = () => {
    const theme = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token không tồn tại');
            const response = await axios.get<ApiResponse>('http://localhost:5000/api/admin/transactions', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data.transactions || []; // Đảm bảo data luôn là mảng, mặc định rỗng nếu undefined
            console.log('Dữ liệu giao dịch từ API:', data);
            setTransactions(data);
        } catch (error) {
            console.error('Lỗi khi tải giao dịch:', error);
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Xử lý lỗi từ response (ví dụ: 401, 403, 500)
                    setError(`Lỗi API: ${error.response.status} - ${error.response.data.message || 'Không thể kết nối đến server'}`);
                } else if (error.request) {
                    // Xử lý lỗi không nhận được response (mạng, server không phản hồi)
                    setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
                } else {
                    // Xử lý lỗi trong quá trình cấu hình request
                    setError('Lỗi khi gửi yêu cầu. Vui lòng thử lại.');
                }
            } else {
                setError('Lỗi không xác định. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async (transactionId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token không tồn tại');
            await axios.delete(`http://localhost:5000/api/admin/transactions/${transactionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(transactions.filter((t) => t._id !== transactionId));
            setDeleteTransactionId(null);
        } catch (error) {
            console.error('Lỗi khi xóa giao dịch:', error);
            setError('Không thể xóa giao dịch. Vui lòng thử lại.');
        }
    };

    const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token không tồn tại');
            const response = await axios.put(`http://localhost:5000/api/admin/transactions/${updatedTransaction._id}`, updatedTransaction, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransactions(transactions.map((t) => 
                t._id === updatedTransaction._id ? response.data : t
            ));
        } catch (error) {
            console.error('Lỗi khi cập nhật giao dịch:', error);
            setError('Không thể cập nhật giao dịch. Vui lòng thử lại.');
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f0f4f8', minHeight: 'calc(100vh - 64px)' }}>
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
                    Quản Lý Giao Dịch
                </Typography>
            </motion.div>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
                    </motion.div>
                </Box>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <TransactionTable
                        transactions={transactions}
                        onDelete={(transactionId: string) => setDeleteTransactionId(transactionId)}
                        onUpdate={handleUpdateTransaction}
                    />
                </motion.div>
            )}

            <Dialog
                open={!!deleteTransactionId}
                onClose={() => setDeleteTransactionId(null)}
                TransitionComponent={Grow}
                transitionDuration={400}
            >
                <DialogTitle
                    sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 'bold',
                        bgcolor: 'rgba(245, 245, 245, 0.95)',
                        color: '#1E3A8A',
                        py: 2,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    }}
                >
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', py: 3, px: 4 }}>
                    <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#555' }}>
                        Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', px: 4, py: 2 }}>
                    <Button
                        onClick={() => setDeleteTransactionId(null)}
                        sx={{
                            fontFamily: 'Poppins, sans-serif',
                            color: '#777',
                            '&:hover': { color: '#1E3A8A' },
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={() => deleteTransactionId && handleDeleteTransaction(deleteTransactionId)}
                        variant="contained"
                        color="error"
                        sx={{
                            fontFamily: 'Poppins, sans-serif',
                            background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                            borderRadius: 3,
                            px: 4,
                            py: 1,
                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                            '&:hover': { background: 'linear-gradient(45deg, #ff5f52, #e64a19)' },
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TransactionsPage;