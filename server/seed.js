const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // Thêm bcrypt để hash password
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Saving = require('./models/Saving');
const Investment = require('./models/Investment');
const connectDB = require('./config/db'); // Import hàm kết nối

// Load env vars
dotenv.config();

// Kết nối đến MongoDB
connectDB(); // Gọi hàm kết nối

// Dữ liệu mẫu
const seedDB = async () => {
  try {
    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await Saving.deleteMany({});
    await Investment.deleteMany({});

    // Tạo user với password đã hash
    const hashedPassword = await bcrypt.hash('123456', 10);

    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin', // Đặt vai trò là admin
      isVerified: true // ✅ Admin được xác thực ngay lập tức
    });

    const user = await User.create({
      name: 'Phạm Thế Sơn',
      email: 'phamtheson@gmail.com',
      password: hashedPassword,
      role: 'user', // Đặt vai trò là user
      isVerified: false // ✅ Người dùng chưa xác thực
    });

    // Tạo các giao dịch với user_id thực
    const transactions = [
      {
        user: user._id, // ✅ Sửa từ user_id -> user
        type: 'income',
        amount: 15000000,
        category: 'Lương',
        description: 'Lương tháng 1',
        date: new Date(),
        paymentMethod: 'Chuyển khoản',
        status: 'completed', // ✅ Sửa từ 'Hoàn thành' -> 'completed'
        attachments: [], // ✅ Thêm trường attachments
        notes: '' // ✅ Thêm trường notes
      },
      {
        user: user._id, // ✅ Sửa từ user_id -> user
        type: 'expense',
        amount: 500000,
        category: 'Ăn uống',
        description: 'Ăn trưa',
        date: new Date(),
        paymentMethod: 'Tiền mặt',
        status: 'completed', // ✅ Sửa từ 'Hoàn thành' -> 'completed'
        attachments: [],
        notes: ''
      },
      {
        user: user._id, // ✅ Sửa từ user_id -> user
        type: 'expense',
        amount: 1000000,
        category: 'Mua sắm',
        description: 'Quần áo',
        date: new Date(),
        paymentMethod: 'Thẻ tín dụng',
        status: 'completed', // ✅ Sửa từ 'Hoàn thành' -> 'completed'
        attachments: [],
        notes: ''
      },
      {
        user: user._id, // ✅ Sửa từ user_id -> user
        type: 'income',
        amount: 5000000,
        category: 'Thưởng',
        description: 'Thưởng dự án',
        date: new Date(),
        paymentMethod: 'Chuyển khoản',
        status: 'completed', // ✅ Sửa từ 'Hoàn thành' -> 'completed'
        attachments: [],
        notes: ''
      }
    ];

    await Transaction.insertMany(transactions);

    // Tạo các khoản tiết kiệm
    const savings = [
      {
        user_id: user._id,
        name: 'Tiết kiệm du lịch',
        target_amount: 10000000,
        current_amount: 2000000,
        target_date: new Date('2024-12-31')
      }
    ];

    await Saving.insertMany(savings);

    // Tạo các khoản đầu tư
    const investments = [
      {
        user_id: user._id,
        name: 'Cổ phiếu ABC',
        amount: 5000000,
        type: 'Cổ phiếu',
        expected_return: 10
      }
    ];

    await Investment.insertMany(investments);

    console.log('Dữ liệu mẫu đã được thêm thành công!');
    console.log('User created:', user._id);
    console.log('Transactions created:', transactions.length);
    console.log('Savings created:', savings.length);
    console.log('Investments created:', investments.length);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Chạy hàm seed
seedDB();