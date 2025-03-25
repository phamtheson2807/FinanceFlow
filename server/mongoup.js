const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/quanlythuchi', { // Sử dụng database của bạn: 'quanlythuchi'
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('✅ Kết nối MongoDB thành công');

  // Nạp model SupportSession
  const SupportSession = require('./models/SupportSession');

  // Kiểm tra xem collection support_sessions đã có dữ liệu chưa
  const sessionCount = await SupportSession.countDocuments();
  if (sessionCount === 0) {
    // Nếu chưa có dữ liệu, thêm một tài liệu mặc định
    const initSession = new SupportSession({
      userId: new mongoose.Types.ObjectId(), // Tạo một ObjectId giả lập
      userName: 'Phạm Thế Sơn',
      userEmail: 'phamtheson@gmail.com',
      messages: [
        {
          sender: 'admin',
          content: 'Tin nhắn khởi tạo từ hệ thống cho phiên hỗ trợ',
          createdAt: new Date(),
        },
      ],
      status: 'active',
      unreadCount: 0,
    });
    await initSession.save();
    console.log('✅ Đã tạo collection support_sessions với một phiên hỗ trợ mặc định');
  } else {
    console.log('✅ Collection support_sessions đã tồn tại, không cần khởi tạo');
  }

  // Đóng kết nối
  mongoose.connection.close();
  console.log('✅ Đã đóng kết nối MongoDB');
}).catch((err) => {
  console.error('❌ Lỗi kết nối hoặc khởi tạo:', err);
  process.exit(1);
});