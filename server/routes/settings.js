const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { authMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: API quản lý cài đặt người dùng
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Lấy cài đặt của người dùng hiện tại
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về cài đặt người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: ID của người dùng
 *                 language:
 *                   type: string
 *                   example: "vi"
 *                 darkMode:
 *                   type: boolean
 *                   example: true
 *                 emailNotifications:
 *                   type: boolean
 *                   example: false
 *                 showBalance:
 *                   type: boolean
 *                   example: true
 *                 currency:
 *                   type: string
 *                   example: "VND"
 *                 aiFinancialManagement:
 *                   type: boolean
 *                   example: false
 *                   description: Bật/tắt AI quản lý tài chính
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📌 User ID from token:', req.user.id);
    let settings = await Settings.findOne({ user_id: req.user.id });

    // Nếu chưa có settings, tạo mới với giá trị mặc định
    if (!settings) {
      settings = new Settings({
        user_id: req.user.id,
        language: 'vi',
        darkMode: false,
        emailNotifications: true,
        showBalance: true,
        currency: 'VND',
        aiFinancialManagement: false,
      });
      await settings.save();
      console.log('✅ Created new settings:', settings);
    }

    res.json(settings);
  } catch (error) {
    console.error('❌ Lỗi khi lấy cài đặt:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy cài đặt' });
  }
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Cập nhật cài đặt người dùng
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 example: "vi"
 *               darkMode:
 *                 type: boolean
 *                 example: true
 *               emailNotifications:
 *                 type: boolean
 *                 example: false
 *               showBalance:
 *                 type: boolean
 *                 example: true
 *               currency:
 *                 type: string
 *                 example: "VND"
 *               aiFinancialManagement:
 *                 type: boolean
 *                 example: false
 *                 description: Bật/tắt AI quản lý tài chính
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    console.log('📌 Update request body:', req.body);
    const updates = req.body;
    const allowedUpdates = ['language', 'darkMode', 'emailNotifications', 'showBalance', 'currency', 'aiFinancialManagement'];

    // Lọc các trường được phép cập nhật
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    console.log('✅ Filtered updates:', filteredUpdates);

    let settings = await Settings.findOne({ user_id: req.user.id });

    if (!settings) {
      settings = new Settings({
        user_id: req.user.id,
        ...filteredUpdates,
      });
    } else {
      Object.assign(settings, filteredUpdates);
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật cài đặt:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật cài đặt' });
  }
});

module.exports = router;