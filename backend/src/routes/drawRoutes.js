import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { drawService } from '../services/drawService.js';
import { scoreService } from '../services/scoreService.js';

const router = express.Router();

// GET /api/draws/latest - Latest official draw (public)
router.get('/latest', (req, res) => {
  try {
    const latest = drawService.getLatestDraw();
    res.json({ draw: latest });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch latest draw' });
  }
});

// GET /api/draws/history - Historical draws (public)
router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const history = drawService.getDrawsHistory(limit);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch draw history' });
  }
});

// GET /api/draws/current-pool - Live prize pool status (public)
router.get('/current-pool', (req, res) => {
  try {
    const pool = drawService.calculatePrizePool();
    res.json({ pool });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to calculate pool' });
  }
});

// GET /api/draws/my-participation - Subscriber's draw participation & past tickets
router.get('/my-participation', authenticateToken, (req, res) => {
  try {
    const userScores = scoreService.getUserScores(req.user.id);
    const activeNumbers = userScores.map(s => s.score);

    // Get user's won draws
    const winnings = db.prepare(`
      SELECT dw.*, d.draw_code, d.draw_date, d.winning_numbers
      FROM draw_winners dw
      JOIN draws d ON dw.draw_id = d.id
      WHERE dw.user_id = ?
      ORDER BY d.draw_date DESC
    `).all(req.user.id).map(w => ({
      ...w,
      matched_numbers: JSON.parse(w.matched_numbers),
      winning_numbers: JSON.parse(w.winning_numbers)
    }));

    const totalWon = winnings
      .filter(w => w.payment_status === 'paid')
      .reduce((sum, w) => sum + w.prize_amount, 0);

    const pendingWon = winnings
      .filter(w => w.payment_status === 'pending')
      .reduce((sum, w) => sum + w.prize_amount, 0);

    res.json({
      activeNumbers,
      scores: userScores,
      isEligible: activeNumbers.length === 5 && req.user.subscription_status === 'active',
      winnings,
      totalWon,
      pendingWon
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch participation details' });
  }
});

// POST /api/draws/simulate - Admin runs simulation before publish (PRD § 06)
router.post('/simulate', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { mode = 'random', customNumbers } = req.body;
    const simulation = drawService.simulateDraw(mode, customNumbers);
    res.json({ simulation });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Simulation failed' });
  }
});

// POST /api/draws/publish - Admin officially publishes draw (PRD § 06 & § 07)
router.post('/publish', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { mode = 'random', customNumbers } = req.body;
    const result = drawService.publishDraw(mode, customNumbers);
    res.status(201).json({
      message: 'Official draw published successfully',
      draw: result
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to publish draw' });
  }
});

export default router;
