// data/payroll.js
// In-memory store for payroll records and salary computations

const { v4: uuidv4 } = require('uuid');
const empStore = require('./employees');
const attendanceStore = require('./attendance');
const leavesStore = require('./leaves');

const computePayrollValues = ({
  basicSalary = 0,
  housingAllowance = 0,
  transportAllowance = 0,
  otherAllowances = 0,
  overtime = 0,
  leaveDeduction = 0,
  otherDeductions = 0,
  taxDeduction = 0,
}) => {
  const b = Math.max(0, Number(basicSalary) || 0);
  const h = Math.max(0, Number(housingAllowance) || 0);
  const tr = Math.max(0, Number(transportAllowance) || 0);
  const o = Math.max(0, Number(otherAllowances) || 0);
  const ot = Math.max(0, Number(overtime) || 0);

  const grossSalary = b + h + tr + o + ot;

  const ld = Math.max(0, Number(leaveDeduction) || 0);
  const od = Math.max(0, Number(otherDeductions) || 0);
  const tx = Math.max(0, Number(taxDeduction) || 0);

  const totalDeductions = ld + od + tx;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    basicSalary: b,
    housingAllowance: h,
    transportAllowance: tr,
    otherAllowances: o,
    overtime: ot,
    grossSalary,
    leaveDeduction: ld,
    otherDeductions: od,
    taxDeduction: tx,
    totalDeductions,
    netSalary,
  };
};

let payrollRecords = [
  // September 2026 (Current Month)
  {
    id: 'pay-sep-1',
    employeeId: 'emp-1',
    employeeCode: 'EMP001',
    employeeName: 'Alice Johnson',
    department: 'Development',
    position: 'Senior Software Engineer',
    month: 'September 2026',
    basicSalary: 28000,
    housingAllowance: 4000,
    transportAllowance: 2500,
    otherAllowances: 1500,
    overtime: 2000,
    grossSalary: 38000,
    leaveDeduction: 0,
    otherDeductions: 500,
    taxDeduction: 1500,
    totalDeductions: 2000,
    netSalary: 36000,
    status: 'Paid',
    generatedDate: '2026-09-25',
    paymentDate: '2026-09-28',
    attendanceDays: 22,
    leaveDays: 1,
  },
  {
    id: 'pay-sep-2',
    employeeId: 'emp-2',
    employeeCode: 'EMP002',
    employeeName: 'Bob Martinez',
    department: 'Development',
    position: 'Software Engineer',
    month: 'September 2026',
    basicSalary: 25000,
    housingAllowance: 3000,
    transportAllowance: 2000,
    otherAllowances: 1000,
    overtime: 1500,
    grossSalary: 32500,
    leaveDeduction: 800,
    otherDeductions: 400,
    taxDeduction: 1200,
    totalDeductions: 2400,
    netSalary: 30100,
    status: 'Processed',
    generatedDate: '2026-09-25',
    paymentDate: null,
    attendanceDays: 20,
    leaveDays: 2,
  },
  {
    id: 'pay-sep-3',
    employeeId: 'emp-3',
    employeeCode: 'EMP003',
    employeeName: 'Carol White',
    department: 'Human Resources',
    position: 'HR Specialist',
    month: 'September 2026',
    basicSalary: 38000,
    housingAllowance: 5000,
    transportAllowance: 3000,
    otherAllowances: 1500,
    overtime: 0,
    grossSalary: 47500,
    leaveDeduction: 0,
    otherDeductions: 500,
    taxDeduction: 2000,
    totalDeductions: 2500,
    netSalary: 45000,
    status: 'Paid',
    generatedDate: '2026-09-25',
    paymentDate: '2026-09-28',
    attendanceDays: 22,
    leaveDays: 0,
  },
  {
    id: 'pay-sep-4',
    employeeId: 'emp-4',
    employeeCode: 'EMP004',
    employeeName: 'David Chen',
    department: 'Finance',
    position: 'Financial Analyst',
    month: 'September 2026',
    basicSalary: 30000,
    housingAllowance: 4000,
    transportAllowance: 2000,
    otherAllowances: 1500,
    overtime: 1000,
    grossSalary: 38500,
    leaveDeduction: 1000,
    otherDeductions: 500,
    taxDeduction: 1500,
    totalDeductions: 3000,
    netSalary: 35500,
    status: 'Pending',
    generatedDate: '2026-09-25',
    paymentDate: null,
    attendanceDays: 21,
    leaveDays: 1,
  },
  {
    id: 'pay-sep-5',
    employeeId: 'emp-5',
    employeeCode: 'EMP005',
    employeeName: 'Emma Davis',
    department: 'Marketing',
    position: 'Marketing Coordinator',
    month: 'September 2026',
    basicSalary: 22000,
    housingAllowance: 3000,
    transportAllowance: 1500,
    otherAllowances: 1000,
    overtime: 0,
    grossSalary: 27500,
    leaveDeduction: 0,
    otherDeductions: 300,
    taxDeduction: 1000,
    totalDeductions: 1300,
    netSalary: 26200,
    status: 'Pending',
    generatedDate: '2026-09-25',
    paymentDate: null,
    attendanceDays: 22,
    leaveDays: 0,
  },
  {
    id: 'pay-sep-6',
    employeeId: 'emp-6',
    employeeCode: 'EMP006',
    employeeName: 'Frank Wilson',
    department: 'Development',
    position: 'Engineering Manager',
    month: 'September 2026',
    basicSalary: 48000,
    housingAllowance: 6000,
    transportAllowance: 3500,
    otherAllowances: 2500,
    overtime: 3000,
    grossSalary: 63000,
    leaveDeduction: 0,
    otherDeductions: 1000,
    taxDeduction: 3000,
    totalDeductions: 4000,
    netSalary: 59000,
    status: 'Paid',
    generatedDate: '2026-09-25',
    paymentDate: '2026-09-28',
    attendanceDays: 22,
    leaveDays: 0,
  },
  {
    id: 'pay-sep-7',
    employeeId: 'emp-7',
    employeeCode: 'EMP007',
    employeeName: 'Grace Lee',
    department: 'Human Resources',
    position: 'HR Manager',
    month: 'September 2026',
    basicSalary: 46000,
    housingAllowance: 6000,
    transportAllowance: 3500,
    otherAllowances: 2500,
    overtime: 0,
    grossSalary: 58000,
    leaveDeduction: 0,
    otherDeductions: 800,
    taxDeduction: 2800,
    totalDeductions: 3600,
    netSalary: 54400,
    status: 'Paid',
    generatedDate: '2026-09-25',
    paymentDate: '2026-09-28',
    attendanceDays: 22,
    leaveDays: 0,
  },
  {
    id: 'pay-sep-10',
    employeeId: 'emp-10',
    employeeCode: 'EMP010',
    employeeName: 'Jake Robinson',
    department: 'Sales',
    position: 'Sales Representative',
    month: 'September 2026',
    basicSalary: 25000,
    housingAllowance: 3500,
    transportAllowance: 2000,
    otherAllowances: 1500,
    overtime: 4000,
    grossSalary: 36000,
    leaveDeduction: 1200,
    otherDeductions: 500,
    taxDeduction: 1400,
    totalDeductions: 3100,
    netSalary: 32900,
    status: 'Processed',
    generatedDate: '2026-09-25',
    paymentDate: null,
    attendanceDays: 18,
    leaveDays: 4,
  },
  {
    id: 'pay-sep-11',
    employeeId: 'emp-11',
    employeeCode: 'EMP011',
    employeeName: 'Karen Mitchell',
    department: 'Design',
    position: 'UI/UX Designer',
    month: 'September 2026',
    basicSalary: 26000,
    housingAllowance: 3500,
    transportAllowance: 2000,
    otherAllowances: 1000,
    overtime: 1000,
    grossSalary: 33500,
    leaveDeduction: 0,
    otherDeductions: 400,
    taxDeduction: 1200,
    totalDeductions: 1600,
    netSalary: 31900,
    status: 'Pending',
    generatedDate: '2026-09-25',
    paymentDate: null,
    attendanceDays: 22,
    leaveDays: 0,
  },

  // August 2026
  {
    id: 'pay-aug-1',
    employeeId: 'emp-1',
    employeeCode: 'EMP001',
    employeeName: 'Alice Johnson',
    department: 'Development',
    position: 'Senior Software Engineer',
    month: 'August 2026',
    basicSalary: 28000,
    housingAllowance: 4000,
    transportAllowance: 2500,
    otherAllowances: 1500,
    overtime: 1500,
    grossSalary: 37500,
    leaveDeduction: 0,
    otherDeductions: 500,
    taxDeduction: 1500,
    totalDeductions: 2000,
    netSalary: 35500,
    status: 'Paid',
    generatedDate: '2026-08-25',
    paymentDate: '2026-08-30',
    attendanceDays: 22,
    leaveDays: 0,
  },
  {
    id: 'pay-aug-2',
    employeeId: 'emp-2',
    employeeCode: 'EMP002',
    employeeName: 'Bob Martinez',
    department: 'Development',
    position: 'Software Engineer',
    month: 'August 2026',
    basicSalary: 25000,
    housingAllowance: 3000,
    transportAllowance: 2000,
    otherAllowances: 1000,
    overtime: 2000,
    grossSalary: 33000,
    leaveDeduction: 0,
    otherDeductions: 400,
    taxDeduction: 1200,
    totalDeductions: 1600,
    netSalary: 31400,
    status: 'Paid',
    generatedDate: '2026-08-25',
    paymentDate: '2026-08-30',
    attendanceDays: 22,
    leaveDays: 0,
  },
  {
    id: 'pay-aug-6',
    employeeId: 'emp-6',
    employeeCode: 'EMP006',
    employeeName: 'Frank Wilson',
    department: 'Development',
    position: 'Engineering Manager',
    month: 'August 2026',
    basicSalary: 48000,
    housingAllowance: 6000,
    transportAllowance: 3500,
    otherAllowances: 2500,
    overtime: 2000,
    grossSalary: 62000,
    leaveDeduction: 0,
    otherDeductions: 1000,
    taxDeduction: 3000,
    totalDeductions: 4000,
    netSalary: 58000,
    status: 'Paid',
    generatedDate: '2026-08-25',
    paymentDate: '2026-08-30',
    attendanceDays: 22,
    leaveDays: 0,
  },
  {
    id: 'pay-aug-7',
    employeeId: 'emp-7',
    employeeCode: 'EMP007',
    employeeName: 'Grace Lee',
    department: 'Human Resources',
    position: 'HR Manager',
    month: 'August 2026',
    basicSalary: 46000,
    housingAllowance: 6000,
    transportAllowance: 3500,
    otherAllowances: 2500,
    overtime: 0,
    grossSalary: 58000,
    leaveDeduction: 0,
    otherDeductions: 800,
    taxDeduction: 2800,
    totalDeductions: 3600,
    netSalary: 54400,
    status: 'Paid',
    generatedDate: '2026-08-25',
    paymentDate: '2026-08-30',
    attendanceDays: 22,
    leaveDays: 0,
  },
];

const getAll = () => payrollRecords;

const getById = (id) => payrollRecords.find(p => p.id === id);

const getByEmployeeId = (employeeId) =>
  payrollRecords.filter(p => p.employeeId === employeeId);

const getByMonth = (month) =>
  payrollRecords.filter(p => p.month.toLowerCase() === month.toLowerCase());

const getStats = (monthFilter = null) => {
  let records = payrollRecords;
  if (monthFilter) {
    records = records.filter(r => r.month.toLowerCase() === monthFilter.toLowerCase());
  }

  const totalPayroll = records.reduce((sum, r) => sum + r.netSalary, 0);
  const totalGross = records.reduce((sum, r) => sum + r.grossSalary, 0);
  const totalDeductions = records.reduce((sum, r) => sum + r.totalDeductions, 0);

  const uniqueEmployees = new Set(records.map(r => r.employeeId)).size;
  const processedCount = records.filter(r => r.status === 'Processed').length;
  const pendingCount = records.filter(r => r.status === 'Pending').length;
  const paidCount = records.filter(r => r.status === 'Paid').length;

  return {
    totalPayroll,
    totalGross,
    totalDeductions,
    totalRecords: records.length,
    totalEmployees: uniqueEmployees,
    processedCount,
    pendingCount,
    paidCount,
  };
};

const create = (recordData) => {
  const computed = computePayrollValues(recordData);
  const record = {
    id: uuidv4(),
    employeeId: recordData.employeeId,
    employeeCode: recordData.employeeCode || 'EMP000',
    employeeName: recordData.employeeName || 'Unknown Employee',
    department: recordData.department || 'General',
    position: recordData.position || 'Staff',
    month: recordData.month,
    ...computed,
    status: recordData.status || 'Pending',
    generatedDate: recordData.generatedDate || new Date().toISOString().split('T')[0],
    paymentDate: recordData.paymentDate || null,
    attendanceDays: Number(recordData.attendanceDays) || 22,
    leaveDays: Number(recordData.leaveDays) || 0,
  };

  payrollRecords.push(record);
  return record;
};

const update = (id, data) => {
  const idx = payrollRecords.findIndex(p => p.id === id);
  if (idx === -1) return null;

  const current = payrollRecords[idx];
  const mergedInputs = {
    basicSalary: data.basicSalary !== undefined ? data.basicSalary : current.basicSalary,
    housingAllowance: data.housingAllowance !== undefined ? data.housingAllowance : current.housingAllowance,
    transportAllowance: data.transportAllowance !== undefined ? data.transportAllowance : current.transportAllowance,
    otherAllowances: data.otherAllowances !== undefined ? data.otherAllowances : current.otherAllowances,
    overtime: data.overtime !== undefined ? data.overtime : current.overtime,
    leaveDeduction: data.leaveDeduction !== undefined ? data.leaveDeduction : current.leaveDeduction,
    otherDeductions: data.otherDeductions !== undefined ? data.otherDeductions : current.otherDeductions,
    taxDeduction: data.taxDeduction !== undefined ? data.taxDeduction : current.taxDeduction,
  };

  const computed = computePayrollValues(mergedInputs);

  payrollRecords[idx] = {
    ...current,
    ...data,
    ...computed,
  };

  return payrollRecords[idx];
};

const updateStatus = (id, status) => {
  const idx = payrollRecords.findIndex(p => p.id === id);
  if (idx === -1) return null;

  payrollRecords[idx].status = status;
  if (status === 'Paid' && !payrollRecords[idx].paymentDate) {
    payrollRecords[idx].paymentDate = new Date().toISOString().split('T')[0];
  }
  return payrollRecords[idx];
};

/**
 * Generate payroll for a month.
 * If employeeId is passed, generate for single employee.
 * Otherwise, generate for all Active employees.
 */
const generateForMonth = (month, targetEmployeeId = null, regenerate = false) => {
  if (!month) throw new Error('Month is required (e.g. "September 2026")');

  let employeesToProcess = empStore.getAll().filter(e => e.status === 'Active');
  if (targetEmployeeId) {
    employeesToProcess = employeesToProcess.filter(e => e.id === targetEmployeeId);
    if (employeesToProcess.length === 0) {
      throw new Error('Active employee not found');
    }
  }

  const generated = [];
  const today = new Date().toISOString().split('T')[0];

  for (const emp of employeesToProcess) {
    const existingIdx = payrollRecords.findIndex(
      p => p.employeeId === emp.id && p.month.toLowerCase() === month.toLowerCase()
    );

    if (existingIdx !== -1) {
      if (!regenerate) {
        // Skip duplicate unless regenerate requested
        continue;
      }
      // If regenerate, remove the existing record first
      payrollRecords.splice(existingIdx, 1);
    }

    // Attendance & Leave integration: calculate leave days in this demo
    const empLeaves = leavesStore.getByEmployeeId(emp.id).filter(l => l.status === 'Approved');
    const leaveDaysCount = empLeaves.length; // simple demo count
    const dailyRate = Math.round(emp.basicSalary / 30);
    // Unpaid leave deduction if more than 2 leaves
    const unpaidLeaveDays = Math.max(0, leaveDaysCount - 1);
    const calculatedLeaveDeduction = unpaidLeaveDays * dailyRate;

    // Standard demo tax calculation (approx 4% of gross estimate)
    const estGross = (emp.basicSalary || 25000) + (emp.housingAllowance || 3000) + (emp.transportAllowance || 2000) + (emp.otherAllowances || 1000);
    const taxDeduction = Math.round(estGross * 0.04);

    const record = create({
      employeeId: emp.id,
      employeeCode: emp.employeeId,
      employeeName: emp.name,
      department: emp.department,
      position: emp.position,
      month,
      basicSalary: emp.basicSalary || 25000,
      housingAllowance: emp.housingAllowance || 3000,
      transportAllowance: emp.transportAllowance || 2000,
      otherAllowances: emp.otherAllowances || 1000,
      overtime: 0,
      leaveDeduction: calculatedLeaveDeduction,
      otherDeductions: 500,
      taxDeduction,
      status: 'Pending',
      generatedDate: today,
      attendanceDays: Math.max(18, 22 - leaveDaysCount),
      leaveDays: leaveDaysCount,
    });

    generated.push(record);
  }

  return generated;
};

module.exports = {
  getAll,
  getById,
  getByEmployeeId,
  getByMonth,
  getStats,
  create,
  update,
  updateStatus,
  generateForMonth,
  computePayrollValues,
};
