import axiosInstance from '../utils/axiosInstance';

export const connectBank = async (bankName: string) => {
  const response = await axiosInstance.post('/api/bank/connect', { bankName });
  return response.data;
};

export const getLinkedAccounts = async () => {
  const response = await axiosInstance.get('/api/bank/accounts');
  return response.data;
};

export const getBankTransactions = async (accountId: string) => {
  const response = await axiosInstance.get(`/api/bank/transactions/${accountId}`);
  return response.data.transactions;
};

export const deleteBankAccount = async (id: string) => {
  const response = await axiosInstance.delete(`/api/bank/${id}`);
  return response.data;
};
