import { useState, useEffect } from 'react';
import axios from 'axios';

interface TransactionReport {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export const useTransactionReport = () => {
    const [report, setReport] = useState<TransactionReport>({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/reports/transactions');
                setReport(response.data);
            } catch (err) {
                setError('Không thể tải báo cáo giao dịch');
                console.error('Error fetching transaction report:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    return { report, loading, error };
};