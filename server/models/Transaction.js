const mongoose = require('mongoose');
const Category = require('./Categories');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc'],
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Loại giao dịch là bắt buộc'],
  },
  amount: {
    type: Number,
    required: [true, 'Số tiền là bắt buộc'],
    min: [0, 'Số tiền không thể âm'],
    validate: {
      validator: Number.isFinite,
      message: 'Số tiền phải là một số hợp lệ',
    },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories',
    required: [true, 'Danh mục là bắt buộc'],
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'],
  },
  date: {
    type: Date,
    required: [true, 'Ngày giao dịch là bắt buộc'],
    validate: {
      validator: function (v) {
        return v <= new Date();
      },
      message: 'Ngày giao dịch không được nằm trong tương lai',
    },
  },
  paymentMethod: {
    type: String,
    enum: ['Tiền mặt', 'Ngân hàng', 'Thẻ tín dụng', 'Chuyển khoản', 'Ví', 'Khác'],
    default: 'Tiền mặt',
    required: [true, 'Phương thức thanh toán là bắt buộc'],
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'canceled'],
    default: 'completed',
    required: [true, 'Trạng thái là bắt buộc'],
  },
  attachments: [{
    type: String,
    validate: {
      validator: function (v) {
        return typeof v === 'string' && v.trim().length > 0;
      },
      message: 'Đính kèm phải là một chuỗi hợp lệ',
    },
  }],
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Ghi chú không được vượt quá 1000 ký tự'],
  },
}, {
  timestamps: true,
});

// Middleware cập nhật `updatedAt` khi sửa đổi
TransactionSchema.pre('updateOne', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

TransactionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Thêm index để tối ưu hóa tìm kiếm theo user và date
TransactionSchema.index({ user: 1, date: -1 });

// Middleware kiểm tra danh mục
TransactionSchema.pre('save', async function (next) {
  try {
    const category = await Category.findById(this.category);
    if (!category) {
      return next(new Error('Danh mục không hợp lệ.'));
    }
    if (category.type !== this.type) {
      return next(new Error(`Danh mục "${category.name}" phải là ${category.type}.`));
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);