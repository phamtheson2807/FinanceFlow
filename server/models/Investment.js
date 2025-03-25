const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Thêm index để tìm kiếm theo user_id nhanh hơn
  },
  name: {
    type: String,
    required: true,
    trim: true, // Loại bỏ khoảng trắng thừa
  },
  type: {
    type: String,
    required: true,
    enum: ['stock', 'crypto', 'realestate', 'bonds', 'savings', 'other'], // Giới hạn giá trị hợp lệ
  },
  initialAmount: {
    type: Number,
    required: true,
    min: 0, // Không cho phép âm
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0, // Không cho phép âm
  },
  expectedReturn: {
    type: Number,
    default: 0,
    min: 0, // Không cho phép âm
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0, // Không cho phép âm, dành cho crypto
    required: function () {
      return this.type === 'crypto'; // Bắt buộc nếu là crypto
    },
  },
  history: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      type: {
        type: String,
        enum: ['deposit', 'withdraw', 'profit', 'loss'],
        required: true,
      },
      _id: false, // Tắt _id tự động trong subdocument để gọn dữ liệu
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware để cập nhật updatedAt trước khi save
investmentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index để tối ưu truy vấn
investmentSchema.index({ user_id: 1, type: 1 });

module.exports = mongoose.model('Investment', investmentSchema);