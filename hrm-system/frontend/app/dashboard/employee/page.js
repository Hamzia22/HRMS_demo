'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dashboardApi, leavesApi, attendanceApi, employeesApi, payrollApi } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle,
  FilePlus, ArrowRight, Calendar, User, Banknote,
  LogIn, LogOut, AlertCircle, Timer, Briefcase
} from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

export default function EmployeeDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [empRecord, setEmpRecord] = useState(null);
  const [myPayroll, setMyPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live time
  const [currentTime, setCurrentTime] = useState('');
  const [todayFormattedDate, setTodayFormattedDate] = useState('');

  // Attendance actions
  const [attActionLoading, setAttActionLoading] = useState(false);
  const [attMessage, setAttMessage] = useState('');
  const [attError, setAttError] = useState('');

  // Apply leave modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [leaveActionLoading, setLeaveActionLoading] = useState(null);

  useEffect(() => {
    const updateLiveTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setTodayFormattedDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateLiveTime();
    const interval = setInterval(updateLiveTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashStats, todayAtt, leaves, attList, emps, payrollData] = await Promise.all([
        dashboardApi.getStats(),
        attendanceApi.getToday().catch(() => null),
        leavesApi.getAll(),
        attendanceApi.getAll(),
        employeesApi.getAll(),
        payrollApi.getMy().catch(() => null),
      ]);
      setStats(dashStats);
      setTodayAttendance(todayAtt);
      setRecentLeaves(leaves.slice(0, 5));
      setRecentAttendance(attList.slice(0, 7));
      if (emps && emps.length > 0) {
        setEmpRecord(emps[0]);
      }
      if (payrollData) {
        setMyPayroll(payrollData.currentPayroll || null);
      }
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setAttActionLoading(true);
      setAttError('');
      setAttMessage('');
      const res = await attendanceApi.checkIn();
      setTodayAttendance(res.record);
      setAttMessage('Check-in logged successfully! Have a productive day.');
      setTimeout(() => setAttMessage(''), 4000);
      loadData();
    } catch (err) {
      setAttError(err.message || 'Check-in failed');
      setTimeout(() => setAttError(''), 5000);
    } finally {
      setAttActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setAttActionLoading(true);
      setAttError('');
      setAttMessage('');
      const res = await attendanceApi.checkOut();
      setTodayAttendance(res.record);
      setAttMessage('Check-out logged successfully. See you tomorrow!');
      setTimeout(() => setAttMessage(''), 4000);
      loadData();
    } catch (err) {
      setAttError(err.message || 'Check-out failed');
      setTimeout(() => setAttError(''), 5000);
    } finally {
      setAttActionLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return;
    try {
      setLeaveActionLoading(leaveId);
      await leavesApi.cancel(leaveId);
      setSuccessMessage('Leave application cancelled successfully.');
      setTimeout(() => setSuccessMessage(''), 3500);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to cancel leave application');
    } finally {
      setLeaveActionLoading(null);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!startDate || !endDate || !reason.trim()) {
      setSubmitError('Please complete all required fields');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setSubmitError('Start date cannot be after end date');
      return;
    }

    try {
      setSubmitting(true);
      await leavesApi.create({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      setShowApplyModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setSuccessMessage('Leave application submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      loadData();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine current attendance state
  const hasCheckedIn = Boolean(todayAttendance?.checkIn);
  const hasCheckedOut = Boolean(todayAttendance?.checkOut);

  let attStatusLabel = 'Not Checked In';
  let attStatusBadgeClass = 'badge-neutral';
  if (hasCheckedIn && !hasCheckedOut) {
    attStatusLabel = todayAttendance?.status || 'Checked In';
    attStatusBadgeClass = 'badge-success';
  } else if (hasCheckedOut) {
    attStatusLabel = 'Checked Out';
    attStatusBadgeClass = 'badge-info';
  }

  if (authLoading || (!user && loading)) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <span>Loading personal employee portal...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Welcome back, {user?.name} 👋</h2>
          <p className="page-subtitle">Your personal employee portal for attendance, leaves, and salary management.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowApplyModal(true)} className="btn btn-primary btn-sm">
            <FilePlus size={16} /> Apply for Leave
          </button>
          <Link href="/dashboard/payroll" className="btn btn-secondary btn-sm">
            <Banknote size={16} /> My Payroll
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ─── Top Row: Live Attendance Check-In Widget & Salary Summary ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Attendance Check-in Widget */}
        <div className="card" style={{ border: '1px solid var(--color-primary-light)', background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-2) 100%)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Timer size={20} color="var(--color-primary)" />
              <div>
                <h3 className="card-title" style={{ fontSize: '1rem' }}>Today's Attendance</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{todayFormattedDate}</span>
              </div>
            </div>
            <span className={`badge ${attStatusBadgeClass}`} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
              {attStatusLabel}
            </span>
          </div>

          <div className="card-body">
            {attMessage && (
              <div className="alert alert-success" style={{ marginBottom: 12, padding: '8px 12px', fontSize: '0.825rem' }}>
                <CheckCircle2 size={15} />
                <span>{attMessage}</span>
              </div>
            )}
            {attError && (
              <div className="alert alert-error" style={{ marginBottom: 12, padding: '8px 12px', fontSize: '0.825rem' }}>
                <AlertCircle size={15} />
                <span>{attError}</span>
              </div>
            )}

            {/* Time & Logged Status Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Check-In Time</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 2, fontFamily: 'monospace' }}>
                  {todayAttendance?.checkIn || '— : —'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Check-Out Time</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 2, fontFamily: 'monospace' }}>
                  {todayAttendance?.checkOut || '— : —'}
                </div>
              </div>
            </div>

            {/* Check In / Check Out Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={handleCheckIn}
                disabled={hasCheckedIn || attActionLoading}
                className="btn btn-success"
                style={{ justifyContent: 'center', fontWeight: 600 }}
              >
                <LogIn size={16} /> Check In
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!hasCheckedIn || hasCheckedOut || attActionLoading}
                className="btn btn-primary"
                style={{ justifyContent: 'center', fontWeight: 600 }}
              >
                <LogOut size={16} /> Check Out
              </button>
            </div>
          </div>
        </div>

        {/* Personal Salary & Compensation Snapshot */}
        <div className="card" style={{ border: '1px solid var(--color-success-light)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Banknote size={20} color="var(--color-success)" />
              <div>
                <h3 className="card-title" style={{ fontSize: '1rem' }}>Salary & Compensation</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {myPayroll ? myPayroll.month : 'September 2026'}
                </span>
              </div>
            </div>
            {myPayroll && <Badge label={myPayroll.status} />}
          </div>

          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Net Take-Home Pay</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)', marginTop: 2 }}>
                  {formatCurrency(myPayroll ? myPayroll.netSalary : (empRecord?.basicSalary || 28000) * 1.15)}
                </div>
              </div>
              <Link href="/dashboard/payroll" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: 6 }}>
                View Payslip <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--color-surface-2)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Basic Salary:</span>
                <div style={{ fontWeight: 600 }}>{formatCurrency(empRecord?.basicSalary || 28000)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Allowances:</span>
                <div style={{ fontWeight: 600 }}>
                  {formatCurrency((empRecord?.housingAllowance || 4000) + (empRecord?.transportAllowance || 2500) + (empRecord?.otherAllowances || 1500))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Personal Summary Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Leave Requests"
          value={stats?.totalLeaves ?? recentLeaves.length}
          icon={Calendar}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Pending Applications"
          value={stats?.pendingLeaves}
          icon={Clock}
          color="yellow"
          loading={loading}
        />
        <StatCard
          label="Approved Leaves"
          value={stats?.approvedLeaves}
          icon={CheckCircle2}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Logged Attendance Days"
          value={stats?.totalAttendanceDays ?? recentAttendance.length}
          icon={CalendarCheck}
          color="indigo"
          loading={loading}
        />
      </div>

      {/* Employee Info & Attendance History */}
      <div className="charts-row">
        {/* Profile Snapshot */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Employee Information</h3>
            <Link href="/dashboard/profile" className="btn btn-ghost btn-sm">
              View Profile <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Department
                </span>
                <p style={{ fontWeight: 600, marginTop: 2 }}>{empRecord?.department || 'Development'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Position
                </span>
                <p style={{ fontWeight: 600, marginTop: 2 }}>{empRecord?.position || 'Senior Software Engineer'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Employment Type
                </span>
                <div style={{ marginTop: 4 }}>
                  <Badge label={empRecord?.employmentType || 'Full-time'} />
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Current Status
                </span>
                <div style={{ marginTop: 4 }}>
                  <Badge label={empRecord?.status || 'Active'} />
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Employee ID
                </span>
                <p style={{ marginTop: 2, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {empRecord?.employeeId || 'EMP001'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Email Address
                </span>
                <p style={{ marginTop: 2, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Attendance Log</h3>
            <Link href="/dashboard/attendance" className="btn btn-ghost btn-sm">
              All Days <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body no-top-pad">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
              </div>
            ) : recentAttendance.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <p>No attendance records logged</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAttendance.slice(0, 5).map((att) => (
                      <tr key={att.id}>
                        <td style={{ fontWeight: 500 }}>{att.date}</td>
                        <td style={{ fontSize: '0.825rem' }}>{att.checkIn || '—'}</td>
                        <td style={{ fontSize: '0.825rem' }}>{att.checkOut || '—'}</td>
                        <td>
                          <Badge label={att.status} />
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

      {/* Leave Applications History */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">My Leave Applications & Status</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Track the progress and review history of your leave submissions
            </p>
          </div>
          <button onClick={() => setShowApplyModal(true)} className="btn btn-primary btn-sm">
            <FilePlus size={15} /> New Application
          </button>
        </div>
        <div className="card-body no-top-pad">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading leaves...</span>
            </div>
          ) : recentLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 20px' }}>
              <Calendar size={32} />
              <h3>No leave requests found</h3>
              <p>You haven't submitted any leave applications yet.</p>
              <button onClick={() => setShowApplyModal(true)} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                Apply Now
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Requested On</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <span className="badge badge-info">{req.leaveType}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{req.startDate}</td>
                      <td style={{ fontWeight: 500 }}>{req.endDate}</td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.reason}>
                        {req.reason}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.825rem' }}>{req.requestedDate}</td>
                      <td>
                        <Badge label={req.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelLeave(req.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                            disabled={leaveActionLoading === req.id}
                            title="Cancel pending application"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-backdrop" onClick={() => setShowApplyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div className="modal-body">
                {submitError && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label required">Leave Type</label>
                  <select
                    className="form-control"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    required
                  >
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                  </select>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label required">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Reason for Leave</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Briefly describe the reason for your leave request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
