import { useState, useEffect } from 'react';
import axios from 'axios';

interface TrendData {
    date: string;
    income: number;
    expense: number;
}

export const useTrends = () => {
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/reports/trends');
                setTrends(response.data);
            } catch (err) {
                setError('Không thể tải dữ liệu xu hướng');
                console.error('Error fetching trends:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, []);

    return { trends, loading, error };
};