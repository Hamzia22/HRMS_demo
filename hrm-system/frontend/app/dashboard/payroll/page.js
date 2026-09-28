'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { payrollApi, employeesApi, departmentsApi } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import {
  Banknote, Plus, Search, Filter, Eye, Edit, CheckCircle2,
  AlertCircle, Clock, Check, ShieldAlert, ArrowLeft,
  Calendar, FileText, Printer, ChevronRight, DollarSign
} from 'lucide-react';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

export default function PayrollPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Common state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Admin / HR State
  const [payrollList, setPayrollList] = useState([]);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Filters
  const [monthFilter, setMonthFilter] = useState('September 2026');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Employee State
  const [myPayrollData, setMyPayrollData] = useState(null);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateMonth, setGenerateMonth] = useState('September 2026');
  const [generateEmpId, setGenerateEmpId] = useState('');
  const [regenerateFlag, setRegenerateFlag] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [payslipData, setPayslipData] = useState(null);

  const isAdminOrHr = user?.role === 'admin' || user?.role === 'hr';
  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager';

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (!isManager) {
        loadData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, router, monthFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      if (isAdminOrHr) {
        const [pList, pStats, deptList, empList] = await Promise.all([
          payrollApi.getAll(monthFilter ? { month: monthFilter } : {}),
          payrollApi.getStats(monthFilter || null),
          departmentsApi.getAll().catch(() => []),
          employeesApi.getAll().catch(() => []),
        ]);
        setPayrollList(pList);
        setStats(pStats);
        setDepartments(deptList);
        setEmployees(empList);
      } else if (isEmployee) {
        const myData = await payrollApi.getMy();
        setMyPayrollData(myData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id) => {
    try {
      setActionLoading(id);
      await payrollApi.process(id);
      setMessage('Payroll record marked as Processed');
      setTimeout(() => setMessage(''), 3500);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to process payroll');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePay = async (id) => {
    try {
      setActionLoading(id);
      await payrollApi.markAsPaid(id);
      setMessage('Payroll record marked as Paid');
      setTimeout(() => setMessage(''), 3500);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setGenerateError('');
    if (!generateMonth.trim()) {
      setGenerateError('Month is required');
      return;
    }

    try {
      setGenerating(true);
      const res = await payrollApi.generate({
        month: generateMonth.trim(),
        employeeId: generateEmpId || undefined,
        regenerate: regenerateFlag,
      });
      setShowGenerateModal(false);
      setMonthFilter(generateMonth.trim());
      setMessage(res.message || 'Payroll generated successfully!');
      setTimeout(() => setMessage(''), 4000);
      loadData();
    } catch (err) {
      setGenerateError(err.message || 'Failed to generate payroll');
    } finally {
      setGenerating(false);
    }
  };

  const openEditModal = (record) => {
    setEditError('');
    setEditingRecord(record);
    setEditFormData({
      basicSalary: record.basicSalary,
      housingAllowance: record.housingAllowance,
      transportAllowance: record.transportAllowance,
      otherAllowances: record.otherAllowances,
      overtime: record.overtime,
      leaveDeduction: record.leaveDeduction,
      otherDeductions: record.otherDeductions,
      taxDeduction: record.taxDeduction,
      notes: record.notes || '',
    });
    setShowEditModal(true);
  };

  const calculateEditLive = () => {
    const b = Number(editFormData.basicSalary) || 0;
    const h = Number(editFormData.housingAllowance) || 0;
    const tr = Number(editFormData.transportAllowance) || 0;
    const o = Number(editFormData.otherAllowances) || 0;
    const ot = Number(editFormData.overtime) || 0;
    const gross = b + h + tr + o + ot;

    const ld = Number(editFormData.leaveDeduction) || 0;
    const od = Number(editFormData.otherDeductions) || 0;
    const tx = Number(editFormData.taxDeduction) || 0;
    const deductions = ld + od + tx;

    const net = Math.max(0, gross - deductions);
    return { gross, deductions, net };
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      setSavingEdit(true);
      await payrollApi.update(editingRecord.id, editFormData);
      setShowEditModal(false);
      setMessage('Payroll record updated successfully!');
      setTimeout(() => setMessage(''), 3500);
      loadData();
    } catch (err) {
      setEditError(err.message || 'Failed to update payroll');
    } finally {
      setSavingEdit(false);
    }
  };

  const openPayslipModal = (record) => {
    setPayslipData(record);
    setShowPayslipModal(true);
  };

  const filteredRecords = payrollList.filter((rec) => {
    const matchesSearch =
      rec.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !deptFilter || rec.department === deptFilter;
    const matchesStatus = !statusFilter || rec.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesDept && matchesStatus;
  });

  if (authLoading || (!user && loading)) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <span>Loading payroll management...</span>
      </div>
    );
  }

  // 1. Manager Access Denied Protection
  if (isManager) {
    return (
      <div className="card" style={{ maxWidth: 650, margin: '40px auto', textAlign: 'center', padding: '36px 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Access Restricted</h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          Team managers do not have access to company payroll and employee salary information by policy. If you require compensation data for budgeting, please consult Human Resources or System Administration.
        </p>
        <Link href="/dashboard/manager" className="btn btn-primary" style={{ display: 'inline-flex', gap: 8 }}>
          <ArrowLeft size={16} /> Return to Manager Dashboard
        </Link>
      </div>
    );
  }

  // 2. Employee Personal "My Payroll" Portal
  if (isEmployee) {
    const current = myPayrollData?.currentPayroll;
    const history = myPayrollData?.payrollHistory || [];
    const empInfo = myPayrollData?.employee;

    return (
      <div>
        <div className="page-header">
          <div>
            <h2 className="page-title">My Payroll & Payslips</h2>
            <p className="page-subtitle">Inspect your salary structure, monthly earnings breakdown, and compensation history.</p>
          </div>
        </div>

        {/* Current Month Highlight Card */}
        {current ? (
          <div className="card" style={{ marginBottom: 24, border: '1px solid var(--color-primary-light)', background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-2) 100%)' }}>
            <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Month Statement
                </span>
                <h3 className="card-title" style={{ marginTop: 2, fontSize: '1.25rem' }}>
                  {current.month}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Badge label={current.status} />
                <button onClick={() => openPayslipModal(current)} className="btn btn-secondary btn-sm">
                  <FileText size={15} /> View Full Payslip
                </button>
              </div>
            </div>

            <div className="card-body">
              {/* Big Net Salary Banner */}
              <div style={{ padding: '20px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    NET TAKE-HOME SALARY
                  </span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-success)', marginTop: 2 }}>
                    {formatCurrency(current.netSalary)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>GROSS EARNINGS</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {formatCurrency(current.grossSalary)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>TOTAL DEDUCTIONS</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                      - {formatCurrency(current.totalDeductions)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings vs Deductions Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* Earnings List */}
                <div style={{ padding: '16px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--color-success-dark)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
                    Earnings Breakdown
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Basic Salary</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(current.basicSalary)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Housing Allowance</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(current.housingAllowance)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Transport Allowance</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(current.transportAllowance)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Other Allowances</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(current.otherAllowances)}</span>
                    </div>
                    {current.overtime > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Overtime Pay</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>+ {formatCurrency(current.overtime)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deductions List */}
                <div style={{ padding: '16px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--color-danger-dark)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
                    Deductions Breakdown
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Income Tax / TDS</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(current.taxDeduction)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Leave / Unpaid Absences</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(current.leaveDeduction)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Other Deductions</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(current.otherDeductions)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: 8, marginTop: 4 }}>
                      <span style={{ fontWeight: 600 }}>Total Deductions</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>{formatCurrency(current.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: '36px 20px' }}>
            <Banknote size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 10px' }} />
            <h3>No Active Payroll Statement</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Your payroll statement for this cycle will appear here once processed by HR.</p>
          </div>
        )}

        {/* History Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Payroll & Payslip History</h3>
          </div>
          <div className="card-body no-top-pad">
            {history.length === 0 ? (
              <div className="empty-state">
                <p>No historical payroll records found.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Gross Salary</th>
                      <th>Total Deductions</th>
                      <th>Net Salary</th>
                      <th>Payment Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Payslip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((rec) => (
                      <tr key={rec.id}>
                        <td style={{ fontWeight: 600 }}>{rec.month}</td>
                        <td>{formatCurrency(rec.grossSalary)}</td>
                        <td style={{ color: 'var(--color-danger)' }}>- {formatCurrency(rec.totalDeductions)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(rec.netSalary)}</td>
                        <td style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                          {rec.paymentDate || (rec.status === 'Paid' ? rec.generatedDate : '—')}
                        </td>
                        <td>
                          <Badge label={rec.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => openPayslipModal(rec)} className="btn btn-ghost btn-sm">
                            <Eye size={15} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Payslip Modal (Reusable) */}
        {renderPayslipModal()}
      </div>
    );
  }

  // 3. Admin / HR Payroll Management UI
  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Payroll Management</h2>
          <p className="page-subtitle">
            Generate monthly payrolls, review employee compensation, and manage disbursements.
          </p>
        </div>
        <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
          <Plus size={16} /> Generate Payroll
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

      {/* Primary KPI Metrics */}
      <div className="stats-grid">
        <StatCard
          label={`Total Payroll (${monthFilter || 'All Months'})`}
          value={formatCurrency(stats?.totalPayroll)}
          icon={Banknote}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Staff on Payroll"
          value={stats?.totalEmployees}
          icon={Calendar}
          color="indigo"
          loading={loading}
        />
        <StatCard
          label="Processed Payroll"
          value={stats?.processedCount}
          icon={Clock}
          color="yellow"
          loading={loading}
        />
        <StatCard
          label="Paid Out"
          value={stats?.paidCount}
          icon={CheckCircle2}
          color="green"
          loading={loading}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search employee, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select
                className="form-control"
                style={{ width: 170 }}
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="">All Months</option>
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>

              <select
                className="form-control"
                style={{ width: 160 }}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              <select
                className="form-control"
                style={{ width: 140 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processed">Processed</option>
                <option value="Paid">Paid</option>
              </select>

              {(searchQuery || deptFilter || statusFilter || monthFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDeptFilter('');
                    setStatusFilter('');
                    setMonthFilter('');
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

      {/* Main Payroll Table */}
      <div className="card">
        <div className="card-body no-top-pad">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading payroll records...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="empty-state">
              <Banknote size={36} />
              <h3>No payroll records found</h3>
              <p>Try selecting a different month or generating payroll for active staff.</p>
              <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                <Plus size={15} /> Generate For {monthFilter || 'Current Month'}
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Month</th>
                    <th>Basic</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{rec.employeeName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>{rec.employeeCode}</div>
                        </div>
                      </td>
                      <td>{rec.department}</td>
                      <td style={{ fontSize: '0.825rem' }}>{rec.month}</td>
                      <td>{formatCurrency(rec.basicSalary)}</td>
                      <td>{formatCurrency(rec.grossSalary)}</td>
                      <td style={{ color: 'var(--color-danger)' }}>- {formatCurrency(rec.totalDeductions)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(rec.netSalary)}</td>
                      <td>
                        <Badge label={rec.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => openPayslipModal(rec)}
                            className="btn btn-ghost btn-sm"
                            title="View full payslip details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => openEditModal(rec)}
                            className="btn btn-ghost btn-sm"
                            title="Edit salary components and adjustments"
                          >
                            <Edit size={15} />
                          </button>

                          {rec.status === 'Pending' && (
                            <button
                              onClick={() => handleProcess(rec.id)}
                              className="btn btn-secondary btn-sm"
                              disabled={actionLoading === rec.id}
                              title="Mark as Processed"
                            >
                              Process
                            </button>
                          )}

                          {rec.status !== 'Paid' && (
                            <button
                              onClick={() => handlePay(rec.id)}
                              className="btn btn-success btn-sm"
                              disabled={actionLoading === rec.id}
                              title="Mark as Paid"
                            >
                              <Check size={14} /> Pay
                            </button>
                          )}
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

      {/* 1. Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="modal-backdrop" onClick={() => setShowGenerateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Generate Monthly Payroll</h3>
              <button onClick={() => setShowGenerateModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit}>
              <div className="modal-body">
                {generateError && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <span>{generateError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label required">Payroll Month</label>
                  <select
                    className="form-control"
                    value={generateMonth}
                    onChange={(e) => setGenerateMonth(e.target.value)}
                    required
                  >
                    <option value="September 2026">September 2026</option>
                    <option value="October 2026">October 2026</option>
                    <option value="November 2026">November 2026</option>
                    <option value="August 2026">August 2026</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Employee Target</label>
                  <select
                    className="form-control"
                    value={generateEmpId}
                    onChange={(e) => setGenerateEmpId(e.target.value)}
                  >
                    <option value="">All Active Employees</option>
                    {employees.filter(e => e.status === 'Active').map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department} - {emp.employeeId})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
                    Leave blank to generate for all active organization staff.
                  </span>
                </div>

                <div className="form-group" style={{ marginTop: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={regenerateFlag}
                      onChange={(e) => setRegenerateFlag(e.target.checked)}
                    />
                    <span>Recalculate & overwrite existing records for this month if already generated</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="btn btn-secondary"
                  disabled={generating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={generating}
                >
                  {generating ? 'Calculating & Generating...' : 'Generate Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Payroll Adjustments Modal */}
      {showEditModal && editingRecord && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Edit Payroll Record</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {editingRecord.employeeName} ({editingRecord.employeeCode}) — {editingRecord.month}
                </p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {editError && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <span>{editError}</span>
                  </div>
                )}

                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
                  1. Earnings & Allowances
                </h4>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label required">Basic Salary (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editFormData.basicSalary}
                      onChange={(e) => setEditFormData({ ...editFormData, basicSalary: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Housing Allowance (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editFormData.housingAllowance}
                      onChange={(e) => setEditFormData({ ...editFormData, housingAllowance: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Transport Allowance (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editFormData.transportAllowance}
                      onChange={(e) => setEditFormData({ ...editFormData, transportAllowance: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Other Allowances (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editFormData.otherAllowances}
                      onChange={(e) => setEditFormData({ ...editFormData, otherAllowances: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Overtime Pay (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editFormData.overtime}
                      onChange={(e) => setEditFormData({ ...editFormData, overtime: e.target.value })}
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-danger)', textTransform: 'uppercase', marginTop: 16, marginBottom: 12, fontWeight: 700 }}>
                  2. Deductions
                </h4>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Leave / Unpaid Absences (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editFormData.leaveDeduction}
                      onChange={(e) => setEditFormData({ ...editFormData, leaveDeduction: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tax / TDS Deduction (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editFormData.taxDeduction}
                      onChange={(e) => setEditFormData({ ...editFormData, taxDeduction: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Other Deductions (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editFormData.otherDeductions}
                      onChange={(e) => setEditFormData({ ...editFormData, otherDeductions: e.target.value })}
                    />
                  </div>
                </div>

                {/* Live Calculation Preview */}
                {(() => {
                  const live = calculateEditLive();
                  return (
                    <div style={{ marginTop: 16, padding: '14px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>GROSS SALARY</span>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{formatCurrency(live.gross)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>DEDUCTIONS</span>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-danger)' }}>- {formatCurrency(live.deductions)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>NET TAKE-HOME</span>
                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-success)' }}>{formatCurrency(live.net)}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving...' : 'Save Adjustments'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Reusable Payslip Modal */}
      {renderPayslipModal()}
    </div>
  );

  function renderPayslipModal() {
    if (!showPayslipModal || !payslipData) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowPayslipModal(false)}>
        <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
          <div className="modal-header">
            <div>
              <h3 className="modal-title">Employee Salary Slip</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {payslipData.month}
              </span>
            </div>
            <button onClick={() => setShowPayslipModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
              ✕
            </button>
          </div>

          <div className="modal-body" id="printable-payslip">
            {/* Payslip Header */}
            <div style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>HRM Organization Inc.</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Human Resources & Payroll Administration</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Badge label={payslipData.status} />
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Date: {payslipData.paymentDate || payslipData.generatedDate}
                </div>
              </div>
            </div>

            {/* Employee Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--color-surface-2)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Employee Name: </span>
                <strong>{payslipData.employeeName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Employee Code: </span>
                <strong>{payslipData.employeeCode}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Department: </span>
                <span>{payslipData.department}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Position: </span>
                <span>{payslipData.position}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Attendance Days: </span>
                <span>{payslipData.attendanceDays || 22} Days</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Leave Days: </span>
                <span>{payslipData.leaveDays || 0} Days</span>
              </div>
            </div>

            {/* 2-Column Earnings & Deductions Tables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Earnings Table */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--color-surface-2)', padding: '8px 12px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-success-dark)', borderBottom: '1px solid var(--color-border)' }}>
                  EARNINGS
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Basic Salary</span>
                    <span>{formatCurrency(payslipData.basicSalary)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Housing Allowance</span>
                    <span>{formatCurrency(payslipData.housingAllowance)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Transport Allowance</span>
                    <span>{formatCurrency(payslipData.transportAllowance)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Other Allowances</span>
                    <span>{formatCurrency(payslipData.otherAllowances)}</span>
                  </div>
                  {payslipData.overtime > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Overtime</span>
                      <span>+ {formatCurrency(payslipData.overtime)}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 6, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>Gross Earnings</span>
                    <span>{formatCurrency(payslipData.grossSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Table */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--color-surface-2)', padding: '8px 12px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-danger-dark)', borderBottom: '1px solid var(--color-border)' }}>
                  DEDUCTIONS
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax / TDS</span>
                    <span>{formatCurrency(payslipData.taxDeduction)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Leave Deduction</span>
                    <span>{formatCurrency(payslipData.leaveDeduction)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Other Deductions</span>
                    <span>{formatCurrency(payslipData.otherDeductions)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 6, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--color-danger)' }}>
                    <span>Total Deductions</span>
                    <span>- {formatCurrency(payslipData.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Summary Block */}
            <div style={{ marginTop: 16, padding: '16px', background: 'var(--color-success-light)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-success-dark)', fontWeight: 700 }}>NET PAYABLE SALARY</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Gross Earnings minus Total Deductions</p>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success-dark)' }}>
                {formatCurrency(payslipData.netSalary)}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: 6 }}>
              <Printer size={15} /> Print Payslip
            </button>
            <button onClick={() => setShowPayslipModal(false)} className="btn btn-primary btn-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}
