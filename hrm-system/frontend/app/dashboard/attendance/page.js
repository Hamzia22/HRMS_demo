'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { attendanceApi } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import {
  CalendarCheck, UserCheck, UserX, Clock, CalendarX,
  Search, Filter, Calendar
} from 'lucide-react';

export default function AttendancePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router, dateFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter) params.date = dateFilter;

      const [list, sum] = await Promise.all([
        attendanceApi.getAll(params),
        attendanceApi.getTodaySummary().catch(() => null),
      ]);
      setRecords(list);
      setSummary(sum);
    } catch (err) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || (!user && loading)) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <span>Loading attendance records...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Attendance Tracking</h2>
          <p className="page-subtitle">
            {user?.role === 'employee'
              ? 'Your personal attendance log and daily check-in timestamps'
              : user?.role === 'manager'
              ? 'Attendance records for your assigned team members'
              : 'Company-wide attendance monitoring and daily presence logs'}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stat Cards (admin, hr, manager) */}
      {user?.role !== 'employee' && (
        <div className="stats-grid">
          <StatCard
            label="Present Today"
            value={summary?.present}
            icon={UserCheck}
            color="green"
            loading={loading}
          />
          <StatCard
            label="Late Today"
            value={summary?.late}
            icon={Clock}
            color="yellow"
            loading={loading}
          />
          <StatCard
            label="Absent Today"
            value={summary?.absent}
            icon={UserX}
            color="red"
            loading={loading}
          />
          <StatCard
            label="On Leave Today"
            value={summary?.onLeave}
            icon={CalendarX}
            color="orange"
            loading={loading}
          />
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="filter-bar">
            {user?.role !== 'employee' && (
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search by employee or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Date:</span>
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 160 }}
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <select
                className="form-control"
                style={{ width: 150 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>

              {(dateFilter || statusFilter || searchQuery) && (
                <button
                  onClick={() => {
                    setDateFilter('');
                    setStatusFilter('');
                    setSearchQuery('');
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

      {/* Attendance Table */}
      <div className="card">
        <div className="card-body no-top-pad">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Fetching attendance data...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck size={36} />
              <h3>No attendance records found</h3>
              <p>There are no attendance logs matching your specified date and filters.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {user?.role !== 'employee' && <th>Employee</th>}
                    {user?.role !== 'employee' && <th>Department</th>}
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id}>
                      {user?.role !== 'employee' && (
                        <td style={{ fontWeight: 600 }}>{rec.employeeName}</td>
                      )}
                      {user?.role !== 'employee' && (
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.825rem' }}>
                          {rec.department || '—'}
                        </td>
                      )}
                      <td style={{ fontWeight: 500 }}>{rec.date}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {rec.checkIn ? (
                          <span style={{ fontFamily: 'monospace' }}>{rec.checkIn}</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {rec.checkOut ? (
                          <span style={{ fontFamily: 'monospace' }}>{rec.checkOut}</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <Badge label={rec.status} />
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
