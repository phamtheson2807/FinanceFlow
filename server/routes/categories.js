const express = require('express');
const router = express.Router();
const Category = require('../models/Categories');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const DEFAULT_CATEGORIES = [
  { name: 'Ăn uống', type: 'expense', color: '#FF5722', icon: '🍔' },
  { name: 'Di chuyển', type: 'expense', color: '#2196F3', icon: '🚗' },
  { name: 'Mua sắm', type: 'expense', color: '#9C27B0', icon: '🛍️' },
  { name: 'Giải trí', type: 'expense', color: '#E91E63', icon: '🎮' },
  { name: 'Hóa đơn & Tiện ích', type: 'expense', color: '#F44336', icon: '📄' },
  { name: 'Xăng xe', type: 'expense', color: '#3F51B5', icon: '⛽' },
  { name: 'Tiết kiệm', type: 'expense', color: '#4CAF50', icon: '💰' },
  { name: 'Lương', type: 'income', color: '#4CAF50', icon: '💵' },
  { name: 'Thưởng', type: 'income', color: '#FFC107', icon: '🎁' },
  { name: 'Đầu tư', type: 'income', color: '#009688', icon: '📈' },
  { name: 'Khác', type: 'expense', color: '#607D8B', icon: '📦' }
];

// API lấy danh mục của user hoặc admin
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log("📡 User ID từ token:", req.user._id, "Role:", req.user.role);
    const categories = await Category.find({ userId: req.user._id });
    console.log("📡 Danh mục hiện có:", categories);

    // Nếu không có danh mục, tạo danh mục mặc định cho cả user và admin
    if (categories.length === 0) {
      console.log("⚡ Không có danh mục, tạo danh mục mặc định...");
      const defaultCategories = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        userId: req.user._id,
      }));
      const newCategories = await Category.insertMany(defaultCategories);
      console.log("✅ Đã tạo danh mục mặc định:", newCategories);
      return res.json(newCategories);
    }

    console.log("📡 Danh mục trả về:", categories);
    res.json(categories);
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh mục:', error.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh mục', error: error.message });
  }
});

// API thêm danh mục mới
router.post('/', authMiddleware, async (req, res) => {
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

// API xóa danh mục theo id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục để xóa!' });
    }
    res.json({ message: 'Đã xóa danh mục thành công!', category });
  } catch (error) {
    console.error('❌ Lỗi khi xóa danh mục:', error.stack);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa danh mục', error: error.message });
  }
});

// Tạo danh mục mặc định cho user
router.post('/create-defaults', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📂 Tạo danh mục mặc định cho user:', userId);

    // Kiểm tra xem user đã có danh mục nào chưa
    const existingCategories = await Category.find({ userId });
    if (existingCategories.length > 0) {
      return res.status(400).json({ message: 'User đã có danh mục. Không thể tạo mặc định.' });
    }

    // Tạo các danh mục mặc định
    const categories = await Promise.all(
      DEFAULT_CATEGORIES.map(cat => 
        Category.create({
          userId,
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon
        })
      )
    );

    console.log('✅ Đã tạo', categories.length, 'danh mục mặc định');
    res.json(categories);
  } catch (err) {
    console.error('❌ Lỗi khi tạo danh mục mặc định:', err);
    res.status(500).json({ message: 'Lỗi khi tạo danh mục mặc định' });
  }
});

module.exports = router;