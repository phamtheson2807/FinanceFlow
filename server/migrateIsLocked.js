const mongoose = require('mongoose');
const User = require('./models/User');

async function addIsLockedField() {
  try {
    await mongoose.connect('mongodb://localhost:27017/finance-manager', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Kết nối MongoDB thành công');

    const users = await User.find();
    for (const user of users) {
      if (!user.isLocked) {
        user.isLocked = false; // Đặt giá trị mặc định là false
        await user.save();
        console.log(`Đã cập nhật isLocked cho user ${user._id}`);
      }
    }
    console.log('Hoàn tất cập nhật trường isLocked cho tất cả người dùng');
  } catch (error) {
    console.error('Lỗi khi cập nhật trường isLocked:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addIsLockedField();