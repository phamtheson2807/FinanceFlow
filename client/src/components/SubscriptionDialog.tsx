import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js'; // ✅ Dùng chuẩn từ Stripe
import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { fetchSubscription } from '../redux/subscriptionSlice';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);


interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  plan: 'premium' | 'pro';
}

interface PriceConfig {
  monthly: number;
  yearly: number;
}

interface Prices {
  premium: PriceConfig;
  pro: PriceConfig;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ open, onClose, plan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [billingDetails, setBillingDetails] = useState({
    fullName: '',
    country: 'Vietnam',
    address: '',
    postalCode: '',
  });

  const prices: Prices = {
    premium: { monthly: 10, yearly: 100 },
    pro: { monthly: 20, yearly: 200 },
  };

  const currentPrice = prices[plan][billingCycle];

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingDetails({ ...billingDetails, [e.target.name]: e.target.value });
  };

  const handleUpgrade = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe chưa sẵn sàng.');
      setLoading(false);
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setError('Vui lòng nhập đầy đủ thông tin thẻ.');
      setLoading(false);
      return;
    }

    try {
      const { paymentMethod, error: paymentError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: billingDetails.fullName,
          address: {
            country: billingDetails.country,
            line1: billingDetails.address,
            postal_code: billingDetails.postalCode,
          },
        },
      });

      if (paymentError) {
        setError(paymentError.message || 'Lỗi khi tạo payment method.');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/subscription/upgrade',
        { plan, paymentMethodId: paymentMethod?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Nâng cấp thành công!');
      dispatch(fetchSubscription());
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi nâng cấp.');
      console.error('❌ Lỗi nâng cấp:', err.response || err);
    }

    setLoading(false);
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#9e2146' },
    },
  };

  return (
    <Dialog open={open} onClose={onClose} sx={{ '& .MuiPaper-root': { borderRadius: '16px', maxWidth: '800px' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Nâng cấp lên {plan}
      </DialogTitle>
      <DialogContent>
        {/* Body giữ nguyên, có thể render biểu mẫu thẻ và thông tin người dùng tại đây */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#757575' }} disabled={loading}>
          Hủy
        </Button>
      </DialogActions>
      <form id="payment-form" onSubmit={handleUpgrade} style={{ display: 'none' }} />
    </Dialog>
  );
};

const WrappedSubscriptionDialog = (props: SubscriptionDialogProps) => (
  <Elements stripe={stripePromise}>
    <SubscriptionDialog {...props} />
  </Elements>
);

export default WrappedSubscriptionDialog;
