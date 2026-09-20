import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `proof-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const router = express.Router();

// POST /api/winners/:id/proof - Winner uploads score screenshot (PRD § 09)
router.post('/:id/proof', authenticateToken, upload.single('proofImage'), (req, res) => {
  try {
    const winnerId = req.params.id;
    const winner = db.prepare('SELECT * FROM draw_winners WHERE id = ?').get(winnerId);

    if (!winner) {
      return res.status(404).json({ error: 'Winning ticket record not found' });
    }

    if (winner.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to upload proof for this ticket' });
    }

    let proofUrl = req.body.proofUrl;
    if (req.file) {
      proofUrl = `/uploads/${req.file.filename}`;
    }

    if (!proofUrl) {
      return res.status(400).json({ error: 'Screenshot proof image is required' });
    }

    db.prepare(`
      UPDATE draw_winners
      SET proof_url = ?, verification_status = 'pending', rejection_reason = NULL
      WHERE id = ?
    `).run(proofUrl, winnerId);

    const updated = db.prepare('SELECT * FROM draw_winners WHERE id = ?').get(winnerId);
    res.json({
      message: 'Proof submitted successfully for verification',
      winner: {
        ...updated,
        matched_numbers: JSON.parse(updated.matched_numbers)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to submit proof' });
  }
});

// GET /api/winners - Admin views full winners list (PRD § 11 Surface 04)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, payment } = req.query;
    let query = `
      SELECT dw.*, u.name as user_name, u.email as user_email,
             d.draw_code, d.draw_date, d.winning_numbers
      FROM draw_winners dw
      JOIN users u ON dw.user_id = u.id
      JOIN draws d ON dw.draw_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND dw.verification_status = ?';
      params.push(status);
    }
    if (payment) {
      query += ' AND dw.payment_status = ?';
      params.push(payment);
    }

    query += ' ORDER BY dw.created_at DESC';
    const winners = db.prepare(query).all(...params).map(w => ({
      ...w,
      matched_numbers: JSON.parse(w.matched_numbers),
      winning_numbers: JSON.parse(w.winning_numbers)
    }));

    res.json({ winners });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch winners' });
  }
});

// PUT /api/winners/:id/verify - Admin approves or rejects submission (PRD § 09 & § 11)
router.put('/:id/verify', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, reason } = req.body; // status: 'approved' | 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved, rejected, or pending' });
    }

    const winnerId = req.params.id;
    db.prepare(`
      UPDATE draw_winners
      SET verification_status = ?, rejection_reason = ?
      WHERE id = ?
    `).run(status, reason || null, winnerId);

    const updated = db.prepare(`
      SELECT dw.*, u.name as user_name, u.email as user_email
      FROM draw_winners dw
      JOIN users u ON dw.user_id = u.id
      WHERE dw.id = ?
    `).get(winnerId);

    res.json({
      message: `Winner verification status updated to ${status}`,
      winner: {
        ...updated,
        matched_numbers: JSON.parse(updated.matched_numbers)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update verification' });
  }
});

// PUT /api/winners/:id/payout - Admin marks payout as completed (PRD § 09: Pending -> Paid)
router.put('/:id/payout', authenticateToken, requireAdmin, (req, res) => {
  try {
    const winnerId = req.params.id;
    const winner = db.prepare('SELECT * FROM draw_winners WHERE id = ?').get(winnerId);

    if (!winner) {
      return res.status(404).json({ error: 'Winner not found' });
    }

    if (winner.verification_status !== 'approved') {
      return res.status(400).json({ error: 'Cannot payout until winner verification is approved' });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    db.prepare(`
      UPDATE draw_winners
      SET payment_status = 'paid', paid_at = ?
      WHERE id = ?
    `).run(now, winnerId);

    const updated = db.prepare('SELECT * FROM draw_winners WHERE id = ?').get(winnerId);
    res.json({
      message: 'Payout marked as completed',
      winner: {
        ...updated,
        matched_numbers: JSON.parse(updated.matched_numbers)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to process payout' });
  }
});

export default router;
