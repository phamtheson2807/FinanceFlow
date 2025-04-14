const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('📌 User ID from token:', req.user._id); // Sửa thành _id
    let settings = await Settings.findOne({ user_id: req.user._id }); // Sửa thành _id

    if (!settings) {
      settings = new Settings({
        user_id: req.user._id, // Sửa thành _id
        language: 'vi',
        darkMode: false,
        emailNotifications: true,
        showBalance: true,
        currency: 'VND',
        aiFinancialManagement: false,
      });
      await settings.save();
      console.log('✅ Created new settings:', settings);
    }

    res.json(settings);
  } catch (error) {
    console.error('❌ Lỗi khi lấy cài đặt:', error.stack); // In stack trace để debug
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy cài đặt', error: error.message });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    console.log('📌 Update request body:', req.body);
    const updates = req.body;
    const allowedUpdates = ['language', 'darkMode', 'emailNotifications', 'showBalance', 'currency', 'aiFinancialManagement'];

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    console.log('✅ Filtered updates:', filteredUpdates);

    let settings = await Settings.findOne({ user_id: req.user._id }); // Sửa thành _id

    if (!settings) {
      settings = new Settings({
        user_id: req.user._id, // Sửa thành _id
        ...filteredUpdates,
      });
    } else {
      Object.assign(settings, filteredUpdates);
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật cài đặt:', error.stack); // In stack trace
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật cài đặt', error: error.message });
  }
});

module.exports = router;