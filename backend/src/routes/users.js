const express = require('express');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Check if admin
    const adminCheck = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!adminCheck.rows[0].email.endsWith('@threvia.app') && adminCheck.rows[0].email !== 'admin@threvia.app') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(
      'SELECT id, name, email, phone, wallet_address, bucks_balance, engagement_score, sessions_completed, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone, wallet_address, bucks_balance, engagement_score, sessions_completed FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email, phone, bucks_balance, engagement_score',
      [name || null, phone || null, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if admin
    const adminCheck = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!adminCheck.rows[0].email.endsWith('@threvia.app') && adminCheck.rows[0].email !== 'admin@threvia.app') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Add bucks to user (admin only)
router.post('/:id/add-bucks', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    // Check if admin
    const adminCheck = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!adminCheck.rows[0].email.endsWith('@threvia.app') && adminCheck.rows[0].email !== 'admin@threvia.app') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(
      'UPDATE users SET bucks_balance = bucks_balance + $1 WHERE id = $2 RETURNING id, name, bucks_balance',
      [amount, req.params.id]
    );

    // Log transaction
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [req.params.id, 'admin_bucks_add', amount, 'Admin added bucks']
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, engagement_score, bucks_balance, sessions_completed FROM users ORDER BY engagement_score DESC LIMIT 10'
    );

    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
