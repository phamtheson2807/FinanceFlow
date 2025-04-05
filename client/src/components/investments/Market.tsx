import { Box, Card, Grid, Typography } from '@mui/material';
import { useInvestments, MarketItem } from '../../hooks/useInvestments';

const Market = () => {
    const { marketData, loading, error } = useInvestments();

    if (loading) return <Typography>Đang tải...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Thị trường đầu tư
            </Typography>
            <Grid container spacing={2}>
                {marketData.map((item: MarketItem) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">{item.name}</Typography>
                            <Typography variant="h4" color={item.change >= 0 ? 'success.main' : 'error.main'}>
                                {item.change.toFixed(2)}%
                            </Typography>
                            <Typography color="textSecondary">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.currentPrice)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Khối lượng: {item.volume.toLocaleString()}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Market;