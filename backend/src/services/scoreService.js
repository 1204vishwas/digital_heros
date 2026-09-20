import db from '../db/database.js';

export const scoreService = {
  // Retrieve the latest 5 scores for a user, reverse chronological
  getUserScores(userId) {
    return db.prepare(`
      SELECT id, score, score_date, created_at
      FROM scores
      WHERE user_id = ?
      ORDER BY score_date DESC, created_at DESC
      LIMIT 5
    `).all(userId);
  },

  // Add a new score adhering to the 5-score rolling window and duplicate date rules
  addScore(userId, score, scoreDate) {
    // 1. Validate score range (1-45 Stableford)
    const numericScore = parseInt(score, 10);
    if (isNaN(numericScore) || numericScore < 1 || numericScore > 45) {
      throw new Error('Score must be a valid Stableford number between 1 and 45');
    }

    // 2. Validate date
    if (!scoreDate || !/^\d{4}-\d{2}-\d{2}$/.test(scoreDate)) {
      throw new Error('A valid score date in YYYY-MM-DD format is required');
    }

    // 3. Prevent duplicate score on same date (PRD § 05)
    const existing = db.prepare(`
      SELECT id FROM scores WHERE user_id = ? AND score_date = ?
    `).get(userId, scoreDate);

    if (existing) {
      throw new Error(`A score for ${scoreDate} already exists. You may edit or delete the existing entry.`);
    }

    const tx = db.transaction(() => {
      // Get all current scores sorted ascending by date (oldest first)
      const currentScores = db.prepare(`
        SELECT id, score_date, created_at
        FROM scores
        WHERE user_id = ?
        ORDER BY score_date ASC, created_at ASC
      `).all(userId);

      // If user already has 5 or more scores, evict the oldest score(s) so exactly 5 remain after insertion
      if (currentScores.length >= 5) {
        const excessCount = (currentScores.length - 5) + 1;
        const toDelete = currentScores.slice(0, excessCount);
        const deleteStmt = db.prepare('DELETE FROM scores WHERE id = ?');
        for (const s of toDelete) {
          deleteStmt.run(s.id);
        }
      }

      // Insert new score
      const insertStmt = db.prepare(`
        INSERT INTO scores (user_id, score, score_date)
        VALUES (?, ?, ?)
      `);
      const res = insertStmt.run(userId, numericScore, scoreDate);
      return res.lastInsertRowid;
    });

    tx();
    return this.getUserScores(userId);
  },

  // Edit an existing score
  updateScore(userId, scoreId, newScore, newDate) {
    const existing = db.prepare(`
      SELECT id, score, score_date FROM scores WHERE id = ? AND user_id = ?
    `).get(scoreId, userId);

    if (!existing) {
      throw new Error('Score entry not found');
    }

    const numericScore = parseInt(newScore, 10);
    if (isNaN(numericScore) || numericScore < 1 || numericScore > 45) {
      throw new Error('Score must be between 1 and 45');
    }

    if (newDate && newDate !== existing.score_date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        throw new Error('Invalid date format (YYYY-MM-DD required)');
      }
      const dateCheck = db.prepare(`
        SELECT id FROM scores WHERE user_id = ? AND score_date = ? AND id != ?
      `).get(userId, newDate, scoreId);

      if (dateCheck) {
        throw new Error(`A score for ${newDate} already exists. Duplicate dates are not allowed.`);
      }
    }

    db.prepare(`
      UPDATE scores
      SET score = ?, score_date = ?
      WHERE id = ? AND user_id = ?
    `).run(numericScore, newDate || existing.score_date, scoreId, userId);

    return this.getUserScores(userId);
  },

  // Delete a score
  deleteScore(userId, scoreId) {
    const res = db.prepare(`
      DELETE FROM scores WHERE id = ? AND user_id = ?
    `).run(scoreId, userId);

    if (res.changes === 0) {
      throw new Error('Score entry not found or unauthorized');
    }

    return this.getUserScores(userId);
  }
};
