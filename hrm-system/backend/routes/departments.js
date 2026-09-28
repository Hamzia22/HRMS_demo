// routes/departments.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const dept = require('../data/departments');
const emp = require('../data/employees');

// GET /api/departments — all authenticated users
router.get('/', authenticate, (req, res) => {
  const departments = dept.getAll();
  // Attach live head counts
  const all = emp.getAll();
  const enriched = departments.map(d => ({
    ...d,
    headCount: all.filter(e => e.departmentId === d.id && e.status === 'Active').length,
  }));
  res.json(enriched);
});

// GET /api/departments/:id
router.get('/:id', authenticate, (req, res) => {
  const d = dept.getById(req.params.id);
  if (!d) return res.status(404).json({ error: 'Department not found' });
  res.json(d);
});

// POST /api/departments — Admin only
router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name is required' });

  const existing = dept.getAll().find(d => d.name.toLowerCase() === name.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Department already exists' });

  const newDept = dept.create({ name, description: description || '' });
  res.status(201).json(newDept);
});

// PUT /api/departments/:id — Admin only
router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  const existing = dept.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Department not found' });

  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name is required' });

  const updated = dept.update(req.params.id, { name, description });
  res.json(updated);
});

// DELETE /api/departments/:id — Admin only
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const existing = dept.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Department not found' });

  // Check if employees are in this dept
  const assigned = emp.getAll().filter(e => e.departmentId === req.params.id && e.status === 'Active');
  if (assigned.length > 0) {
    return res.status(409).json({ error: `Cannot delete: ${assigned.length} active employee(s) in this department` });
  }

  dept.remove(req.params.id);
  res.json({ message: 'Department deleted' });
});

module.exports = router;
