const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    color: { type: String, default: '#000' },
    icon: { type: String, default: '📂' },
  },
  { timestamps: true } // Thêm timestamps để tự động tạo createdAt và updatedAt
);

module.exports = mongoose.model('Categories', categoriesSchema); // Sửa typo "categorieesSchema" thành "categoriesSchema"