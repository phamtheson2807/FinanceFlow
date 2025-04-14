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
const multer = require('multer');
const path = require('path');
const EditHistory = require('../models/EditHistory');
const fs = require('fs');



// Tạo thư mục nếu chưa có
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Route đăng ký
router.post('/register', async (req, res) => {
  try {
    // Lấy dữ liệu từ body
    const { name, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên, email và mật khẩu' });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Kiểm tra xem email đã tồn tại chưa
    let user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      role: 'user',
      isLocked: false,
      plan: 'free',
    });

    // Lưu user vào database
    await user.save();
    console.log(`✅ Đã tạo user mới: ${user.email}`);

    // Tạo token xác thực email
    const verificationToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Gửi email xác thực
    try {
      await sendVerificationEmail(user.email, verificationToken);
      console.log(`📩 Đã gửi email xác thực đến: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Lỗi khi gửi email xác thực:', emailError);
      // Không trả về lỗi cho client, chỉ ghi log, vì user đã được tạo thành công
    }

    // Trả về response thành công
    res.status(201).json({ message: 'Tài khoản đã được tạo, vui lòng kiểm tra email để xác thực!' });
  } catch (error) {
    console.error('❌ Lỗi đăng ký:', error);
    if (error.name === 'ValidationError') {
      // Xử lý lỗi validation từ Mongoose
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký' });
  }
});

// Route xác thực email
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

// Route đăng nhập
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
      { id: user._id, email: user.email, role: user.role || 'user', plan: user.plan || 'free' }, // Thêm plan vào token
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
        plan: user.plan || 'free', // Thêm plan vào response
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

// Route xác thực admin
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

// Route quên mật khẩu
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

// Route đặt lại mật khẩu
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

// Route lấy thông tin người dùng
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
        plan: user.plan || 'free',
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


// Route cập nhật thông tin người dùng
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }

    const user = await User.findById(req.user.id);
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
        plan: user.plan || 'free', // Thêm plan
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


// Đổi mật khẩu
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' });
    }

    const user = await User.findById(req.user._id); // dùng req.user._id thay vì req.user.id nếu middleware set như vậy
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: '✅ Đổi mật khẩu thành công' });
  } catch (err) {
    console.error('❌ Lỗi khi đổi mật khẩu:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi đổi mật khẩu' });
  }
});


// Route bắt đầu xác thực Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route callback từ Google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=OAuthFail`,
    session: false,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        console.error('❌ Không tìm thấy user từ Google OAuth');
        return res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFail`);
      }

      const { id, email, displayName, photos } = req.user;

      let user = await User.findOne({ email });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('google-' + Date.now(), salt);
        
        user = new User({
          name: displayName,
          email,
          googleId: id,
          isVerified: true,
          password: hashedPassword,
          role: 'user',
          isLocked: false,
          plan: 'free',
          avatar: photos?.[0]?.value || '',
        });
        await user.save();
        console.log('✅ Tạo user Google mới thành công:', email);
      }

      // Tạo token với đầy đủ thông tin
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role || 'user',
          plan: user.plan || 'free',
          avatar: user.avatar || '',
          isVerified: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Chuyển hướng với token và thông tin user
      const userInfo = JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        isVerified: true,
        avatar: user.avatar
      });

      console.log('✅ Đăng nhập Google thành công cho', email);
      res.redirect(`${process.env.CLIENT_URL}/oauth/success?token=${token}&user=${encodeURIComponent(userInfo)}`);
    } catch (error) {
      console.error('❌ Lỗi Google OAuth:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFail`);
    }
  }
);

// Route đăng xuất
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

// Route refresh token
router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Token không hợp lệ' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    const newToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role || 'user', plan: user.plan || 'free' }, // Thêm plan vào token
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token: newToken });
  } catch (error) {
    console.error('❌ Lỗi refresh token:', error);
    res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }
});
// Upload avatar

// 📤 Upload avatar từ máy hoặc từ URL
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    let newAvatarUrl = '';

    // Trường hợp: upload từ máy
    if (req.file) {
      console.log('📤 Upload từ máy:', req.file.filename);
      newAvatarUrl = `/uploads/${req.file.filename}`;
    }
    // Trường hợp: chọn ảnh chibi online (truyền qua body.avatarUrl)
    else if (req.body.avatarUrl) {
      console.log('🌐 Chọn ảnh từ URL:', req.body.avatarUrl);
      newAvatarUrl = req.body.avatarUrl;
    }

    if (!newAvatarUrl) {
      return res.status(400).json({ message: 'Không có ảnh nào được gửi' });
    }

    // Ghi lại lịch sử thay đổi
    await EditHistory.create({
      userId: user._id,
      field: 'avatar',
      oldValue: user.avatar || '',
      newValue: newAvatarUrl,
    });

    user.avatar = newAvatarUrl;
    await user.save();

    res.json({ avatarUrl: newAvatarUrl });
  } catch (error) {
    console.error('❌ Lỗi khi upload avatar:', error);
    res.status(500).json({ message: 'Lỗi server khi upload avatar' });
  }
});


// Lấy lịch sử chỉnh sửa
router.get('/edit-history', authMiddleware, async (req, res) => {
  try {
    console.log('📥 Đang truy vấn lịch sử cho user:', req.user._id);
    const history = await EditHistory.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('❌ Lỗi khi lấy lịch sử chỉnh sửa:', error.message);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử chỉnh sửa' });
  }
});

// Cập nhật balance người dùng
router.put('/balance', authMiddleware, async (req, res) => {
  try {
    const { balance } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    user.balance = balance;
    await user.save();
    res.json({ message: '✅ Đã cập nhật số dư thành công!', balance });
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật balance:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật balance' });
  }
});

module.exports = router;