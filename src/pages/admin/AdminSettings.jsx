// ── Admin Settings Page ──────────────────────────────────────────────────────
import { useT, useLocale } from '../../lib/i18n';
import { useThemeStore } from '../../lib/theme';
import { useI18nStore } from '../../lib/i18n';
import Card from '../../components/ui/Card';
import { C } from '../../components/shared/tokens';

export default function AdminSettings() {
  const t = useT();
  const locale = useLocale();
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const toggleLang = useI18nStore((s) => s.toggle);

  const settings = [
    {
      icon: '🌙', label: t.darkMode,
      desc: locale === 'ar' ? 'تفعيل الوضع الليلي' : 'Enable dark mode',
      action: (
        <button onClick={toggleTheme} style={{
          width: '50px', height: '28px', borderRadius: '14px',
          background: themeMode === 'dark' ? C.gold : 'var(--border-primary)',
          border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
        }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%', background: '#fff',
            position: 'absolute', top: '3px',
            left: themeMode === 'dark' ? '25px' : '3px',
            transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
        </button>
      ),
    },
    {
      icon: '🌐', label: t.language,
      desc: locale === 'ar' ? 'تغيير لغة المنصة' : 'Change platform language',
      action: (
        <button onClick={toggleLang} style={{
          padding: '0.4rem 1rem', borderRadius: '0.5rem',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {locale === 'ar' ? 'English' : 'العربية'}
        </button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
        ⚙️ {t.settings}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {locale === 'ar' ? 'إعدادات المنصة' : 'Platform settings'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {settings.map((s) => (
          <Card key={s.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem', padding: '1.15rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{s.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{s.desc}</div>
              </div>
            </div>
            {s.action}
          </Card>
        ))}
      </div>
    </div>
  );
}
