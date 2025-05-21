const mongoose = require('mongoose');
const Transaction = require('./models/Transaction'); // Import model Transaction

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('✅ Kết nối MongoDB thành công');
    console.log('Transaction model:', Transaction);

    try {
      // Kiểm tra và khởi tạo collection nếu chưa tồn tại
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map((col) => col.name);

      if (!collectionNames.includes('transactions')) {
        console.log('⚠️ Collection transactions chưa tồn tại, khởi tạo...');
        await Transaction.createCollection();
        console.log('✅ Đã tạo collection transactions');
      } else {
        console.log('✅ Collection transactions đã tồn tại, không cần khởi tạo');
      }

      // Kiểm tra tất cả bản ghi trong Transaction
      const transactions = await Transaction.find();
      console.log(`🔍 Tìm thấy ${transactions.length} bản ghi trong Transactions`);

      let invalidRecords = 0;
      transactions.forEach((transaction) => {
        const isValid =
          transaction.user &&
          ['income', 'expense'].includes(transaction.type) &&
          typeof transaction.amount === 'number' &&
          transaction.amount >= 0 &&
          transaction.category &&
          transaction.date instanceof Date &&
          ['Tiền mặt', 'Ngân hàng', 'Thẻ tín dụng', 'Chuyển khoản', 'Ví', 'Khác'].includes(transaction.paymentMethod) &&
          ['completed', 'pending', 'canceled'].includes(transaction.status);

        if (isValid) {
          console.log(
            `✅ Transaction ${transaction._id} - User: ${transaction.user}, Type: ${transaction.type}, Amount: ${transaction.amount}, Category: ${transaction.category}, PaymentMethod: ${transaction.paymentMethod}, Date: ${transaction.date.toISOString()}`
          );
        } else {
          console.warn(
            `⚠️ Invalid Transaction ${transaction._id} - Data: ${JSON.stringify(
              {
                user: transaction.user,
                type: transaction.type,
                amount: transaction.amount,
                category: transaction.category,
                paymentMethod: transaction.paymentMethod,
                status: transaction.status,
                date: transaction.date,
              },
              null,
              2
            )}`
          );
          invalidRecords++;
        }
      });

      if (invalidRecords > 0) {
        console.warn(`⚠️ Tìm thấy ${invalidRecords} bản ghi không hợp lệ trong Transactions`);
        // Tùy chọn: Xóa bản ghi không hợp lệ
        // const deleteResult = await Transaction.deleteMany({
        //   $or: [
        //     { user: { $exists: false } },
        //     { type: { $exists: false } },
        //     { amount: { $exists: false } },
        //     { category: { $exists: false } },
        //     { date: { $exists: false } },
        //     { paymentMethod: { $nin: ['Tiền mặt', 'Ngân hàng', 'Thẻ tín dụng', 'Chuyển khoản', 'Ví', 'Khác'] } },
        //     { status: { $nin: ['completed', 'pending', 'canceled'] } },
        //   ],
        // });
        // console.log(`🗑️ Đã xóa ${deleteResult.deletedCount} bản ghi không hợp lệ`);
      } else {
        console.log('✅ Tất cả bản ghi đều hợp lệ');
      }

      // Đóng kết nối
      await mongoose.connection.close();
      console.log('✅ Đã đóng kết nối MongoDB');
    } catch (error) {
      console.error('❌ Lỗi khi xử lý dữ liệu:', error);
      await mongoose.connection.close();
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });