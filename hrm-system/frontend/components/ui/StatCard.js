// components/ui/StatCard.js
export default function StatCard({ label, value, icon: Icon, color = 'blue', loading = false }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {Icon && <Icon size={20} />}
      </div>
      <div className="stat-info">
        <div className="stat-label" title={label}>{label}</div>
        {loading
          ? <div style={{ height: 26, width: 64, background: 'var(--color-border)', borderRadius: 4, marginTop: 4 }} />
          : <div className="stat-value" title={value != null ? String(value) : undefined}>{value ?? '—'}</div>
        }
      </div>
    </div>
  );
}
