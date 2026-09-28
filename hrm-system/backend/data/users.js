// data/users.js
// Demo user accounts — password hashing is applied at startup via bcryptjs

const bcrypt = require('bcryptjs');

// Plain-text passwords for demo — hashed at module load
const rawUsers = [
  {
    id: 'user-admin',
    name: 'System Admin',
    email: 'admin@hrm.com',
    password: 'admin123',
    role: 'admin',
    avatar: null,
  },
  {
    id: 'user-hr',
    name: 'Grace Lee',
    email: 'hr@hrm.com',
    password: 'hr123',
    role: 'hr',
    avatar: null,
  },
  {
    id: 'user-manager',
    name: 'Frank Wilson',
    email: 'manager@hrm.com',
    password: 'manager123',
    role: 'manager',
    avatar: null,
  },
  {
    id: 'user-employee',
    name: 'Alice Johnson',
    email: 'employee@hrm.com',
    password: 'employee123',
    role: 'employee',
    avatar: null,
  },
];

// Hash passwords synchronously at startup (acceptable for demo/dev)
const users = rawUsers.map(u => ({
  ...u,
  passwordHash: bcrypt.hashSync(u.password, 10),
}));

const findByEmail = (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase());
const findById = (id) => users.find(u => u.id === id);

const verifyPassword = (user, plainText) => bcrypt.compareSync(plainText, user.passwordHash);

// Safe user object (no password hash)
const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

module.exports = { findByEmail, findById, verifyPassword, safeUser };
