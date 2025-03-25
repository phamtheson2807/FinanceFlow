const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ GỬI EMAIL XÁC THỰC
const sendVerificationEmail = async (email, token) => {
    console.log(`🚀 Bắt đầu gửi email xác thực đến: ${email}`);

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔑 Xác thực tài khoản của bạn',
            html: `
                <h2>Chào mừng bạn đến với Quản lý tài chính</h2>
                <p>Vui lòng nhấn vào đường link bên dưới để xác thực tài khoản của bạn:</p>
                <a href="${process.env.CLIENT_URL}/verify-email?token=${token}" style="color: green; font-weight: bold;">Xác thực tài khoản</a>
                <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
            `
        };

        console.log('📡 Đang gửi email xác thực...');
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email xác thực đã được gửi: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Lỗi khi gửi email xác thực:', error);
        throw new Error('Không thể gửi email xác thực');
    }
};

module.exports = sendVerificationEmail;
