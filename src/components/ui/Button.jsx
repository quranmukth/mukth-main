// ── Button Component — Reusable with variants ───────────────────────────────
import { C } from '../shared/tokens';

const variants = {
  primary: {
    background: `linear-gradient(135deg, ${C.g800}, ${C.g600})`,
    color: '#fff',
    border: 'none',
    shadow: `0 4px 16px rgba(6,78,59,0.25)`,
    hoverShadow: `0 8px 28px rgba(6,78,59,0.35)`,
  },
  gold: {
    background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
    color: C.g900,
    border: 'none',
    shadow: `0 3px 16px ${C.gold}40`,
    hoverShadow: `0 8px 28px ${C.gold}55`,
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: `1.5px solid var(--border-primary)`,
    shadow: 'none',
    hoverShadow: 'var(--shadow-sm)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    shadow: 'none',
    hoverShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: '#fff',
    border: 'none',
    shadow: '0 4px 16px rgba(220,38,38,0.25)',
    hoverShadow: '0 8px 28px rgba(220,38,38,0.35)',
  },
};

const sizes = {
  sm: { padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '0.5rem' },
  md: { padding: '0.65rem 1.5rem', fontSize: '0.9rem', borderRadius: '0.7rem' },
  lg: { padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '0.8rem' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  type = 'button',
  style = {},
  className = '',
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        fontFamily: 'inherit',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.55 : 1,
        width: fullWidth ? '100%' : 'auto',
        textDecoration: 'none',
        ...s,
        background: v.background,
        color: v.color,
        border: v.border,
        boxShadow: v.shadow,
        ...style,
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = v.hoverShadow;
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = v.shadow;
      }}
    >
      {loading && <span className="btn-spinner" />}
      {!loading && icon && <span style={{ fontSize: '1.1em', lineHeight: 1 }}>{icon}</span>}
      {children}
    </button>
  );
}
