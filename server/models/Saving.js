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
    trim: true,
    validate: {
      validator: async function (value) {
        const count = await mongoose.model('Saving').countDocuments({
          user_id: this.user_id,
          name: value,
          _id: { $ne: this._id },
          deleted_at: null,
        });
        return count === 0;
      },
      message: 'Tên quỹ đã tồn tại cho người dùng này',
    },
  },
  target_amount: {
    type: Number,
    required: true,
    min: [0, 'Số tiền mục tiêu không được âm'],
  },
  current_amount: {
    type: Number,
    default: 0,
    min: [0, 'Số tiền hiện tại không được âm'],
  },
  target_date: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Ngày mục tiêu không được nằm trong quá khứ',
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
});

// Cập nhật updated_at trước khi save
SavingSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// Cập nhật updated_at trước khi findOneAndUpdate
SavingSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

// Chỉ lấy các quỹ chưa bị xóa
SavingSchema.pre(['find', 'findOne'], function () {
  this.where({ deleted_at: null });
});

// Hỗ trợ soft delete
SavingSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    doc.deleted_at = new Date();
    await doc.save();
  }
  next();
});

// Index cho tìm kiếm nhanh
SavingSchema.index({ user_id: 1 });
SavingSchema.index({ created_at: -1 });
SavingSchema.index({ updated_at: -1 });
SavingSchema.index({ deleted_at: 1 });

module.exports = mongoose.model('Saving', SavingSchema);