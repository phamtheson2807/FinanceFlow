const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.header('Authorization') || req.headers['authorization'];
  console.log('📡 Token từ request (Header):', authHeader || 'Không có token');

  try {
    if (!authHeader) {
      console.error('❌ Không tìm thấy header Authorization');
      return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }

    const parts = authHeader.split(' ').filter(part => part.trim() && part.toLowerCase() !== 'bearer');
    const token = parts.length > 0 ? parts[parts.length - 1] : null;
    console.log('📡 Token sau khi xử lý:', token || 'Không có token');

    if (!token) {
      console.error('❌ Token rỗng hoặc không hợp lệ sau khi xử lý');
      return res.status(401).json({ message: 'Token không hợp lệ - Không tìm thấy token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('📡 Thông tin từ token (Decoded):', decoded);

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      console.error('❌ ID trong token không phải ObjectId hợp lệ:', decoded.id);
      return res.status(401).json({ message: 'Token không hợp lệ - ID không đúng định dạng' });
    }

    const user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) {
      console.error('❌ Không tìm thấy user trong DB với ID:', decoded.id);
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      isVerified: user.isVerified || false,
      isLocked: user.isLocked || false,
    };
    console.log('📡 User từ database:', req.user);

    if (!req.user.isVerified) {
      console.error('❌ User chưa xác thực email:', req.user.email);
      return res.status(403).json({ message: 'Email chưa được xác thực, vui lòng xác thực email' });
    }

    if (req.user.isLocked) {
      console.error('❌ User bị khóa:', req.user.email);
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa, vui lòng liên hệ quản trị viên' });
    }

    next();
  } catch (err) {
    console.error('❌ Lỗi xác thực token:', { message: err.message, name: err.name, token: authHeader || 'Không có token', stack: err.stack });
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Middleware kiểm tra quyền Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Truy cập bị từ chối: yêu cầu quyền admin' });
  }
};

module.exports = { authMiddleware, isAdmin };
