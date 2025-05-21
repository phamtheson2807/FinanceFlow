import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormControl,
} from '@mui/material';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { fetchSubscription } from '../redux/subscriptionSlice';
import { EmailOutlined, CreditCard, Person, Public } from '@mui/icons-material';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  plan: 'pro';
}

const countries = [
  { code: 'VN', label: 'Việt Nam' },
  { code: 'US', label: 'Hoa Kỳ' },
  { code: 'JP', label: 'Nhật Bản' },
  { code: 'KR', label: 'Hàn Quốc' },
  // ... thêm quốc gia nếu cần
];

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ open, onClose, plan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('VN');

  const handleUpgrade = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe chưa sẵn sàng.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Vui lòng nhập đầy đủ thông tin thẻ.');
      setLoading(false);
      return;
    }

    try {
      const { paymentMethod, error: paymentError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: fullName,
          email,
          address: { country },
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

      dispatch(fetchSubscription());
      onClose();
      alert('Nâng cấp thành công!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi nâng cấp.');
    }

    setLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
        fontFamily: 'inherit',
      },
      invalid: { color: '#9e2146' },
    },
    hidePostalCode: true,
  };

  return (
    <Dialog open={open} onClose={onClose} sx={{ '& .MuiPaper-root': { borderRadius: '18px', maxWidth: 420, width: '100%' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: 'center', pb: 0 }}>
        Thanh toán nâng cấp Pro
      </DialogTitle>
      <form onSubmit={handleUpgrade} autoComplete="off">
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
            <EmailOutlined sx={{ color: '#1976d2', mr: 1 }} />
            <TextField
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
              type="email"
              autoComplete="email"
              variant="standard"
            />
          </Box>
          <Typography sx={{ fontWeight: 600, mb: 1, mt: 2 }}>Phương thức thanh toán</Typography>
          <Box sx={{ p: 2, border: '1.5px solid #e0e0e0', borderRadius: 2, mb: 2, background: '#fafbfc' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CreditCard sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Thông tin thẻ</Typography>
            </Box>
            <CardElement options={cardElementOptions} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
            <Person sx={{ color: '#1976d2', mr: 1 }} />
            <TextField
              label="Tên chủ thẻ"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              fullWidth
              required
              autoComplete="cc-name"
              variant="standard"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
            <Public sx={{ color: '#1976d2', mr: 1 }} />
            <TextField
              select
              label="Quốc gia hoặc khu vực"
              value={country}
              onChange={e => setCountry(e.target.value)}
              fullWidth
              required
              variant="standard"
            >
              {countries.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {error && (
            <Typography color="error" sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} sx={{ color: '#757575' }} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ minWidth: 120, fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} /> : 'Thanh toán'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const WrappedSubscriptionDialog = (props: SubscriptionDialogProps) => (
  <Elements stripe={stripePromise}>
    <SubscriptionDialog {...props} />
  </Elements>
);

export default WrappedSubscriptionDialog;
