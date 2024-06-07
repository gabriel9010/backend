const Transaction = require('../models/transaction');

exports.addTransaction = async (req, res) => {
  const { name, date, amount, type } = req.body;
  try {
    const transaction = new Transaction({
      name,
      date,
      amount,
      type,
      user: req.user.id,
    });

    await transaction.save();
    console.log('Transaction added:', transaction);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    console.log('Transactions fetched:', transactions);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
