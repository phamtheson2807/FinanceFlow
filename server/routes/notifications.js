const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/auth'); // Sử dụng isAdmin
const Notification = require('../models/Notification');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API quản lý thông báo của người dùng
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo của người dùng
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   createdBy:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   isRead:
 *                     type: boolean
 *                   recipients:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    console.log('Request to /api/notifications:', {
      userId: req.user._id,
      token: req.header('Authorization'),
    });
    const notifications = await Notification.find({
      $or: [
        { recipients: { $in: [req.user._id] } }, // Thông báo gửi cho người dùng cụ thể
        { recipients: { $exists: false, $size: 0 } }, // Thông báo gửi cho tất cả
      ],
      isActive: true, // Chỉ lấy thông báo đang hoạt động
    })
      .populate('createdBy', 'name email -_id')
      .lean();

    console.log('Danh sách thông báo trả về:', notifications);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Lỗi tải thông báo:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Đánh dấu tất cả thông báo của người dùng là đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tất cả thông báo đã được đánh dấu là đã đọc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Notification.updateMany(
      { recipients: { $in: [userId] }, isRead: false },
      { $set: { isRead: true } },
      { new: true }
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: 'Không có thông báo nào để đánh dấu' });
    }

    res.status(200).json({ message: 'Tất cả thông báo đã được đánh dấu là đã đọc' });
  } catch (error) {
    console.error('❌ Lỗi đánh dấu tất cả đã đọc:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/mark-read:
 *   put:
 *     summary: Đánh dấu một thông báo cụ thể là đã đọc
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Thông báo đã được đánh dấu là đã đọc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy thông báo
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/notifications/:id/mark-read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, recipients: { $in: [userId] } });
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    if (notification.isRead) {
      return res.status(200).json({ message: 'Thông báo đã được đọc trước đó' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Thông báo đã được đánh dấu là đã đọc' });
  } catch (error) {
    console.error('❌ Lỗi đánh dấu thông báo đã đọc:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

/**
 * @swagger
 * /api/admin/notifications/{id}:
 *   put:
 *     summary: Cập nhật thông báo bởi admin
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
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
 *     responses:
 *       200:
 *         description: Thông báo đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy thông báo
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/admin/notifications/:id', [authMiddleware, isAdmin], async (req, res) => { // Sử dụng isAdmin
  try {
    const { id } = req.params;
    const { title, content, isActive, recipients } = req.body;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    if (title) notification.title = title;
    if (content) notification.content = content;
    if (isActive !== undefined) notification.isActive = isActive;
    if (recipients) notification.recipients = recipients;

    await notification.save();
    res.status(200).json({ message: 'Thông báo đã được cập nhật', notification });
  } catch (error) {
    console.error('❌ Lỗi cập nhật thông báo:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router;