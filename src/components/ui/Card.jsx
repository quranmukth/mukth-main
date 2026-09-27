// ── Card Component — Reusable card container ────────────────────────────────
export default function Card({ children, padding = '1.5rem', hover = false, glow = false, style = {}, className = '', onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border-secondary)',
        borderRadius: '1rem',
        padding,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseOver={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          e.currentTarget.style.borderColor = 'var(--border-primary)';
        }
      }}
      onMouseOut={(e) => {
        if (hover) {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
          e.currentTarget.style.borderColor = 'var(--border-secondary)';
        }
      }}
    >
      {children}
    </div>
  );
}

// ── Stat Card — For dashboard metrics ────────────────────────────────────────
export function StatCard({ icon, label, value, change, color = '#064e3b' }) {
  const isPositive = change && change > 0;
  return (
    <Card hover style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div
        style={{
          width: '48px', height: '48px', borderRadius: '0.75rem',
          background: `${color}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.35rem', flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</div>
        <div style={{
          fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)',
          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          lineHeight: 1.1,
        }}>
          {value}
        </div>
        {change !== undefined && (
          <div style={{
            fontSize: '0.75rem', fontWeight: 600, marginTop: '0.35rem',
            color: isPositive ? '#059669' : '#dc2626',
            display: 'flex', alignItems: 'center', gap: '0.2rem',
          }}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
    </Card>
  );
}
