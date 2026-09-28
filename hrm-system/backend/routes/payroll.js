// routes/payroll.js
// Payroll Management REST API endpoints with strict role-based access control

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const payroll = require('../data/payroll');
const emp = require('../data/employees');

// Block Managers completely from payroll endpoints
const blockManager = (req, res, next) => {
  if (req.user?.role === 'manager') {
    return res.status(403).json({ error: 'Access denied: Managers do not have permission to view or manage payroll data.' });
  }
  next();
};

router.use(authenticate);
router.use(blockManager);

// GET /api/payroll/my — Employee personal payroll history & active breakdown
router.get('/my', (req, res) => {
  const { id: userId, role } = req.user;
  const selfEmp = emp.getAll().find(e => e.userId === userId);

  if (!selfEmp) {
    return res.status(404).json({ error: 'Linked employee profile not found' });
  }

  const records = payroll.getByEmployeeId(selfEmp.id);
  // Sort most recent month first
  records.sort((a, b) => b.generatedDate.localeCompare(a.generatedDate));

  res.json({
    employee: {
      id: selfEmp.id,
      employeeId: selfEmp.employeeId,
      name: selfEmp.name,
      department: selfEmp.department,
      position: selfEmp.position,
      basicSalary: selfEmp.basicSalary,
      housingAllowance: selfEmp.housingAllowance,
      transportAllowance: selfEmp.transportAllowance,
      otherAllowances: selfEmp.otherAllowances,
    },
    payrollHistory: records,
    currentPayroll: records[0] || null,
  });
});

// GET /api/payroll/stats — Admin & HR overview metrics
router.get('/stats', authorize('admin', 'hr'), (req, res) => {
  const { month } = req.query;
  const stats = payroll.getStats(month);
  res.json(stats);
});

// GET /api/payroll — Admin & HR view all records with optional query filters
router.get('/', authorize('admin', 'hr'), (req, res) => {
  const { month, employeeId, department, status, search } = req.query;

  let records = payroll.getAll();

  if (month) {
    records = records.filter(r => r.month.toLowerCase() === month.toLowerCase());
  }
  if (employeeId) {
    records = records.filter(r => r.employeeId === employeeId);
  }
  if (department) {
    records = records.filter(r => r.department.toLowerCase() === department.toLowerCase());
  }
  if (status) {
    records = records.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    records = records.filter(r =>
      r.employeeName.toLowerCase().includes(q) ||
      r.employeeCode.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    );
  }

  // Sort by generatedDate desc, then employee name
  records.sort((a, b) => b.generatedDate.localeCompare(a.generatedDate) || a.employeeName.localeCompare(b.employeeName));

  res.json(records);
});

// GET /api/payroll/salary/:employeeId — Get base salary profile
router.get('/salary/:employeeId', (req, res) => {
  const { role, id: userId } = req.user;
  const targetEmp = emp.getById(req.params.employeeId);

  if (!targetEmp) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  // If role is employee, ensure they can only inspect their own
  if (role === 'employee') {
    const selfEmp = emp.getAll().find(e => e.userId === userId);
    if (!selfEmp || selfEmp.id !== targetEmp.id) {
      return res.status(403).json({ error: 'Access denied: You cannot view another employee salary details.' });
    }
  }

  res.json({
    employeeId: targetEmp.id,
    employeeCode: targetEmp.employeeId,
    name: targetEmp.name,
    department: targetEmp.department,
    position: targetEmp.position,
    basicSalary: targetEmp.basicSalary,
    housingAllowance: targetEmp.housingAllowance,
    transportAllowance: targetEmp.transportAllowance,
    otherAllowances: targetEmp.otherAllowances,
  });
});

// PUT /api/payroll/salary/:employeeId — Update base salary structure (Admin, HR only)
router.put('/salary/:employeeId', authorize('admin', 'hr'), (req, res) => {
  const { basicSalary, housingAllowance, transportAllowance, otherAllowances } = req.body;

  if (basicSalary !== undefined && (isNaN(basicSalary) || Number(basicSalary) < 0)) {
    return res.status(400).json({ error: 'Basic salary must be a non-negative number' });
  }
  if (housingAllowance !== undefined && (isNaN(housingAllowance) || Number(housingAllowance) < 0)) {
    return res.status(400).json({ error: 'Housing allowance must be a non-negative number' });
  }
  if (transportAllowance !== undefined && (isNaN(transportAllowance) || Number(transportAllowance) < 0)) {
    return res.status(400).json({ error: 'Transport allowance must be a non-negative number' });
  }
  if (otherAllowances !== undefined && (isNaN(otherAllowances) || Number(otherAllowances) < 0)) {
    return res.status(400).json({ error: 'Other allowances must be a non-negative number' });
  }

  const updated = emp.update(req.params.employeeId, {
    basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowances,
  });

  if (!updated) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  res.json({
    message: 'Salary configuration updated successfully',
    employee: updated,
  });
});

// GET /api/payroll/:id — Single payroll record details
router.get('/:id', (req, res) => {
  const { role, id: userId } = req.user;
  const record = payroll.getById(req.params.id);

  if (!record) {
    return res.status(404).json({ error: 'Payroll record not found' });
  }

  // If role is employee, prevent viewing other employee records
  if (role === 'employee') {
    const selfEmp = emp.getAll().find(e => e.userId === userId);
    if (!selfEmp || selfEmp.id !== record.employeeId) {
      return res.status(403).json({ error: 'Access denied: You cannot view this payroll record.' });
    }
  }

  res.json(record);
});

// POST /api/payroll/generate — Generate payroll for a month (Admin, HR only)
router.post('/generate', authorize('admin', 'hr'), (req, res) => {
  const { month, employeeId, regenerate } = req.body;

  if (!month || !month.trim()) {
    return res.status(400).json({ error: 'Payroll month is required (e.g. "September 2026")' });
  }

  try {
    const generated = payroll.generateForMonth(month.trim(), employeeId || null, Boolean(regenerate));

    if (generated.length === 0 && !regenerate) {
      return res.status(200).json({
        message: `Payroll for "${month}" has already been generated. Use regenerate option to recalculate.`,
        generatedCount: 0,
        records: [],
      });
    }

    res.status(201).json({
      message: `Successfully generated payroll for ${generated.length} employee(s) for ${month}`,
      generatedCount: generated.length,
      records: generated,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to generate payroll' });
  }
});

// PUT /api/payroll/:id — Edit payroll values (overtime, allowances, deductions) (Admin, HR only)
router.put('/:id', authorize('admin', 'hr'), (req, res) => {
  const record = payroll.getById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Payroll record not found' });
  }

  const { basicSalary, housingAllowance, transportAllowance, otherAllowances, overtime, leaveDeduction, otherDeductions, taxDeduction, notes } = req.body;

  // Validate non-negative numbers
  const numericFields = { basicSalary, housingAllowance, transportAllowance, otherAllowances, overtime, leaveDeduction, otherDeductions, taxDeduction };
  for (const [key, val] of Object.entries(numericFields)) {
    if (val !== undefined && (isNaN(val) || Number(val) < 0)) {
      return res.status(400).json({ error: `${key} cannot be a negative value` });
    }
  }

  const updated = payroll.update(req.params.id, {
    basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowances,
    overtime,
    leaveDeduction,
    otherDeductions,
    taxDeduction,
    notes,
  });

  res.json(updated);
});

// PUT /api/payroll/:id/process — Mark status as Processed (Admin, HR only)
router.put('/:id/process', authorize('admin', 'hr'), (req, res) => {
  const record = payroll.getById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Payroll record not found' });
  }

  const updated = payroll.updateStatus(req.params.id, 'Processed');
  res.json({ message: 'Payroll marked as Processed', record: updated });
});

// PUT /api/payroll/:id/pay — Mark status as Paid (Admin, HR only)
router.put('/:id/pay', authorize('admin', 'hr'), (req, res) => {
  const record = payroll.getById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Payroll record not found' });
  }

  const updated = payroll.updateStatus(req.params.id, 'Paid');
  res.json({ message: 'Payroll marked as Paid', record: updated });
});

module.exports = router;
