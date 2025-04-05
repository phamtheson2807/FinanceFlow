import { Box, Typography } from '@mui/material';
import { useTransactions } from '../../hooks/useTransactions';
import { Transaction } from '../../types/transaction.types'; // Update import path
import TransactionTable from './TransactionTable';

const TransactionList = () => {
    const { 
        transactions, 
        loading, 
        error, 
        deleteTransaction, 
        updateTransaction 
    } = useTransactions();

    const handleUpdate = async (transaction: Transaction) => {
        try {
            const { _id, ...updateData } = transaction;
            await updateTransaction(_id, updateData);
        } catch (error) {
            console.error('Failed to update transaction:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTransaction(id);
        } catch (error) {
            console.error('Failed to delete transaction:', error);
        }
    };

    if (loading) return <Typography>Đang tải...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Danh sách giao dịch
            </Typography>
            <TransactionTable 
                transactions={transactions}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
            />
        </Box>
    );
};

export default TransactionList;