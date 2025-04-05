const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      _id: user._id.toString(), // Chuyển thành chuỗi
      name: user.name,
      email: user.email,
      role: decoded.role || user.role || 'user',
      plan: decoded.plan || user.plan || 'free',
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
    console.error('❌ Lỗi xác thực token:', {
      message: err.message,
      name: err.name,
      token: authHeader || 'Không có token',
      stack: err.stack,
    });
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

// Xử lý xác thực Google OAuth2
const googleAuth = async (req, res) => {
  try {
    console.log('📱 Google auth request:', req.body);
    const { credential } = req.body;

    if (!credential) {
      console.error('❌ Không có credential từ Google');
      return res.status(400).json({ message: 'Thiếu thông tin xác thực từ Google' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Google verify success:', payload);

    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        avatar: picture,
        isVerified: true,
        role: 'user',
        plan: 'free',
      });
      await user.save();
      console.log('✅ Tạo người dùng mới từ Google:', email);
    }

    const token = jwt.sign(
      {
        id: user._id.toString(), // Chuyển thành chuỗi
        email: user.email,
        role: user.role,
        plan: user.plan,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(), // Chuyển thành chuỗi
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({ message: 'Lỗi xác thực Google: ' + error.message });
  }
};

module.exports = { authMiddleware, isAdmin, googleAuth };