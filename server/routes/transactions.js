const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Category = require('../models/Categories');
const Subscription = require('../models/Subscription');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');
const { checkLimit } = require('../middleware/checkLimit');

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

router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('📡 Nhận yêu cầu GET /api/transactions/stats từ user:', userId);

        // Kiểm tra gói subscription
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

// Route thêm giao dịch mới
router.post('/', authMiddleware, checkLimit('transactions'), async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📡 Nhận yêu cầu POST /api/transactions từ user:', userId, req.body);
    const { type, amount, category, description, date } = req.body;

    // Kiểm tra gói subscription và giới hạn giao dịch
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
    if (!category || category.trim() === '') {
        return res.status(400).json({ message: 'Danh mục không được để trống.' });
    }

    const existingCategory = await Category.findOne({ userId: userId, name: category });
    if (!existingCategory) {
        return res.status(400).json({ message: 'Danh mục không hợp lệ.' });
    }

    const incomeCategories = ['Lương', 'Thưởng'];
    if (incomeCategories.includes(category) && type !== 'income') {
        return res.status(400).json({ message: 'Danh mục "Lương" hoặc "Thưởng" phải là thu nhập (income).' });
    }
    if (!incomeCategories.includes(category) && type !== 'expense') {
        return res.status(400).json({ message: 'Danh mục này phải là chi tiêu (expense).' });
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
    console.log('✅ Đã tạo giao dịch:', newTransaction._id);
    
    // Tăng số lượng giao dịch sau khi thêm thành công
    await User.findByIdAndUpdate(req.user._id, { $inc: { transactionCount: 1 } });
    
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('❌ Lỗi khi thêm giao dịch:', err.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm giao dịch mới' });
  }
});

router.get('/trend', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(`📡 Lấy xu hướng chi tiêu cho user: ${userId}`);

        // Kiểm tra gói subscription
        const subscription = await Subscription.findOne({ userId });
        if (!subscription || subscription.plan !== 'pro') {
            return res.status(403).json({ message: 'Tính năng xu hướng chi tiêu chỉ dành cho gói Pro. Vui lòng nâng cấp!' });
        }

        const trendData = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                    totalExpense: { $sum: '$amount' },
                },
            },
            { $sort: { '_id': 1 } },
        ]);

        if (!trendData || trendData.length === 0) {
            console.warn('⚠️ Không có dữ liệu xu hướng chi tiêu');
            return res.json({ labels: [], data: [] });
        }

        const labels = trendData.map((item) => item._id);
        const data = trendData.map((item) => item.totalExpense);
        console.log(`📈 Xu hướng chi tiêu: ${JSON.stringify({ labels, data })}`);
        res.json({ labels, data });
    } catch (error) {
        console.error('❌ Lỗi khi lấy xu hướng chi tiêu:', error.stack);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy xu hướng chi tiêu' });
    }
});

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
        if (category && (!category || category.trim() === '')) {
            return res.status(400).json({ message: 'Danh mục không được để trống.' });
        }

        const incomeCategories = ['Lương', 'Thưởng'];
        if (category) {
            const existingCategory = await Category.findOne({ userId: userId, name: category });
            if (!existingCategory) {
                return res.status(400).json({ message: 'Danh mục không hợp lệ.' });
            }

            if (incomeCategories.includes(category) && type !== 'income') {
                return res.status(400).json({ message: 'Danh mục "Lương" hoặc "Thưởng" phải là thu nhập (income).' });
            }
            if (!incomeCategories.includes(category) && type !== 'expense') {
                return res.status(400).json({ message: 'Danh mục này phải là chi tiêu (expense).' });
            }
        }

        if (type) transaction.type = type;
        if (amount !== undefined) transaction.amount = amount;
        if (category) transaction.category = category;
        if (description !== undefined) transaction.description = description || '';
        if (date) transaction.date = new Date(date);

        await transaction.save();
        console.log('✅ Đã cập nhật giao dịch:', transaction._id);
        res.json(transaction);
    } catch (err) {
        console.error('❌ Lỗi khi cập nhật giao dịch:', err.stack);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật giao dịch' });
    }
});

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
        console.log('✅ Đã xóa giao dịch:', req.params.id);
        res.json({ message: 'Giao dịch đã bị xóa' });
    } catch (err) {
        console.error('❌ Lỗi khi xóa giao dịch:', err.stack);
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa giao dịch' });
    }
});

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

module.exports = router;