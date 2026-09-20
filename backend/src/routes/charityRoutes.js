import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/charities - List charities with search and filtering (PRD § 08.2)
router.get('/', (req, res) => {
  try {
    const { search, category, featured } = req.query;
    let query = 'SELECT * FROM charities WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR mission LIKE ? OR description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (featured === 'true' || featured === '1') {
      query += ' AND is_featured = 1';
    }

    query += ' ORDER BY is_featured DESC, raised_amount DESC';
    const charities = db.prepare(query).all(...params);

    res.json({ charities });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch charities' });
  }
});

// GET /api/charities/categories - Unique categories for filtering
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT DISTINCT category FROM charities ORDER BY category ASC
    `).all().map(c => c.category);
    res.json({ categories: ['All', ...categories] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/charities/:slug - Detailed profile with upcoming events
router.get('/:slug', (req, res) => {
  try {
    const charity = db.prepare(`
      SELECT * FROM charities WHERE slug = ? OR id = ?
    `).get(req.params.slug, req.params.slug);

    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    const events = db.prepare(`
      SELECT * FROM charity_events
      WHERE charity_id = ?
      ORDER BY event_date ASC
    `).all(charity.id);

    const recentDonations = db.prepare(`
      SELECT amount, donation_type, donor_name, note, created_at
      FROM donations
      WHERE charity_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(charity.id);

    res.json({ charity, events, recentDonations });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch charity profile' });
  }
});

// POST /api/charities/:id/donate - Independent donation option, not tied to gameplay (PRD § 08.1)
router.post('/:id/donate', (req, res) => {
  try {
    const charityId = parseInt(req.params.id, 10);
    const { amount, donorName = 'Anonymous Hero', note = '' } = req.body;

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      return res.status(400).json({ error: 'Valid donation amount required' });
    }

    const charity = db.prepare('SELECT id, name FROM charities WHERE id = ?').get(charityId);
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    let userId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      // Optional: attach user ID if authenticated
      try {
        const token = authHeader.split(' ')[1];
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = decoded.id;
      } catch (e) {}
    }

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO donations (user_id, charity_id, amount, donation_type, donor_name, note)
        VALUES (?, ?, ?, 'direct_donation', ?, ?)
      `).run(userId, charityId, donationAmount, donorName.trim(), note.trim());

      db.prepare(`
        UPDATE charities
        SET raised_amount = raised_amount + ?
        WHERE id = ?
      `).run(donationAmount, charityId);
    });

    tx();

    res.status(201).json({
      message: `Thank you for supporting ${charity.name}!`,
      amount: donationAmount
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Donation failed' });
  }
});

// ADMIN ROUTES: CRUD Charities (PRD § 11 - Surface 03)

// POST /api/charities - Create charity
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, mission, description, category, logoUrl, coverImage, websiteUrl, targetAmount, isFeatured } = req.body;
    if (!name || !mission || !description || !category) {
      return res.status(400).json({ error: 'Name, mission, description, and category are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const result = db.prepare(`
      INSERT INTO charities (name, slug, mission, description, category, logo_url, cover_image, website_url, target_amount, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      slug,
      mission.trim(),
      description.trim(),
      category.trim(),
      logoUrl || 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=200',
      coverImage || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200',
      websiteUrl || '',
      parseFloat(targetAmount) || 50000.0,
      isFeatured ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM charities WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Charity created', charity: created });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create charity' });
  }
});

// PUT /api/charities/:id - Update charity
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, mission, description, category, logoUrl, coverImage, websiteUrl, targetAmount, isFeatured } = req.body;
    const charityId = req.params.id;

    const existing = db.prepare('SELECT * FROM charities WHERE id = ?').get(charityId);
    if (!existing) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    db.prepare(`
      UPDATE charities
      SET name = ?, mission = ?, description = ?, category = ?, logo_url = ?, cover_image = ?, website_url = ?, target_amount = ?, is_featured = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      mission || existing.mission,
      description || existing.description,
      category || existing.category,
      logoUrl || existing.logo_url,
      coverImage || existing.cover_image,
      websiteUrl !== undefined ? websiteUrl : existing.website_url,
      targetAmount !== undefined ? parseFloat(targetAmount) : existing.target_amount,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : existing.is_featured,
      charityId
    );

    const updated = db.prepare('SELECT * FROM charities WHERE id = ?').get(charityId);
    res.json({ message: 'Charity updated', charity: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update charity' });
  }
});

// DELETE /api/charities/:id - Delete charity
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const charityId = req.params.id;
    const resDel = db.prepare('DELETE FROM charities WHERE id = ?').run(charityId);
    if (resDel.changes === 0) {
      return res.status(404).json({ error: 'Charity not found' });
    }
    res.json({ message: 'Charity deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete charity' });
  }
});

// POST /api/charities/:id/events - Add charity event
router.post('/:id/events', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, eventDate, location, description } = req.body;
    if (!title || !eventDate || !location) {
      return res.status(400).json({ error: 'Title, eventDate, and location required' });
    }

    const result = db.prepare(`
      INSERT INTO charity_events (charity_id, title, event_date, location, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, title.trim(), eventDate, location.trim(), description || '');

    const event = db.prepare('SELECT * FROM charity_events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Event added', event });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to add event' });
  }
});

export default router;
