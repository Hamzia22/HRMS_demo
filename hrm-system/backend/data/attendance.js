// data/attendance.js
// In-memory attendance records

const { v4: uuidv4 } = require('uuid');

// Helper to build date strings
const d = (daysAgo) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString().split('T')[0];
};

let attendance = [
  // Today — emp-1 Alice
  { id: uuidv4(), employeeId: 'emp-1', employeeName: 'Alice Johnson', department: 'Development', date: d(0), checkIn: '09:02', checkOut: '17:30', status: 'Present' },
  // Today — emp-2 Bob
  { id: uuidv4(), employeeId: 'emp-2', employeeName: 'Bob Martinez', department: 'Development', date: d(0), checkIn: '09:45', checkOut: null, status: 'Late' },
  // Today — emp-3 Carol (HR)
  { id: uuidv4(), employeeId: 'emp-3', employeeName: 'Carol White', department: 'Human Resources', date: d(0), checkIn: '08:55', checkOut: '17:00', status: 'Present' },
  // Today — emp-4 David
  { id: uuidv4(), employeeId: 'emp-4', employeeName: 'David Chen', department: 'Finance', date: d(0), checkIn: null, checkOut: null, status: 'Absent' },
  // Today — emp-5 Emma
  { id: uuidv4(), employeeId: 'emp-5', employeeName: 'Emma Davis', department: 'Marketing', date: d(0), checkIn: '10:00', checkOut: null, status: 'Present' },
  // Today — emp-6 Frank (Manager)
  { id: uuidv4(), employeeId: 'emp-6', employeeName: 'Frank Wilson', department: 'Development', date: d(0), checkIn: '08:30', checkOut: '18:00', status: 'Present' },
  // Today — emp-7 Grace (HR Manager)
  { id: uuidv4(), employeeId: 'emp-7', employeeName: 'Grace Lee', department: 'Human Resources', date: d(0), checkIn: '09:00', checkOut: '17:00', status: 'Present' },
  // Today — emp-10 Jake
  { id: uuidv4(), employeeId: 'emp-10', employeeName: 'Jake Robinson', department: 'Sales', date: d(0), checkIn: null, checkOut: null, status: 'On Leave' },
  // Today — emp-11 Karen
  { id: uuidv4(), employeeId: 'emp-11', employeeName: 'Karen Mitchell', department: 'Design', date: d(0), checkIn: '09:15', checkOut: null, status: 'Present' },

  // Yesterday
  { id: uuidv4(), employeeId: 'emp-1', employeeName: 'Alice Johnson', department: 'Development', date: d(1), checkIn: '08:58', checkOut: '17:30', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-2', employeeName: 'Bob Martinez', department: 'Development', date: d(1), checkIn: '09:10', checkOut: '17:45', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-3', employeeName: 'Carol White', department: 'Human Resources', date: d(1), checkIn: '09:00', checkOut: '17:00', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-6', employeeName: 'Frank Wilson', department: 'Development', date: d(1), checkIn: '08:45', checkOut: '17:50', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-10', employeeName: 'Jake Robinson', department: 'Sales', date: d(1), checkIn: null, checkOut: null, status: 'On Leave' },
  { id: uuidv4(), employeeId: 'emp-4', employeeName: 'David Chen', department: 'Finance', date: d(1), checkIn: '09:30', checkOut: '17:00', status: 'Present' },

  // 2 days ago
  { id: uuidv4(), employeeId: 'emp-1', employeeName: 'Alice Johnson', department: 'Development', date: d(2), checkIn: '09:05', checkOut: '17:30', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-2', employeeName: 'Bob Martinez', department: 'Development', date: d(2), checkIn: '10:15', checkOut: '17:30', status: 'Late' },
  { id: uuidv4(), employeeId: 'emp-6', employeeName: 'Frank Wilson', department: 'Development', date: d(2), checkIn: '08:30', checkOut: '18:00', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-5', employeeName: 'Emma Davis', department: 'Marketing', date: d(2), checkIn: null, checkOut: null, status: 'Absent' },

  // 3 days ago
  { id: uuidv4(), employeeId: 'emp-1', employeeName: 'Alice Johnson', department: 'Development', date: d(3), checkIn: '09:00', checkOut: '17:30', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-2', employeeName: 'Bob Martinez', department: 'Development', date: d(3), checkIn: '09:05', checkOut: '17:20', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-6', employeeName: 'Frank Wilson', department: 'Development', date: d(3), checkIn: '08:40', checkOut: '17:55', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-3', employeeName: 'Carol White', department: 'Human Resources', date: d(3), checkIn: '09:00', checkOut: '17:00', status: 'Present' },
  { id: uuidv4(), employeeId: 'emp-11', employeeName: 'Karen Mitchell', department: 'Design', date: d(3), checkIn: '09:10', checkOut: '17:30', status: 'Present' },
];

const getCurrentTimeString = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const getAll = () => attendance;
const getByEmployeeId = (employeeId) => attendance.filter(a => a.employeeId === employeeId);
const getByDepartment = (department) => attendance.filter(a => a.department === department);
const getToday = () => {
  const today = getTodayDateString();
  return attendance.filter(a => a.date === today);
};

const getTodayByEmployeeId = (employeeId) => {
  const today = getTodayDateString();
  return attendance.find(a => a.employeeId === employeeId && a.date === today) || null;
};

const checkIn = (employeeId, employeeName, department) => {
  const today = getTodayDateString();
  const existing = attendance.find(a => a.employeeId === employeeId && a.date === today);

  if (existing && existing.checkIn) {
    throw new Error('You have already checked in today');
  }

  const timeStr = getCurrentTimeString();
  const status = timeStr > '09:30' ? 'Late' : 'Present';

  if (existing) {
    existing.checkIn = timeStr;
    existing.status = status;
    return existing;
  }

  const newRecord = {
    id: uuidv4(),
    employeeId,
    employeeName,
    department,
    date: today,
    checkIn: timeStr,
    checkOut: null,
    status,
  };
  attendance.push(newRecord);
  return newRecord;
};

const checkOut = (employeeId) => {
  const today = getTodayDateString();
  const existing = attendance.find(a => a.employeeId === employeeId && a.date === today);

  if (!existing || !existing.checkIn) {
    throw new Error('You must check in first before checking out');
  }

  if (existing.checkOut) {
    throw new Error('You have already checked out today');
  }

  existing.checkOut = getCurrentTimeString();
  return existing;
};

const addRecord = (record) => {
  const rec = { id: uuidv4(), ...record };
  attendance.push(rec);
  return rec;
};

module.exports = {
  getAll,
  getByEmployeeId,
  getByDepartment,
  getToday,
  getTodayByEmployeeId,
  checkIn,
  checkOut,
  addRecord,
};
