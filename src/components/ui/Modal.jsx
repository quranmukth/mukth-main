// ── Modal Component — Reusable dialog ────────────────────────────────────────
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, subtitle, children, size = 'md', showClose = true }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    const handleEsc = (e) => e.key === 'Escape' && onClose?.();
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: '400px', md: '520px', lg: '680px', xl: '860px', full: '95vw' };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--overlay)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '1.25rem',
          padding: '2rem',
          width: '100%',
          maxWidth: widths[size] || widths.md,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-secondary)',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              {title && (
                <h2 style={{
                  fontSize: '1.35rem', fontWeight: 800,
                  color: 'var(--text-primary)',
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  margin: 0,
                }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'var(--bg-hover)', border: 'none', cursor: 'pointer',
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', color: 'var(--text-secondary)',
                  transition: 'background 0.15s',
                  flexShrink: 0,
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'var(--border-secondary)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              >
                ✕
              </button>
            )}
          </div>
        )}
        {/* Body */}
        {children}
      </div>
    </div>
  );
}
