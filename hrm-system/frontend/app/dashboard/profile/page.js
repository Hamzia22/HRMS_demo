'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { employeesApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import {
  User, Mail, Shield, Briefcase, Building2,
  Calendar, Phone, KeyRound, CheckCircle2
} from 'lucide-react';

const ROLE_PERMISSIONS = {
  admin: [
    'Full access to all administrative modules',
    'Manage company employees (Add, Edit, Deactivate)',
    'Create, modify, and delete organizational departments',
    'Review, approve, and reject company-wide leave requests',
    'Inspect overall attendance logs for all personnel',
    'Monitor aggregated company-wide operational metrics',
  ],
  hr: [
    'View and manage employee directory (Add, Edit)',
    'Inspect organizational department structure',
    'Review and action employee leave applications',
    'View company-wide daily attendance logs',
    'Monitor human resources personnel dashboards',
  ],
  manager: [
    'View assigned team members and direct reports',
    'Monitor daily team attendance and check-in logs',
    'Review, approve, and reject team leave requests',
    'Track team presence metrics and leave schedules',
  ],
  employee: [
    'Access personal employee portal and dashboard',
    'View personal attendance timestamps and history',
    'Apply for leave and track review status',
    'View employee profile information and assignment',
  ],
};

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        loadEmployee();
      }
    }
  }, [user, authLoading, router]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const list = await employeesApi.getAll();
      if (list && list.length > 0) {
        // Find matching by userId or email or first employee
        const match =
          list.find((e) => e.userId === user.id) ||
          list.find((e) => e.email.toLowerCase() === user.email.toLowerCase()) ||
          list[0];
        setEmployee(match);
      }
    } catch (err) {
      console.error('Failed to load employee profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <span>Loading profile...</span>
      </div>
    );
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'U';

  const permissions = ROLE_PERMISSIONS[user?.role] || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Account & Profile</h2>
          <p className="page-subtitle">Your login credentials, account role, and associated employee record.</p>
        </div>
        <button onClick={logout} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-danger)' }}>
          Sign Out
        </button>
      </div>

      {/* Profile Overview Header Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="profile-header">
          <div className="avatar avatar-xl">{initials}</div>
          <div className="profile-info" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2>{user?.name}</h2>
              <Badge label={user?.role} />
              {employee && <Badge label={employee.status} />}
            </div>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Mail size={15} color="var(--color-text-muted)" />
              <span style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>•</span>
              <Shield size={15} color="var(--color-primary)" />
              <span style={{ textTransform: 'capitalize' }}>{user?.role} Account</span>
            </p>
          </div>
        </div>

        <div className="card-body">
          <h4 style={{ fontSize: '0.9rem', marginBottom: 14, color: 'var(--color-text-secondary)' }}>
            User Account Details
          </h4>
          <div className="info-grid">
            <div className="info-item">
              <label>System User ID</label>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{user?.id}</span>
            </div>
            <div className="info-item">
              <label>Account Role</label>
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{user?.role}</span>
            </div>
            <div className="info-item">
              <label>Auth Method</label>
              <span>JWT Authentication</span>
            </div>
            <div className="info-item">
              <label>Session Status</label>
              <span style={{ color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={14} /> Active Session
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-row">
        {/* Linked Employee Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={18} color="var(--color-primary)" /> Linked Employee Record
            </h3>
          </div>
          <div className="card-body">
            {employee ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--color-border-light)' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Employee ID</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{employee.employeeId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--color-border-light)' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Job Position</span>
                  <span style={{ fontWeight: 500 }}>{employee.position}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--color-border-light)' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Department</span>
                  <span style={{ fontWeight: 500 }}>{employee.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--color-border-light)' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Joining Date</span>
                  <span style={{ fontWeight: 500 }}>{employee.joiningDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--color-border-light)' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Employment Type</span>
                  <Badge label={employee.employmentType} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Phone</span>
                  <span style={{ fontWeight: 500 }}>{employee.phone || '—'}</span>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <p>No linked employee record found for this system user.</p>
              </div>
            )}
          </div>
        </div>

        {/* Role Permissions & Capabilities */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <KeyRound size={18} color="var(--color-purple)" /> Role Capabilities ({user?.role})
            </h3>
          </div>
          <div className="card-body">
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {permissions.map((perm, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem' }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'var(--color-success-light)',
                      color: 'var(--color-success-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    ✓
                  </div>
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
