import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface StripeCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  plan: 'premium' | 'pro';
  onSuccess: () => void;
}

const StripeCheckoutDialog = ({ open, onClose, plan, onSuccess }: StripeCheckoutDialogProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Gọi backend để tạo Stripe Checkout Session
      const token = localStorage.getItem('token');
      const { data } = await axiosInstance.post(
        '/api/subscription/create-checkout-session',
        { plan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = data.url; // Redirect sang Stripe Checkout
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Thanh toán với Stripe</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <CardElement options={{ hidePostalCode: true }} />
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={onClose} disabled={loading}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={loading || !stripe}>
              {loading ? <CircularProgress size={24} /> : 'Thanh toán'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StripeCheckoutDialog;