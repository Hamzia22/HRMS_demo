// data/departments.js
// In-memory department data — replace with DB queries later

const { v4: uuidv4 } = require('uuid');

let departments = [
  { id: 'dept-1', name: 'Development', description: 'Software development and engineering', headCount: 0, createdAt: '2023-01-01' },
  { id: 'dept-2', name: 'Human Resources', description: 'HR operations and people management', headCount: 0, createdAt: '2023-01-01' },
  { id: 'dept-3', name: 'Finance', description: 'Financial operations and accounting', headCount: 0, createdAt: '2023-01-01' },
  { id: 'dept-4', name: 'Marketing', description: 'Marketing and brand management', headCount: 0, createdAt: '2023-01-01' },
  { id: 'dept-5', name: 'Sales', description: 'Sales and business development', headCount: 0, createdAt: '2023-01-01' },
  { id: 'dept-6', name: 'Design', description: 'Product and graphic design', headCount: 0, createdAt: '2023-01-01' },
];

const getAll = () => departments;
const getById = (id) => departments.find(d => d.id === id);
const create = (data) => {
  const dept = { id: uuidv4(), ...data, createdAt: new Date().toISOString().split('T')[0] };
  departments.push(dept);
  return dept;
};
const update = (id, data) => {
  const idx = departments.findIndex(d => d.id === id);
  if (idx === -1) return null;
  departments[idx] = { ...departments[idx], ...data };
  return departments[idx];
};
const remove = (id) => {
  const idx = departments.findIndex(d => d.id === id);
  if (idx === -1) return false;
  departments.splice(idx, 1);
  return true;
};

module.exports = { getAll, getById, create, update, remove };
