'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dashboardApi, leavesApi, employeesApi } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import {
  Users, UserCheck, Clock, CalendarX, Building2,
  FileText, ArrowRight, CheckCircle2, XCircle, Shield, Banknote
} from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [empStats, setEmpStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'admin') {
        router.replace(`/dashboard/${user.role}`);
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashStats, eStats, leaves] = await Promise.all([
        dashboardApi.getStats(),
        employeesApi.getStats(),
        leavesApi.getAll({ status: 'Pending' }),
      ]);
      setStats(dashStats);
      setEmpStats(eStats);
      setPendingLeaves(leaves.slice(0, 5));
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      setActionLoading(id);
      await leavesApi.updateStatus(id, status);
      setMessage(`Leave request ${status.toLowerCase()} successfully`);
      setTimeout(() => setMessage(''), 3000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update leave request');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <span>Loading Admin Dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Welcome back, {user?.name} 👋</h2>
          <p className="page-subtitle">Here is the latest overview of company operations and human resources.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard/payroll" className="btn btn-primary btn-sm">
            <Banknote size={16} /> Payroll
          </Link>
          <Link href="/dashboard/employees" className="btn btn-secondary btn-sm">
            <Users size={16} /> Employees
          </Link>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Active Employees"
          value={stats?.totalEmployees}
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Total Monthly Payroll"
          value={formatCurrency(stats?.payroll?.totalPayroll)}
          icon={Banknote}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Present Today"
          value={stats?.presentToday}
          icon={UserCheck}
          color="indigo"
          loading={loading}
        />
        <StatCard
          label="On Leave Today"
          value={stats?.onLeave}
          icon={CalendarX}
          color="orange"
          loading={loading}
        />
        <StatCard
          label="Pending Leave Requests"
          value={stats?.pendingLeaves}
          icon={Clock}
          color="yellow"
          loading={loading}
        />
        <StatCard
          label="HR Personnel"
          value={stats?.totalHR}
          icon={Shield}
          color="purple"
          loading={loading}
        />
      </div>

      <div className="charts-row">
        {/* Department Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Headcount by Department</h3>
            <Link href="/dashboard/departments" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
              </div>
            ) : empStats?.byDepartment && Object.keys(empStats.byDepartment).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(empStats.byDepartment).map(([dept, count]) => {
                  const pct = Math.round((count / (empStats.active || 1)) * 100);
                  return (
                    <div key={dept}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>{dept}</span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{count} staff ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <p>No department data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick System Shortcuts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Administrative Actions</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Link
                href="/dashboard/employees"
                style={{
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-info-light)', color: 'var(--color-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Employees</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Add, edit, or deactivate</div>
                </div>
              </Link>

              <Link
                href="/dashboard/departments"
                style={{
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-purple-light)', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Departments</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Manage organizational units</div>
                </div>
              </Link>

              <Link
                href="/dashboard/attendance"
                style={{
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Attendance</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>View company attendance logs</div>
                </div>
              </Link>

              <Link
                href="/dashboard/leaves"
                style={{
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Leave Requests</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Approve or reject applications</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Pending Leave Requests Awaiting Review</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Requires administrative or manager decision
            </p>
          </div>
          <Link href="/dashboard/leaves" className="btn btn-secondary btn-sm">
            View All Leaves <ArrowRight size={14} />
          </Link>
        </div>
        <div className="card-body no-top-pad">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading leaves...</span>
            </div>
          ) : pendingLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 20px' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--color-success)', opacity: 0.8 }} />
              <h3>All caught up!</h3>
              <p>There are no pending leave requests awaiting approval.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>{req.employeeName}</td>
                      <td>{req.department}</td>
                      <td>
                        <span className="badge badge-info">{req.leaveType}</span>
                      </td>
                      <td style={{ fontSize: '0.825rem' }}>
                        {req.startDate} → {req.endDate}
                      </td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.reason}>
                        {req.reason}
                      </td>
                      <td>
                        <Badge label={req.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleLeaveAction(req.id, 'Approved')}
                            className="btn btn-success btn-sm"
                            disabled={actionLoading === req.id}
                            title="Approve leave"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleLeaveAction(req.id, 'Rejected')}
                            className="btn btn-danger btn-sm"
                            disabled={actionLoading === req.id}
                            title="Reject leave"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
