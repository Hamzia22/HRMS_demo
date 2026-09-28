'use client';
// components/layout/Sidebar.js

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, FileText,
  User, LogOut, Briefcase, Banknote
} from 'lucide-react';

const NAV_CONFIG = {
  admin: [
    { label: 'Main', items: [
      { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { label: 'Management', items: [
      { href: '/dashboard/employees', label: 'Employees', icon: Users },
      { href: '/dashboard/departments', label: 'Departments', icon: Building2 },
    ]},
    { label: 'Operations', items: [
      { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck },
      { href: '/dashboard/leaves', label: 'Leave Requests', icon: FileText },
      { href: '/dashboard/payroll', label: 'Payroll', icon: Banknote },
    ]},
    { label: 'Account', items: [
      { href: '/dashboard/profile', label: 'My Profile', icon: User },
    ]},
  ],
  hr: [
    { label: 'Main', items: [
      { href: '/dashboard/hr', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { label: 'Management', items: [
      { href: '/dashboard/employees', label: 'Employees', icon: Users },
      { href: '/dashboard/departments', label: 'Departments', icon: Building2 },
    ]},
    { label: 'Operations', items: [
      { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck },
      { href: '/dashboard/leaves', label: 'Leave Requests', icon: FileText },
      { href: '/dashboard/payroll', label: 'Payroll', icon: Banknote },
    ]},
    { label: 'Account', items: [
      { href: '/dashboard/profile', label: 'My Profile', icon: User },
    ]},
  ],
  manager: [
    { label: 'Main', items: [
      { href: '/dashboard/manager', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { label: 'My Team', items: [
      { href: '/dashboard/employees', label: 'Team Members', icon: Users },
      { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck },
      { href: '/dashboard/leaves', label: 'Leave Requests', icon: FileText },
    ]},
    { label: 'Account', items: [
      { href: '/dashboard/profile', label: 'My Profile', icon: User },
    ]},
  ],
  employee: [
    { label: 'Main', items: [
      { href: '/dashboard/employee', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { label: 'My Work', items: [
      { href: '/dashboard/attendance', label: 'My Attendance', icon: CalendarCheck },
      { href: '/dashboard/leaves', label: 'My Leaves', icon: FileText },
      { href: '/dashboard/payroll', label: 'My Payroll', icon: Banknote },
    ]},
    { label: 'Account', items: [
      { href: '/dashboard/profile', label: 'My Profile', icon: User },
    ]},
  ],
};

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
}

function getRoleColor(role) {
  const map = { admin: '#ef4444', hr: '#10b981', manager: '#f59e0b', employee: '#3b82f6' };
  return map[role] || '#6366f1';
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const sections = NAV_CONFIG[user?.role] || [];

  const isActive = (href) => {
    if (href === `/dashboard/${user?.role}`) return pathname === href;
    return pathname.startsWith(href) && href !== `/dashboard/${user?.role}`;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="sidebar-logo-icon">
            <Briefcase size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <h2>HRM System</h2>
            <span>Human Resources</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user" style={{ marginBottom: 8 }}>
          <div className="sidebar-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role" style={{ color: getRoleColor(user?.role) }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="nav-item"
          style={{ width: '100%', color: '#f87171', background: 'rgba(239,68,68,0.08)' }}
        >
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
