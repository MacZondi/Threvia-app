const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, login_method) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, bucks_balance, engagement_score',
      [name, email, phone, hashedPassword, 'email']
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active
    await pool.query('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bucks_balance: user.bucks_balance,
        engagement_score: user.engagement_score,
        wallet_address: user.wallet_address,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Base/Wallet Login
router.post('/login-base', async (req, res) => {
  try {
    const { walletAddress, name } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Find or create user
    let user = await pool.query('SELECT * FROM users WHERE wallet_address = $1', [walletAddress]);

    if (user.rows.length === 0) {
      // Create new wallet user
      const result = await pool.query(
        'INSERT INTO users (name, email, wallet_address, login_method) VALUES ($1, $2, $3, $4) RETURNING id, name, email, wallet_address, bucks_balance, engagement_score',
        [name || 'Wallet User', `${walletAddress.slice(0, 10)}@base.wallet`, walletAddress, 'base']
      );
      user = { rows: [result.rows[0]] };
    }

    // Update last active
    await pool.query('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1', [user.rows[0].id]);

    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in with Base wallet',
      token,
      user: user.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
