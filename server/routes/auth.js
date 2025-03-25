// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
require('../config/passport');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const sendResetPasswordEmail = require('../utils/sendResetPasswordEmail');
const Notification = require('../models/Notification');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      role: 'user',
      isLocked: false,
    });

    await user.save();

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    await sendVerificationEmail(email, verificationToken);
    console.log(`📩 Đã gửi email xác thực đến: ${email}`);

    res.status(201).json({ message: 'Tài khoản đã tạo, vui lòng kiểm tra email để xác thực!' });
  } catch (error) {
    console.error('❌ Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token không hợp lệ' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    console.log(`📩 Xác thực email: ${email}`);

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      console.error(`❌ Xác thực thất bại: Không tìm thấy user với email ${email}`);
      return res.status(400).json({ message: 'Tài khoản không tồn tại hoặc đã bị xóa!' });
    }

    console.log(`✅ Email ${email} đã được xác thực!`);
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    console.error('❌ Lỗi xác thực email:', error);
    res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    console.log(`🔍 Email nhận từ request: "${normalizedEmail}"`);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${normalizedEmail}`);
      return res.status(400).json({ message: 'Email không tồn tại' });
    }

    console.log(`🔍 Dữ liệu user từ DB: ${JSON.stringify(user)}`);

    if (user.isLocked) {
      console.log(`❌ Tài khoản bị khóa: ${normalizedEmail}`);
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    if (!user.isVerified) {
      console.log(`❌ Email chưa xác thực: ${normalizedEmail}`);
      return res.status(403).json({ message: 'Email chưa xác thực, vui lòng kiểm tra email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ Mật khẩu không đúng cho email: ${normalizedEmail}`);
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isLocked: user.isLocked,
        isVerified: user.isVerified,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

router.post('/verify-admin', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      return res.status(404).json({ message: 'Admin không tồn tại!' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: `✅ Admin ${email} đã được xác thực!` });
  } catch (error) {
    console.error('❌ Lỗi xác thực admin:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ Email không tồn tại: ${email}`);
      return res.status(404).json({ message: 'Email không tồn tại!' });
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    await sendResetPasswordEmail(email, resetToken);
    console.log(`📩 Đã gửi email đặt lại mật khẩu đến: ${email}`);

    res.json({ message: 'Liên kết đặt lại mật khẩu đã được gửi vào email của bạn!' });
  } catch (error) {
    console.error('❌ Lỗi khi gửi email đặt lại mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ!' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ Không tìm thấy user với email: ${email}`);
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    console.log(`✅ Mật khẩu của ${email} đã được đặt lại thành công!`);

    res.json({ message: '✅ Mật khẩu đã được đặt lại thành công!' });
  } catch (error) {
    console.error('❌ Lỗi đặt lại mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ!' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.isLocked) {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isLocked: user.isLocked,
        isVerified: user.isVerified,
        avatar: user.avatar || '',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      user.email = email;
      user.isVerified = false;
      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
      await sendVerificationEmail(email, verificationToken);
      console.log(`📩 Đã gửi email xác thực mới đến: ${email}`);
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();
    console.log(`✅ Thông tin người dùng ${user.email} đã được cập nhật!`);

    res.json({
      message: 'Thông tin người dùng đã được cập nhật thành công!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        isLocked: user.isLocked,
        isVerified: user.isVerified,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    console.log('📡 Request body:', req.body);
    const { currentPassword, newPassword } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    console.log(`✅ Mật khẩu của người dùng ${user.email} đã được thay đổi thành công!`);

    res.json({ message: 'Mật khẩu đã được thay đổi thành công!' });
  } catch (error) {
    console.error('❌ Lỗi khi thay đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Comment out Google OAuth routes for now
/*
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: `${process.env.CLIENT_URL}/login?error=OAuthFail`,
  session: false
}), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      console.error('❌ Không tìm thấy user từ Google OAuth');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFail`);
    }

    if (user.isLocked) {
      console.error(`❌ Tài khoản ${user.email} đã bị khóa`);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=AccountLocked`);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log(`✅ Đăng nhập Google thành công cho ${user.email}, token: ${token}`);
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  } catch (error) {
    console.error('❌ Google OAuth Error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFail`);
  }
});
*/

// Thêm route POST /logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }

    console.log(`✅ Người dùng ${req.user.email} đã đăng xuất`);
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('❌ Lỗi đăng xuất:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Token không hợp lệ' });

  try {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return res.status(401).json({ message: 'Token không hợp lệ' });

      const newToken = jwt.sign(
        { id: user.id, role: user.role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token: newToken });
    });
  } catch (error) {
    console.error('❌ Lỗi refresh token:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;