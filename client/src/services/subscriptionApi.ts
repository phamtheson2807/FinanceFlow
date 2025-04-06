// src/services/subscriptionApi.ts
import axios from 'axios';
import config from '../config';

const API_URL = `${config.apiUrl}/subscription`;

export const getSubscriptionStatus = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createSubscription = async (plan: string, paymentMethodId: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/create-subscription`,
    { plan, paymentMethodId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};