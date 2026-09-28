'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { leavesApi, employeesApi } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import {
  FileText, Clock, CheckCircle2, XCircle, Plus,
  Search, Filter, Calendar, AlertCircle
} from 'lucide-react';

export default function LeavesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const canApprove = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager';

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
      const [list, st, empList] = await Promise.all([
        leavesApi.getAll(),
        leavesApi.getStats().catch(() => null),
        (user?.role === 'admin' || user?.role === 'hr') ? employeesApi.getAll().catch(() => []) : Promise.resolve([]),
      ]);
      setLeaves(list);
      setStats(st);
      setEmployees(empList);
      if (empList.length > 0 && !selectedEmpId) {
        setSelectedEmpId(empList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id);
      await leavesApi.updateStatus(id, newStatus);
      setMessage(`Leave application marked as ${newStatus}`);
      setTimeout(() => setMessage(''), 3500);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update leave status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!startDate || !endDate || !reason.trim()) {
      setModalError('Please fill in all required fields');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setModalError('Start date must be before or equal to end date');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      };
      if (user?.role === 'admin' || user?.role === 'hr') {
        payload.employeeId = selectedEmpId;
      }
      await leavesApi.create(payload);
      setShowApplyModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setMessage('Leave request submitted successfully!');
      setTimeout(() => setMessage(''), 3500);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const matchesSearch =
      l.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || l.status === statusFilter;
    const matchesType = !typeFilter || l.leaveType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (authLoading || (!user && loading)) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <span>Loading leave requests...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Leave Management</h2>
          <p className="page-subtitle">
            {user?.role === 'employee'
              ? 'Apply for time off and review approval status'
              : 'Review, approve, and track employee leave requests'}
          </p>
        </div>
        <button onClick={() => setShowApplyModal(true)} className="btn btn-primary">
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="stats-grid">
        <StatCard
          label="Total Applications"
          value={stats?.total ?? leaves.length}
          icon={FileText}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Pending Review"
          value={stats?.pending ?? leaves.filter((l) => l.status === 'Pending').length}
          icon={Clock}
          color="yellow"
          loading={loading}
        />
        <StatCard
          label="Approved Requests"
          value={stats?.approved ?? leaves.filter((l) => l.status === 'Approved').length}
          icon={CheckCircle2}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Rejected Requests"
          value={stats?.rejected ?? leaves.filter((l) => l.status === 'Rejected').length}
          icon={XCircle}
          color="red"
          loading={loading}
        />
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by employee, department, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select
                className="form-control"
                style={{ width: 150 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                className="form-control"
                style={{ width: 160 }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Leave Types</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Personal Leave">Personal Leave</option>
              </select>

              {(searchQuery || statusFilter || typeFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setTypeFilter('');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body no-top-pad">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Fetching leave applications...</span>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="empty-state">
              <FileText size={36} />
              <h3>No leave requests found</h3>
              <p>There are no leave applications matching your current filter criteria.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Requested</th>
                    <th>Status</th>
                    {canApprove && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600 }}>{l.employeeName}</td>
                      <td>{l.department}</td>
                      <td>
                        <span className="badge badge-info">{l.leaveType}</span>
                      </td>
                      <td style={{ fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                        {l.startDate} → {l.endDate}
                      </td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.reason}>
                        {l.reason}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        {l.requestedDate}
                      </td>
                      <td>
                        <Badge label={l.status} />
                      </td>
                      {canApprove && (
                        <td style={{ textAlign: 'right' }}>
                          {l.status === 'Pending' ? (
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                onClick={() => handleStatusChange(l.id, 'Approved')}
                                className="btn btn-success btn-sm"
                                disabled={actionLoading === l.id}
                                title="Approve application"
                              >
                                <CheckCircle2 size={14} /> Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(l.id, 'Rejected')}
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading === l.id}
                                title="Reject application"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Reviewed by {l.approvedBy || 'Admin'}
                            </span>
                          )}
                        </td>
                      )}
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
              <h3 className="modal-title">Submit Leave Request</h3>
              <button onClick={() => setShowApplyModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit}>
              <div className="modal-body">
                {modalError && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <span>{modalError}</span>
                  </div>
                )}

                {(user?.role === 'admin' || user?.role === 'hr') && employees.length > 0 && (
                  <div className="form-group">
                    <label className="form-label required">Employee</label>
                    <select
                      className="form-control"
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      required
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.department} - {emp.employeeId})
                        </option>
                      ))}
                    </select>
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
                  <label className="form-label required">Reason for Absence</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Brief explanation for this leave request..."
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
                  {submitting ? 'Submitting...' : 'Submit Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
