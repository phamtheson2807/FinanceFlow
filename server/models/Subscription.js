const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  status: { type: String, enum: ['active', 'canceled', 'pending'], default: 'pending' },
  startDate: { type: Date },
  endDate: { type: Date },
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);