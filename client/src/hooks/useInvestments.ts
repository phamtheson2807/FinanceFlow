import { useState, useEffect } from 'react';
import axios from 'axios';

export interface MarketItem {
    _id: string;
    name: string;
    currentPrice: number;
    previousPrice: number;
    change: number;
    volume: number;
    lastUpdated: string;
}

export const useInvestments = () => {
    const [marketData, setMarketData] = useState<MarketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/investments/market');
                setMarketData(response.data);
            } catch (err) {
                setError('Không thể tải dữ liệu thị trường');
                console.error('Error fetching market data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
    }, []);

    return { marketData, loading, error };
};