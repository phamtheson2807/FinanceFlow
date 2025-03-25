const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'user' },
    isVerified: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false }, // Thêm trường isLocked với giá trị mặc định false
    resetPasswordToken: String,   // Token đặt lại mật khẩu
    resetPasswordExpire: Date,    // Hạn sử dụng của token
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);