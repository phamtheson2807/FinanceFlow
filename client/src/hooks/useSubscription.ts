import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export const useSubscription = () => {
  const { plan } = useSelector((state: RootState) => state.subscription);

  const hasAccess = (requiredPlan: 'free' | 'premium' | 'pro') => {
    const planOrder: { [key: string]: number } = {
      free: 0,
      premium: 1,
      pro: 2,
    };

    // Đảm bảo plan không phải là null hoặc undefined, mặc định là 'free'
    const currentPlan = plan || 'free';

    // Kiểm tra xem currentPlan có nằm trong planOrder không
    if (!(currentPlan in planOrder)) {
      console.warn(`Gói không hợp lệ: ${currentPlan}, mặc định về 'free'`);
      return planOrder['free'] >= planOrder[requiredPlan];
    }

    return planOrder[currentPlan] >= planOrder[requiredPlan];
  };

  return { plan: plan || 'free', hasAccess };
};