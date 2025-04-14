const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { authMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Quản lý ngân sách cá nhân
 */

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Lấy tất cả ngân sách của người dùng
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách ngân sách
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Budget'
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.status(200).json(budgets);
  } catch (error) {
    console.error('Lỗi khi lấy ngân sách:', error);
    res.status(500).json({ message: 'Không thể lấy ngân sách' });
  }
});

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Tạo ngân sách mới
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - budgets
 *             properties:
 *               budgets:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/BudgetInput'
 *     responses:
 *       201:
 *         description: Ngân sách đã được lưu
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post('/', authMiddleware, async (req, res) => {
  const { budgets } = req.body;
  if (!budgets || !Array.isArray(budgets)) {
    return res.status(400).json({ message: 'Dữ liệu ngân sách không hợp lệ' });
  }

  try {
    const newBudgets = budgets.map((budget) => ({
      ...budget,
      userId: req.user._id,
    }));
    await Budget.insertMany(newBudgets);
    res.status(201).json({ message: 'Ngân sách đã được lưu' });
  } catch (error) {
    console.error('Lỗi khi lưu ngân sách:', error);
    res.status(500).json({ message: 'Không thể lưu ngân sách' });
  }
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Budget:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         category:
 *           type: string
 *           example: Ăn uống
 *         amount:
 *           type: number
 *           example: 2000000
 *         period:
 *           type: string
 *           enum: [monthly, weekly]
 *           example: monthly
 *         createdAt:
 *           type: string
 *           format: date-time
 *     BudgetInput:
 *       type: object
 *       required:
 *         - category
 *         - amount
 *       properties:
 *         category:
 *           type: string
 *           example: Giải trí
 *         amount:
 *           type: number
 *           example: 1000000
 *         period:
 *           type: string
 *           enum: [monthly, weekly]
 *           default: monthly
 */
