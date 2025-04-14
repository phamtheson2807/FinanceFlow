import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Transaction, User } from '../../types/transaction.types';

// Remove the local Transaction interface since it's imported
interface TransactionTableProps {
    transactions: Transaction[];
    onDelete: (transactionId: string) => void;
    onUpdate: (transaction: Transaction) => void;
}

const HEADERS = [
    'Người dùng',
    'Số tiền',
    'Danh mục',
    'Loại',
    'Ngày',
    'Mô tả',
    'Vi phạm',
    'Hành động',
];

const SORT_KEYS: (keyof Transaction)[] = [
    'user', // Sắp xếp theo tên người dùng (user.name)
    'amount',
    'category',
    'type',
    'date',
    'description',
    'description', // Vi phạm không sắp xếp được, giữ nguyên như mô tả
    'description',
];

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete, onUpdate }) => {
    const [orderBy, setOrderBy] = useState<keyof Transaction>('date');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedUser, setSelectedUser] = useState<string | null>(null); // Lọc theo tên người dùng
    const [searchTerm, setSearchTerm] = useState<string>(''); // Tìm kiếm
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(null); // Trạng thái để chỉnh sửa giao dịch

    useEffect(() => {
        console.log('Transactions received:', transactions);
    }, [transactions]);

    // Lấy danh sách người dùng duy nhất, xử lý khi transactions rỗng
    const uniqueUsers = useMemo(() => {
        const safeTransactions = transactions || []; // Đảm bảo transactions luôn là mảng
        const users = safeTransactions
            .map((t) => {
                if (!t.user) return 'Không xác định';
                return t.user.name || t.user.email || t.user._id || 'Không xác định';
            })
            .filter((name): name is string => name !== null && name !== undefined);
        return Array.from(new Set(users));
    }, [transactions]);

    const handleSort = (property: keyof Transaction) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Lọc và sắp xếp giao dịch, xử lý khi transactions rỗng
    const filteredTransactions = useMemo(() => {
        const safeTransactions = transactions || []; // Đảm bảo transactions luôn là mảng
        return safeTransactions
            .filter((transaction) => {
                const userDisplay = transaction.user
                    ? (transaction.user.name || transaction.user.email || transaction.user._id || 'Không xác định')
                    : 'Không xác định';
                const matchesUser = selectedUser ? userDisplay === selectedUser : true;
                const matchesSearch = searchTerm
                    ? (transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                      (transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                      (userDisplay.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      String(transaction.amount).includes(searchTerm) ||
                      (transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                      (transaction.date?.includes(searchTerm) || false)
                    : true;
                return matchesUser && matchesSearch;
            })
            .sort((a, b) => {
                let valueA, valueB;
                if (orderBy === 'user') {
                    valueA = a.user ? (a.user.name || a.user.email || a.user._id || '') : '';
                    valueB = b.user ? (b.user.name || b.user.email || b.user._id || '') : '';
                } else if (orderBy === 'amount') {
                    valueA = a.amount;
                    valueB = b.amount;
                } else if (orderBy === 'date') {
                    valueA = new Date(a.date).getTime();
                    valueB = new Date(b.date).getTime();
                } else {
                    valueA = a[orderBy] ? (typeof a[orderBy] === 'string' ? a[orderBy] : '') : '';
                    valueB = b[orderBy] ? (typeof b[orderBy] === 'string' ? b[orderBy] : '') : '';
                }

                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return order === 'asc' ? valueA - valueB : valueB - valueA;
                }
                return order === 'asc'
                    ? String(valueA).localeCompare(String(valueB))
                    : String(valueB).localeCompare(String(valueA));
            });
    }, [transactions, selectedUser, searchTerm, orderBy, order]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN');

    const getUserDisplay = (user: User | null) => {
        if (!user) {
            return 'Không xác định';
        }
        return user.name || user.email || user._id || 'Không xác định';
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSelectedUser(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#e9f0f7', p: 2, borderRadius: 1 }}>
                <Select
                    value={selectedUser || ''}
                    onChange={(e) => setSelectedUser(e.target.value as string)}
                    displayEmpty
                    sx={{ minWidth: 150 }}
                    renderValue={(value) => value || 'Tất cả người dùng'}
                >
                    <MenuItem value="">Tất cả người dùng</MenuItem>
                    {uniqueUsers.map((user) => (
                        <MenuItem key={user} value={user}>
                            {user}
                        </MenuItem>
                    ))}
                </Select>
                <TextField
                    variant="outlined"
                    placeholder="Tìm kiếm giao dịch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Typography>🔍</Typography>
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClearSearch} size="small">
                                    <Typography>✕</Typography>
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleClearSearch}
                    sx={{ bgcolor: '#1976d2', color: 'white' }}
                >
                    Xem tất cả
                </Button>
            </Box>

            <TableContainer
                component={Paper}
                sx={{
                    bgcolor: '#f5f7fa',
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: '1px solid #e0e0e0',
                    maxHeight: { xs: 400, sm: 600 },
                    overflow: 'auto',
                }}
            >
                <Table stickyHeader aria-label="bảng giao dịch">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f0f2f5', borderBottom: '2px solid #e0e0e0' }}>
                            {HEADERS.map((header, index) => (
                                <TableCell
                                    key={header}
                                    sx={{
                                        color: '#333',
                                        fontWeight: 'bold',
                                        fontFamily: 'Poppins, sans-serif',
                                        bgcolor: '#f0f2f5',
                                        borderRight: '1px solid #e0e0e0',
                                        '&:last-child': { borderRight: 'none' },
                                    }}
                                >
                                    <TableSortLabel
                                        active={orderBy === SORT_KEYS[index]}
                                        direction={orderBy === SORT_KEYS[index] ? order : 'asc'}
                                        onClick={() => handleSort(SORT_KEYS[index])}
                                        sx={{
                                            color: '#333',
                                            '&:hover': { color: '#000' },
                                            '&.Mui-active': { color: '#000' },
                                        }}
                                    >
                                        {header}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction, rowIndex) => (
                                <TableRow
                                    key={transaction._id}
                                    sx={{
                                        bgcolor: rowIndex % 2 === 0 ? 'white' : '#fafbff',
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                >
                                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif', color: '#333', padding: '8px' }}>
                                        {getUserDisplay(transaction.user)}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: transaction.type === 'income' ? '#2e7d32' : '#d32f2f',
                                            padding: '8px',
                                        }}
                                    >
                                        {formatCurrency(transaction.amount)}
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif', color: '#666', padding: '8px' }}>
                                        {transaction.category}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontFamily: 'Poppins, sans-serif',
                                            color: transaction.type === 'income' ? '#2e7d32' : '#d32f2f',
                                            padding: '8px',
                                        }}
                                    >
                                        {transaction.type === 'income' ? 'Thu' : 'Chi'}
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif', color: '#666', padding: '8px' }}>
                                        {formatDate(transaction.date)}
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif', color: '#666', padding: '8px' }}>
                                        {transaction.description || '-'}
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif', color: '#666', padding: '8px' }}>
                                        {transaction.isViolating ? (
                                            <Typography color="error">Có</Typography>
                                        ) : (
                                            'Không'
                                        )}
                                    </TableCell>
                                    <TableCell align="center" sx={{ padding: '8px' }}>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => setEditTransaction(transaction)}
                                                sx={{ p: 0.5 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => onDelete(transaction._id)}
                                                sx={{ p: 0.5, '& .MuiSvgIcon-root': { color: '#d32f2f' } }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Typography variant="h6" color="textSecondary" sx={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>
                                            Không có dữ liệu giao dịch
                                        </Typography>
                                    </motion.div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {editTransaction && (
                <Dialog
                    open={!!editTransaction}
                    onClose={() => setEditTransaction(null)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#1E3A8A' }}>
                        Cập nhật giao dịch
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                        <TextField
                            fullWidth
                            label="Tên người dùng"
                            value={editTransaction.user?.name || ''}
                            onChange={(e) => {
                                const updatedUser = editTransaction.user
                                    ? { ...editTransaction.user, name: e.target.value }
                                    : { name: e.target.value, email: '', _id: '' };
                                setEditTransaction({
                                    ...editTransaction,
                                    user: updatedUser as User,
                                });
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Email người dùng"
                            value={editTransaction.user?.email || ''}
                            onChange={(e) => {
                                const updatedUser = editTransaction.user
                                    ? { ...editTransaction.user, email: e.target.value }
                                    : { name: '', email: e.target.value, _id: '' };
                                setEditTransaction({
                                    ...editTransaction,
                                    user: updatedUser as User,
                                });
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="ID người dùng"
                            value={editTransaction.user?._id || ''}
                            disabled // Chỉ hiển thị, không cho phép chỉnh sửa
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Số tiền"
                            type="number"
                            value={editTransaction.amount}
                            onChange={(e) => setEditTransaction({ ...editTransaction, amount: Number(e.target.value) })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Danh mục"
                            value={editTransaction.category}
                            onChange={(e) => setEditTransaction({ ...editTransaction, category: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <Select
                            fullWidth
                            value={editTransaction.type}
                            onChange={(e) => setEditTransaction({ ...editTransaction, type: e.target.value as 'income' | 'expense' })}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="income">Thu</MenuItem>
                            <MenuItem value="expense">Chi</MenuItem>
                        </Select>
                        <TextField
                            fullWidth
                            label="Ngày"
                            type="date"
                            value={editTransaction.date.slice(0, 10)}
                            onChange={(e) => setEditTransaction({ ...editTransaction, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Mô tả"
                            value={editTransaction.description}
                            onChange={(e) => setEditTransaction({ ...editTransaction, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditTransaction(null)} sx={{ color: '#777' }}>
                            Hủy
                        </Button>
                        <Button
                            onClick={() => {
                                if (editTransaction) {
                                    onUpdate(editTransaction);
                                    setEditTransaction(null);
                                }
                            }}
                            variant="contained"
                            color="primary"
                        >
                            Lưu
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </motion.div>
    );
};

export default TransactionTable;