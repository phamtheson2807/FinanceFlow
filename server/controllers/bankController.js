const BankAccount = require('../models/BankAccount');

exports.connectBank = async (req, res) => {
  try {
    const { bankName } = req.body;
    const userId = req.user.id;

    const fakeAccountNumber = '088' + Math.floor(100000000 + Math.random() * 900000000);
    const fakeBalance = Math.floor(Math.random() * 10000000 + 1000000);

    const sampleTransactions = [
      { type: 'income', amount: 2000000, description: 'Lương tháng' },
      { type: 'expense', amount: 300000, description: 'Mua hàng Tiki' },
      { type: 'expense', amount: 150000, description: 'GrabFood' },
      { type: 'income', amount: 500000, description: 'Chuyển từ bạn bè' }
    ];

    const newAccount = await BankAccount.create({
      userId, bankName, accountNumber: fakeAccountNumber, balance: fakeBalance,
      transactions: sampleTransactions
    });

    res.status(201).json({ message: 'Đã liên kết ngân hàng giả lập', account: newAccount });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi liên kết ngân hàng' });
  }
};

exports.getLinkedBanks = async (req, res) => {
  const accounts = await BankAccount.find({ userId: req.user.id }).sort({ linkedAt: -1 });
  res.json(accounts);
};

exports.getBankTransactions = async (req, res) => {
  const account = await BankAccount.findOne({ _id: req.params.accountId, userId: req.user.id });
  if (!account) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
  res.json({ transactions: account.transactions });
};

exports.deleteBankAccount = async (req, res) => {
  await BankAccount.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Đã huỷ liên kết tài khoản' });
};
