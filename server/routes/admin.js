const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Category = require('../models/Categories');
const SupportSession = require('../models/SupportSession'); // Thêm model mới

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API dành cho quản trị viên
 */

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Lấy danh sách tất cả giao dịch cho admin (với bộ lọc)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Loại giao dịch (income/expense)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Danh mục giao dịch
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng giao dịch mỗi trang
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Trường để sắp xếp, mặc định là 'date'
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *         description: Hướng sắp xếp, mặc định là 'desc' (asc hoặc desc)
 *     responses:
 *       200:
 *         description: Thành công, trả về danh sách giao dịch
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/transactions', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate, type, category, page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type && type !== 'all') {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }

    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .populate('user', '_id name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    if (!transactions.length) {
      return res.status(404).json({ message: 'Không có giao dịch nào' });
    }

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách giao dịch cho admin:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: Lấy danh sách tất cả thông báo cho admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/notifications', authMiddleware, isAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('createdBy', 'name email -_id')
      .populate('recipients', 'name email -_id')
      .lean();
    res.json(notifications);
  } catch (error) {
    console.error('❌ Lỗi tải danh sách thông báo:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/notifications:
 *   post:
 *     summary: Gửi thông báo đến người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: ObjectId
 *     responses:
 *       201:
 *         description: Thông báo đã được gửi
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/notifications', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, content, isActive, recipients = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc' });
    }

    let finalRecipients = recipients;
    if (recipients.length === 0) {
      const allUsers = await User.find().select('_id').lean();
      finalRecipients = allUsers.map((user) => user._id);
    }

    const notification = await Notification.create({
      title,
      content,
      isActive,
      createdBy: req.user._id,
      recipients: finalRecipients,
    });

    res.status(201).json({ message: 'Thông báo đã được gửi', data: notification });
  } catch (error) {
    console.error('❌ Lỗi gửi thông báo:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/notifications/{id}:
 *   put:
 *     summary: Cập nhật thông báo (xem, bật/tắt, chỉnh sửa)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: ObjectId
 *     responses:
 *       200:
 *         description: Thông báo đã được cập nhật
 *       404:
 *         description: Không tìm thấy thông báo
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/notifications/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, content, isActive, recipients } = req.body;
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo' });

    if (title) notification.title = title;
    if (content) notification.content = content;
    if (isActive !== undefined) notification.isActive = isActive;
    if (recipients) notification.recipients = recipients;

    await notification.save();
    res.json({ message: 'Thông báo đã được cập nhật', data: notification });
  } catch (error) {
    console.error('❌ Lỗi cập nhật thông báo:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/notifications/{id}:
 *   delete:
 *     summary: Xóa thông báo
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông báo đã bị xóa
 *       404:
 *         description: Không tìm thấy thông báo
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete('/notifications/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    res.json({ message: 'Thông báo đã bị xóa' });
  } catch (error) {
    console.error('❌ Lỗi xóa thông báo:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng cho admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *       404:
 *         description: Không có người dùng nào
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire').lean();
    if (!users.length) return res.status(404).json({ message: 'Không có người dùng nào' });
    res.json(users);
  } catch (error) {
    console.error('❌ Lỗi tải danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/overview:
 *   get:
 *     summary: Lấy tổng quan hệ thống cho admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê tổng quan
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/overview', authMiddleware, isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const newUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt')
      .lean();
    res.json({ userCount, transactionCount, newUsers });
  } catch (error) {
    console.error('❌ Lỗi tải dữ liệu tổng quan:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Lấy chi tiết một người dùng cho admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết người dùng
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/users/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire').lean();
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(user);
  } catch (error) {
    console.error('❌ Lỗi tải thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/lock:
 *   put:
 *     summary: Khóa tài khoản người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã khóa tài khoản
 *       400:
 *         description: Tài khoản đã bị khóa hoặc ID không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/users/:id/lock', authMiddleware, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (user.isLocked) return res.status(400).json({ message: 'Tài khoản đã bị khóa trước đó' });

    user.isLocked = true;
    await user.save();
    res.json({ message: `Tài khoản của ${user.name} đã bị khóa thành công`, data: user });
  } catch (error) {
    console.error('❌ Lỗi khóa tài khoản:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/unlock:
 *   put:
 *     summary: Mở khóa tài khoản người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã mở khóa tài khoản
 *       400:
 *         description: Tài khoản đang hoạt động hoặc ID không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/users/:id/unlock', authMiddleware, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (!user.isLocked) return res.status(400).json({ message: 'Tài khoản này đang hoạt động' });

    user.isLocked = false;
    await user.save();
    res.json({ message: `Tài khoản của ${user.name} đã được mở khóa thành công`, data: user });
  } catch (error) {
    console.error('❌ Lỗi mở khóa tài khoản:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Người dùng đã được cập nhật
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc ID không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/users/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Vai trò không hợp lệ' });
      }
      user.role = role;
    }

    await user.save();
    res.json({ message: `Thông tin của ${user.name} đã được cập nhật`, data: user });
  } catch (error) {
    console.error('❌ Lỗi cập nhật người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Xóa một người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Người dùng đã bị xóa
 *       400:
 *         description: ID không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete('/users/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: `Tài khoản của ${user.name} đã bị xóa thành công` });
  } catch (error) {
    console.error('❌ Lỗi xóa người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Lấy thống kê tài chính cho admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê tài chính
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: '$user',
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
    ])
      .lookup({
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      })
      .unwind('userDetails')
      .project({
        userId: '$userDetails._id',
        userName: '$userDetails.name',
        userEmail: '$userDetails.email',
        totalIncome: 1,
        totalExpense: 1,
      });

    res.json(stats);
  } catch (error) {
    console.error('❌ Lỗi khi lấy thống kê cho admin:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Lấy danh sách tất cả danh mục (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không có danh mục nào
 *       500:
 *         description: Lỗi server
 */
router.get('/categories', authMiddleware, isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().populate('userId', 'name email').sort({ createdAt: -1 });
    if (!categories.length) {
      return res.status(404).json({ message: 'Không có danh mục nào' });
    }
    res.status(200).json(categories);
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách danh mục:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách danh mục' });
  }
});

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Xóa một danh mục (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục cần xóa
 *     responses:
 *       200:
 *         description: Danh mục đã bị xóa
 *       400:
 *         description: ID không hợp lệ
 *       404:
 *         description: Không tìm thấy danh mục
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.delete('/categories/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    res.status(200).json({ message: `Danh mục "${category.name}" đã bị xóa thành công` });
  } catch (error) {
    console.error('❌ Lỗi khi xóa danh mục:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa danh mục' });
  }
});

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Thêm danh mục mới (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               description:
 *                 type: string
 *             required:
 *               - name
 *               - type
 *     responses:
 *       201:
 *         description: Danh mục đã được thêm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Thiếu thông tin bắt buộc hoặc dữ liệu không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.post('/categories', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, type, description } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Tên và loại danh mục là bắt buộc' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Loại danh mục phải là "income" hoặc "expense"' });
    }

    const newCategory = new Category({
      userId: req.user._id,
      name,
      type,
      description,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('❌ Lỗi khi thêm danh mục:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm danh mục' });
  }
});

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Lấy thống kê hệ thống cho admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalTransactions:
 *                   type: number
 *                 totalIncome:
 *                   type: number
 *                 totalExpense:
 *                   type: number
 *                 usersByMonth:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       count:
 *                         type: number
 *                 transactionsByMonth:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                       count:
 *                         type: number
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/analytics', authMiddleware, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
    ]);

    const totalIncome = transactionStats[0]?.totalIncome || 0;
    const totalExpense = transactionStats[0]?.totalExpense || 0;

    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', count: 1, _id: 0 } },
    ]);

    const transactionsByMonth = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', count: 1, _id: 0 } },
    ]);

    const stats = {
      totalUsers,
      totalTransactions,
      totalIncome,
      totalExpense,
      usersByMonth,
      transactionsByMonth,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Lỗi khi lấy thống kê hệ thống:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê' });
  }
});

/**
 * @swagger
 * /api/admin/support/sessions:
 *   get:
 *     summary: Lấy danh sách các phiên hỗ trợ cho admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách các phiên hỗ trợ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       userEmail:
 *                         type: string
 *                       messages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             sender:
 *                               type: string
 *                               enum: [user, admin]
 *                             content:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                       status:
 *                         type: string
 *                         enum: [active, closed]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       unreadCount:
 *                         type: number
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/support/sessions', authMiddleware, isAdmin, async (req, res) => {
  try {
    const sessions = await SupportSession.find()
      .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian cập nhật gần nhất
      .lean();
    console.log('📡 Trả về danh sách sessions:', sessions);
    res.json({ sessions });
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách phiên hỗ trợ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách phiên hỗ trợ' });
  }
});

module.exports = router;