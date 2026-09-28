// components/ui/Badge.js
const VARIANTS = {
  Active: 'badge-success',
  Inactive: 'badge-neutral',
  'On Leave': 'badge-warning',
  Present: 'badge-success',
  Absent: 'badge-danger',
  Late: 'badge-warning',
  Pending: 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-danger',
  'Full-time': 'badge-info',
  'Part-time': 'badge-purple',
  Contract: 'badge-neutral',
  admin: 'badge-danger',
  hr: 'badge-success',
  manager: 'badge-warning',
  employee: 'badge-info',
};

export default function Badge({ label, variant }) {
  const cls = variant || VARIANTS[label] || 'badge-neutral';
  return <span className={`badge ${cls}`}>{label}</span>;
}
