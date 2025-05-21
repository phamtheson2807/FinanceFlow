const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { 
      type: String, 
      required: true,
      trim: true // Tự động loại bỏ khoảng trắng
    },
    type: { type: String, enum: ['income', 'expense'], required: true },
    color: { type: String, default: '#000' },
    icon: { type: String, default: '📂' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categories', categoriesSchema);