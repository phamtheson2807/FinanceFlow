import { Box, Card, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useTrends } from '../../hooks/useTrends';

const Trends = () => {
    const { trends, loading } = useTrends();

    if (loading) return <Typography>Đang tải...</Typography>;

    const chartData = {
        labels: trends.map((t: { date: string }) => t.date),
        datasets: [
            {
                label: 'Thu',
                data: trends.map((t: { income: number }) => t.income),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Chi',
                data: trends.map((t: { expense: number }) => t.expense),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Xu hướng thu chi
            </Typography>
            <Card sx={{ p: 2 }}>
                <Line data={chartData} />
            </Card>
        </Box>
    );
};

export default Trends;