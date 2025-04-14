const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Saving = require('../models/Saving');
const Investment = require('../models/Investment');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Sửa từ .id thành ._id
        console.log('📡 User ID từ token:', userId);

        // Lấy dữ liệu giao dịch
        const transactions = await Transaction.find({ user: userId });
        console.log('📡 Transactions từ DB:', JSON.stringify(transactions, null, 2));

        const stats = transactions.reduce(
            (acc, transaction) => {
                if (transaction.type === 'income') {
                    acc.income += transaction.amount;
                } else if (transaction.type === 'expense') {
                    acc.expense += transaction.amount;
                }
                return acc;
            },
            { income: 0, expense: 0 }
        );

        // Lấy dữ liệu tiết kiệm thực tế
        const savings = await Saving.find({ user_id: userId });
        const totalSavings = savings.reduce((sum, item) => sum + (item.current_amount || 0), 0);
        stats.savings = totalSavings;

        // Lấy dữ liệu đầu tư thực tế
        const investments = await Investment.find({ user_id: userId });
        const totalInvestment = investments.reduce((sum, item) => sum + (item.currentAmount || item.initialAmount || 0), 0);
        stats.investment = totalInvestment;

        // Phân loại giao dịch theo danh mục
        const categoryStats = {};
        transactions.forEach(({ category, amount, type }) => {
            if (!categoryStats[category]) {
                categoryStats[category] = 0;
            }
            categoryStats[category] += type === 'income' ? amount : -amount;
        });
        const categories = Object.keys(categoryStats).map((name) => ({
            name,
            amount: categoryStats[name]
        }));

        // Tính monthlyData
        const monthlyDataMap = {};
        transactions.forEach((t) => {
            const date = new Date(t.date);
            const month = date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' });
            if (!monthlyDataMap[month]) {
                monthlyDataMap[month] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                monthlyDataMap[month].income += t.amount;
            } else {
                monthlyDataMap[month].expense += t.amount;
            }
        });
        const monthlyData = Object.keys(monthlyDataMap).map((month) => ({
            month,
            income: monthlyDataMap[month].income,
            expense: monthlyDataMap[month].expense
        }));

        const responseData = {
            stats,
            categories,
            monthlyData,
            recentTransactions: transactions.slice(-5)
        };
        console.log('📡 Dữ liệu trả về frontend:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (error) {
        console.error('❌ Lỗi lấy dữ liệu dashboard:', error.stack);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;