// middleware/auth.js
// JWT verification and role-based authorization middleware

const jwt = require('jsonwebtoken');
const { findById } = require('../data/users');

const JWT_SECRET = process.env.JWT_SECRET || 'hrm_demo_secret_key_2024';

/**
 * Verify JWT and attach user to req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Restrict access to specific roles
 * Usage: authorize('admin', 'hr')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

const JWT_SECRET_EXPORT = JWT_SECRET;
module.exports = { authenticate, authorize, JWT_SECRET: JWT_SECRET_EXPORT };
