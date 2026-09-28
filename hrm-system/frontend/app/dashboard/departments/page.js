'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { departmentsApi } from '@/lib/api';
import {
  Building2, Plus, Edit2, Trash2, Users,
  CheckCircle2, AlertCircle, ShieldAlert
} from 'lucide-react';

export default function DepartmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const isAdmin = user?.role === 'admin';
  const canView = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (!canView) {
        router.replace(`/dashboard/${user.role}`);
      } else {
        loadDepartments();
      }
    }
  }, [user, authLoading, canView, router]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentsApi.getAll();
      setDepartments(data);
    } catch (err) {
      setError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setModalError('');
    setDeptName('');
    setDeptDesc('');
    setShowAddModal(true);
  };

  const openEdit = (d) => {
    setModalError('');
    setEditingDept(d);
    setDeptName(d.name);
    setDeptDesc(d.description || '');
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!deptName.trim()) {
      setModalError('Department name is required');
      return;
    }

    try {
      setSubmitting(true);
      await departmentsApi.create({ name: deptName.trim(), description: deptDesc.trim() });
      setShowAddModal(false);
      setMessage('Department created successfully!');
      setTimeout(() => setMessage(''), 3500);
      loadDepartments();
    } catch (err) {
      setModalError(err.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!deptName.trim()) {
      setModalError('Department name is required');
      return;
    }

    try {
      setSubmitting(true);
      await departmentsApi.update(editingDept.id, {
        name: deptName.trim(),
        description: deptDesc.trim(),
      });
      setShowEditModal(false);
      setMessage('Department updated successfully!');
      setTimeout(() => setMessage(''), 3500);
      loadDepartments();
    } catch (err) {
      setModalError(err.message || 'Failed to update department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (d) => {
    if (d.headCount > 0) {
      alert(`Cannot delete ${d.name}: it currently has ${d.headCount} active employee(s) assigned.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the "${d.name}" department?`)) {
      return;
    }

    try {
      await departmentsApi.delete(d.id);
      setMessage(`Department "${d.name}" was deleted successfully.`);
      setTimeout(() => setMessage(''), 3500);
      loadDepartments();
    } catch (err) {
      alert(err.message || 'Failed to delete department');
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg" />
        <span>Loading departments...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Departments</h2>
          <p className="page-subtitle">Organizational divisions, team descriptions, and active headcounts.</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="btn btn-primary">
            <Plus size={16} /> Add Department
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

      {!isAdmin && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={18} />
          <span>Viewing as HR Manager (Read-only mode. Department creation/deletion requires Administrator access).</span>
        </div>
      )}

      <div className="card">
        <div className="card-body no-top-pad">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading department records...</span>
            </div>
          ) : departments.length === 0 ? (
            <div className="empty-state">
              <Building2 size={36} />
              <h3>No departments found</h3>
              <p>Get started by adding your first organizational department.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Description</th>
                    <th>Active Headcount</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Building2 size={18} />
                          </div>
                          <span>{dept.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', maxWidth: 380 }}>
                        {dept.description || '—'}
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ display: 'inline-flex', gap: 6 }}>
                          <Users size={12} /> {dept.headCount ?? 0} Employees
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              onClick={() => openEdit(dept)}
                              className="btn btn-ghost btn-sm"
                              title="Edit department"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(dept)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--color-danger)' }}
                              title={
                                dept.headCount > 0
                                  ? 'Cannot delete department with active employees'
                                  : 'Delete department'
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
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

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Department</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {modalError && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label required">Department Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Product Management"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="Brief description of the department's mandate and scope..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                  />
                </div>
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
                  {submitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Department</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {modalError && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label required">Department Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                  />
                </div>
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
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
