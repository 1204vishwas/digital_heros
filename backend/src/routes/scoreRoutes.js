import express from 'express';
import { authenticateToken, requireActiveSubscription } from '../middleware/auth.js';
import { scoreService } from '../services/scoreService.js';

const router = express.Router();

// All score routes require authentication and active subscription (PRD § 04 & § 05)
router.use(authenticateToken, requireActiveSubscription);

// GET /api/scores - Get user's current 5 scores (reverse chronological)
router.get('/', (req, res) => {
  try {
    const scores = scoreService.getUserScores(req.user.id);
    res.json({ scores });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch scores' });
  }
});

// POST /api/scores - Add score with rolling logic and unique date validation
router.post('/', (req, res) => {
  try {
    const { score, scoreDate } = req.body;
    if (score === undefined || !scoreDate) {
      return res.status(400).json({ error: 'Score and scoreDate are required' });
    }

    const updatedScores = scoreService.addScore(req.user.id, score, scoreDate);
    res.status(201).json({
      message: 'Score successfully recorded',
      scores: updatedScores
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/scores/:id - Edit an existing score
router.put('/:id', (req, res) => {
  try {
    const { score, scoreDate } = req.body;
    const updatedScores = scoreService.updateScore(req.user.id, req.params.id, score, scoreDate);
    res.json({
      message: 'Score successfully updated',
      scores: updatedScores
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/scores/:id - Delete a score
router.delete('/:id', (req, res) => {
  try {
    const updatedScores = scoreService.deleteScore(req.user.id, req.params.id);
    res.json({
      message: 'Score successfully deleted',
      scores: updatedScores
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
