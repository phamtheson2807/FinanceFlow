const mongoose = require('mongoose');
const EditHistory = require('./models/EditHistory'); // Import model EditHistory

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/finance-manager')
  .then(async () => {
    console.log('✅ Kết nối MongoDB thành công');
    console.log('EditHistory model:', EditHistory);

    try {
      // Kiểm tra và khởi tạo collection nếu chưa tồn tại
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map((col) => col.name);

      // Kiểm tra collection 'edithistories'
      if (!collectionNames.includes('edithistories')) {
        console.log('⚠️ Collection edithistories chưa tồn tại, khởi tạo...');
        await EditHistory.createCollection();
      } else {
        console.log('✅ Collection edithistories đã tồn tại, không cần khởi tạo');
      }

      // Kiểm tra tất cả bản ghi trong EditHistory (tùy chọn)
      const editHistories = await EditHistory.find();
      console.log(`🔍 Tìm thấy ${editHistories.length} bản ghi trong EditHistory`);
      editHistories.forEach((history) => {
        console.log(`✅ History ${history._id} - Field: ${history.field}, Old: ${history.oldValue}, New: ${history.newValue}`);
      });

      // Đóng kết nối
      mongoose.connection.close();
      console.log('✅ Đã đóng kết nối MongoDB');
    } catch (error) {
      console.error('❌ Lỗi khi xử lý dữ liệu:', error);
      mongoose.connection.close();
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });