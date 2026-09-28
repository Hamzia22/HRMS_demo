// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { findByEmail, verifyPassword, safeUser } = require('../data/users');
const { getByUserId } = require('../data/employees');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!verifyPassword(user, password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  // Attach employee profile if exists
  const employeeProfile = getByUserId(user.id);

  res.json({
    token,
    user: safeUser(user),
    employeeProfile: employeeProfile || null,
  });
});

// POST /api/auth/logout  (stateless — client just drops the token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
