// ── Input Component — Reusable with label, error, icon ───────────────────────
import { C } from '../shared/tokens';

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  required,
  disabled = false,
  style = {},
  inputStyle = {},
  dir,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', ...style }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            fontSize: '0.84rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              insetInlineStart: '0.85rem',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              fontSize: '1rem',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          dir={dir}
          style={{
            width: '100%',
            paddingTop: '0.72rem',
            paddingBottom: '0.72rem',
            paddingInlineStart: icon ? '2.5rem' : '1rem',
            paddingInlineEnd: '1rem',
            border: `1.5px solid ${error ? '#dc2626' : 'var(--border-primary)'}`,
            borderRadius: '0.7rem',
            background: 'var(--bg-input)',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            textAlign: 'inherit',
            ...inputStyle,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#dc2626' : C.g700;
            e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(6,95,70,0.1)'}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#dc2626' : 'var(--border-primary)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.78rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
