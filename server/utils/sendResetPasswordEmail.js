const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ GỬI EMAIL QUÊN MẬT KHẨU
const sendResetPasswordEmail = async (email, resetToken) => {
    console.log(`🔄 Bắt đầu gửi email đặt lại mật khẩu đến: ${email}`);

    try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔐 Yêu cầu đặt lại mật khẩu',
            html: `
                <h2>🔑 Đặt lại mật khẩu của bạn</h2>
                <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu:</p>
                <a href="${resetUrl}" style="color: blue; font-weight: bold;">Đặt lại mật khẩu</a>
                <p>⚠ Liên kết có hiệu lực trong 15 phút.</p>
            `
        };

        console.log('📡 Đang gửi email đặt lại mật khẩu...');
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email đặt lại mật khẩu đã được gửi: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Lỗi gửi email đặt lại mật khẩu:', error);
        throw new Error('Không thể gửi email đặt lại mật khẩu');
    }
};

module.exports = sendResetPasswordEmail;
