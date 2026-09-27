// ── Dashboard Layout — Sidebar + Topbar ──────────────────────────────────────
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useT, useLocale, useI18nStore } from '../lib/i18n';
import { useThemeStore } from '../lib/theme';
import { C } from '../components/shared/tokens';

const menuItems = {
  student: [
    { path: '/student', icon: '🏠', label: 'studentDashboard', end: true },
    { path: '/student/sessions', icon: '📹', label: 'sessions' },
    { path: '/student/profile', icon: '👤', label: 'profile' },
  ],
  teacher: [
    { path: '/teacher', icon: '🏠', label: 'teacherDashboard', end: true },
    { path: '/teacher/students', icon: '👥', label: 'myStudents' },
    { path: '/teacher/sessions', icon: '📹', label: 'sessions' },
    { path: '/teacher/schedule', icon: '📅', label: 'schedule' },
    { path: '/teacher/profile', icon: '👤', label: 'profile' },
  ],
  admin: [
    { path: '/admin', icon: '📊', label: 'adminDashboard', end: true },
    { path: '/admin/users', icon: '👥', label: 'userManagement' },
    { path: '/admin/halaqat', icon: '📅', label: 'halaqatScheduler' },
    { path: '/admin/reports', icon: '📈', label: 'reports' },
    { path: '/admin/settings', icon: '⚙️', label: 'settings' },
  ],
};

export default function DashboardLayout() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const toggleTheme = useThemeStore((s) => s.toggle);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleLang = useI18nStore((s) => s.toggle);
  const notify = useNotificationStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = menuItems[role] || [];

  const handleLogout = () => {
    logout();
    notify.info(locale === 'ar' ? 'تم' : 'Done', locale === 'ar' ? 'تم تسجيل الخروج' : 'Logged out');
    navigate('/login');
  };

  const linkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.65rem 1rem', borderRadius: '0.65rem',
    textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600,
    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
    background: isActive ? `${C.gold}22` : 'transparent',
    borderRight: isActive ? `3px solid ${C.gold}` : '3px solid transparent',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  });

  return (
    <div dir={dir} style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Tajawal', 'IBM Plex Sans Arabic', sans-serif" }}>
      {/* ── Sidebar ── */}
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
        />
      )}

      <aside
        style={{
          width: '260px',
          background: `linear-gradient(180deg, ${C.g900} 0%, ${C.g850} 100%)`,
          display: 'flex', flexDirection: 'column',
          borderInlineEnd: `1px solid rgba(255,255,255,0.06)`,
          position: 'fixed', top: 0, bottom: 0,
          zIndex: 999,
          transform: sidebarOpen ? 'translateX(0)' : '',
          transition: 'transform 0.3s ease',
        }}
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
      >
        {/* Logo */}
        <div style={{
          padding: '1.25rem 1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 2px 12px ${C.gold}30`,
          }}>
            <span style={{ fontSize: '1.1rem', color: C.g900, fontWeight: 900, fontFamily: "'IBM Plex Sans Arabic'" }}>م</span>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: "'IBM Plex Sans Arabic'" }}>
            {t.appName}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => linkStyle(isActive)}
              onMouseOver={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                }
              }}
              onMouseOut={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }
              }}
            >
              <span style={{ fontSize: '1.15rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
              <span>{t[item.label]}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            padding: '0.75rem 0.85rem', borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            marginBottom: '0.5rem',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `${C.gold}25`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 800, color: C.gold,
            }}>
              {profile?.full_name?.[0] || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name || 'User'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                {t[role] || role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '0.55rem', borderRadius: '0.6rem',
              background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.2)',
              color: '#fca5a5', fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(220,38,38,0.2)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(220,38,38,0.12)')}
          >
            🚪 {t.logout}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, marginInlineStart: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
        className="main-content"
      >
        {/* Topbar */}
        <header 
          className="glass"
          style={{
            height: '64px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky', top: 0, zIndex: 100,
            borderBottom: '1px solid var(--border-secondary)',
          }}
        >
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hamburger-btn"
            style={{
              background: 'var(--bg-hover)', border: '1px solid var(--border-secondary)',
              borderRadius: '0.5rem', width: '38px', height: '38px',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-primary)',
            }}
          >
            ☰
          </button>

          <div />

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={toggleLang} style={{
              padding: '0.35rem 0.7rem', borderRadius: '0.5rem',
              background: 'var(--bg-hover)', border: '1px solid var(--border-secondary)',
              color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {locale === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button onClick={toggleTheme} style={{
              padding: '0.35rem 0.7rem', borderRadius: '0.5rem',
              background: 'var(--bg-hover)', border: '1px solid var(--border-secondary)',
              color: 'var(--text-secondary)', fontSize: '0.9rem',
              cursor: 'pointer',
            }}>
              {themeMode === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '1.5rem', background: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
