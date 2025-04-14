import axiosInstance from '../utils/axiosInstance';
import { Transaction } from '../types/transaction.types';

export const TransactionService = {
    getAll: async () => {
        const response = await axiosInstance.get('/api/transactions');
        return response.data;
    },

    create: async (data: Omit<Transaction, '_id'>) => {
        const response = await axiosInstance.post('/api/transactions', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Transaction>) => {
        const response = await axiosInstance.put(`/api/transactions/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(`/api/transactions/${id}`);
        return response.data;
    }
};