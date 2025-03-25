const db = require('../config/db');

exports.getTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTransaction = async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, type, amount, category, description, date]
    );
    
    res.status(201).json({
      id: result.insertId,
      type,
      amount,
      category,
      description,
      date
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, description, date } = req.body;
  
  try {
    await db.query(
      'UPDATE transactions SET type = ?, amount = ?, category = ?, description = ?, date = ? WHERE id = ? AND user_id = ?',
      [type, amount, category, description, date, id, req.user.id]
    );
    
    res.json({ message: 'Transaction updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 