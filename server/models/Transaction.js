const mongoose = require('mongoose');

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
    min: [0, 'Số tiền không thể âm'], // Đảm bảo giá trị không âm với thông điệp lỗi rõ ràng
    validate: {
      validator: Number.isFinite, // Đảm bảo là số hợp lệ (không phải NaN, Infinity, v.v.)
      message: 'Số tiền phải là một số hợp lệ',
    },
  },
  category: {
    type: String,
    required: [true, 'Danh mục là bắt buộc'],
    trim: true, // Loại bỏ khoảng trắng thừa
    validate: {
      validator: function (v) {
        return v.length > 0; // Đảm bảo danh mục không chỉ là khoảng trắng
      },
      message: 'Danh mục không được để trống',
    },
  },
  description: {
    type: String,
    default: '', // Mô tả mặc định là chuỗi rỗng
    trim: true, // Loại bỏ khoảng trắng thừa
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự'], // Giới hạn độ dài mô tả
  },
  date: {
    type: Date,
    required: [true, 'Ngày giao dịch là bắt buộc'],
    validate: {
      validator: function (v) {
        return v <= new Date(); // Đảm bảo ngày không nằm trong tương lai
      },
      message: 'Ngày giao dịch không được nằm trong tương lai',
    },
  },
  paymentMethod: {
    type: String,
    enum: ['Tiền mặt', 'Ngân hàng', 'Thẻ tín dụng', 'Chuyển khoản', 'Khác'],
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
    type: String, // URL hoặc đường dẫn đến file đính kèm
    validate: {
      validator: function (v) {
        return typeof v === 'string' && v.trim().length > 0; // Đảm bảo là chuỗi hợp lệ
      },
      message: 'Đính kèm phải là một chuỗi hợp lệ',
    },
  }],
  notes: {
    type: String,
    default: '',
    trim: true, // Loại bỏ khoảng trắng thừa
    maxlength: [1000, 'Ghi chú không được vượt quá 1000 ký tự'], // Giới hạn độ dài ghi chú
  },
}, {
  timestamps: true, // Tự động thêm `createdAt` và `updatedAt`
});

// Middleware cập nhật `updatedAt` khi sửa đổi
TransactionSchema.pre('updateOne', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Middleware cập nhật `updatedAt` cho các phương thức update khác
TransactionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Thêm index để tối ưu hóa tìm kiếm theo user và date
TransactionSchema.index({ user: 1, date: -1 });

// Thêm validate cấp document để kiểm tra logic giữa type và category (nếu cần)
TransactionSchema.pre('save', async function (next) {
  const incomeCategories = ['Lương', 'Thưởng']; // Giả định danh mục thu nhập
  if (incomeCategories.includes(this.category) && this.type !== 'income') {
    throw new Error('Danh mục "Lương" hoặc "Thưởng" phải là thu nhập (income).');
  }
  if (!incomeCategories.includes(this.category) && this.type !== 'expense') {
    throw new Error('Danh mục này phải là chi tiêu (expense).');
  }
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);