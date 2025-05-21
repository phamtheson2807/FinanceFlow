import {
    Box,
    Card,
    CardContent,
    Snackbar,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const FinancialStatistics = () => {
    const [statistics, setStatistics] = useState({ income: 0, expense: 0 });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const fetchStatistics = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/statistics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatistics(response.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            showSnackbar('Không thể tải thống kê', 'error');
        }
    }, [showSnackbar]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Thống kê tài chính
            </Typography>
            <Card>
                <CardContent>
                    <Typography variant="h6">Tổng thu: {statistics.income} VND</Typography>
                    <Typography variant="h6">Tổng chi: {statistics.expense} VND</Typography>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </Box>
    );
};

export default FinancialStatistics; 