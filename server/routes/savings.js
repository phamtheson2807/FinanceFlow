const express = require('express');
const router = express.Router();
const Saving = require('../models/Saving');
const { authMiddleware } = require('../middleware/auth');

// Lấy danh sách quỹ tiết kiệm của user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('📡 Nhận yêu cầu GET /api/savings từ user:', userId);

    const savings = await Saving.find({ user_id: userId });
    console.log('📡 Savings từ DB:', JSON.stringify(savings, null, 2));

    res.status(200).json(savings);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách quỹ tiết kiệm:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách quỹ tiết kiệm' });
  }
});

// Tạo quỹ tiết kiệm mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, target_amount, target_date } = req.body;
    console.log('📡 Nhận yêu cầu POST /api/savings từ user:', userId, 'Dữ liệu:', req.body);

    // Kiểm tra dữ liệu đầu vào
    if (!name || !target_amount || !target_date) {
      console.warn('⚠ Thiếu thông tin trong request:', { name, target_amount, target_date });
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin (name, target_amount, target_date)' });
    }

    if (typeof target_amount !== 'number' || target_amount <= 0) {
      console.warn('⚠ Số tiền mục tiêu không hợp lệ:', target_amount);
      return res.status(400).json({ message: 'Số tiền mục tiêu phải là số dương' });
    }

    const newSaving = new Saving({
      user_id: userId,
      name,
      target_amount,
      target_date: new Date(target_date), // Chuyển thành định dạng Date
      current_amount: 0, // Khởi tạo current_amount mặc định là 0
    });

    const savedSaving = await newSaving.save();
    console.log('✅ Đã tạo quỹ tiết kiệm:', savedSaving._id);

    res.status(201).json(savedSaving);
  } catch (error) {
    console.error('❌ Lỗi tạo quỹ tiết kiệm:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo quỹ tiết kiệm' });
  }
});

// Cập nhật thông tin quỹ tiết kiệm
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const savingId = req.params.id;
    const { name, target_amount, target_date } = req.body;
    console.log('📡 Nhận yêu cầu PUT /api/savings/:id từ user:', userId, 'ID quỹ:', savingId, 'Dữ liệu:', req.body);

    const saving = await Saving.findById(savingId);
    if (!saving) {
      console.warn('⚠ Không tìm thấy quỹ:', savingId);
      return res.status(404).json({ message: 'Không tìm thấy quỹ tiết kiệm' });
    }

    console.log('📡 Thông tin quỹ từ DB:', JSON.stringify(saving, null, 2));
    if (saving.user_id.toString() !== userId) {
      console.warn('⚠ Quyền truy cập bị từ chối cho user:', userId, 'Quỹ thuộc về:', saving.user_id);
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa quỹ này' });
    }

    // Cập nhật các trường nếu có
    if (name) saving.name = name;
    if (target_amount) {
      if (typeof target_amount !== 'number' || target_amount <= 0) {
        console.warn('⚠ Số tiền mục tiêu không hợp lệ:', target_amount);
        return res.status(400).json({ message: 'Số tiền mục tiêu phải là số dương' });
      }
      saving.target_amount = target_amount;
    }
    if (target_date) saving.target_date = new Date(target_date);

    const updatedSaving = await saving.save();
    console.log('✅ Đã cập nhật quỹ:', updatedSaving._id);

    res.status(200).json({ message: 'Cập nhật quỹ tiết kiệm thành công', saving: updatedSaving });
  } catch (error) {
    console.error('❌ Lỗi cập nhật quỹ tiết kiệm:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật quỹ tiết kiệm' });
  }
});

// Xóa quỹ tiết kiệm
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id.toString(); // Chuyển ObjectId thành chuỗi
    const savingId = req.params.id;
    console.log('📡 Nhận yêu cầu DELETE /api/savings/:id từ user:', userId, 'ID quỹ:', savingId);

    const saving = await Saving.findById(savingId);
    if (!saving) {
      console.warn('⚠ Không tìm thấy quỹ:', savingId);
      return res.status(404).json({ message: 'Không tìm thấy quỹ tiết kiệm' });
    }

    console.log('📡 Thông tin quỹ từ DB:', JSON.stringify(saving, null, 2));
    if (saving.user_id.toString() !== userId) {
      console.warn('⚠ Quyền truy cập bị từ chối cho user:', userId, 'Quỹ thuộc về:', saving.user_id);
      return res.status(403).json({ message: 'Bạn không có quyền xóa quỹ này' });
    }

    await saving.deleteOne();
    console.log('✅ Đã xóa quỹ:', savingId);
    res.status(200).json({ message: 'Quỹ tiết kiệm đã được xóa' });
  } catch (error) {
    console.error('❌ Lỗi xóa quỹ tiết kiệm:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa quỹ tiết kiệm' });
  }
});

// Thêm tiền vào quỹ tiết kiệm
router.patch('/:id/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const savingId = req.params.id;
    const { amount } = req.body;
    console.log('📡 Nhận yêu cầu PATCH /api/savings/:id/add từ user:', userId, 'ID quỹ:', savingId, 'Số tiền:', amount);

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.warn('⚠ Số tiền không hợp lệ:', amount);
      return res.status(400).json({ message: 'Số tiền phải là số dương' });
    }

    const saving = await Saving.findById(savingId);
    if (!saving) {
      console.warn('⚠ Không tìm thấy quỹ:', savingId);
      return res.status(404).json({ message: 'Không tìm thấy quỹ tiết kiệm' });
    }

    console.log('📡 Thông tin quỹ từ DB:', JSON.stringify(saving, null, 2));
    console.log('📡 Giá trị userId:', userId, 'Kiểu:', typeof userId);
    console.log('📡 Giá trị saving.user_id:', saving.user_id, 'Kiểu:', typeof saving.user_id);
    console.log('📡 So sánh userId.toString():', userId.toString(), 'với saving.user_id.toString():', saving.user_id.toString());

    // Chuyển cả hai thành chuỗi để so sánh
    if (saving.user_id.toString() !== userId.toString()) {
      console.warn('⚠ Quyền truy cập bị từ chối cho user:', userId, 'Quỹ thuộc về:', saving.user_id);
      return res.status(403).json({ message: 'Bạn không có quyền thêm tiền vào quỹ này' });
    }

    saving.current_amount = (saving.current_amount || 0) + amount;
    const updatedSaving = await saving.save();
    console.log('✅ Đã thêm tiền vào quỹ:', JSON.stringify(updatedSaving, null, 2));

    res.status(200).json({ message: 'Thêm tiền vào quỹ tiết kiệm thành công', saving: updatedSaving });
  } catch (error) {
    console.error('❌ Lỗi thêm tiền vào quỹ tiết kiệm:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm tiền vào quỹ tiết kiệm' });
  }
});

module.exports = router;