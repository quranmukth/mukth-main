// ── Student Profile ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useT, useLocale } from '../../lib/i18n';
import { useNotificationStore } from '../../stores/notificationStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { C } from '../../components/shared/tokens';

export default function StudentProfile() {
  const t = useT();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const notify = useNotificationStore();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [form, setForm] = useState({ 
    name: profile?.full_name || '', 
    email: user?.email || '', 
    phone: profile?.phone_number || '' 
  });
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      await updateProfile(form);
      notify.success(locale === 'ar' ? 'تم!' : 'Done!', locale === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profile updated');
    } catch (err) {
      notify.error('Error', err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 1.5rem' }}>
        👤 {t.profile}
      </h1>

      {/* Avatar */}
      <Card style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem',
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 900, color: C.g900,
        }}>
          {profile?.full_name?.[0] || '?'}
        </div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {profile?.full_name}
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {user?.email}
        </p>
      </Card>

      {/* Form */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label={t.fullName} name="name" value={form.name} onChange={handleChange} dir={dir} />
          <Input label={t.email} name="email" type="email" value={form.email} onChange={handleChange} dir={dir} />
          <Input label={t.phone} name="phone" type="tel" value={form.phone} onChange={handleChange} dir={dir} />
          <Button variant="primary" fullWidth onClick={handleSave} icon="💾">
            {t.save}
          </Button>
        </div>
      </Card>
    </div>
  );
}
