'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dashboardApi, leavesApi, attendanceApi, employeesApi } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import {
  Users, UserCheck, UserX, Clock, CalendarX,
  FileText, ArrowRight, CheckCircle2, XCircle, UserPlus, Building2, Banknote
} from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

export default function HRDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [empStats, setEmpStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'hr' && user.role !== 'admin') {
        router.replace(`/dashboard/${user.role}`);
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashStats, eStats, attSummary, leaves] = await Promise.all([
        dashboardApi.getStats(),
        employeesApi.getStats(),
        attendanceApi.getTodaySummary(),
        leavesApi.getAll({ status: 'Pending' }),
      ]);
      setStats(dashStats);
      setEmpStats(eStats);
      setTodayAttendance(attSummary);
      setPendingLeaves(leaves.slice(0, 5));
    } catch (err) {
      console.error('Failed to load HR dashboard:', err);
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
        <span>Loading HR Dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">HR Overview — {user?.name}</h2>
          <p className="page-subtitle">Track personnel attendance, manage staffing, review leave requests, and oversee payroll.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard/payroll" className="btn btn-primary btn-sm">
            <Banknote size={16} /> Payroll
          </Link>
          <Link href="/dashboard/employees" className="btn btn-secondary btn-sm">
            <UserPlus size={16} /> Manage Employees
          </Link>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* HR Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Employees"
          value={stats?.totalEmployees}
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Monthly Payroll"
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
          label="Absent Today"
          value={stats?.absentToday}
          icon={UserX}
          color="red"
          loading={loading}
        />
        <StatCard
          label="Employees on Leave"
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
      </div>

      <div className="charts-row">
        {/* Attendance Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Today's Attendance Status</h3>
            <Link href="/dashboard/attendance" className="btn btn-ghost btn-sm">
              Full Log <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--color-success-dark)', fontWeight: 500 }}>Present / On Time</span>
                    <span style={{ fontWeight: 600 }}>{todayAttendance?.present ?? 0}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(((todayAttendance?.present || 0) / (todayAttendance?.total || 1)) * 100)}%`,
                        height: '100%',
                        background: 'var(--color-success)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--color-warning-dark)', fontWeight: 500 }}>Late Arrival</span>
                    <span style={{ fontWeight: 600 }}>{todayAttendance?.late ?? 0}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(((todayAttendance?.late || 0) / (todayAttendance?.total || 1)) * 100)}%`,
                        height: '100%',
                        background: 'var(--color-warning)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--color-danger-dark)', fontWeight: 500 }}>Absent</span>
                    <span style={{ fontWeight: 600 }}>{todayAttendance?.absent ?? 0}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(((todayAttendance?.absent || 0) / (todayAttendance?.total || 1)) * 100)}%`,
                        height: '100%',
                        background: 'var(--color-danger)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--color-orange)', fontWeight: 500 }}>On Leave</span>
                    <span style={{ fontWeight: 600 }}>{todayAttendance?.onLeave ?? 0}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(((todayAttendance?.onLeave || 0) / (todayAttendance?.total || 1)) * 100)}%`,
                        height: '100%',
                        background: 'var(--color-orange)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Staffing by Department */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Staffing by Department</h3>
            <Link href="/dashboard/departments" className="btn btn-ghost btn-sm">
              Departments <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
              </div>
            ) : empStats?.byDepartment && Object.keys(empStats.byDepartment).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(empStats.byDepartment).map(([dept, count]) => (
                  <div key={dept} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={16} color="var(--color-primary)" />
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{dept}</span>
                    </div>
                    <span className="badge badge-info">{count} staff</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No department data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Leave Requests */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Pending Leave Requests</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Review applications submitted by employees
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
              <h3>No pending leaves</h3>
              <p>All employee leave requests have been reviewed.</p>
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
