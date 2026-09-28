'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { employeesApi, attendanceApi, leavesApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import {
  ArrowLeft, Mail, Phone, Calendar, Briefcase,
  Building2, CheckCircle2, Clock, CalendarCheck, Banknote
} from 'lucide-react';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        loadData();
      }
    }
  }, [id, user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [emp, att, leaveList] = await Promise.all([
        employeesApi.getById(id),
        attendanceApi.getByEmployee(id).catch(() => []),
        leavesApi.getAll().then((list) => list.filter((l) => l.employeeId === id)).catch(() => []),
      ]);
      setEmployee(emp);
      setAttendance(att);
      setLeaves(leaveList);
    } catch (err) {
      setError(err.message || 'Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <span>Loading employee profile...</span>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="empty-state">
        <h3>Employee Not Found</h3>
        <p>{error || 'The requested employee record does not exist or you do not have permission to view it.'}</p>
        <Link href="/dashboard/employees" className="btn btn-secondary btn-sm" style={{ marginTop: 14 }}>
          <ArrowLeft size={16} /> Return to Directory
        </Link>
      </div>
    );
  }

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href="/dashboard/employees" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', gap: 6 }}>
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="profile-header">
          <div className="avatar avatar-xl">{initials}</div>
          <div className="profile-info" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2>{employee.name}</h2>
              <Badge label={employee.status} />
              <Badge label={employee.employmentType} />
            </div>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Briefcase size={16} color="var(--color-primary)" />
              <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{employee.position}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>•</span>
              <Building2 size={16} color="var(--color-primary)" />
              <span>{employee.department}</span>
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Employee ID: <strong style={{ color: 'var(--color-primary)' }}>{employee.employeeId}</strong>
            </p>
          </div>
        </div>

        <div className="card-body">
          <h4 style={{ fontSize: '0.9rem', marginBottom: 14, color: 'var(--color-text-secondary)' }}>
            Contact & Employment Details
          </h4>
          <div className="info-grid">
            <div className="info-item">
              <label>Work Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={15} color="var(--color-text-muted)" />
                <span>{employee.email}</span>
              </div>
            </div>

            <div className="info-item">
              <label>Phone Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={15} color="var(--color-text-muted)" />
                <span>{employee.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="info-item">
              <label>Department</label>
              <span>{employee.department}</span>
            </div>

            <div className="info-item">
              <label>Position</label>
              <span>{employee.position}</span>
            </div>

            <div className="info-item">
              <label>Joining Date</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} color="var(--color-text-muted)" />
                <span>{employee.joiningDate}</span>
              </div>
            </div>

            <div className="info-item">
              <label>Employment Type</label>
              <span>{employee.employmentType}</span>
            </div>

            <div className="info-item">
              <label>Status</label>
              <Badge label={employee.status} />
            </div>
          </div>

          {employee.basicSalary !== undefined && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 14, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <Banknote size={16} /> Salary & Compensation Profile (INR ₹)
              </h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Basic Salary</label>
                  <span style={{ fontWeight: 600 }}>₹{Number(employee.basicSalary || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="info-item">
                  <label>Housing Allowance</label>
                  <span>₹{Number(employee.housingAllowance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="info-item">
                  <label>Transport Allowance</label>
                  <span>₹{Number(employee.transportAllowance || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="info-item">
                  <label>Other Allowances</label>
                  <span>₹{Number(employee.otherAllowances || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs / Two Column: Attendance & Leaves for this Employee */}
      <div className="charts-row">
        {/* Attendance History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarCheck size={18} color="var(--color-primary)" /> Attendance Records
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{attendance.length} logged days</span>
          </div>
          <div className="card-body no-top-pad">
            {attendance.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 10px' }}>
                <p>No recorded attendance entries</p>
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
                    {attendance.slice(0, 10).map((record) => (
                      <tr key={record.id}>
                        <td style={{ fontWeight: 500 }}>{record.date}</td>
                        <td style={{ fontSize: '0.825rem' }}>{record.checkIn || '—'}</td>
                        <td style={{ fontSize: '0.825rem' }}>{record.checkOut || '—'}</td>
                        <td>
                          <Badge label={record.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Leave Requests History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--color-warning)" /> Leave History
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{leaves.length} requests</span>
          </div>
          <div className="card-body no-top-pad">
            {leaves.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 10px' }}>
                <p>No leave requests on record</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <span className="badge badge-info">{req.leaveType}</span>
                        </td>
                        <td style={{ fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                          {req.startDate} → {req.endDate}
                        </td>
                        <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.reason}>
                          {req.reason}
                        </td>
                        <td>
                          <Badge label={req.status} />
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
    </div>
  );
}
