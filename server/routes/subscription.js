const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const User = require('../models/User'); // Thêm model User
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Không có token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Decoded user:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Lỗi authMiddleware:', error.message, error.stack);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Lấy thông tin subscription
router.get('/', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: new mongoose.Types.ObjectId(req.user.id) });
    if (!subscription) return res.status(200).json({ plan: 'free' });
    res.status(200).json({
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy subscription:', error.message, error.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin subscription' });
  }
});

// Nâng cấp gói subscription qua Stripe
router.post('/upgrade', authMiddleware, async (req, res) => {
  const { plan, paymentMethodId } = req.body;
  console.log('📡 Nhận yêu cầu upgrade:', { plan, paymentMethodId });

  // Chỉ cho phép nâng cấp lên gói "pro"
  if (plan !== 'pro') {
    return res.status(400).json({ message: 'Gói không hợp lệ. Chỉ hỗ trợ nâng cấp lên "pro"' });
  }

  if (!paymentMethodId) {
    return res.status(400).json({ message: 'Thiếu paymentMethodId' });
  }

  try {
    // Chuyển đổi userId thành ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log('🔍 User ID (ObjectId):', userId);

    let subscription = await Subscription.findOne({ userId });
    let customer;

    // Tạo hoặc lấy customer từ Stripe
    if (subscription && subscription.stripeCustomerId) {
      try {
        customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
        console.log('🔍 Customer hiện có:', customer.id);
      } catch (error) {
        console.error('❌ Customer không tồn tại, tạo customer mới:', error.message);
        customer = await stripe.customers.create({
          email: req.user.email || 'default@example.com',
          metadata: { userId: req.user.id },
        });
        console.log('✅ Tạo customer mới:', customer.id);
        subscription.stripeCustomerId = customer.id;
      }
    } else {
      customer = await stripe.customers.create({
        email: req.user.email || 'default@example.com',
        metadata: { userId: req.user.id },
      });
      console.log('✅ Tạo customer mới:', customer.id);
    }

    // Gắn payment method vào customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    console.log('✅ Đã gắn payment method:', paymentMethodId);

    // Sử dụng priceId của gói "pro" duy nhất
    const priceId = 'price_1R6SKtJ0EYLbnLTicD7AMwRk';
    console.log('📦 Price ID:', priceId);

    // Tạo subscription trên Stripe
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      payment_behavior: 'allow_incomplete',
    });
    console.log('✅ Tạo subscription trên Stripe:', stripeSubscription.id);

    // Cập nhật hoặc tạo mới subscription trong database
    if (subscription) {
      subscription.plan = plan;
      subscription.status = 'active';
      subscription.stripeCustomerId = customer.id;
      subscription.stripeSubscriptionId = stripeSubscription.id;
    } else {
      subscription = new Subscription({
        userId,
        plan,
        status: 'active',
        stripeCustomerId: customer.id,
        stripeSubscriptionId: stripeSubscription.id,
        startDate: new Date(),
      });
    }

    await subscription.save();
    console.log('✅ Lưu subscription vào DB:', subscription._id);

    // Cập nhật plan trong users
    const user = await User.findById(userId);
    if (user) {
      user.plan = plan;
      await user.save();
      console.log('✅ Đã cập nhật plan trong users:', { userId: user._id, plan: user.plan });
    } else {
      console.warn('⚠ Không tìm thấy user để cập nhật plan:', userId);
    }

    res.status(200).json({
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      stripeSubscriptionId: stripeSubscription.id,
    });
  } catch (error) {
    console.error('❌ Lỗi khi nâng cấp subscription:', error.message, error.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi nâng cấp subscription: ' + error.message });
  }
});

// Hủy subscription
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log('📡 Nhận yêu cầu hủy subscription từ user:', userId);

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ message: 'Không tìm thấy subscription' });
    }

    // Hủy subscription trên Stripe
    if (subscription.stripeSubscriptionId) {
      const stripeSubscription = await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      console.log('✅ Đã hủy subscription trên Stripe:', stripeSubscription.id);
    }

    // Cập nhật trạng thái subscription trong database
    subscription.status = 'cancelled';
    subscription.endDate = new Date();
    await subscription.save();
    console.log('✅ Đã cập nhật subscription trong DB:', subscription._id);

    // Cập nhật plan trong users về free
    const user = await User.findById(userId);
    if (user) {
      user.plan = 'free';
      await user.save();
      console.log('✅ Đã cập nhật plan trong users về free:', { userId: user._id, plan: user.plan });
    } else {
      console.warn('⚠ Không tìm thấy user để cập nhật plan:', userId);
    }

    res.status(200).json({ message: 'Hủy subscription thành công', plan: 'free' });
  } catch (error) {
    console.error('❌ Lỗi khi hủy subscription:', error.message, error.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi hủy subscription: ' + error.message });
  }
});

// Tạo PaymentIntent cho thanh toán một lần (nếu dùng Stripe Elements)
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  const { plan } = req.body;
  let amount = 0;
  // Chỉ cho phép gói "pro"
  if (plan === 'pro') amount = 1000 * 20; // $20
  else return res.status(400).json({ message: 'Gói không hợp lệ. Chỉ hỗ trợ thanh toán cho gói "pro"' });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId: req.user.id, plan },
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo PaymentIntent', error: error.message });
  }
});

module.exports = router;