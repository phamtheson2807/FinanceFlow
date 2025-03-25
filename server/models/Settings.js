const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  language: {
    type: String,
    enum: ['vi', 'en'],
    default: 'vi'
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  showBalance: {
    type: Boolean,
    default: true
  },
  currency: {
    type: String,
    enum: ['VND', 'USD'],
    default: 'VND'
  },
  aiFinancialManagement: { // Đảm bảo có trường này
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);