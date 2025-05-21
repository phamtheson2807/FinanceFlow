const express = require('express');
const router = express.Router();
const Saving = require('../models/Saving');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Category = require('../models/Categories');
const { authMiddleware } = require('../middleware/auth');

// Hàm tính balance từ transactions
const calculateUserBalance = async (userId) => {
  try {
    const transactions = await Transaction.find({ user: userId });
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return totalIncome - totalExpense;
  } catch (error) {
    console.error('Lỗi tính toán số dư:', error);
    throw error;
  }
};

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
      target_date: new Date(target_date),
      current_amount: 0,
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

// Xóa quỹ tiết kiệm và hoàn tiền về ví
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const savingId = req.params.id;
    const { returnToBalance } = req.body;
    console.log('📡 Nhận yêu cầu DELETE /api/savings/:id từ user:', userId, 'ID quỹ:', savingId, 'Return to balance:', returnToBalance);

    // Tìm quỹ tiết kiệm
    const saving = await Saving.findById(savingId);
    if (!saving) {
      console.warn('⚠ Không tìm thấy quỹ:', savingId);
      return res.status(404).json({ message: 'Không tìm thấy quỹ tiết kiệm' });
    }

    if (returnToBalance && saving.current_amount > 0) {
      // Lấy thông tin người dùng
      const user = await User.findById(userId);
      if (!user) {
        console.warn('⚠ Không tìm thấy user:', userId);
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      // Tìm danh mục "Tiết kiệm" loại income
      const savingCategory = await Category.findOne({ userId, name: 'Tiết kiệm', type: 'income' });
      if (!savingCategory) {
        console.warn('⚠ Không tìm thấy danh mục "Tiết kiệm"');
        return res.status(400).json({ message: 'Danh mục "Tiết kiệm" không tồn tại' });
      }

      // Tạo giao dịch thu nhập để hoàn tiền
      const transaction = new Transaction({
        user: userId,
        type: 'income',
        amount: saving.current_amount,
        category: savingCategory._id,
        description: `Hoàn tiền từ quỹ ${saving.name}`,
        date: new Date(),
        paymentMethod: 'Ví',
        status: 'completed',
      });
      await transaction.save();
      console.log('✅ Đã tạo giao dịch hoàn tiền:', transaction._id);

      // Cập nhật số dư người dùng
      user.balance = await calculateUserBalance(userId);
      await user.save();
      console.log('Số dư sau khi hoàn tiền:', user.balance);
    }

    // Đánh dấu quỹ đã xóa
    saving.deleted_at = new Date();
    await saving.save();

    console.log('✅ Đã xóa quỹ:', savingId);
    res.status(200).json({ 
      message: 'Quỹ tiết kiệm đã được xóa', 
      returnedAmount: returnToBalance ? saving.current_amount : 0,
      newBalance: returnToBalance ? await calculateUserBalance(userId) : undefined
    });
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

    // Lấy thông tin người dùng
    const user = await User.findById(userId);
    if (!user) {
      console.warn('⚠ Không tìm thấy user:', userId);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Tính toán số dư chính xác từ transactions
    const currentBalance = await calculateUserBalance(userId);
    console.log('Số dư hiện tại của người dùng:', currentBalance);

    // Kiểm tra số dư có đủ không
    if (currentBalance < amount) {
      console.warn('⚠ Số dư không đủ:', { balance: currentBalance, amount });
      return res.status(400).json({ message: 'Số dư ví không đủ để thêm vào quỹ' });
    }

    // Tìm quỹ tiết kiệm
    const saving = await Saving.findById(savingId);
    if (!saving) {
      console.warn('⚠ Không tìm thấy quỹ:', savingId);
      return res.status(404).json({ message: 'Không tìm thấy quỹ tiết kiệm' });
    }

    // Tìm danh mục "Tiết kiệm"
    const savingCategory = await Category.findOne({ userId, name: 'Tiết kiệm', type: 'expense' });
    if (!savingCategory) {
      console.warn('⚠ Không tìm thấy danh mục "Tiết kiệm"');
      return res.status(400).json({ message: 'Danh mục "Tiết kiệm" không tồn tại' });
    }

    // Cập nhật số tiền hiện tại của quỹ
    saving.current_amount = (saving.current_amount || 0) + amount;
    const updatedSaving = await saving.save();

    // Tạo giao dịch chi tiêu
    const transaction = new Transaction({
      user: userId,
      type: 'expense',
      amount,
      category: savingCategory._id,
      description: `Thêm tiền vào quỹ ${updatedSaving.name}`,
      date: new Date(),
      paymentMethod: 'Ví',
      status: 'completed',
    });
    await transaction.save();
    console.log('✅ Đã tạo giao dịch chi tiêu:', transaction._id);

    // Cập nhật user.balance sau khi tạo giao dịch
    user.balance = await calculateUserBalance(userId);
    await user.save();
    console.log('Số dư sau khi cập nhật:', user.balance);

    console.log('✅ Đã thêm tiền vào quỹ:', JSON.stringify(updatedSaving, null, 2));
    res.status(200).json({ 
      message: 'Thêm tiền vào quỹ tiết kiệm thành công', 
      saving: updatedSaving,
      newBalance: user.balance 
    });
  } catch (error) {
    console.error('❌ Lỗi thêm tiền vào quỹ tiết kiệm:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm tiền vào quỹ tiết kiệm' });
  }
});

// Rút tiền từ quỹ tiết kiệm
router.patch('/:id/withdraw', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const savingId = req.params.id;
    const { amount } = req.body;
    console.log('📡 Nhận yêu cầu PATCH /api/savings/:id/withdraw từ user:', userId, 'ID quỹ:', savingId, 'Số tiền:', amount);

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.warn('⚠ Số tiền không hợp lệ:', amount);
      return res.status(400).json({ message: 'Số tiền phải là số dương' });
    }

    // Tìm quỹ tiết kiệm
    const saving = await Saving.findById(savingId);
    if (!saving) {
      console.warn('⚠ Không tìm thấy quỹ:', savingId);
      return res.status(404).json({ message: 'Không tìm thấy quỹ tiết kiệm' });
    }

    if ((saving.current_amount || 0) < amount) {
      console.warn('⚠ Số dư quỹ không đủ:', { current_amount: saving.current_amount, amount });
      return res.status(400).json({ message: 'Số dư quỹ không đủ để rút' });
    }

    // Lấy thông tin người dùng
    const user = await User.findById(userId);
    if (!user) {
      console.warn('⚠ Không tìm thấy user:', userId);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Tìm danh mục "Tiết kiệm" loại income
    const savingCategory = await Category.findOne({ userId, name: 'Tiết kiệm', type: 'income' });
    if (!savingCategory) {
      console.warn('⚠ Không tìm thấy danh mục "Tiết kiệm"');
      return res.status(400).json({ message: 'Danh mục "Tiết kiệm" không tồn tại' });
    }

    // Cập nhật số tiền hiện tại của quỹ
    saving.current_amount -= amount;
    const updatedSaving = await saving.save();

    // Tạo giao dịch thu nhập
    const transaction = new Transaction({
      user: userId,
      type: 'income',
      amount,
      category: savingCategory._id,
      description: `Rút tiền từ quỹ ${updatedSaving.name}`,
      date: new Date(),
      paymentMethod: 'Ví',
      status: 'completed',
    });
    await transaction.save();
    console.log('✅ Đã tạo giao dịch thu nhập:', transaction._id);

    // Cập nhật số dư người dùng
    const newBalance = await calculateUserBalance(userId);
    user.balance = newBalance;
    await user.save();
    console.log('Số dư sau khi cập nhật:', user.balance);

    console.log('✅ Đã rút tiền từ quỹ:', JSON.stringify(updatedSaving, null, 2));
    res.status(200).json({ 
      message: 'Rút tiền từ quỹ tiết kiệm thành công', 
      saving: updatedSaving,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('❌ Lỗi rút tiền từ quỹ tiết kiệm:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Lỗi máy chủ khi rút tiền từ quỹ tiết kiệm' });
  }
});

module.exports = router;