const express = require('express');
const axios = require('axios');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get token info
router.get('/info', async (req, res) => {
  try {
    res.json({
      name: 'Threvia Bucks',
      symbol: 'THREV',
      decimals: 18,
      address: process.env.THREVIA_TOKEN_ADDRESS,
      network: 'Base Sepolia',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get user token balance from blockchain
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // For now, return from database
    const result = await pool.query('SELECT bucks_balance FROM users WHERE wallet_address = $1', [address]);

    if (result.rows.length === 0) {
      return res.json({ balance: '0' });
    }

    res.json({ balance: result.rows[0].bucks_balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Purchase data with bucks (deduct from balance)
router.post('/purchase-data', verifyToken, async (req, res) => {
  try {
    const { packageId, amount } = req.body;

    // Get user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    // Check balance
    if (Number(user.bucks_balance) < Number(amount)) {
      return res.status(400).json({ error: 'Insufficient bucks balance' });
    }

    // Deduct bucks
    await pool.query(
      'UPDATE users SET bucks_balance = bucks_balance - $1 WHERE id = $2',
      [amount, req.user.id]
    );

    // Log transaction
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'data_purchase', amount, `Purchased data package ${packageId}`]
    );

    res.json({
      message: 'Data purchase successful',
      newBalance: Number(user.bucks_balance) - Number(amount),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Award bucks to user (admin only)
router.post('/award/:userId', verifyToken, async (req, res) => {
  try {
    const { amount, reason } = req.body;

    // Check if admin
    const adminCheck = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!adminCheck.rows[0].email.endsWith('@threvia.app') && adminCheck.rows[0].email !== 'admin@threvia.app') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Award bucks
    const result = await pool.query(
      'UPDATE users SET bucks_balance = bucks_balance + $1 WHERE id = $2 RETURNING id, name, bucks_balance',
      [amount, req.params.userId]
    );

    // Log transaction
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [req.params.userId, 'award', amount, reason || 'Admin award']
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
