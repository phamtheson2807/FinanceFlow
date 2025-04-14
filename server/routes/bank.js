const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const authMiddleware = require('../middleware/auth');

router.post('/connect', authMiddleware, bankController.connectBank);
router.get('/accounts', authMiddleware, bankController.getLinkedBanks);
router.get('/transactions/:accountId', authMiddleware, bankController.getBankTransactions);
router.delete('/:id', authMiddleware, bankController.deleteBankAccount);

module.exports = router;
