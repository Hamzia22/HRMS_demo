// data/employees.js
// In-memory employee store — replace with DB queries later

const { v4: uuidv4 } = require('uuid');

let employees = [
  {
    id: 'emp-1',
    employeeId: 'EMP001',
    name: 'Alice Johnson',
    email: 'alice.johnson@hrm.com',
    phone: '+1 (555) 101-0001',
    department: 'Development',
    departmentId: 'dept-1',
    position: 'Senior Software Engineer',
    joiningDate: '2021-03-15',
    employmentType: 'Full-time',
    status: 'Active',
    managerId: 'emp-6',
    userId: 'user-employee',
    basicSalary: 28000,
    housingAllowance: 4000,
    transportAllowance: 2500,
    otherAllowances: 1500,
  },
  {
    id: 'emp-2',
    employeeId: 'EMP002',
    name: 'Bob Martinez',
    email: 'bob.martinez@hrm.com',
    phone: '+1 (555) 101-0002',
    department: 'Development',
    departmentId: 'dept-1',
    position: 'Software Engineer',
    joiningDate: '2022-06-01',
    employmentType: 'Full-time',
    status: 'Active',
    managerId: 'emp-6',
    userId: null,
    basicSalary: 25000,
    housingAllowance: 3000,
    transportAllowance: 2000,
    otherAllowances: 1000,
  },
  {
    id: 'emp-3',
    employeeId: 'EMP003',
    name: 'Carol White',
    email: 'carol.white@hrm.com',
    phone: '+1 (555) 101-0003',
    department: 'Human Resources',
    departmentId: 'dept-2',
    position: 'HR Specialist',
    joiningDate: '2020-11-20',
    employmentType: 'Full-time',
    status: 'Active',
    managerId: 'emp-7',
    userId: 'user-hr',
    basicSalary: 38000,
    housingAllowance: 5000,
    transportAllowance: 3000,
    otherAllowances: 1500,
  },
  {
    id: 'emp-4',
    employeeId: 'EMP004',
    name: 'David Chen',
    email: 'david.chen@hrm.com',
    phone: '+1 (555) 101-0004',
    department: 'Finance',
    departmentId: 'dept-3',
    position: 'Financial Analyst',
    joiningDate: '2021-08-10',
    employmentType: 'Full-time',
    status: 'Active',
    managerId: 'emp-8',
    userId: null,
    basicSalary: 30000,
    housingAllowance: 4000,
    transportAllowance: 2000,
    otherAllowances: 1500,
  },
  {
    id: 'emp-5',
    employeeId: 'EMP005',
    name: 'Emma Davis',
    email: 'emma.davis@hrm.com',
    phone: '+1 (555) 101-0005',
    department: 'Marketing',
    departmentId: 'dept-4',
    position: 'Marketing Coordinator',
    joiningDate: '2023-01-09',
    employmentType: 'Part-time',
    status: 'Active',
    managerId: 'emp-9',
    userId: null,
    basicSalary: 22000,
    housingAllowance: 3000,
    transportAllowance: 1500,
    otherAllowances: 1000,
  },
  {
    id: 'emp-6',
    employeeId: 'EMP006',
    name: 'Frank Wilson',
    email: 'manager@hrm.com',
    phone: '+1 (555) 101-0006',
    department: 'Development',
    departmentId: 'dept-1',
    position: 'Engineering Manager',
    joiningDate: '2019-05-01',
    employmentType: 'Full-time',
    status: 'Active',
    managerId: null,
    userId: 'user-manager',
    basicSalary: 48000,
    housingAllowance: 6000,
    transportAllowance: 3500,
    otherAllowances: 2500,
  },
  {
    id: 'emp-7',
    employeeId: 'EMP007',
    name: 'Grace Lee',
    email: 'hr@hrm.com',
    phone: '+1 (555) 101-0007',
    department: 'Human Resources',
    departmentId: 'dept-2',
    position: 'HR Manager',
    joiningDate: '2018-09-15',
    employmentType: 'Full-time',
    status: 'Active',
    managerId: null,
    userId: 'user-hr',
    basicSalary: 46000,
    housingAllowance: 6000,
    transportAllowance: 3500,
    otherAllowances: 2500,
  },
  {
    id: 'emp-8',
    employeeId: 'EMP008',
    name: 'Henry Brown',
    email: 'henry.brown@hrm.com',
    phone: '+1 (555) 101-0008',
    department: 'Finance',
    departmentId: 'dept-3',
    position: 'Finance Manager',
    joiningDate: '2017-12-01',
    employmentType: 'Full-time',
    status: 'Active',
    managerId: null,
    userId: null,
    basicSalary: 48000,
    housingAllowance: 6000,
    transportAllowance: 3500,
    otherAllowances: 2500,
  },
  {
    id: 'emp-9',
    employeeId: 'EMP009',
    name: 'Iris Thompson',
    email: 'iris.thompson@hrm.com',
    phone: '+1 (555) 101-0009',
    department: 'Marketing',
    departmentId: 'dept-4',
    position: 'Marketing Manager',
    joiningDate: '2020-02-14',
    employmentType: 'Full-time',
    status: 'Active',
    managerId: null,
    userId: null,
    basicSalary: 45000,
    housingAllowance: 5500,
    transportAllowance: 3000,
    otherAllowances: 2000,
  },
  {
    id: 'emp-10',
    employeeId: 'EMP010',
    name: 'Jake Robinson',
    email: 'jake.robinson@hrm.com',
    phone: '+1 (555) 101-0010',
    department: 'Sales',
    departmentId: 'dept-5',
    position: 'Sales Representative',
    joiningDate: '2022-09-05',
    employmentType: 'Full-time',
    status: 'Active',
    managerId: null,
    userId: null,
    basicSalary: 25000,
    housingAllowance: 3500,
    transportAllowance: 2000,
    otherAllowances: 1500,
  },
  {
    id: 'emp-11',
    employeeId: 'EMP011',
    name: 'Karen Mitchell',
    email: 'karen.mitchell@hrm.com',
    phone: '+1 (555) 101-0011',
    department: 'Design',
    departmentId: 'dept-6',
    position: 'UI/UX Designer',
    joiningDate: '2023-04-03',
    employmentType: 'Contract',
    status: 'Active',
    managerId: null,
    userId: null,
    basicSalary: 26000,
    housingAllowance: 3500,
    transportAllowance: 2000,
    otherAllowances: 1000,
  },
  {
    id: 'emp-12',
    employeeId: 'EMP012',
    name: 'Liam Anderson',
    email: 'liam.anderson@hrm.com',
    phone: '+1 (555) 101-0012',
    department: 'Development',
    departmentId: 'dept-1',
    position: 'Junior Developer',
    joiningDate: '2024-01-15',
    employmentType: 'Full-time',
    status: 'Inactive',
    managerId: 'emp-6',
    userId: null,
    basicSalary: 20000,
    housingAllowance: 2500,
    transportAllowance: 1500,
    otherAllowances: 1000,
  },
];

let nextEmpNum = 13;

const getAll = () => employees;
const getById = (id) => employees.find(e => e.id === id);
const getByUserId = (userId) => employees.find(e => e.userId === userId);
const getByManagerId = (managerId) => employees.filter(e => e.managerId === managerId);

// Omit salary fields for unauthorized roles (e.g. manager or basic employee view)
const stripSalaryInfo = (emp) => {
  if (!emp) return null;
  const { basicSalary, housingAllowance, transportAllowance, otherAllowances, ...safeEmp } = emp;
  return safeEmp;
};

const create = (data) => {
  const empNum = String(nextEmpNum).padStart(3, '0');
  nextEmpNum++;
  const emp = {
    id: uuidv4(),
    employeeId: `EMP${empNum}`,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    department: data.department,
    departmentId: data.departmentId || null,
    position: data.position,
    joiningDate: data.joiningDate,
    employmentType: data.employmentType || 'Full-time',
    status: data.status || 'Active',
    managerId: data.managerId || null,
    userId: data.userId || null,
    basicSalary: Number(data.basicSalary) || 25000,
    housingAllowance: Number(data.housingAllowance) || 3000,
    transportAllowance: Number(data.transportAllowance) || 2000,
    otherAllowances: Number(data.otherAllowances) || 1000,
  };
  employees.push(emp);
  return emp;
};

const update = (id, data) => {
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return null;
  const updatedData = { ...data };
  if (data.basicSalary !== undefined) updatedData.basicSalary = Number(data.basicSalary);
  if (data.housingAllowance !== undefined) updatedData.housingAllowance = Number(data.housingAllowance);
  if (data.transportAllowance !== undefined) updatedData.transportAllowance = Number(data.transportAllowance);
  if (data.otherAllowances !== undefined) updatedData.otherAllowances = Number(data.otherAllowances);

  employees[idx] = { ...employees[idx], ...updatedData };
  return employees[idx];
};

const updateStatus = (id, status) => {
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return null;
  employees[idx].status = status;
  return employees[idx];
};

module.exports = { getAll, getById, getByUserId, getByManagerId, stripSalaryInfo, create, update, updateStatus };
