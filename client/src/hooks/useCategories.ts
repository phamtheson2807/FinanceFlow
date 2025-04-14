import { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
    _id: string;
    name: string;
    type: 'income' | 'expense';
    description?: string;
    icon?: string;
}

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/categories');
                setCategories(response.data);
            } catch (err) {
                setError('Không thể tải danh sách danh mục');
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
};