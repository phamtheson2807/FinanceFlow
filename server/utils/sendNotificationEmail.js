const nodemailer = require('nodemailer');

// Khởi tạo transporter cho nodemailer (tái sử dụng cấu hình từ sendVerificationEmail.js)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendNotificationEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    const mailOptions = {
      from: `FinanceFlow <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Đã gửi email thông báo:', info.messageId);
    return info.messageId;
  } catch (error) {
    console.error('❌ Lỗi gửi email thông báo:', error.message);
    throw new Error('Không thể gửi email thông báo: ' + error.message);
  }
};

module.exports = sendNotificationEmail; 