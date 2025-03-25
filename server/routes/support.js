const express = require('express');
const nodemailer = require('nodemailer');
const Message = require('../models/Message');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @swagger
 * /api/support/send:
 *   post:
 *     summary: Gửi tin nhắn hỗ trợ từ người dùng (không cần đăng nhập)
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               contact:
 *                 type: string
 *               message:
 *                 type: string
 *             required:
 *               - fullName
 *               - contact
 *     responses:
 *       200:
 *         description: Tin nhắn đã được gửi thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       500:
 *         description: Lỗi server
 */
router.post('/send', async (req, res) => {
  const { fullName, contact, message } = req.body;

  if (!fullName || !contact) {
    return res.status(400).json({ message: 'Họ tên và email/số điện thoại là bắt buộc' });
  }

  try {
    // Lưu tin nhắn vào MongoDB
    const newMessage = new Message({ fullName, contact, message });
    await newMessage.save();

    // Định dạng thời gian gửi tin nhắn
    const sentAt = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Nội dung plain text (dự phòng cho các email client không hỗ trợ HTML)
    const textContent = `
Họ tên: ${fullName}
Liên hệ: ${contact}
Thời gian gửi: ${sentAt}
Tin nhắn: ${message || 'Không có nội dung'}
    `;

    // Thiết kế nội dung email dưới dạng HTML
    const htmlContent = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
        <!-- Header -->
        <div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #A78BFA, #60A5FA); border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Tin Nhắn Hỗ Trợ Mới Từ Khách Hàng</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 10px 10px;">
          <p style="color: #1E293B; font-size: 16px; margin: 0 0 10px;">Chào Admin,</p>
          <p style="color: #1E293B; font-size: 16px; margin: 0 0 20px;">Bạn vừa nhận được một tin nhắn hỗ trợ mới từ khách hàng. Dưới đây là thông tin chi tiết:</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; font-weight: 600; color: #A78BFA; font-size: 16px; border-bottom: 1px solid #E5E7EB;">Họ tên:</td>
              <td style="padding: 10px; color: #64748B; font-size: 16px; border-bottom: 1px solid #E5E7EB;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; color: #A78BFA; font-size: 16px; border-bottom: 1px solid #E5E7EB;">Liên hệ:</td>
              <td style="padding: 10px; color: #64748B; font-size: 16px; border-bottom: 1px solid #E5E7EB;">${contact}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; color: #A78BFA; font-size: 16px; border-bottom: 1px solid #E5E7EB;">Thời gian gửi:</td>
              <td style="padding: 10px; color: #64748B; font-size: 16px; border-bottom: 1px solid #E5E7EB;">${sentAt}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; color: #A78BFA; font-size: 16px; vertical-align: top;">Tin nhắn:</td>
              <td style="padding: 10px; color: #64748B; font-size: 16px;">${message || 'Không có nội dung'}</td>
            </tr>
          </table>

          <p style="color: #1E293B; font-size: 16px; margin: 0;">Vui lòng phản hồi khách hàng trong thời gian sớm nhất.</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; background-color: #1E293B; border-radius: 0 0 10px 10px; margin-top: 10px;">
          <p style="color: #CBD5E1; font-size: 14px; margin: 0 0 5px;">FinanceFlow - Quản Lý Tài Chính Dễ Dàng</p>
          <p style="color: #CBD5E1; font-size: 14px; margin: 0;">
            Email: <a href="mailto:support@financeflow.com" style="color: #60A5FA; text-decoration: none;">support@financeflow.com</a> | Hotline: 0123-456-789
          </p>
          <p style="color: #64748B; font-size: 12px; margin: 10px 0 0;">© 2025 FinanceFlow. All rights reserved.</p>
        </div>
      </div>
    `;

    // Gửi email đến admin
    const mailOptions = {
      from: `"FinanceFlow Support" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Tin Nhắn Hỗ Trợ Mới Từ ${fullName} - FinanceFlow`,
      text: textContent, // Nội dung plain text dự phòng
      html: htmlContent, // Nội dung HTML chính
    };

    // Gửi email và kiểm tra kết quả
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Đã gửi email hỗ trợ từ ${fullName} đến admin. Message ID: ${info.messageId}`);

    res.status(200).json({ message: 'Tin nhắn đã được gửi thành công' });
  } catch (error) {
    console.error('❌ Lỗi khi gửi tin nhắn:', error);
    res.status(500).json({ message: 'Lỗi server khi gửi tin nhắn', error: error.message });
  }
});

/**
 * @swagger
 * /api/support/messages:
 *   get:
 *     summary: Lấy danh sách tin nhắn hỗ trợ (Admin only)
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tin nhắn
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/messages', authMiddleware, isAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách tin nhắn:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy tin nhắn' });
  }
});

module.exports = router;