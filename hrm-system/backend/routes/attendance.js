// routes/attendance.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const attendance = require('../data/attendance');
const emp = require('../data/employees');

// POST /api/attendance/check-in — Authenticated user checks in for today
router.post('/check-in', authenticate, (req, res) => {
  const { id: userId, name } = req.user;
  const selfEmp = emp.getAll().find(e => e.userId === userId);

  if (!selfEmp) {
    return res.status(404).json({ error: 'Employee profile not linked to this account' });
  }

  try {
    const record = attendance.checkIn(selfEmp.id, selfEmp.name, selfEmp.department);
    res.status(201).json({
      message: 'Check-in successful',
      record,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/attendance/check-out — Authenticated user checks out for today
router.post('/check-out', authenticate, (req, res) => {
  const { id: userId } = req.user;
  const selfEmp = emp.getAll().find(e => e.userId === userId);

  if (!selfEmp) {
    return res.status(404).json({ error: 'Employee profile not linked to this account' });
  }

  try {
    const record = attendance.checkOut(selfEmp.id);
    res.json({
      message: 'Check-out successful',
      record,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/attendance/today — Today's attendance status for current user (or list for admin/hr)
router.get('/today', authenticate, (req, res) => {
  const { role, id: userId } = req.user;

  if (role === 'employee' || role === 'manager') {
    const selfEmp = emp.getAll().find(e => e.userId === userId);
    if (!selfEmp) return res.json(null);
    const todayRecord = attendance.getTodayByEmployeeId(selfEmp.id);
    return res.json(todayRecord);
  }

  // Admin/HR
  res.json(attendance.getToday());
});

// GET /api/attendance/my-history — Current user's attendance log
router.get('/my-history', authenticate, (req, res) => {
  const { id: userId } = req.user;
  const selfEmp = emp.getAll().find(e => e.userId === userId);

  if (!selfEmp) return res.json([]);

  const records = attendance.getByEmployeeId(selfEmp.id);
  records.sort((a, b) => b.date.localeCompare(a.date));
  res.json(records);
});

// GET /api/attendance — Filtered by role and query params
router.get('/', authenticate, (req, res) => {
  const { role, id: userId } = req.user;
  const { date, employeeId, department, status } = req.query;

  let records = attendance.getAll();

  // Employee: own records only
  if (role === 'employee') {
    const self = emp.getAll().find(e => e.userId === userId);
    if (!self) return res.json([]);
    records = attendance.getByEmployeeId(self.id);
  }

  // Manager: their team only
  if (role === 'manager') {
    const managerEmp = emp.getAll().find(e => e.userId === userId);
    if (!managerEmp) return res.json([]);
    const teamIds = emp.getByManagerId(managerEmp.id).map(e => e.id);
    teamIds.push(managerEmp.id); // include manager's own attendance
    records = records.filter(r => teamIds.includes(r.employeeId));
  }

  // Optional filters
  if (date) records = records.filter(r => r.date === date);
  if (status) records = records.filter(r => r.status.toLowerCase() === status.toLowerCase());
  if (department) records = records.filter(r => r.department && r.department.toLowerCase() === department.toLowerCase());
  if (employeeId && (role === 'admin' || role === 'hr')) {
    records = records.filter(r => r.employeeId === employeeId);
  }

  // Sort by date desc, then employeeName
  records.sort((a, b) => b.date.localeCompare(a.date) || a.employeeName.localeCompare(b.employeeName));

  res.json(records);
});

// GET /api/attendance/today/summary
router.get('/today/summary', authenticate, (req, res) => {
  const today = attendance.getToday();
  const present = today.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absent = today.filter(r => r.status === 'Absent').length;
  const onLeave = today.filter(r => r.status === 'On Leave').length;
  const late = today.filter(r => r.status === 'Late').length;

  res.json({ present, absent, onLeave, late, total: today.length });
});

// GET /api/attendance/employee/:employeeId
router.get('/employee/:employeeId', authenticate, (req, res) => {
  const { role, id: userId } = req.user;

  // Protect employee access to another employee
  if (role === 'employee') {
    const self = emp.getAll().find(e => e.userId === userId);
    if (!self || self.id !== req.params.employeeId) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  const records = attendance.getByEmployeeId(req.params.employeeId);
  records.sort((a, b) => b.date.localeCompare(a.date));
  res.json(records);
});

module.exports = router;

