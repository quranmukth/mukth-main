// ── Badge Component — Status indicator pill ──────────────────────────────────
const presets = {
  active: { bg: '#ecfdf5', color: '#065f46', border: '#059669' },
  inactive: { bg: '#f3f4f6', color: '#4b5563', border: '#9ca3af' },
  pending: { bg: '#fffbeb', color: '#92400e', border: '#d97706' },
  reviewed: { bg: '#ecfdf5', color: '#065f46', border: '#059669' },
  needsRedo: { bg: '#fef2f2', color: '#991b1b', border: '#dc2626' },
  completed: { bg: '#ecfdf5', color: '#065f46', border: '#059669' },
  inProgress: { bg: '#eff6ff', color: '#1e40af', border: '#3b82f6' },
  locked: { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
  student: { bg: '#ecfdf5', color: '#065f46', border: '#059669' },
  teacher: { bg: '#fffbea', color: '#8b7a14', border: '#d4af37' },
  admin: { bg: '#f5ecff', color: '#6c3483', border: '#9b59b6' },
};

export default function Badge({ children, variant = 'active', dot = false, style = {} }) {
  const p = presets[variant] || presets.active;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: '0.22rem 0.7rem', borderRadius: '99px',
        background: p.bg, color: p.color,
        border: `1px solid ${p.border}30`,
        fontSize: '0.75rem', fontWeight: 600,
        whiteSpace: 'nowrap', lineHeight: 1.4,
        ...style,
      }}
    >
      {dot && (
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: p.border, flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}
