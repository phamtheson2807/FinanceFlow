const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  plan: { type: String, default: 'free', enum: ['free', 'premium', 'pro'] },
  balance: { type: Number, default: 0 }, // Trường balance đã có
  avatar: { type: String, default: '' }, // Thêm trường avatar, mặc định là chuỗi rỗng
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware để cập nhật trường updatedAt khi có thay đổi
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);