const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Category = require('../models/Categories');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');
const { checkLimit } = require('../middleware/checkLimit');

// Hàm tính balance từ transactions
const calculateUserBalance = async (userId) => {
  const transactions = await Transaction.find({ user: userId });
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return totalIncome - totalExpense;
};

// Lấy danh sách giao dịch
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    console.log('📡 Nhận yêu cầu GET /api/transactions từ user:', userId);
    const { startDate, endDate, type, category, page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;
    const query = { user: userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type && type !== 'all') {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();
    console.log('📡 Transactions từ DB:', JSON.stringify(transactions, null, 2));

    res.json({
      transactions: transactions || [],
      pagination: {
        total: total || 0,
        page: parseInt(page),
        totalPages: Math.ceil((total || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách giao dịch:', err.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách giao dịch' });
  }
});

// Thống kê giao dịch
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📡 Nhận yêu cầu GET /api/transactions/stats từ user:', userId);

    const subscription = await Subscription.findOne({ userId });
    if (!subscription || subscription.plan !== 'pro') {
      return res.status(403).json({ message: 'Tính năng thống kê chỉ dành cho gói Pro. Vui lòng nâng cấp!' });
    }

    const stats = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        },
      },
    ]);
    console.log('📡 Stats từ DB:', JSON.stringify(stats, null, 2));

    res.json(stats[0] || { totalIncome: 0, totalExpense: 0 });
  } catch (error) {
    console.error('❌ Lỗi khi lấy thống kê:', error.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thống kê' });
  }
});

// Thêm giao dịch mới
router.post('/', authMiddleware, checkLimit('transactions'), async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📡 Nhận yêu cầu POST /api/transactions từ user:', userId, req.body);
    const { type, amount, category, description, date } = req.body;

    const subscription = await Subscription.findOne({ userId });
    if (!subscription || subscription.plan === 'free') {
      const transactionCount = await Transaction.countDocuments({ user: userId });
      if (transactionCount >= 50) {
        return res.status(403).json({ message: 'Bạn đã đạt giới hạn 50 giao dịch. Nâng cấp lên gói Pro để tiếp tục!' });
      }
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Loại giao dịch không hợp lệ. Chỉ chấp nhận "income" hoặc "expense".' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Số tiền phải lớn hơn 0.' });
    }
    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Danh mục không hợp lệ hoặc không tồn tại.' });
    }

    const existingCategory = await Category.findOne({ userId: userId, _id: category });
    console.log('📡 Danh mục tìm thấy:', existingCategory);
    if (!existingCategory) {
      return res.status(400).json({ message: 'Danh mục không hợp lệ hoặc không tồn tại.' });
    }

    if (existingCategory.type !== type) {
      return res.status(400).json({ message: `Danh mục "${existingCategory.name}" phải là ${existingCategory.type}.` });
    }

    const newTransaction = new Transaction({
      user: userId,
      type,
      amount,
      category,
      description: description || '',
      date: new Date(date),
      paymentMethod: 'Tiền mặt',
      status: 'completed',
    });

    await newTransaction.save();

    // Cập nhật user.balance
    const user = await User.findById(userId);
    if (!user) {
      console.warn('⚠ Không tìm thấy user:', userId);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    user.balance = await calculateUserBalance(userId);
    await user.save();

    console.log('✅ Đã tạo giao dịch:', newTransaction._id);
    await User.findByIdAndUpdate(userId, { $inc: { transactionCount: 1 } });

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('❌ Lỗi khi thêm giao dịch:', error.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm giao dịch mới' });
  }
});

// Xu hướng chi tiêu
router.get('/trend', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { filter = 'month', startDate: queryStartDate, endDate: queryEndDate } = req.query;
    console.log(`📊 Lấy xu hướng chi tiêu cho user: ${userId}, filter: ${filter}`);

    // Xác định khoảng thời gian
    const now = new Date();
    let startDate = queryStartDate ? new Date(queryStartDate) : new Date();
    let endDate = queryEndDate ? new Date(queryEndDate) : now;
    let dateFormat;
    let groupByFormat;

    if (!queryStartDate || !queryEndDate) {
      switch (filter) {
        case 'day':
          startDate.setDate(startDate.getDate() - 7); // 7 ngày gần nhất
          dateFormat = '%Y-%m-%d';
          groupByFormat = { $dateToString: { format: '%d/%m', date: '$date' } };
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 28); // 4 tuần gần nhất
          dateFormat = '%Y-%U';
          groupByFormat = { 
            $dateToString: { 
              format: '%d/%m', 
              date: { $dateSubtract: { startDate: '$date', unit: 'day', amount: { $subtract: [{ $dayOfWeek: '$date' }, 1] } } }
            }
          };
          break;
        default: // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Đầu tháng hiện tại
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Cuối tháng hiện tại
          dateFormat = '%Y-%m';
          groupByFormat = { $dateToString: { format: '%m/%Y', date: '$date' } };
      }
    }

    console.log('📊 Khoảng thời gian:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Lấy tất cả giao dịch trong khoảng thời gian
    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Tính tổng thu/chi
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Lấy xu hướng theo thời gian
    const trendData = await Transaction.aggregate([
      { 
        $match: { 
          user: userId,
          date: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: groupByFormat,
          income: { 
            $sum: { 
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] 
            }
          },
          expense: { 
            $sum: { 
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] 
            }
          }
        }
      },
      { 
        $project: {
          _id: 0,
          name: '$_id',
          income: 1,
          expense: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    const result = {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      trendData
    };

    console.log('📊 Kết quả phân tích:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('❌ Lỗi khi lấy xu hướng chi tiêu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy xu hướng chi tiêu' });
  }
});

// Cập nhật giao dịch
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📡 Nhận yêu cầu PUT /api/transactions/:id từ user:', userId, req.params.id, req.body);
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    if (transaction.user.toString() !== userId) {
      return res.status(401).json({ message: 'Không có quyền chỉnh sửa giao dịch này' });
    }

    const { type, amount, category, description, date } = req.body;

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Loại giao dịch không hợp lệ. Chỉ chấp nhận "income" hoặc "expense".' });
    }
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Số tiền phải lớn hơn 0.' });
    }
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Danh mục không hợp lệ.' });
    }

    if (category) {
      const existingCategory = await Category.findOne({ userId: userId, _id: category });
      if (!existingCategory) {
        return res.status(400).json({ message: 'Danh mục không hợp lệ.' });
      }
      if (existingCategory.type !== (type || transaction.type)) {
        return res.status(400).json({ message: `Danh mục "${existingCategory.name}" phải là ${existingCategory.type}.` });
      }
    }

    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = amount;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description || '';
    if (date) transaction.date = new Date(date);

    await transaction.save();

    // Cập nhật user.balance
    const user = await User.findById(userId);
    if (!user) {
      console.warn('⚠ Không tìm thấy user:', userId);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    user.balance = await calculateUserBalance(userId);
    await user.save();

    console.log('✅ Đã cập nhật giao dịch:', transaction._id);
    res.json(transaction);
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật giao dịch:', err.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật giao dịch' });
  }
});

// Xóa giao dịch
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📡 Nhận yêu cầu DELETE /api/transactions/:id từ user:', userId, req.params.id);
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    if (transaction.user.toString() !== userId) {
      return res.status(401).json({ message: 'Không có quyền xóa giao dịch này' });
    }

    await transaction.deleteOne();

    // Cập nhật user.balance
    const user = await User.findById(userId);
    if (!user) {
      console.warn('⚠ Không tìm thấy user:', userId);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    user.balance = await calculateUserBalance(userId);
    await user.save();

    console.log('✅ Đã xóa giao dịch:', req.params.id);
    res.json({ message: 'Giao dịch đã bị xóa' });
  } catch (err) {
    console.error('❌ Lỗi khi xóa giao dịch:', err.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa giao dịch' });
  }
});

// Lấy danh sách giao dịch cho admin
router.get('/admin/transactions', authMiddleware, isAdmin, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📡 Nhận yêu cầu GET /api/admin/transactions từ admin:', userId);
    const { startDate, endDate, type, category, page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type && type !== 'all') {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('user', '_id name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();
    console.log('📡 Transactions từ DB:', JSON.stringify(transactions, null, 2));

    res.json({
      transactions: transactions || [],
      pagination: {
        total: total || 0,
        page: parseInt(page),
        totalPages: Math.ceil((total || 0) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách giao dịch cho admin:', err.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách giao dịch' });
  }
});

// Tổng hợp chi tiêu theo danh mục
router.get('/category-summary', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    console.log('📊 Phân tích chi tiêu theo danh mục cho user:', userId.toString());

    // Lấy tất cả giao dịch chi tiêu
    const transactions = await Transaction.find({ 
      user: userId, 
      type: 'expense'
    }).populate('category');
    console.log(`📊 Tìm thấy ${transactions.length} giao dịch chi tiêu`);

    // Tạo map để tổng hợp theo danh mục
    const categoryMap = new Map();
    
    // Tổng hợp số tiền theo danh mục
    transactions.forEach(transaction => {
      if (transaction.category) {
        const categoryId = transaction.category._id.toString();
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            category: transaction.category.name,
            color: transaction.category.color || '#000000',
            icon: transaction.category.icon || '📊',
            amount: 0,
            count: 0
          });
        }
        const data = categoryMap.get(categoryId);
        data.amount += transaction.amount;
        data.count += 1;
      }
    });

    // Chuyển map thành array và sắp xếp theo số tiền
    const summary = Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .map(item => ({
        category: item.category,
        amount: item.amount,
        color: item.color,
        icon: item.icon,
        transactionCount: item.count
      }));

    console.log('📊 Kết quả phân tích:', JSON.stringify(summary, null, 2));

    if (summary.length === 0) {
      console.log('⚠️ Không có dữ liệu phân tích chi tiêu');
      return res.json([]);
    }

    // Tính tổng chi tiêu và tỷ lệ phần trăm
    const totalExpense = summary.reduce((sum, item) => sum + item.amount, 0);
    const summaryWithPercentage = summary.map(item => ({
      ...item,
      percentage: Math.round((item.amount / totalExpense) * 100)
    }));

    res.json(summaryWithPercentage);
  } catch (err) {
    console.error('❌ Lỗi khi phân tích chi tiêu:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi phân tích chi tiêu theo danh mục' });
  }
});

// Tạo giao dịch mẫu để test
router.post('/create-samples', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📝 Tạo giao dịch mẫu cho user:', userId);

    // Lấy danh sách category của user
    const categories = await Category.find({ userId, type: 'expense' });
    if (categories.length === 0) {
      return res.status(400).json({ message: 'Vui lòng tạo danh mục trước khi tạo giao dịch mẫu' });
    }

    // Tạo các giao dịch mẫu
    const sampleTransactions = [];
    const today = new Date();
    
    for (const category of categories) {
      // Tạo 3 giao dịch cho mỗi danh mục trong 3 tháng gần nhất
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        
        const transaction = await Transaction.create({
          user: userId,
          type: 'expense',
          amount: Math.floor(Math.random() * 1000000) + 100000, // 100,000 đến 1,100,000
          category: category._id,
          description: `Giao dịch mẫu - ${category.name}`,
          date: date,
          paymentMethod: 'Tiền mặt',
          status: 'completed'
        });
        sampleTransactions.push(transaction);
      }
    }

    console.log('✅ Đã tạo', sampleTransactions.length, 'giao dịch mẫu');
    res.json(sampleTransactions);
  } catch (err) {
    console.error('❌ Lỗi khi tạo giao dịch mẫu:', err);
    res.status(500).json({ message: 'Lỗi khi tạo giao dịch mẫu' });
  }
});

module.exports = router;