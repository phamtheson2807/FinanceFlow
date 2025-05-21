import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Typography } from '@mui/material';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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

    if (!stripe || !elements) {
      setError('Stripe chưa sẵn sàng.');
      setLoading(false);
      return;
    }

    try {
      // Gọi backend để tạo paymentIntent
      const { data } = await axiosInstance.post('/api/stripe/create-payment-intent', { plan });
      const clientSecret = data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message || 'Thanh toán thất bại');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Gọi backend để cập nhật subscription
        await axiosInstance.post('/api/subscription/activate', { plan });
        onSuccess();
        onClose();
      }
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