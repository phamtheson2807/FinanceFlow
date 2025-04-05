const nodemailer = require('nodemailer');

// Khởi tạo transporter cho nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Kiểm tra kết nối với Gmail SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Lỗi kết nối với Gmail SMTP:', error);
  } else {
    console.log('✅ Kết nối Gmail SMTP thành công');
  }
});

// ✅ GỬI EMAIL QUÊN MẬT KHẨU
const sendResetPasswordEmail = async (email, resetToken) => {
  console.log(`🔄 Bắt đầu gửi email đặt lại mật khẩu đến: ${email}`);

  try {
    // Kiểm tra email đầu vào
    if (!email || !email.includes('@')) {
      throw new Error('Email không hợp lệ');
    }

    // Tạo URL đặt lại mật khẩu
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Định dạng thời gian gửi email
    const sentAt = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Nội dung plain text (dự phòng cho các email client không hỗ trợ HTML)
    const textContent = `
Email: ${email}
Thời gian gửi: ${sentAt}
Liên kết đặt lại mật khẩu: ${resetUrl}
    `;

    // Thiết kế nội dung email dưới dạng HTML (đồng bộ với phong cách của sendVerificationEmail.js và support.js)
    const htmlContent = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
        <!-- Header -->
        <div style="text-align: center; padding: 20px; background: linear-gradient(45deg, #A78BFA, #60A5FA); border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Đặt Lại Mật Khẩu Của Bạn</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 10px 10px;">
          <p style="color: #1E293B; font-size: 16px; margin: 0 0 10px;">Chào bạn,</p>
          <p style="color: #1E293B; font-size: 16px; margin: 0 0 20px;">
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại FinanceFlow. Dưới đây là thông tin chi tiết:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; font-weight: 600; color: #A78BFA; font-size: 16px; border-bottom: 1px solid #E5E7EB;">Email:</td>
              <td style="padding: 10px; color: #64748B; font-size: 16px; border-bottom: 1px solid #E5E7EB;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; color: #A78BFA; font-size: 16px; border-bottom: 1px solid #E5E7EB;">Thời gian gửi:</td>
              <td style="padding: 10px; color: #64748B; font-size: 16px; border-bottom: 1px solid #E5E7EB;">${sentAt}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: 600; color: #A78BFA; font-size: 16px; border-bottom: 1px solid #E5E7EB;">Liên kết đặt lại:</td>
              <td style="padding: 10px; color: #64748B; font-size: 16px; border-bottom: 1px solid #E5E7EB;">
                <a href="${resetUrl}" style="color: #60A5FA; text-decoration: none; font-weight: 600;">Nhấn để đặt lại mật khẩu</a>
              </td>
            </tr>
          </table>

          <p style="color: #1E293B; font-size: 16px; margin: 0 0 10px;">
            Nếu liên kết trên không hoạt động, bạn có thể sao chép và dán URL sau vào trình duyệt:
          </p>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 20px; word-break: break-all;">
            <a href="${resetUrl}" style="color: #60A5FA; text-decoration: none;">${resetUrl}</a>
          </p>
          <p style="color: #1E293B; font-size: 16px; margin: 0;">
            ⚠ Liên kết này sẽ hết hạn sau 15 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
          </p>
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

    // Gửi email
    const mailOptions = {
      from: `"FinanceFlow Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Yêu Cầu Đặt Lại Mật Khẩu - FinanceFlow',
      text: textContent, // Nội dung plain text dự phòng
      html: htmlContent, // Nội dung HTML chính
    };

    console.log('📡 Đang gửi email đặt lại mật khẩu...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email đặt lại mật khẩu đã được gửi: ${info.messageId}`);
    return info.messageId; // Trả về messageId để sử dụng nếu cần
  } catch (error) {
    console.error('❌ Lỗi gửi email đặt lại mật khẩu:', error.message);
    throw new Error(`Không thể gửi email đặt lại mật khẩu: ${error.message}`);
  }
};

module.exports = sendResetPasswordEmail;