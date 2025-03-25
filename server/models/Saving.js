const mongoose = require('mongoose');

const SavingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true, // Loại bỏ khoảng trắng thừa
  },
  target_amount: {
    type: Number,
    required: true,
    min: 0, // Đảm bảo số tiền không âm
  },
  current_amount: {
    type: Number,
    default: 0, // Mặc định là 0 nếu không có giá trị
    min: 0, // Không cho phép âm
  },
  target_date: {
    type: Date,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Đảm bảo index cho user_id để tìm kiếm nhanh hơn
SavingSchema.index({ user_id: 1 });

module.exports = mongoose.model('Saving', SavingSchema);