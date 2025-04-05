import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';

export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  async () => {
    const response = await axiosInstance.get('/api/subscription');
    return response.data;
  }
);

interface SubscriptionState {
  plan: 'free' | 'premium' | 'pro' | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plan: null,
  status: null,
  startDate: null,
  endDate: null,
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.plan = action.payload.plan;
        state.status = action.payload.status || 'pending';
        state.startDate = action.payload.startDate || null;
        state.endDate = action.payload.endDate || null;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Có lỗi xảy ra';
      });
  },
});

export default subscriptionSlice.reducer;