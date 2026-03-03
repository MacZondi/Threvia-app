const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/users/:userId/session
 * Get current user session and stats
 */
router.get('/:userId/session', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await pool.query(
      'SELECT id, email, points, threv_balance, first_ad_watched FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get active session
    const sessionResult = await pool.query(
      `SELECT id, started_at, expires_at, data_allocated, data_remaining, ads_watched, points_earned, is_active
       FROM data_sessions
       WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    const activeSession = sessionResult.rows[0] || null;

    res.json({
      firstAdWatched: user.first_ad_watched,
      points: user.points || 0,
      threvBucks: user.threv_balance || 0,
      activeSession: activeSession ? {
        sessionId: activeSession.id,
        startedAt: activeSession.started_at,
        expiresAt: activeSession.expires_at,
        dataAllocated: activeSession.data_allocated,
        dataRemaining: activeSession.data_remaining,
        adsWatched: activeSession.ads_watched,
        pointsEarned: activeSession.points_earned,
        isActive: activeSession.is_active,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * POST /api/users/:userId/session/create
 * Create new 25-minute data session (after watching first ad)
 */
router.post('/:userId/session/create', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { adId, durationMinutes = 25 } = req.body;

    // Validate input
    if (!adId || !durationMinutes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const durationSeconds = durationMinutes * 60;

    // Create session
    const sessionResult = await pool.query(
      `INSERT INTO data_sessions 
       (id, user_id, started_at, expires_at, data_allocated, data_remaining, ads_watched, points_earned, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 1, 0, true)
       RETURNING *`,
      [sessionId, userId, now, expiresAt, durationSeconds, durationSeconds]
    );

    // Mark first ad as watched
    await pool.query(
      'UPDATE users SET first_ad_watched = true WHERE id = $1',
      [userId]
    );

    // Log ad watch
    await pool.query(
      `INSERT INTO ad_logs (id, user_id, sponsor_id, watched_at, duration_seconds, points_earned, session_id)
       VALUES ($1, $2, $3, $4, $5, 0, $6)`,
      [uuidv4(), userId, adId, now, 20, sessionId] // Assuming ~20 sec average duration
    );

    const session = sessionResult.rows[0];

    res.json({
      success: true,
      message: 'Data session created successfully',
      session: {
        sessionId: session.id,
        startedAt: session.started_at,
        expiresAt: session.expires_at,
        dataAllocated: session.data_allocated,
        dataRemaining: session.data_remaining,
        isActive: session.is_active,
      },
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * POST /api/users/:userId/points/add
 * Add points after watching recurring ad
 */
router.post('/:userId/points/add', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, adId } = req.body;

    if (!points || !adId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update user points
    const userResult = await pool.query(
      'UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points',
      [points, userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPoints = userResult.rows[0].points;

    // Log ad watch
    await pool.query(
      `INSERT INTO ad_logs (id, user_id, sponsor_id, watched_at, duration_seconds, points_earned)
       VALUES ($1, $2, $3, $4, 30, $5)`,
      [uuidv4(), userId, adId, new Date(), points]
    );

    res.json({
      success: true,
      message: `${points} points awarded`,
      newPoints,
    });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

/**
 * POST /api/users/:userId/points/convert
 * Convert 100 points → 1 THREV token
 * Mints token to user's wallet
 */
router.post('/:userId/points/convert', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { threvAmount } = req.body;

    if (!threvAmount || threvAmount < 1) {
      return res.status(400).json({ error: 'Invalid THREV amount' });
    }

    const pointsRequired = threvAmount * 100;

    // Get user and check points
    const userResult = await pool.query(
      'SELECT id, points, threv_balance, wallet_address FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (user.points < pointsRequired) {
      return res.status(400).json({
        error: 'Insufficient points',
        currentPoints: user.points,
        required: pointsRequired,
      });
    }

    if (!user.wallet_address) {
      return res.status(400).json({
        error: 'No wallet connected. Connect your wallet to claim THREV tokens.',
      });
    }

    // Deduct points and add THREV
    const updateResult = await pool.query(
      `UPDATE users 
       SET points = points - $1, threv_balance = threv_balance + $2 
       WHERE id = $3 
       RETURNING points, threv_balance`,
      [pointsRequired, threvAmount, userId]
    );

    // TODO: Call smart contract to mint tokens
    // await mintThrevTokens(user.wallet_address, threvAmount);

    res.json({
      success: true,
      message: `${threvAmount} THREV tokens minted to your wallet!`,
      newBalance: updateResult.rows[0].threv_balance,
      remainingPoints: updateResult.rows[0].points,
      transactionHash: 'tx_pending_implementation', // Will be actual hash after mint
    });
  } catch (error) {
    console.error('Error converting points:', error);
    res.status(500).json({ error: 'Failed to convert points' });
  }
});

/**
 * GET /api/users/:userId/ad-history
 * Get user's ad watch history
 */
router.get('/:userId/ad-history', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT id, sponsor_id, watched_at, duration_seconds, points_earned, session_id
       FROM ad_logs
       WHERE user_id = $1
       ORDER BY watched_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      total: result.rows.length,
      ads: result.rows,
    });
  } catch (error) {
    console.error('Error fetching ad history:', error);
    res.status(500).json({ error: 'Failed to fetch ad history' });
  }
});

/**
 * GET /api/sponsors
 * Get list of active sponsors (for admin)
 */
router.get('/sponsors/list', async (req, res) => {
  try {
    // For now, return hardcoded sponsor list
    // In production, store in database
    const sponsors = [
      {
        id: 'vodacom',
        name: 'Vodacom',
        tagline: 'Connecting South Africa',
        category: 'telecom',
        isActive: true,
      },
      {
        id: 'capitec',
        name: 'Capitec Bank',
        tagline: 'Banking made simple',
        category: 'finance',
        isActive: true,
      },
      {
        id: 'nsfas',
        name: 'NSFAS',
        tagline: 'Funding your future',
        category: 'education',
        isActive: true,
      },
      {
        id: 'doh',
        name: 'Dept of Health',
        tagline: 'Your health, our priority',
        category: 'health',
        isActive: true,
      },
      {
        id: 'mtn',
        name: 'MTN',
        tagline: 'Everywhere you go',
        category: 'telecom',
        isActive: true,
      },
    ];

    res.json({ sponsors });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

module.exports = router;
