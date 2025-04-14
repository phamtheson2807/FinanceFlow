const User = require('../models/User');

const LIMITS = {
  free: {
    transactions: 50,
    categories: 10,
    reports: 5,
    // Thêm các giới hạn khác cho gói free
  },
  premium: {
    transactions: 1000,
    categories: 50,
    reports: 20,
  },
  pro: {
    transactions: Infinity,
    categories: Infinity,
    reports: Infinity,
  }
};

const checkLimit = (limitType) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const plan = user.plan || 'free';
    const limit = LIMITS[plan][limitType];

    // Kiểm tra giới hạn dựa trên loại
    switch (limitType) {
      case 'transactions':
        if (user.transactionCount >= limit) {
          return res.status(403).json({
            message: `Bạn đã đạt giới hạn ${limit} giao dịch của gói ${plan}. Nâng cấp để có thêm giao dịch?`,
            limit: limit,
            current: user.transactionCount,
            needUpgrade: true
          });
        }
        break;
      // Thêm các case khác tùy theo loại giới hạn
    }
    next();
  } catch (error) {
    console.error('❌ Lỗi kiểm tra giới hạn:', error);
    next();
  }
};

module.exports = { checkLimit, LIMITS };