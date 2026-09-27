// ── Toast Component — Individual toast notification ──────────────────────────
import { C } from '../shared/tokens';

const typeConfig = {
  success: { icon: '✅', bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '#059669', text: '#065f46' },
  error: { icon: '❌', bg: 'linear-gradient(135deg, #fef2f2, #fecaca)', border: '#dc2626', text: '#991b1b' },
  warning: { icon: '⚠️', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '#d97706', text: '#92400e' },
  info: { icon: 'ℹ️', bg: `linear-gradient(135deg, ${C.g50}, ${C.g100})`, border: C.g600, text: C.g800 },
  badge: { icon: '🏆', bg: 'linear-gradient(135deg, #fffbea, #fef3c7)', border: C.gold, text: C.goldD },
};

export default function Toast({ toast, onDismiss }) {
  const config = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      style={{
        background: config.bg,
        border: `1px solid ${config.border}30`,
        borderRight: `4px solid ${config.border}`,
        borderRadius: '0.85rem',
        padding: '0.85rem 1.15rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        minWidth: '320px',
        maxWidth: '420px',
        animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: '1.2rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}>
        {config.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: config.text, marginBottom: '0.15rem' }}>
            {toast.title}
          </div>
        )}
        {toast.message && (
          <div style={{ fontSize: '0.82rem', color: config.text, opacity: 0.85, lineHeight: 1.5 }}>
            {toast.message}
          </div>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            style={{
              marginTop: '0.5rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '0.4rem',
              background: config.border,
              color: '#fff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: config.text, opacity: 0.5, fontSize: '1rem',
          padding: '0.15rem', flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseOut={(e) => (e.currentTarget.style.opacity = '0.5')}
      >
        ✕
      </button>
    </div>
  );
}
