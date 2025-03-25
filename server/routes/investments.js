const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Investment = require('../models/Investment');
const axios = require('axios');

// Lấy danh sách đầu tư và cập nhật giá crypto
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Đảm bảo sử dụng _id từ JWT payload
        console.log('📡 Nhận yêu cầu GET /api/investments từ user:', userId);
        const investments = await Investment.find({ user_id: userId });
        console.log('📡 Investments từ DB:', JSON.stringify(investments, null, 2));

        // Cập nhật giá crypto từ CoinGecko
        const cryptoInvestments = investments.filter((inv) => inv.type === 'crypto' && inv.status === 'active');
        if (cryptoInvestments.length > 0) {
            console.log('🚀 Có', cryptoInvestments.length, 'khoản crypto cần cập nhật giá');
            const cryptoIds = cryptoInvestments.map((inv) => inv.name.toLowerCase()).join(',');
            console.log('📞 Gọi CoinGecko API với IDs:', cryptoIds);

            try {
                const priceResponse = await axios.get(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=vnd`
                );
                console.log('✅ CoinGecko API response:', JSON.stringify(priceResponse.data, null, 2));
                const prices = priceResponse.data;

                for (const inv of cryptoInvestments) {
                    const currentPrice = prices[inv.name.toLowerCase()]?.vnd;
                    if (currentPrice && inv.quantity) {
                        const oldCurrentAmount = inv.currentAmount;
                        inv.currentAmount = currentPrice * inv.quantity;
                        const profitLoss = inv.currentAmount - inv.initialAmount;
                        console.log(
                            `💰 Cập nhật ${inv.name}: Giá hiện tại = ${currentPrice} VND, currentAmount = ${inv.currentAmount} VND, Lợi nhuận/Thua lỗ = ${profitLoss} VND (${((profitLoss / inv.initialAmount) * 100).toFixed(2)}%)`
                        );
                        await inv.save();
                    } else if (!currentPrice) {
                        console.warn(`⚠ Không tìm thấy giá cho ${inv.name} trên CoinGecko`);
                    }
                }
            } catch (apiError) {
                console.error('❌ Lỗi khi gọi CoinGecko API:', apiError.message);
            }
        } else {
            console.log('ℹ Không có khoản crypto nào để cập nhật');
        }

        res.json(investments);
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách đầu tư:', error.stack);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách đầu tư' });
    }
});

// Thêm mới khoản đầu tư
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Đảm bảo sử dụng _id từ JWT payload
        console.log('📡 Nhận yêu cầu POST /api/investments từ user:', userId, req.body);
        const {
            name,
            type,
            initialAmount,
            expectedReturn,
            startDate,
            endDate,
            notes,
            status,
            quantity,
        } = req.body;

        if (!name || !type || !initialAmount) {
            console.warn('⚠ Thiếu thông tin bắt buộc');
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên, loại và số tiền ban đầu' });
        }
        if (type === 'crypto' && !quantity) {
            console.warn('⚠ Thiếu số lượng coin cho crypto');
            return res.status(400).json({ message: 'Vui lòng cung cấp số lượng coin cho đầu tư crypto' });
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
            console.log('📞 Gọi CoinGecko API để khởi tạo giá cho', name);
            try {
                const priceResponse = await axios.get(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${name.toLowerCase()}&vs_currencies=vnd`
                );
                console.log('✅ CoinGecko API response:', JSON.stringify(priceResponse.data, null, 2));
                const currentPrice = priceResponse.data[name.toLowerCase()]?.vnd;
                if (currentPrice) {
                    investment.currentAmount = currentPrice * quantity;
                    const profitLoss = investment.currentAmount - investment.initialAmount;
                    console.log(
                        `💰 Khởi tạo ${name}: Giá hiện tại = ${currentPrice} VND, currentAmount = ${investment.currentAmount} VND, Lợi nhuận/Thua lỗ = ${profitLoss} VND (${((profitLoss / investment.initialAmount) * 100).toFixed(2)}%)`
                    );
                } else {
                    console.warn(`⚠ Không tìm thấy giá cho ${name} trên CoinGecko`);
                }
            } catch (apiError) {
                console.error('❌ Lỗi khi gọi CoinGecko API trong POST:', apiError.message);
            }
        }

        await investment.save();
        console.log('✅ Đã tạo khoản đầu tư:', investment._id);
        res.status(201).json(investment);
    } catch (error) {
        console.error('❌ Lỗi tạo đầu tư:', error.stack);
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo khoản đầu tư' });
    }
});

// Cập nhật khoản đầu tư
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Đảm bảo sử dụng _id từ JWT payload
        console.log('📡 Nhận yêu cầu PUT /api/investments/:id từ user:', userId, req.params.id, req.body);
        const {
            name,
            type,
            initialAmount,
            expectedReturn,
            startDate,
            endDate,
            notes,
            status,
            quantity,
        } = req.body;

        const investment = await Investment.findById(req.params.id);
        if (!investment) {
            console.warn('⚠ Không tìm thấy đầu tư:', req.params.id);
            return res.status(404).json({ message: 'Không tìm thấy khoản đầu tư' });
        }

        if (investment.user_id.toString() !== userId) {
            console.warn('⚠ Quyền truy cập bị từ chối cho user:', userId);
            return res.status(403).json({ message: 'Bạn không có quyền sửa khoản đầu tư này' });
        }

        investment.name = name || investment.name;
        investment.type = type || investment.type;
        investment.initialAmount = initialAmount || investment.initialAmount;
        investment.expectedReturn = expectedReturn || investment.expectedReturn;
        investment.startDate = startDate || investment.startDate;
        investment.endDate = endDate || investment.endDate;
        investment.notes = notes || investment.notes;
        investment.status = status || investment.status;
        investment.quantity = quantity !== undefined ? quantity : investment.quantity;

        if (investment.type === 'crypto' && investment.quantity) {
            console.log('📞 Gọi CoinGecko API để cập nhật giá cho', investment.name);
            try {
                const priceResponse = await axios.get(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${investment.name.toLowerCase()}&vs_currencies=vnd`
                );
                console.log('✅ CoinGecko API response:', JSON.stringify(priceResponse.data, null, 2));
                const currentPrice = priceResponse.data[investment.name.toLowerCase()]?.vnd;
                if (currentPrice) {
                    const oldCurrentAmount = investment.currentAmount;
                    investment.currentAmount = currentPrice * investment.quantity;
                    const profitLoss = investment.currentAmount - investment.initialAmount;
                    console.log(
                        `💰 Cập nhật ${investment.name}: Giá cũ = ${oldCurrentAmount} VND, Giá hiện tại = ${currentPrice} VND, currentAmount = ${investment.currentAmount} VND, Lợi nhuận/Thua lỗ = ${profitLoss} VND (${((profitLoss / investment.initialAmount) * 100).toFixed(2)}%)`
                    );
                } else {
                    console.warn(`⚠ Không tìm thấy giá cho ${investment.name} trên CoinGecko`);
                    investment.currentAmount = investment.initialAmount;
                }
            } catch (apiError) {
                console.error('❌ Lỗi khi gọi CoinGecko API trong PUT:', apiError.message);
                investment.currentAmount = investment.initialAmount;
            }
        }

        await investment.save();
        console.log('✅ Đã cập nhật khoản đầu tư:', investment._id);
        res.json({ message: 'Cập nhật khoản đầu tư thành công', investment });
    } catch (error) {
        console.error('❌ Lỗi cập nhật đầu tư:', error.stack);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật khoản đầu tư' });
    }
});

// Xóa khoản đầu tư
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Đảm bảo sử dụng _id từ JWT payload
        console.log('📡 Nhận yêu cầu DELETE /api/investments/:id từ user:', userId, req.params.id);
        const investment = await Investment.findById(req.params.id);

        if (!investment) {
            console.warn('⚠ Không tìm thấy đầu tư:', req.params.id);
            return res.status(404).json({ message: 'Không tìm thấy khoản đầu tư' });
        }

        if (investment.user_id.toString() !== userId) {
            console.warn('⚠ Quyền truy cập bị từ chối cho user:', userId);
            return res.status(403).json({ message: 'Bạn không có quyền xóa khoản đầu tư này' });
        }

        await investment.deleteOne();
        console.log('✅ Đã xóa khoản đầu tư:', req.params.id);
        res.json({ message: 'Xóa khoản đầu tư thành công' });
    } catch (error) {
        console.error('❌ Lỗi xóa đầu tư:', error.stack);
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa khoản đầu tư' });
    }
});

module.exports = router; // Sửa từ route thành router