const mongoose = require('mongoose');

const supportSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    messages: [
      {
        _id: { type: String, default: () => Date.now().toString() },
        sender: { type: String, enum: ['user', 'admin'], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // Thêm createdAt và updatedAt
);

module.exports = mongoose.model('SupportSession', supportSessionSchema);