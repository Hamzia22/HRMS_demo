// routes/employees.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const emp = require('../data/employees');

// GET /api/employees — Admin/HR: all; Manager: their team (no salary); Employee: own
router.get('/', authenticate, (req, res) => {
  const { role, id: userId } = req.user;

  if (role === 'admin' || role === 'hr') {
    return res.json(emp.getAll());
  }

  if (role === 'manager') {
    const managerEmp = emp.getAll().find(e => e.userId === userId);
    if (!managerEmp) return res.json([]);
    const team = emp.getByManagerId(managerEmp.id);
    return res.json(team.map(emp.stripSalaryInfo));
  }

  // employee — own record only
  const self = emp.getAll().find(e => e.userId === userId);
  return res.json(self ? [self] : []);
});

// GET /api/employees/stats — summary counts for dashboards
router.get('/stats', authenticate, (req, res) => {
  const all = emp.getAll();
  const active = all.filter(e => e.status === 'Active');

  const byDept = {};
  active.forEach(e => {
    byDept[e.department] = (byDept[e.department] || 0) + 1;
  });

  res.json({
    total: all.length,
    active: active.length,
    inactive: all.filter(e => e.status === 'Inactive').length,
    byDepartment: byDept,
  });
});

// GET /api/employees/:id
router.get('/:id', authenticate, (req, res) => {
  const { role, id: userId } = req.user;
  const employee = emp.getById(req.params.id);

  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  // Employees can only view their own profile
  if (role === 'employee') {
    const self = emp.getAll().find(e => e.userId === userId);
    if (!self || self.id !== employee.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    return res.json(employee);
  }

  // Managers should not see salary info
  if (role === 'manager') {
    return res.json(emp.stripSalaryInfo(employee));
  }

  // Admin and HR get full employee record including compensation info
  res.json(employee);
});

// POST /api/employees — Admin, HR only
router.post('/', authenticate, authorize('admin', 'hr'), (req, res) => {
  const {
    name,
    email,
    phone,
    department,
    departmentId,
    position,
    joiningDate,
    employmentType,
    status,
    basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowances,
  } = req.body;

  if (!name || !email || !department || !position || !joiningDate) {
    return res.status(400).json({ error: 'Name, email, department, position, and joining date are required' });
  }

  // Check email uniqueness
  const existing = emp.getAll().find(e => e.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An employee with this email already exists' });
  }

  const newEmp = emp.create({
    name,
    email,
    phone,
    department,
    departmentId,
    position,
    joiningDate,
    employmentType,
    status,
    basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowances,
  });
  res.status(201).json(newEmp);
});

// PUT /api/employees/:id — Admin, HR only
router.put('/:id', authenticate, authorize('admin', 'hr'), (req, res) => {
  const employee = emp.getById(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const updated = emp.update(req.params.id, req.body);
  res.json(updated);
});

// PATCH /api/employees/:id/status — Admin, HR only
router.patch('/:id/status', authenticate, authorize('admin', 'hr'), (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Active', 'Inactive', 'On Leave'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const employee = emp.getById(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const updated = emp.updateStatus(req.params.id, status);
  res.json(updated);
});

module.exports = router;
