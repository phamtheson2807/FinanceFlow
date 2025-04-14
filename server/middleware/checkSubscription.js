const Subscription = require('../models/Subscription');

const checkSubscription = async (req, res, next) => {
  try {
    // Force console log
    process.stdout.write('\n=== CHECK SUBSCRIPTION MIDDLEWARE ===\n');
    process.stdout.write(`Request User: ${JSON.stringify(req.user, null, 2)}\n`);
    
    const currentPlan = (req.user?.plan || '').toLowerCase();

    process.stdout.write(`Current Plan: ${currentPlan}\n`);
    process.stdout.write(`Is Pro Plan: ${currentPlan === 'pro'}\n`);

    if (currentPlan !== 'pro') {
      process.stdout.write('❌ Không phải gói Pro. Truy cập bị từ chối\n');
      return res.status(403).json({
        message: 'Tính năng xu hướng chi tiêu chỉ dành cho gói Pro. Vui lòng nâng cấp!'
      });
    }

    process.stdout.write('✅ Pro plan xác thực thành công\n');
    process.stdout.write('================================\n');
    next();
  } catch (error) {
    process.stdout.write(`❌ Error in checkSubscription: ${error.message}\n`);
    res.status(500).json({ message: 'Lỗi server khi kiểm tra quyền truy cập' });
  }
};

module.exports = checkSubscription;
