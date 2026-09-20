import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { scoreService } from '../services/scoreService.js';

const router = express.Router();

// Require admin access for all routes
router.use(authenticateToken, requireAdmin);

// GET /api/admin/users - Surface 01: User Management
router.get('/users', (req, res) => {
  try {
    const { search, status, role } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.subscription_plan,
             u.subscription_status, u.subscription_price, u.renewal_date,
             u.charity_id, u.charity_percentage, u.created_at,
             c.name as charity_name
      FROM users u
      LEFT JOIN charities c ON u.charity_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status && status !== 'all') {
      query += ' AND u.subscription_status = ?';
      params.push(status);
    }
    if (role && role !== 'all') {
      query += ' AND u.role = ?';
      params.push(role);
    }

    query += ' ORDER BY u.created_at DESC';
    const users = db.prepare(query).all(...params);

    // Fetch scores for each user
    const scoresStmt = db.prepare(`
      SELECT id, score, score_date, created_at
      FROM scores
      WHERE user_id = ?
      ORDER BY score_date DESC, created_at DESC
      LIMIT 5
    `);

    const enrichedUsers = users.map(user => ({
      ...user,
      scores: scoresStmt.all(user.id)
    }));

    res.json({ users: enrichedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT u.*, c.name as charity_name
      FROM users u
      LEFT JOIN charities c ON u.charity_id = c.id
      WHERE u.id = ?
    `).get(req.params.id);

    if (!user) return res.status(404).json({ error: 'User not found' });
    delete user.password_hash;

    const scores = scoreService.getUserScores(user.id);
    res.json({ user, scores });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch user' });
  }
});

// PUT /api/admin/users/:id - Edit user profile & subscription
router.put('/users/:id', (req, res) => {
  try {
    const { name, role, subscriptionPlan, subscriptionStatus, charityId, charityPercentage } = req.body;
    const userId = req.params.id;

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          role = COALESCE(?, role),
          subscription_plan = COALESCE(?, subscription_plan),
          subscription_status = COALESCE(?, subscription_status),
          charity_id = COALESCE(?, charity_id),
          charity_percentage = COALESCE(?, charity_percentage)
      WHERE id = ?
    `).run(
      name,
      role,
      subscriptionPlan,
      subscriptionStatus,
      charityId,
      charityPercentage,
      userId
    );

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    delete updated.password_hash;

    res.json({ message: 'User updated successfully', user: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update user' });
  }
});

// PUT /api/admin/users/:id/scores - Admin edits scores directly (PRD § 11 Surface 01)
router.put('/users/:id/scores', (req, res) => {
  try {
    const userId = req.params.id;
    const { scores } = req.body; // array of { score, score_date }

    if (!Array.isArray(scores)) {
      return res.status(400).json({ error: 'Scores array expected' });
    }

    if (scores.length > 5) {
      return res.status(400).json({ error: 'Max 5 scores allowed' });
    }

    // Check unique dates within provided array
    const dateSet = new Set();
    for (const s of scores) {
      if (dateSet.has(s.score_date)) {
        return res.status(400).json({ error: `Duplicate date ${s.score_date} found in score set` });
      }
      dateSet.add(s.score_date);
      const val = parseInt(s.score, 10);
      if (val < 1 || val > 45) {
        return res.status(400).json({ error: 'All scores must be between 1 and 45' });
      }
    }

    const tx = db.transaction(() => {
      db.prepare('DELETE FROM scores WHERE user_id = ?').run(userId);
      const insert = db.prepare('INSERT INTO scores (user_id, score, score_date) VALUES (?, ?, ?)');
      for (const s of scores) {
        insert.run(userId, parseInt(s.score, 10), s.score_date);
      }
    });
    tx();

    const updatedScores = scoreService.getUserScores(userId);
    res.json({ message: 'User scores updated', scores: updatedScores });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update user scores' });
  }
});

// GET /api/admin/reports - Surface 05: Reports & Analytics
router.get('/reports', (req, res) => {
  try {
    // 1. Total users breakdown
    const userStats = db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active_subscribers,
        SUM(CASE WHEN subscription_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_subscribers,
        SUM(CASE WHEN subscription_status = 'lapsed' THEN 1 ELSE 0 END) as lapsed_subscribers
      FROM users WHERE role != 'admin'
    `).get();

    // 2. Prize pool stats
    const prizeStats = db.prepare(`
      SELECT 
        COALESCE(SUM(total_pool), 0) as total_prize_pool_history,
        COUNT(*) as total_draws_conducted
      FROM draws WHERE status = 'published'
    `).get();

    const winnersStats = db.prepare(`
      SELECT 
        COALESCE(SUM(prize_amount), 0) as total_payouts_awarded,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN prize_amount ELSE 0 END), 0) as total_payouts_paid,
        COUNT(*) as total_winners_count
      FROM draw_winners
    `).get();

    const rolloverSetting = db.prepare(`SELECT value FROM system_settings WHERE key = 'jackpot_rollover'`).get();
    const currentRollover = rolloverSetting ? parseFloat(rolloverSetting.value) : 0;

    // 3. Charity totals
    const charityStats = db.prepare(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_charity_contributions,
        COALESCE(SUM(CASE WHEN donation_type = 'subscription_split' THEN amount ELSE 0 END), 0) as subscription_charity_split,
        COALESCE(SUM(CASE WHEN donation_type = 'direct_donation' THEN amount ELSE 0 END), 0) as direct_donations_total
      FROM donations
    `).get();

    // Charity breakdown by organization
    const charityBreakdown = db.prepare(`
      SELECT c.id, c.name, c.category, c.target_amount, c.raised_amount,
             COALESCE(SUM(d.amount), 0) as platform_donations
      FROM charities c
      LEFT JOIN donations d ON c.id = d.charity_id
      GROUP BY c.id
      ORDER BY c.raised_amount DESC
    `).all();

    res.json({
      users: userStats,
      prizePool: {
        currentRollover,
        totalPoolHistory: prizeStats.total_prize_pool_history,
        totalDraws: prizeStats.total_draws_conducted,
        totalPayoutsAwarded: winnersStats.total_payouts_awarded,
        totalPayoutsPaid: winnersStats.total_payouts_paid,
        totalWinnersCount: winnersStats.total_winners_count
      },
      charity: {
        ...charityStats,
        breakdown: charityBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to generate reports' });
  }
});

// GET /api/admin/score-distribution - Score frequency across all active subscribers (1-45)
router.get('/score-distribution', (req, res) => {
  try {
    const rawScores = db.prepare(`
      SELECT s.score, COUNT(*) as count
      FROM scores s
      JOIN users u ON s.user_id = u.id
      WHERE u.subscription_status = 'active'
      GROUP BY s.score
      ORDER BY s.score ASC
    `).all();

    const scoreMap = {};
    for (let i = 1; i <= 45; i++) scoreMap[i] = 0;
    rawScores.forEach(r => { scoreMap[r.score] = r.count; });

    const distribution = Object.keys(scoreMap).map(k => ({
      score: parseInt(k, 10),
      count: scoreMap[k]
    }));

    res.json({ distribution });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch distribution' });
  }
});

export default router;
