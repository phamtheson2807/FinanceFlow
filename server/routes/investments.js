const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const Investment = require('../models/Investment');
const axios = require('axios');

// Lấy danh sách đầu tư - Cho phép tất cả các gói
router.get('/', authMiddleware, checkSubscription(['free', 'premium', 'pro'], 'Tính năng đầu tư'), async (req, res) => {
  console.log('👤 User data sau khi qua middleware:', req.user);
  try {
    const userId = req.user._id; // ✅ Sửa thành _id
    console.log('🔍 Tìm investments cho userId:', userId);
    const investments = await Investment.find({ user_id: userId });
    console.log('📊 Investments tìm thấy:', investments);

    const cryptoInvestments = investments.filter((inv) => inv.type === 'crypto' && inv.status === 'active');
    if (cryptoInvestments.length > 0) {
      const cryptoIds = cryptoInvestments.map((inv) => inv.name.toLowerCase()).join(',');
      console.log('🔗 Gọi CoinGecko API với IDs:', cryptoIds);
      const priceResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=vnd`
      );
      const prices = priceResponse.data;
      console.log('💰 Giá crypto từ CoinGecko:', prices);

      for (const inv of cryptoInvestments) {
        try {
          const currentPrice = prices[inv.name.toLowerCase()]?.vnd;
          if (currentPrice && inv.quantity) {
            inv.currentAmount = currentPrice * inv.quantity;
            await inv.save();
            console.log(`✅ Cập nhật ${inv.name}: currentAmount = ${inv.currentAmount}`);
          }
        } catch (err) {
          console.error(`❌ Lỗi khi cập nhật ${inv.name}:`, err);
        }
      }
    }

    res.json(investments);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách đầu tư:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách đầu tư' });
  }
});

// Tạo mới đầu tư - Cho phép tất cả các gói
router.post('/', authMiddleware, checkSubscription(['free', 'premium', 'pro'], 'Tính năng đầu tư'), async (req, res) => {
  try {
    const userId = req.user._id; // ✅ Sửa thành _id
    const {
      name, type, initialAmount, expectedReturn, startDate,
      endDate, notes, status, quantity
    } = req.body;

    if (!name || !type || !initialAmount) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' });
    }

    const investment = new Investment({
      user_id: userId,
      name,
      type,
      initialAmount,
      expectedReturn: expectedReturn || 0,
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      notes: notes || '',
      status: status || 'active',
      quantity: quantity || 0,
      currentAmount: initialAmount,
    });

    if (type === 'crypto' && quantity) {
      const priceResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${name.toLowerCase()}&vs_currencies=vnd`
      );
      const currentPrice = priceResponse.data[name.toLowerCase()]?.vnd;
      if (currentPrice) {
        investment.currentAmount = currentPrice * quantity;
      }
    }

    await investment.save();
    res.status(201).json(investment);
  } catch (error) {
    console.error('❌ Lỗi tạo đầu tư:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo khoản đầu tư' });
  }
});

// Cập nhật đầu tư - Cho phép tất cả các gói
router.put('/:id', authMiddleware, checkSubscription(['free', 'premium', 'pro'], 'Tính năng đầu tư'), async (req, res) => {
  try {
    const userId = req.user._id; // ✅ Sửa thành _id
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Không tìm thấy khoản đầu tư' });
    }
    if (investment.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa khoản đầu tư này' });
    }

    const {
      name, type, initialAmount, expectedReturn,
      startDate, endDate, notes, status, quantity
    } = req.body;

    investment.name = name || investment.name;
    investment.type = type || investment.type;
    investment.initialAmount = initialAmount || investment.initialAmount;
    investment.expectedReturn = expectedReturn || investment.expectedReturn;
    investment.startDate = startDate || investment.startDate;
    investment.endDate = endDate || investment.endDate;
    investment.notes = notes || investment.notes;
    investment.status = status || investment.status;
    investment.quantity = quantity !== undefined ? quantity : investment.quantity;

    if (req.body.currentAmount !== undefined) {
      investment.currentAmount = req.body.currentAmount;
    }

    if (investment.type === 'crypto' && investment.quantity) {
      const priceResponse = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${investment.name.toLowerCase()}&vs_currencies=vnd`
      );
      const currentPrice = priceResponse.data[investment.name.toLowerCase()]?.vnd;
      if (currentPrice) {
        investment.currentAmount = currentPrice * investment.quantity;
      }
    }

    await investment.save();
    res.json({ message: 'Cập nhật khoản đầu tư thành công', investment });
  } catch (error) {
    console.error('❌ Lỗi cập nhật đầu tư:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật khoản đầu tư' });
  }
});

// Xoá đầu tư - Cho phép tất cả các gói
router.delete('/:id', authMiddleware, checkSubscription(['free', 'premium', 'pro'], 'Tính năng đầu tư'), async (req, res) => {
  try {
    const userId = req.user._id; // ✅ Sửa thành _id
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Không tìm thấy khoản đầu tư' });
    }
    if (investment.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa khoản đầu tư này' });
    }

    await investment.deleteOne();
    res.json({ message: 'Xóa khoản đầu tư thành công' });
  } catch (error) {
    console.error('❌ Lỗi xoá đầu tư:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xoá khoản đầu tư' });
  }
});

module.exports = router;