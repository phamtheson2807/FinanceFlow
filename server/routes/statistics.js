const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

/**
 * @swagger
 * tags:
 *   name: FinancialStatistics
 *   description: API thống kê tài chính cá nhân
 */

/**
 * @swagger
 * /api/financial-statistics:
 *   get:
 *     summary: Lấy thống kê tài chính của người dùng
 *     tags: [FinancialStatistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công, trả về thu nhập, chi tiêu và các thống kê chi tiết
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', auth, async (req, res) => {
    try {
        console.log(`📊 Fetching statistics for user: ${req.user.id}`);

        // Tính tổng thu nhập
        const incomeData = await Transaction.aggregate([
            { $match: { user_id: req.user.id, type: 'income' } },
            { $group: { _id: null, totalIncome: { $sum: '$amount' } } }
        ]);

        // Tính tổng chi tiêu
        const expenseData = await Transaction.aggregate([
            { $match: { user_id: req.user.id, type: 'expense' } },
            { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
        ]);

        // Thống kê theo danh mục
        const categoryStats = await Transaction.aggregate([
            { $match: { user_id: req.user.id } },
            { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } },
            { $sort: { totalAmount: -1 } }
        ]);

        // Thống kê thu nhập & chi tiêu theo tháng
        const monthlyStats = await Transaction.aggregate([
            { $match: { user_id: req.user.id } },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' }
                    },
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
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            totalIncome: incomeData[0]?.totalIncome || 0,
            totalExpense: expenseData[0]?.totalExpense || 0,
            categoryStats,
            monthlyStats
        });
    } catch (error) {
        console.error('❌ Lỗi khi lấy thống kê tài chính:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy thống kê' });
    }
});

module.exports = router;
