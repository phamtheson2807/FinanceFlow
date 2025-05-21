const Subscription = require('../models/Subscription');

/**
 * Check subscription middleware - controls access to features based on user's subscription plan
 * @param {Array<string>} requiredPlans - An array of plans that can access the feature ['free', 'premium', 'pro']
 * @param {string} featureName - Name of the feature being accessed (for error message)
 */
const checkSubscription = (requiredPlans = ['premium', 'pro'], featureName = 'Tính năng này') => async (req, res, next) => {
  try {
    // Force console log
    process.stdout.write('\n=== CHECK SUBSCRIPTION MIDDLEWARE ===\n');
    process.stdout.write(`Request User: ${JSON.stringify(req.user, null, 2)}\n`);
    
    const currentPlan = (req.user?.plan || 'free').toLowerCase();
    process.stdout.write(`Current Plan: ${currentPlan}\n`);
    process.stdout.write(`Required Plans: ${JSON.stringify(requiredPlans)}\n`);
    
    // Check if the user's plan is included in the requiredPlans array
    if (!requiredPlans.includes(currentPlan)) {
      process.stdout.write(`❌ Plan ${currentPlan} không được phép. Truy cập bị từ chối\n`);
      return res.status(403).json({
        message: `${featureName} chỉ dành cho gói ${requiredPlans.join(' hoặc ')}. Vui lòng nâng cấp!`,
        requiredPlans: requiredPlans
      });
    }

    process.stdout.write(`✅ ${currentPlan} plan xác thực thành công\n`);
    process.stdout.write('================================\n');
    next();
  } catch (error) {
    process.stdout.write(`❌ Error in checkSubscription: ${error.message}\n`);
    res.status(500).json({ message: 'Lỗi server khi kiểm tra quyền truy cập' });
  }
};

module.exports = checkSubscription;
