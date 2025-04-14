import { useState, useEffect } from 'react';
import axios from 'axios';

interface SavingsAccount {
    _id: string;
    name: string;
    balance: number;
    interestRate: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'terminated';
}

export const useSavings = () => {
    const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/savings/accounts');
                setAccounts(response.data);
            } catch (err) {
                setError('Không thể tải danh sách tài khoản tiết kiệm');
                console.error('Error fetching savings accounts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    return { accounts, loading, error };
};