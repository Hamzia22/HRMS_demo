// routes/dashboard.js
// Aggregated stats endpoints used by dashboards
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const emp = require('../data/employees');
const attendance = require('../data/attendance');
const leaves = require('../data/leaves');
const payroll = require('../data/payroll');

router.get('/stats', authenticate, (req, res) => {
  const { role, id: userId } = req.user;

  const allEmployees = emp.getAll();
  const today = attendance.getToday();
  const allLeaves = leaves.getAll();
  const payrollStats = payroll.getStats();

  if (role === 'admin') {
    const hrCount = allEmployees.filter(e => e.department === 'Human Resources').length;
    const managerCount = allEmployees.filter(e => e.position.toLowerCase().includes('manager')).length;
    const presentToday = today.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const onLeaveToday = today.filter(r => r.status === 'On Leave').length;
    const pendingLeaves = allLeaves.filter(l => l.status === 'Pending').length;

    return res.json({
      totalEmployees: allEmployees.filter(e => e.status === 'Active').length,
      totalHR: hrCount,
      totalManagers: managerCount,
      presentToday,
      onLeave: onLeaveToday,
      pendingLeaves,
      payroll: {
        totalPayroll: payrollStats.totalPayroll,
        totalEmployees: payrollStats.totalEmployees,
        processedCount: payrollStats.processedCount,
        pendingCount: payrollStats.pendingCount,
        paidCount: payrollStats.paidCount,
      },
    });
  }

  if (role === 'hr') {
    const presentToday = today.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const absentToday = today.filter(r => r.status === 'Absent').length;
    const onLeaveToday = today.filter(r => r.status === 'On Leave').length;
    const pendingLeaves = allLeaves.filter(l => l.status === 'Pending').length;

    return res.json({
      totalEmployees: allEmployees.filter(e => e.status === 'Active').length,
      presentToday,
      absentToday,
      onLeave: onLeaveToday,
      pendingLeaves,
      payroll: {
        totalPayroll: payrollStats.totalPayroll,
        totalEmployees: payrollStats.totalEmployees,
        processedCount: payrollStats.processedCount,
        pendingCount: payrollStats.pendingCount,
        paidCount: payrollStats.paidCount,
      },
    });
  }

  if (role === 'manager') {
    const managerEmp = allEmployees.find(e => e.userId === userId);
    if (!managerEmp) return res.json({ totalTeam: 0, presentTeam: 0, onLeaveTeam: 0, pendingLeaves: 0 });

    const teamIds = emp.getByManagerId(managerEmp.id).map(e => e.id);
    const teamToday = today.filter(r => teamIds.includes(r.employeeId));
    const teamLeaves = allLeaves.filter(l => teamIds.includes(l.employeeId));

    return res.json({
      totalTeam: teamIds.length,
      presentTeam: teamToday.filter(r => r.status === 'Present' || r.status === 'Late').length,
      onLeaveTeam: teamToday.filter(r => r.status === 'On Leave').length,
      pendingLeaves: teamLeaves.filter(l => l.status === 'Pending').length,
    });
  }

  if (role === 'employee') {
    const selfEmp = allEmployees.find(e => e.userId === userId);
    if (!selfEmp) return res.json({});
    const selfLeaves = leaves.getByEmployeeId(selfEmp.id);
    const selfAttendance = attendance.getByEmployeeId(selfEmp.id);
    const selfPayrollRecords = payroll.getByEmployeeId(selfEmp.id);
    const latestPayroll = selfPayrollRecords[0] || null;

    return res.json({
      totalLeaves: selfLeaves.length,
      pendingLeaves: selfLeaves.filter(l => l.status === 'Pending').length,
      approvedLeaves: selfLeaves.filter(l => l.status === 'Approved').length,
      totalAttendanceDays: selfAttendance.length,
      latestPayroll: latestPayroll ? {
        month: latestPayroll.month,
        netSalary: latestPayroll.netSalary,
        grossSalary: latestPayroll.grossSalary,
        totalDeductions: latestPayroll.totalDeductions,
        status: latestPayroll.status,
      } : null,
    });
  }

  res.json({});
});

module.exports = router;
