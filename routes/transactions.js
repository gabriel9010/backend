const express = require('express');
const router = express.Router();
const { addTransaction, getTransactions } = require('../controllers/transactionController');
const authMiddleware = require('../config/authMiddleware');

router.post('/transactions', authMiddleware, addTransaction);
router.get('/transactions', authMiddleware, getTransactions);

module.exports = router;
