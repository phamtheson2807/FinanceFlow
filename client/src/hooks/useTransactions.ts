import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Transaction } from '../types/transaction.types';

export const useTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/transactions');
      const transactionsData = Array.isArray(response.data) ? response.data : 
                              response.data.transactions || [];
      setTransactions(transactionsData);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      if (error.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(error.response?.data?.message || 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
    if (error.response?.status === 401) {
      navigate('/login');
      throw new Error('Please login to continue');
    }
    throw error;
  };

  const addTransaction = async (transaction: Omit<Transaction, '_id'>) => {
    try {
      const response = await axiosInstance.post('/api/transactions', transaction);
      setTransactions(prev => [...prev, response.data]);
      return response.data;
    } catch (error: any) {
      handleAuthError(error);
      throw new Error(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const response = await axiosInstance.put(`/api/transactions/${id}`, updates);
      setTransactions(prev => 
        prev.map(t => t._id === id ? response.data : t)
      );
      return response.data;
    } catch (error: any) {
      handleAuthError(error);
      throw new Error(error.response?.data?.message || 'Failed to update transaction');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (error: any) {
      handleAuthError(error);
      throw new Error(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [navigate]); // Thêm navigate vào dependency array

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};