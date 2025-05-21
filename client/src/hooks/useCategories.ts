import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

export interface Category {
  _id: string;
  name: string;
  type: string;
  description?: string;
  icon?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/api/categories');
      setCategories(res.data);
    } catch (err: any) {
      setError('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};