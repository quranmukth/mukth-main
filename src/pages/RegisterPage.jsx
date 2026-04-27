// ── Register Page ────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useT, useLocale } from '../lib/i18n';
import { registerSchema, validate } from '../lib/validators';
import { C } from '../components/shared/tokens';
import IslamicPattern from '../components/shared/IslamicPattern';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import apiClient from '../lib/apiClient';

const ROLES = [
  { value: 'student', icon: '📖' },
  { value: 'teacher', icon: '🎓' },
];

export default function RegisterPage() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const navigate = useNavigate();
  
  const notify = useNotificationStore();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'student' 
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverDown, setServerDown] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Health Check — Vital for Egypt users with flaky DNS ─────────────────────
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.get('/health');
        setServerDown(false);
      } catch (err) {
        setServerDown(true);
        notify.error(
          locale === 'ar' ? 'الخادم غير متصل' : 'Server Offline',
          locale === 'ar' ? 'يرجى التأكد من تشغيل الخادم وتعديل DNS إلى 8.8.8.8' : 'Ensure backend is running and DNS is set to 8.8.8.8'
        );
      }
    };
    checkHealth();
  }, [locale, notify]);

  // Auto-redirect when user state is updated
  useEffect(() => {
    if (user && role) {
      const timer = setTimeout(() => {
        const path = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student';
        navigate(path);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (serverDown) {
      notify.error(locale === 'ar' ? 'لا يمكن التسجيل' : 'Cannot Register', locale === 'ar' ? 'الخادم غير متاح حالياً.' : 'Server is unreachable.');
      return;
    }

    const v = validate(registerSchema, form);
    if (!v.success) { setErrors(v.errors); return; }

    setLoading(true);
    try {
      await register(form.email, form.password, { 
        name: form.name, phone: form.phone, role: form.role 
      });

      notify.success(
        locale === 'ar' ? 'تم بنجاح!' : 'Success!', 
        locale === 'ar' ? 'تم إنشاء الحساب' : 'Account created'
      );
    } catch (err) {
      let msg = err.message;
      if (msg.includes('already exists')) {
        msg = locale === 'ar' ? 'البريد مسجل بالفعل' : 'Email already exists.';
      } else if (msg.includes('Network Error')) {
        msg = locale === 'ar' ? 'فشل الاتصال. تحقق من DNS.' : 'Connection failed. Check DNS settings.';
      }
      notify.error(locale === 'ar' ? 'خطأ' : 'Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} style={{
      minHeight: '100vh', display: 'flex',
      background: `linear-gradient(155deg, ${C.g900} 0%, ${C.g850} 40%, ${C.g800} 100%)`,
      position: 'relative', overflow: 'hidden',
      padding: '2rem 1rem',
    }}>
      <IslamicPattern opacity={0.05} />

      <div style={{ margin: 'auto', width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}>
        {/* Connection Warning */}
        {serverDown && (
          <div style={{
            background: '#ff444420', border: '1px solid #ff4444', color: '#ff4444',
            padding: '1rem', borderRadius: '1rem', marginBottom: '1rem', textAlign: 'center',
            fontSize: '0.9rem', fontWeight: 600,
          }}>
            ⚠️ {locale === 'ar' ? 'الخادم لا يستجيب. تحقق من اتصالك و DNS.' : 'Server unreachable. Check your DNS (8.8.8.8).'}
          </div>
        )}

        <div style={{
          background: 'var(--bg-card)', borderRadius: '1.5rem',
          padding: '2.25rem 2rem', boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          border: `1px solid ${C.gold}18`,
        }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center' }}>
            {t.registerTitle}
          </h1>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1.5rem' }}>
             {/* Role Selection */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {ROLES.map((r) => (
                <button
                  key={r.value} type="button"
                  onClick={() => setForm(f => ({...f, role: r.value}))}
                  style={{
                    flex: 1, padding: '0.7rem', borderRadius: '0.7rem',
                    border: `2px solid ${form.role === r.value ? C.gold : 'transparent'}`,
                    background: form.role === r.value ? `${C.gold}15` : 'rgba(255,255,255,0.05)',
                    color: form.role === r.value ? C.gold : '#fff',
                    cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s'
                  }}
                >
                  {r.icon} {r.value}
                </button>
              ))}
            </div>

            <Input label={t.fullName} name="name" value={form.name} onChange={handleChange} error={errors.name} required icon="👤" />
            <Input label={t.email} name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required icon="📧" />
            <Input label={t.phone} name="phone" value={form.phone} onChange={handleChange} error={errors.phone} required icon="📱" />
            <Input label={t.password} name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} required icon="🔒" />
            <Input label={t.confirmPassword} name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required icon="🔒" />
            
            <Button type="submit" variant="gold" fullWidth loading={loading} disabled={serverDown}>
              {t.register}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {t.hasAccount} <Link to="/login" style={{ color: C.gold, fontWeight: 700 }}>{t.login}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
