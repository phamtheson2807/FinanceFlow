import { Box, Card, Grid, Typography } from '@mui/material';
import { useTransactionReport } from '../../hooks/useTransactionReport';

const TransactionReport = () => {
    const { report, loading } = useTransactionReport();

    if (loading) return <Typography>Đang tải...</Typography>;

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Báo cáo giao dịch
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6">Tổng thu</Typography>
                        <Typography variant="h4" color="success.main">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.totalIncome)}
                        </Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6">Tổng chi</Typography>
                        <Typography variant="h4" color="error.main">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.totalExpense)}
                        </Typography>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TransactionReport;