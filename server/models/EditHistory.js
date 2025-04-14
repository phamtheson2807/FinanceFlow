const mongoose = require('mongoose');

const editHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  field: {
    type: String,
    required: true,
  },
  oldValue: {
    type: String,
    required: false, // 🛠 đổi từ true → false
    default: '',      // ✅ thêm default để tránh null
  },
  newValue: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('EditHistory', editHistorySchema);
