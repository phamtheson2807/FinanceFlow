const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  contact: { type: String, required: true }, // Email hoặc số điện thoại
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);