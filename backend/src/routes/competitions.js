const express = require('express');
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all competitions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM competitions ORDER BY created_at DESC');

    res.json({ competitions: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Create competition (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, metric, start_date, end_date, prize_pool } = req.body;

    // Check if admin
    const adminCheck = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!adminCheck.rows[0].email.endsWith('@threvia.app') && adminCheck.rows[0].email !== 'admin@threvia.app') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(
      'INSERT INTO competitions (name, description, metric, start_date, end_date, prize_pool, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, metric, start_date, end_date, prize_pool, 'active']
    );

    res.status(201).json({ competition: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update competition (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, description, metric, status, prize_pool } = req.body;

    // Check if admin
    const adminCheck = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!adminCheck.rows[0].email.endsWith('@threvia.app') && adminCheck.rows[0].email !== 'admin@threvia.app') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const result = await pool.query(
      'UPDATE competitions SET name = COALESCE($1, name), description = COALESCE($2, description), metric = COALESCE($3, metric), status = COALESCE($4, status), prize_pool = COALESCE($5, prize_pool), updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name || null, description || null, metric || null, status || null, prize_pool || null, req.params.id]
    );

    res.json({ competition: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete competition (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if admin
    const adminCheck = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!adminCheck.rows[0].email.endsWith('@threvia.app') && adminCheck.rows[0].email !== 'admin@threvia.app') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await pool.query('DELETE FROM competitions WHERE id = $1', [req.params.id]);

    res.json({ message: 'Competition deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
