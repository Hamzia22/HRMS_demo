'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { employeesApi, departmentsApi } from '@/lib/api';
import Badge from '@/components/ui/Badge';
import {
  Users, UserPlus, Search, Filter, Edit, Eye,
  UserX, UserCheck, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function EmployeesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    departmentId: '',
    position: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full-time',
    status: 'Active',
    basicSalary: 25000,
    housingAllowance: 3000,
    transportAllowance: 2000,
    otherAllowances: 1000,
  });
  const [editingId, setEditingId] = useState(null);

  const canManage = user?.role === 'admin' || user?.role === 'hr';

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
      const [empList, deptList] = await Promise.all([
        employeesApi.getAll(),
        departmentsApi.getAll(),
      ]);
      setEmployees(empList);
      setDepartments(deptList);
      if (deptList.length > 0 && !formData.department) {
        setFormData((prev) => ({
          ...prev,
          department: deptList[0].name,
          departmentId: deptList[0].id,
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDeptSelect = (deptName) => {
    const d = departments.find((item) => item.name === deptName);
    setFormData((prev) => ({
      ...prev,
      department: deptName,
      departmentId: d ? d.id : '',
    }));
  };

  const openAddModal = () => {
    setFormError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: departments[0]?.name || 'Development',
      departmentId: departments[0]?.id || 'dept-1',
      position: '',
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: 'Full-time',
      status: 'Active',
      basicSalary: 25000,
      housingAllowance: 3000,
      transportAllowance: 2000,
      otherAllowances: 1000,
    });
    setShowAddModal(true);
  };

  const openEditModal = (emp) => {
    setFormError('');
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      departmentId: emp.departmentId,
      position: emp.position,
      joiningDate: emp.joiningDate,
      employmentType: emp.employmentType,
      status: emp.status,
      basicSalary: emp.basicSalary !== undefined ? emp.basicSalary : 25000,
      housingAllowance: emp.housingAllowance !== undefined ? emp.housingAllowance : 3000,
      transportAllowance: emp.transportAllowance !== undefined ? emp.transportAllowance : 2000,
      otherAllowances: emp.otherAllowances !== undefined ? emp.otherAllowances : 1000,
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.position.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await employeesApi.create(formData);
      setShowAddModal(false);
      setMessage('Employee created successfully!');
      setTimeout(() => setMessage(''), 3500);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.position.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await employeesApi.update(editingId, formData);
      setShowEditModal(false);
      setMessage('Employee record updated successfully!');
      setTimeout(() => setMessage(''), 3500);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    const confirmMsg = `Are you sure you want to mark ${emp.name} as ${nextStatus}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await employeesApi.updateStatus(emp.id, nextStatus);
      setMessage(`Employee status updated to ${nextStatus}`);
      setTimeout(() => setMessage(''), 3500);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update employee status');
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !departmentFilter || emp.department === departmentFilter;
    const matchesStatus = !statusFilter || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Employee Directory</h2>
          <p className="page-subtitle">
            {user?.role === 'manager'
              ? 'Members of your assigned team'
              : 'Complete roster of organization staff and personnel'}
          </p>
        </div>
        {canManage && (
          <button onClick={openAddModal} className="btn btn-primary">
            <UserPlus size={16} /> Add Employee
          </button>
        )}
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

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by name, ID, position, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select
                className="form-control"
                style={{ width: 180 }}
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                className="form-control"
                style={{ width: 150 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>

              {(searchQuery || departmentFilter || statusFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDepartmentFilter('');
                    setStatusFilter('');
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

      {/* Employee Table */}
      <div className="card">
        <div className="card-body no-top-pad">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading employees directory...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <Users size={36} />
              <h3>No employees found</h3>
              <p>Try adjusting your search query or filter selection.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Joining Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{emp.employeeId}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">
                            {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{emp.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.department}</td>
                      <td>{emp.position}</td>
                      <td style={{ fontSize: '0.825rem' }}>{emp.joiningDate}</td>
                      <td>
                        <Badge label={emp.employmentType} />
                      </td>
                      <td>
                        <Badge label={emp.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          <Link
                            href={`/dashboard/employees/${emp.id}`}
                            className="btn btn-ghost btn-sm"
                            title="View Profile"
                          >
                            <Eye size={15} />
                          </Link>

                          {canManage && (
                            <>
                              <button
                                onClick={() => openEditModal(emp)}
                                className="btn btn-ghost btn-sm"
                                title="Edit employee details"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(emp)}
                                className={`btn btn-sm ${
                                  emp.status === 'Active' ? 'btn-ghost' : 'btn-success'
                                }`}
                                title={emp.status === 'Active' ? 'Deactivate employee' : 'Activate employee'}
                                style={
                                  emp.status === 'Active'
                                    ? { color: 'var(--color-danger)' }
                                    : undefined
                                }
                              >
                                {emp.status === 'Active' ? <UserX size={15} /> : <UserCheck size={15} />}
                              </button>
                            </>
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

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label required">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="john.doe@hrm.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Department</label>
                    <select
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => handleDeptSelect(e.target.value)}
                      required
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Position / Job Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Senior Frontend Developer"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Joining Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Employment Type</label>
                    <select
                      className="form-control"
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Initial Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                {canManage && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
                      Salary & Compensation (INR ₹)
                    </h4>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label required">Basic Salary (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.basicSalary}
                          onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Housing Allowance (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.housingAllowance}
                          onChange={(e) => setFormData({ ...formData, housingAllowance: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Transport Allowance (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.transportAllowance}
                          onChange={(e) => setFormData({ ...formData, transportAllowance: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Other Allowances (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.otherAllowances}
                          onChange={(e) => setFormData({ ...formData, otherAllowances: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  {submitting ? 'Creating Employee...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Employee Information</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label required">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Department</label>
                    <select
                      className="form-control"
                      value={formData.department}
                      onChange={(e) => handleDeptSelect(e.target.value)}
                      required
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Position / Job Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Joining Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Employment Type</label>
                    <select
                      className="form-control"
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                {canManage && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
                      Salary & Compensation (INR ₹)
                    </h4>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label required">Basic Salary (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.basicSalary}
                          onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Housing Allowance (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.housingAllowance}
                          onChange={(e) => setFormData({ ...formData, housingAllowance: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Transport Allowance (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.transportAllowance}
                          onChange={(e) => setFormData({ ...formData, transportAllowance: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Other Allowances (₹)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          value={formData.otherAllowances}
                          onChange={(e) => setFormData({ ...formData, otherAllowances: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
