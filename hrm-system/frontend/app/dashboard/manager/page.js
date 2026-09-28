'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dashboardApi, leavesApi, employeesApi, attendanceApi } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import {
  Users, UserCheck, Clock, CalendarX,
  FileText, ArrowRight, CheckCircle2, XCircle
} from 'lucide-react';

export default function ManagerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'manager' && user.role !== 'admin') {
        router.replace(`/dashboard/${user.role}`);
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashStats, team, leaves] = await Promise.all([
        dashboardApi.getStats(),
        employeesApi.getAll(),
        leavesApi.getAll(),
      ]);
      setStats(dashStats);
      setTeamMembers(team);
      setTeamLeaves(leaves);
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
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

  const pendingLeaves = teamLeaves.filter(l => l.status === 'Pending');

  if (authLoading || (!user && loading)) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <span>Loading Manager Dashboard...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Team Manager Dashboard — {user?.name}</h2>
          <p className="page-subtitle">Oversee your assigned engineering & project team, attendance, and leave approvals.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard/employees" className="btn btn-primary btn-sm">
            <Users size={16} /> My Team Members
          </Link>
          <Link href="/dashboard/attendance" className="btn btn-secondary btn-sm">
            <UserCheck size={16} /> Team Attendance
          </Link>
        </div>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Manager Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Team Members"
          value={stats?.totalTeam ?? teamMembers.length}
          icon={Users}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Present Today"
          value={stats?.presentTeam}
          icon={UserCheck}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Team Members on Leave"
          value={stats?.onLeaveTeam}
          icon={CalendarX}
          color="orange"
          loading={loading}
        />
        <StatCard
          label="Pending Team Approvals"
          value={stats?.pendingLeaves ?? pendingLeaves.length}
          icon={Clock}
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Pending Leave Requests for Team */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Pending Team Leave Approvals</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Requests requiring your review and sign-off
            </p>
          </div>
          <Link href="/dashboard/leaves" className="btn btn-ghost btn-sm">
            All Team Leaves <ArrowRight size={14} />
          </Link>
        </div>
        <div className="card-body no-top-pad">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading requests...</span>
            </div>
          ) : pendingLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--color-success)', opacity: 0.8 }} />
              <h3>No pending approvals</h3>
              <p>Your team has no pending leave requests awaiting approval.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>{req.employeeName}</td>
                      <td>
                        <span className="badge badge-info">{req.leaveType}</span>
                      </td>
                      <td>{req.startDate}</td>
                      <td>{req.endDate}</td>
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
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleLeaveAction(req.id, 'Rejected')}
                            className="btn btn-danger btn-sm"
                            disabled={actionLoading === req.id}
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

      {/* Team Members List */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Assigned Team Members</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Direct reports under your supervision
            </p>
          </div>
          <Link href="/dashboard/employees" className="btn btn-secondary btn-sm">
            View Details <ArrowRight size={14} />
          </Link>
        </div>
        <div className="card-body no-top-pad">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading team members...</span>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 20px' }}>
              <Users size={32} />
              <h3>No team members assigned</h3>
              <p>You have no direct reports configured in the system.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((emp) => (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 600 }}>{emp.name}</td>
                      <td>{emp.position}</td>
                      <td>{emp.department}</td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.825rem' }}>{emp.email}</td>
                      <td>
                        <Badge label={emp.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/dashboard/employees/${emp.id}`} className="btn btn-ghost btn-sm">
                          View Profile
                        </Link>
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
