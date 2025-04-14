import { Box, Button, Card, CardContent, CircularProgress, MenuItem, Select, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { connectBank, deleteBankAccount, getBankTransactions, getLinkedAccounts } from '../../services/bankApi';

const BankIntegration: React.FC = () => {
  const [bankName, setBankName] = useState('Giả lập MB Bank');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    const data = await getLinkedAccounts();
    setAccounts(data);
    setLoading(false);
  };

  const handleConnect = async () => {
    await connectBank(bankName);
    fetchAccounts();
  };

  const handleSelectAccount = async (id: string) => {
    setSelectedAccount(id);
    const tx = await getBankTransactions(id);
    setTransactions(tx);
  };

  const handleDelete = async (id: string) => {
    await deleteBankAccount(id);
    fetchAccounts();
    if (selectedAccount === id) {
      setSelectedAccount(null);
      setTransactions([]);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  return (
    <Box p={3}>
      <Typography variant="h5">Tích hợp ngân hàng (Giả lập)</Typography>
      <Box mt={2}>
        <Select value={bankName} onChange={(e) => setBankName(e.target.value)} sx={{ mr: 2 }}>
          <MenuItem value="Giả lập MB Bank">Giả lập MB Bank</MenuItem>
          <MenuItem value="Giả lập Vietcombank">Giả lập Vietcombank</MenuItem>
          <MenuItem value="Giả lập BIDV">Giả lập BIDV</MenuItem>
        </Select>
        <Button variant="contained" onClick={handleConnect}>Liên kết</Button>
      </Box>

      {loading ? <CircularProgress /> : accounts.map((acc) => (
        <Card key={acc._id} sx={{ my: 2 }}>
          <CardContent>
            <Typography>{acc.bankName}</Typography>
            <Typography>Số tài khoản: {acc.accountNumber}</Typography>
            <Typography>Số dư: {acc.balance.toLocaleString()} đ</Typography>
            <Button size="small" onClick={() => handleSelectAccount(acc._id)}>Xem giao dịch</Button>
            <Button size="small" color="error" onClick={() => handleDelete(acc._id)}>Huỷ liên kết</Button>
          </CardContent>
        </Card>
      ))}

      {transactions.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6">Giao dịch</Typography>
          {transactions.map((tx, idx) => (
            <Typography key={idx}>{tx.date.slice(0, 10)} - {tx.description} - {tx.amount.toLocaleString()} đ ({tx.type})</Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BankIntegration;
