// data/leaves.js
// In-memory leave request store

const { v4: uuidv4 } = require('uuid');

const d = (daysOffset) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + daysOffset);
  return dt.toISOString().split('T')[0];
};

let leaves = [
  {
    id: 'leave-1',
    employeeId: 'emp-10',
    employeeName: 'Jake Robinson',
    department: 'Sales',
    leaveType: 'Annual Leave',
    startDate: d(-2),
    endDate: d(2),
    reason: 'Family vacation',
    status: 'Approved',
    requestedDate: d(-5),
    reviewedBy: 'Grace Lee',
    reviewedAt: d(-4),
  },
  {
    id: 'leave-2',
    employeeId: 'emp-1',
    employeeName: 'Alice Johnson',
    department: 'Development',
    leaveType: 'Sick Leave',
    startDate: d(5),
    endDate: d(6),
    reason: 'Medical appointment',
    status: 'Pending',
    requestedDate: d(-1),
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: 'leave-3',
    employeeId: 'emp-2',
    employeeName: 'Bob Martinez',
    department: 'Development',
    leaveType: 'Casual Leave',
    startDate: d(7),
    endDate: d(7),
    reason: 'Personal errands',
    status: 'Pending',
    requestedDate: d(0),
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: 'leave-4',
    employeeId: 'emp-5',
    employeeName: 'Emma Davis',
    department: 'Marketing',
    leaveType: 'Personal Leave',
    startDate: d(-10),
    endDate: d(-8),
    reason: 'Moving to new apartment',
    status: 'Approved',
    requestedDate: d(-15),
    reviewedBy: 'Grace Lee',
    reviewedAt: d(-12),
  },
  {
    id: 'leave-5',
    employeeId: 'emp-4',
    employeeName: 'David Chen',
    department: 'Finance',
    leaveType: 'Sick Leave',
    startDate: d(-3),
    endDate: d(-3),
    reason: 'Flu symptoms',
    status: 'Rejected',
    requestedDate: d(-4),
    reviewedBy: 'System Admin',
    reviewedAt: d(-3),
  },
  {
    id: 'leave-6',
    employeeId: 'emp-11',
    employeeName: 'Karen Mitchell',
    department: 'Design',
    leaveType: 'Annual Leave',
    startDate: d(10),
    endDate: d(15),
    reason: 'Planned holiday trip',
    status: 'Pending',
    requestedDate: d(-2),
    reviewedBy: null,
    reviewedAt: null,
  },
];

const getAll = () => leaves;
const getById = (id) => leaves.find(l => l.id === id);
const getByEmployeeId = (employeeId) => leaves.filter(l => l.employeeId === employeeId);
const getByDepartment = (dept) => leaves.filter(l => l.department === dept);
const getPending = () => leaves.filter(l => l.status === 'Pending');

const create = (data) => {
  const leave = {
    id: uuidv4(),
    ...data,
    status: 'Pending',
    requestedDate: new Date().toISOString().split('T')[0],
    reviewedBy: null,
    reviewedAt: null,
  };
  leaves.push(leave);
  return leave;
};

const updateStatus = (id, status, reviewedBy) => {
  const idx = leaves.findIndex(l => l.id === id);
  if (idx === -1) return null;
  leaves[idx].status = status;
  leaves[idx].reviewedBy = reviewedBy;
  leaves[idx].reviewedAt = new Date().toISOString().split('T')[0];
  return leaves[idx];
};

const remove = (id) => {
  const idx = leaves.findIndex(l => l.id === id);
  if (idx === -1) return false;
  leaves.splice(idx, 1);
  return true;
};

module.exports = { getAll, getById, getByEmployeeId, getByDepartment, getPending, create, updateStatus, remove };
