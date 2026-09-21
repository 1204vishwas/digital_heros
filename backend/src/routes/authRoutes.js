import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate token
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, plan = 'monthly', charityId = null, charityPercentage = 10 } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const pct = Math.max(10, parseFloat(charityPercentage) || 10); // Minimum 10% (PRD § 08.1)
    const passwordHash = bcrypt.hashSync(password, 10);

    // Calculate subscription plan pricing & initial state
    let subStatus = 'active';
    let price = 499.0;
    const now = new Date();
    let renewalDate = new Date();

    if (plan === 'yearly') {
      price = 4990.0; // 2 months discount (Save ₹998)
      renewalDate.setFullYear(now.getFullYear() + 1);
    } else {
      renewalDate.setMonth(now.getMonth() + 1);
    }

    // Default charity if none specified
    let targetCharityId = charityId;
    if (!targetCharityId) {
      const firstCharity = db.prepare('SELECT id FROM charities LIMIT 1').get();
      targetCharityId = firstCharity ? firstCharity.id : null;
    }

    const result = db.prepare(`
      INSERT INTO users (
        name, email, password_hash, role, subscription_plan, subscription_status,
        subscription_price, renewal_date, charity_id, charity_percentage
      ) VALUES (?, ?, ?, 'subscriber', ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      cleanEmail,
      passwordHash,
      plan,
      subStatus,
      price,
      renewalDate.toISOString().split('T')[0],
      targetCharityId,
      pct
    );

    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.subscription_plan, u.subscription_status,
             u.subscription_price, u.renewal_date, u.charity_id, u.charity_percentage,
             c.name as charity_name, c.logo_url as charity_logo
      FROM users u
      LEFT JOIN charities c ON u.charity_id = c.id
      WHERE u.id = ?
    `).get(result.lastInsertRowid);

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.password_hash, u.role, u.subscription_plan,
             u.subscription_status, u.subscription_price, u.renewal_date,
             u.charity_id, u.charity_percentage,
             c.name as charity_name, c.logo_url as charity_logo
      FROM users u
      LEFT JOIN charities c ON u.charity_id = c.id
      WHERE u.email = ?
    `).get(cleanEmail);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    delete user.password_hash;
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// POST /api/auth/social-login
router.post('/social-login', (req, res) => {
  try {
    const { 
      provider = 'google', 
      email, 
      name, 
      plan = 'monthly', 
      charityId = null, 
      charityPercentage = 15 
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required for social authentication' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.subscription_plan,
             u.subscription_status, u.subscription_price, u.renewal_date,
             u.charity_id, u.charity_percentage,
             c.name as charity_name, c.logo_url as charity_logo
      FROM users u
      LEFT JOIN charities c ON u.charity_id = c.id
      WHERE u.email = ?
    `).get(cleanEmail);

    if (!user) {
      // Create new subscriber with social profile
      const pct = Math.max(10, parseFloat(charityPercentage) || 15);
      const randomPassword = bcrypt.hashSync(`social-${provider}-${Date.now()}-${Math.random()}`, 10);
      
      let price = plan === 'yearly' ? 4990.0 : 499.0;
      const now = new Date();
      let renewalDate = new Date();
      if (plan === 'yearly') {
        renewalDate.setFullYear(now.getFullYear() + 1);
      } else {
        renewalDate.setMonth(now.getMonth() + 1);
      }

      let targetCharityId = charityId;
      if (!targetCharityId) {
        const firstCharity = db.prepare('SELECT id FROM charities LIMIT 1').get();
        targetCharityId = firstCharity ? firstCharity.id : null;
      }

      const userName = name && name.trim().length > 0 ? name.trim() : cleanEmail.split('@')[0];

      const result = db.prepare(`
        INSERT INTO users (
          name, email, password_hash, role, subscription_plan, subscription_status,
          subscription_price, renewal_date, charity_id, charity_percentage
        ) VALUES (?, ?, ?, 'subscriber', ?, 'active', ?, ?, ?, ?)
      `).run(
        userName,
        cleanEmail,
        randomPassword,
        plan,
        price,
        renewalDate.toISOString().split('T')[0],
        targetCharityId,
        pct
      );

      user = db.prepare(`
        SELECT u.id, u.name, u.email, u.role, u.subscription_plan, u.subscription_status,
               u.subscription_price, u.renewal_date, u.charity_id, u.charity_percentage,
               c.name as charity_name, c.logo_url as charity_logo
        FROM users u
        LEFT JOIN charities c ON u.charity_id = c.id
        WHERE u.id = ?
      `).get(result.lastInsertRowid);
    }

    const token = signToken(user);
    res.json({ token, user, provider });
  } catch (err) {
    console.error('Social login error:', err);
    res.status(500).json({ error: err.message || 'Social authentication failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.subscription_plan,
             u.subscription_status, u.subscription_price, u.renewal_date,
             u.charity_id, u.charity_percentage,
             c.name as charity_name, c.logo_url as charity_logo, c.slug as charity_slug
      FROM users u
      LEFT JOIN charities c ON u.charity_id = c.id
      WHERE u.id = ?
    `).get(req.user.id);

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, charityId, charityPercentage } = req.body;
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (charityId !== undefined) {
      updates.push('charity_id = ?');
      params.push(charityId);
    }

    if (charityPercentage !== undefined) {
      const pct = Math.max(10, parseFloat(charityPercentage) || 10);
      updates.push('charity_percentage = ?');
      params.push(pct);
    }

    if (updates.length > 0) {
      params.push(req.user.id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.subscription_plan,
             u.subscription_status, u.subscription_price, u.renewal_date,
             u.charity_id, u.charity_percentage,
             c.name as charity_name, c.logo_url as charity_logo
      FROM users u
      LEFT JOIN charities c ON u.charity_id = c.id
      WHERE u.id = ?
    `).get(req.user.id);

    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Profile update failed' });
  }
});

// POST /api/auth/subscription
// Handles renewal, plan change, and cancellation states (PRD § 04)
router.post('/subscription', authenticateToken, (req, res) => {
  try {
    const { action, plan } = req.body; // action: 'subscribe' | 'change_plan' | 'cancel' | 'reactivate'

    let newPlan = req.user.subscription_plan;
    let newStatus = req.user.subscription_status;
    let price = req.user.subscription_price;
    const now = new Date();
    let renewalDate = new Date();

    if (action === 'cancel') {
      newStatus = 'cancelled';
    } else if (action === 'reactivate' || action === 'subscribe' || action === 'change_plan') {
      newStatus = 'active';
      newPlan = plan === 'yearly' ? 'yearly' : 'monthly';
      price = newPlan === 'yearly' ? 4990.0 : 499.0;
      if (newPlan === 'yearly') {
        renewalDate.setFullYear(now.getFullYear() + 1);
      } else {
        renewalDate.setMonth(now.getMonth() + 1);
      }
    }

    db.prepare(`
      UPDATE users
      SET subscription_plan = ?, subscription_status = ?, subscription_price = ?, renewal_date = ?
      WHERE id = ?
    `).run(newPlan, newStatus, price, renewalDate.toISOString().split('T')[0], req.user.id);

    const user = db.prepare(`
      SELECT id, name, email, role, subscription_plan, subscription_status, subscription_price, renewal_date, charity_id, charity_percentage
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json({ message: `Subscription updated to ${newStatus}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update subscription' });
  }
});

export default router;
