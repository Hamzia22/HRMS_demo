'use client';
// components/layout/Header.js

import { useAuth } from '@/context/AuthContext';
import { LogOut, Bell } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard/admin': { title: 'Admin Dashboard', sub: 'Overview of all HR operations' },
  '/dashboard/hr': { title: 'HR Dashboard', sub: 'Human resources overview' },
  '/dashboard/manager': { title: 'Manager Dashboard', sub: 'Your team overview' },
  '/dashboard/employee': { title: 'My Dashboard', sub: 'Your personal HR portal' },
  '/dashboard/employees': { title: 'Employees', sub: 'Manage employee records' },
  '/dashboard/departments': { title: 'Departments', sub: 'Manage company departments' },
  '/dashboard/attendance': { title: 'Attendance', sub: 'Track attendance records' },
  '/dashboard/leaves': { title: 'Leave Requests', sub: 'Manage leave applications' },
  '/dashboard/profile': { title: 'My Profile', sub: 'Your account information' },
};

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
}

export default function Header({ pathname }) {
  const { user, logout } = useAuth();
  const pageInfo = PAGE_TITLES[pathname] || { title: 'HRM System', sub: '' };

  return (
    <header className="header">
      <div className="header-left">
        <h1>{pageInfo.title}</h1>
        {pageInfo.sub && <p>{pageInfo.sub}</p>}
      </div>
      <div className="header-right">
        <div style={{ textAlign: 'right' }}>
          <div className="header-user-name">{user?.name}</div>
          <div className="header-user-role">{user?.role}</div>
        </div>
        <div className="header-avatar" title={user?.name}>
          {getInitials(user?.name)}
        </div>
        <button
          onClick={logout}
          className="btn btn-ghost btn-icon"
          title="Sign out"
          style={{ color: 'var(--color-danger)' }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
