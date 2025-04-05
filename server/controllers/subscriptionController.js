// backend/controllers/subscriptionController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');

exports.createSubscription = async (req, res) => {
  const { userId, plan, paymentMethodId } = req.body;

  try {
    // Tạo Stripe Customer
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: req.user.email, // Lấy từ JWT
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Tạo Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan === 'premium' ? process.env.STRIPE_PREMIUM_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Lưu vào MongoDB
    const newSubscription = new Subscription({
      userId,
      plan,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      status: 'pending',
      startDate: new Date(),
    });
    await newSubscription.save();

    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Lỗi khi tạo subscription:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo subscription' });
  }
};