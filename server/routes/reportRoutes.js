const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Endpoint to get report data - accessible by all plans
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get date range parameters or use defaults
    const today = new Date();
    let { startDate, endDate } = req.query;
    
    if (!startDate) {
      // Default to last 30 days if not specified
      const defaultStartDate = new Date();
      defaultStartDate.setDate(today.getDate() - 30);
      startDate = defaultStartDate.toISOString();
    }
    
    if (!endDate) {
      endDate = today.toISOString();
    }

    const dateFilter = {
      date: { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      }
    };

    // Get all user transactions in date range
    const transactions = await Transaction.find({
      user_id: mongoose.Types.ObjectId(userId),
      ...dateFilter
    }).sort({ date: 1 });

    // Calculate summary data
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Prepare monthly statistics
    const monthlyStats = [];
    const monthMap = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!monthMap[key]) {
        monthMap[key] = {
          _id: { month, year },
          income: 0,
          expense: 0
        };
      }

      if (transaction.type === 'income') {
        monthMap[key].income += transaction.amount;
      } else {
        monthMap[key].expense += transaction.amount;
      }
    });

    Object.values(monthMap).forEach(monthData => {
      monthlyStats.push(monthData);
    });

    // Calculate category statistics
    const categoryStats = [];
    const categoryMap = {};

    transactions.forEach(transaction => {
      const category = transaction.category;
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          _id: category,
          totalAmount: 0
        };
      }

      if (transaction.type === 'expense') {
        categoryMap[category].totalAmount += transaction.amount;
      }
    });

    Object.values(categoryMap).forEach(categoryData => {
      categoryStats.push(categoryData);
    });

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      monthlyStats,
      categoryStats
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo báo cáo' });
  }
});

// Endpoint to check if user can export reports
router.get('/export-access', authMiddleware, async (req, res) => {
  try {
    const userPlan = req.user.plan || 'free';
    const canExport = ['premium', 'pro'].includes(userPlan);
    
    res.json({
      canExport,
      currentPlan: userPlan,
      requiredPlans: ['premium', 'pro']
    });
  } catch (error) {
    console.error('Error checking export access:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi kiểm tra quyền truy cập' });
  }
});

// Endpoint for exporting reports - requires premium or pro subscription
router.post('/export', authMiddleware, checkSubscription(['premium', 'pro'], 'Xuất báo cáo'), async (req, res) => {
  try {
    // This endpoint will only be accessible to premium and pro users
    // due to the checkSubscription middleware
    
    // For now, we'll just return success since the actual export happens on the client
    res.json({ 
      success: true,
      message: 'Bạn có quyền xuất báo cáo'
    });
  } catch (error) {
    console.error('Error in export endpoint:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xuất báo cáo' });
  }
});

module.exports = router; 