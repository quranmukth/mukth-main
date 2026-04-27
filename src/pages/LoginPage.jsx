// ── Login Page ───────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useT, useLocale, useI18nStore } from '../lib/i18n';
import { useThemeStore } from '../lib/theme';
import { loginSchema, validate } from '../lib/validators';
import { C } from '../components/shared/tokens';
import IslamicPattern from '../components/shared/IslamicPattern';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';


export default function LoginPage() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const notify = useNotificationStore();
  const toggleTheme = useThemeStore((s) => s.toggle);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleLang = useI18nStore((s) => s.toggle);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: null }));
  };

  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (user && role) {
      const path = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student';
      navigate(path);
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(loginSchema, form);
    if (!v.success) { setErrors(v.errors); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      notify.success(locale === 'ar' ? 'مرحباً!' : 'Welcome!', locale === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
    } catch (err) {
      let msg = err.message;
      if (msg.includes('Network Error') || msg.includes('ECONNREFUSED') || msg.includes('ERR_NETWORK') || msg.includes('Failed to fetch')) {
        msg = locale === 'ar'
          ? 'تعذّر الاتصال بالخادم. يرجى المحاولة لاحقاً.'
          : 'Cannot reach the server. Please try again later.';
      } else if (msg.includes('Invalid email or password')) {
        msg = locale === 'ar' ? 'بريد أو كلمة مرور غير صحيحة.' : 'Invalid email or password.';
      } else if (msg.includes('suspended')) {
        msg = locale === 'ar' ? 'تم تعليق هذا الحساب. تواصل مع الإدارة.' : 'Account suspended. Contact admin.';
      }
      notify.error(locale === 'ar' ? 'خطأ في الدخول' : 'Login Error', msg);
      setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };




  return (
    <div dir={dir} style={{
      minHeight: '100vh', display: 'flex',
      background: `linear-gradient(155deg, ${C.g900} 0%, ${C.g850} 40%, ${C.g800} 100%)`,
      position: 'relative', overflow: 'hidden',
      direction: dir,
    }}>
      <IslamicPattern opacity={0.05} />

      {/* Language / Theme toggles */}
      <div style={{ 
        position: 'absolute', 
        top: '1rem', 
        [locale === 'ar' ? 'left' : 'right']: '1rem', 
        display: 'flex', 
        gap: '0.4rem', 
        zIndex: 100 
      }}>
        <button onClick={toggleLang} style={{
          padding: '0.4rem 0.8rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.8rem',
          fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {locale === 'ar' ? 'EN' : 'عربي'}
        </button>
        <button onClick={toggleTheme} style={{
          padding: '0.4rem 0.8rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.85rem',
          cursor: 'pointer',
        }}>
          {themeMode === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Center card */}
      <div style={{
        margin: 'auto', width: '100%', maxWidth: '440px', padding: '2rem 1.5rem',
        position: 'relative', zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '14px',
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 20px ${C.gold}40`,
            }}>
              <span style={{ fontSize: '1.5rem', color: C.g900, fontWeight: 900, fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic'" : "'Inter', sans-serif" }}>
                {locale === 'ar' ? 'م' : 'M'}
              </span>
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic'" : "'Inter', sans-serif" }}>
              {t.appName}
            </span>
          </Link>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: '1.5rem',
          padding: '2.25rem 2rem', boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          border: `1px solid ${C.gold}18`,
          textAlign: locale === 'ar' ? 'right' : 'left',
        }}>
          <h1 style={{
            fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)',
            fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
            margin: '0 0 0.3rem', textAlign: 'center',
          }}>
            {t.loginTitle}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.75rem' }}>
            {t.loginSub}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label={t.email} name="email" type="email"
              placeholder="example@mukth.com"
              value={form.email} onChange={handleChange}
              error={errors.email} icon="📧" required
              dir={dir}
            />
            <Input
              label={t.password} name="password" type="password"
              placeholder="••••••"
              value={form.password} onChange={handleChange}
              error={errors.password} icon="🔒" required
              dir={dir}
            />

            <Button type="submit" variant="gold" fullWidth loading={loading} size="lg">
              {t.login} {locale === 'ar' ? '←' : '→'}
            </Button>
          </form>

          <p style={{ textAlign: 'center', margin: '1.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {t.noAccount}{' '}
            <Link to="/register" style={{ color: C.gold, fontWeight: 700, textDecoration: 'none' }}>
              {t.register}
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
