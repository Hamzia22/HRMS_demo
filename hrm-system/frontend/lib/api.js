// lib/api.js — Central API service layer

let activeBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hrm_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${activeBase}${path}`, { ...options, headers });
  } catch (err) {
    // If request failed (e.g. server running on alternative port), attempt fallback once
    if (activeBase.includes(':5001')) {
      activeBase = activeBase.replace(':5001', ':5002');
      try {
        res = await fetch(`${activeBase}${path}`, { ...options, headers });
      } catch (retryErr) {
        throw err;
      }
    } else {
      throw err;
    }
  }

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const authApi = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
};

export const dashboardApi = {
  getStats: () => request('/api/dashboard/stats'),
};

export const employeesApi = {
  getAll: () => request('/api/employees'),
  getStats: () => request('/api/employees/stats'),
  getById: (id) => request(`/api/employees/${id}`),
  create: (data) => request('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id, status) =>
    request(`/api/employees/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export const departmentsApi = {
  getAll: () => request('/api/departments'),
  getById: (id) => request(`/api/departments/${id}`),
  create: (data) => request('/api/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/api/departments/${id}`, { method: 'DELETE' }),
};

export const attendanceApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/attendance${qs ? `?${qs}` : ''}`);
  },
  getTodaySummary: () => request('/api/attendance/today/summary'),
  getToday: () => request('/api/attendance/today'),
  getMyHistory: () => request('/api/attendance/my-history'),
  getByEmployee: (employeeId) => request(`/api/attendance/employee/${employeeId}`),
  checkIn: () => request('/api/attendance/check-in', { method: 'POST' }),
  checkOut: () => request('/api/attendance/check-out', { method: 'POST' }),
};

export const leavesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/leaves${qs ? `?${qs}` : ''}`);
  },
  getStats: () => request('/api/leaves/stats'),
  getById: (id) => request(`/api/leaves/${id}`),
  create: (data) => request('/api/leaves', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) =>
    request(`/api/leaves/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  cancel: (id) => request(`/api/leaves/${id}`, { method: 'DELETE' }),
};

export const payrollApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/payroll${qs ? `?${qs}` : ''}`);
  },
  getStats: (month) => {
    const qs = month ? `?month=${encodeURIComponent(month)}` : '';
    return request(`/api/payroll/stats${qs}`);
  },
  getMy: () => request('/api/payroll/my'),
  getById: (id) => request(`/api/payroll/${id}`),
  generate: (data) => request('/api/payroll/generate', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/payroll/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  process: (id) => request(`/api/payroll/${id}/process`, { method: 'PUT' }),
  markAsPaid: (id) => request(`/api/payroll/${id}/pay`, { method: 'PUT' }),
  getSalary: (employeeId) => request(`/api/payroll/salary/${employeeId}`),
  updateSalary: (employeeId, data) =>
    request(`/api/payroll/salary/${employeeId}`, { method: 'PUT', body: JSON.stringify(data) }),
};
