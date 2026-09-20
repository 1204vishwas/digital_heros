import 'dotenv/config';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'digital-heroes-super-secure-key-2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Always fetch the freshest user state from DB
    const user = db.prepare(`
      SELECT id, name, email, role, subscription_plan, subscription_status, subscription_price, renewal_date, charity_id, charity_percentage, created_at
      FROM users WHERE id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
};

export const requireActiveSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role === 'admin') {
    return next(); // Admins bypass subscription restrictions
  }
  if (req.user.subscription_status !== 'active') {
    return res.status(403).json({
      error: 'Active subscription required to access this feature',
      subscription_status: req.user.subscription_status
    });
  }
  next();
};
