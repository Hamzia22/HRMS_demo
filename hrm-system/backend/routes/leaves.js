// routes/leaves.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const leaves = require('../data/leaves');
const emp = require('../data/employees');

// GET /api/leaves — filtered by role
router.get('/', authenticate, (req, res) => {
  const { role, id: userId } = req.user;
  const { status } = req.query;

  let records = leaves.getAll();

  if (role === 'employee') {
    const self = emp.getAll().find(e => e.userId === userId);
    if (!self) return res.json([]);
    records = leaves.getByEmployeeId(self.id);
  }

  if (role === 'manager') {
    const managerEmp = emp.getAll().find(e => e.userId === userId);
    if (!managerEmp) return res.json([]);
    const teamIds = emp.getByManagerId(managerEmp.id).map(e => e.id);
    records = records.filter(r => teamIds.includes(r.employeeId));
  }

  if (status) records = records.filter(r => r.status === status);

  records.sort((a, b) => b.requestedDate.localeCompare(a.requestedDate));
  res.json(records);
});

// GET /api/leaves/stats
router.get('/stats', authenticate, (req, res) => {
  const { role, id: userId } = req.user;
  let records = leaves.getAll();

  if (role === 'employee') {
    const self = emp.getAll().find(e => e.userId === userId);
    records = self ? leaves.getByEmployeeId(self.id) : [];
  }

  if (role === 'manager') {
    const managerEmp = emp.getAll().find(e => e.userId === userId);
    if (managerEmp) {
      const teamIds = emp.getByManagerId(managerEmp.id).map(e => e.id);
      records = records.filter(r => teamIds.includes(r.employeeId));
    }
  }

  res.json({
    total: records.length,
    pending: records.filter(r => r.status === 'Pending').length,
    approved: records.filter(r => r.status === 'Approved').length,
    rejected: records.filter(r => r.status === 'Rejected').length,
  });
});

// GET /api/leaves/:id
router.get('/:id', authenticate, (req, res) => {
  const leave = leaves.getById(req.params.id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });
  res.json(leave);
});

// POST /api/leaves — any authenticated user can submit for themselves
router.post('/', authenticate, (req, res) => {
  const { role, id: userId } = req.user;
  const { employeeId, leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: 'Leave type, start date, end date, and reason are required' });
  }

  const validTypes = ['Casual Leave', 'Sick Leave', 'Annual Leave', 'Personal Leave'];
  if (!validTypes.includes(leaveType)) {
    return res.status(400).json({ error: `Leave type must be one of: ${validTypes.join(', ')}` });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: 'Start date must be before end date' });
  }

  let empRecord;
  if (role === 'employee') {
    empRecord = emp.getAll().find(e => e.userId === userId);
  } else {
    // Admin/HR/Manager can submit on behalf of an employee
    empRecord = employeeId ? emp.getById(employeeId) : emp.getAll().find(e => e.userId === userId);
  }

  if (!empRecord) {
    return res.status(400).json({ error: 'Employee record not found' });
  }

  const newLeave = leaves.create({
    employeeId: empRecord.id,
    employeeName: empRecord.name,
    department: empRecord.department,
    leaveType,
    startDate,
    endDate,
    reason,
  });

  res.status(201).json(newLeave);
});

// PUT /api/leaves/:id/status — Admin, HR, Manager can approve/reject
router.put('/:id/status', authenticate, authorize('admin', 'hr', 'manager'), (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Approved', 'Rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be Approved or Rejected' });
  }

  const leave = leaves.getById(req.params.id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });
  if (leave.status !== 'Pending') {
    return res.status(400).json({ error: 'Only pending leave requests can be updated' });
  }

  // Managers can only review their team's requests
  if (req.user.role === 'manager') {
    const managerEmp = emp.getAll().find(e => e.userId === req.user.id);
    if (managerEmp) {
      const teamIds = emp.getByManagerId(managerEmp.id).map(e => e.id);
      if (!teamIds.includes(leave.employeeId)) {
        return res.status(403).json({ error: 'You can only review leave requests for your team' });
      }
    }
  }

  const updated = leaves.updateStatus(req.params.id, status, req.user.name);
  res.json(updated);
});

// DELETE /api/leaves/:id — Employee can cancel their own pending leave; Admin/HR can delete
router.delete('/:id', authenticate, (req, res) => {
  const { role, id: userId } = req.user;
  const leave = leaves.getById(req.params.id);

  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  if (role === 'employee') {
    const self = emp.getAll().find(e => e.userId === userId);
    if (!self || self.id !== leave.employeeId) {
      return res.status(403).json({ error: 'You can only cancel your own leave requests' });
    }
    if (leave.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending leave requests can be cancelled' });
    }
  }

  const removed = leaves.remove(req.params.id);
  if (!removed) {
    return res.status(500).json({ error: 'Failed to cancel leave request' });
  }

  res.json({ message: 'Leave request cancelled successfully' });
});

module.exports = router;
