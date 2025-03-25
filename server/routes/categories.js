const express = require('express');
const router = express.Router();
const Category = require('../models/Categories');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const DEFAULT_CATEGORIES = [
  { name: 'Ăn uống', type: 'expense', color: '#FF5722', icon: '🍔' },
  { name: 'Di chuyển', type: 'expense', color: '#3F51B5', icon: '🚖' },
  { name: 'Mua sắm', type: 'expense', color: '#9C27B0', icon: '🛍️' },
  { name: 'Lương', type: 'income', color: '#4CAF50', icon: '💰' },
  { name: 'Thưởng', type: 'income', color: '#FFC107', icon: '🎁' },
  { name: 'Khác', type: 'expense', color: '#607D8B', icon: '❓' },
];

// API lấy danh mục của user hoặc admin
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log("📡 User ID từ token:", req.user._id, "Role:", req.user.role);
    const categories = await Category.find({ userId: req.user._id });
    console.log("📡 Danh mục hiện có:", categories);

    // Nếu là admin và không có danh mục, tạo danh mục mặc định
    if (req.user.role === 'admin' && categories.length === 0) {
      console.log("⚡ Không có danh mục, tạo danh mục mặc định cho admin...");
      const defaultCategories = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        userId: req.user._id,
      }));
      const newCategories = await Category.insertMany(defaultCategories);
      console.log("✅ Đã tạo danh mục mặc định:", newCategories);
      return res.json(newCategories);
    }

    // Nếu là user hoặc admin có danh mục sẵn, trả về danh mục hiện có
    if (categories.length === 0) {
      console.log("⚠️ Không tìm thấy danh mục nào cho user:", req.user._id);
      return res.json([]); // Trả về mảng rỗng nếu không có danh mục
    }

    console.log("📡 Danh mục trả về:", categories);
    res.json(categories);
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh mục:', error.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh mục', error: error.message });
  }
});

// API thêm danh mục mới (chỉ dành cho admin)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Tên danh mục và loại là bắt buộc!' });
    }

    const newCategory = new Category({
      userId: req.user._id,
      name,
      type,
      color: color || '#000',
      icon: icon || '📂',
    });

    await newCategory.save();
    console.log('✅ Đã tạo danh mục mới:', newCategory);
    res.status(201).json({ message: '✅ Danh mục đã được tạo!', category: newCategory });
  } catch (error) {
    console.error('❌ Lỗi khi thêm danh mục:', error.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm danh mục', error: error.message });
  }
});

module.exports = router;