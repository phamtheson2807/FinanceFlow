import { Box, Card, Grid, Typography } from '@mui/material';
import { useSavings } from '../../hooks/useSavings';

const SavingsAccounts = () => {
    const { accounts, loading, error } = useSavings();

    if (loading) return <Typography>Đang tải...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Tài khoản tiết kiệm
            </Typography>
            <Grid container spacing={2}>
                {accounts.map((account) => (
                    <Grid item xs={12} sm={6} md={4} key={account._id}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">{account.name}</Typography>
                            <Typography variant="h4" color="primary">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(account.balance)}
                            </Typography>
                            <Typography color="textSecondary">
                                Lãi suất: {account.interestRate}%
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default SavingsAccounts;