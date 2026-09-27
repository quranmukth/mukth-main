// ── Teacher Schedule ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useT, useLocale } from '../../lib/i18n';
import { teacherApi } from '../../lib/api';
import { C } from '../../components/shared/tokens';
import Card from '../../components/ui/Card';

const DAYS = [
  { ar: 'السبت', en: 'Saturday' }, { ar: 'الأحد', en: 'Sunday' },
  { ar: 'الاثنين', en: 'Monday' }, { ar: 'الثلاثاء', en: 'Tuesday' },
  { ar: 'الأربعاء', en: 'Wednesday' }, { ar: 'الخميس', en: 'Thursday' },
  { ar: 'الجمعة', en: 'Friday' },
];

export default function TeacherSchedule() {
  const t = useT();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      teacherApi.getSchedule(user.id)
        .then(setSchedule)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>{t.loading}</div>;

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
        📅 {t.schedule}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {locale === 'ar' ? 'جدول حصصك الأسبوعي' : 'Your weekly session schedule'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.85rem' }}>
        {DAYS.map((day) => {
          const daySessions = schedule.filter((s) => s.day === day.ar || s.dayEn === day.en);
          return (
            <Card key={day.en} style={{
              opacity: daySessions.length > 0 ? 1 : 0.5,
              border: daySessions.length > 0 ? `1.5px solid ${C.g600}30` : undefined,
            }}>
              <h3 style={{
                fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)',
                margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                📆 {locale === 'ar' ? day.ar : day.en}
                {daySessions.length > 0 && (
                  <span style={{
                    fontSize: '0.7rem', background: `${C.g600}15`, color: C.g700,
                    padding: '0.15rem 0.5rem', borderRadius: '99px', fontWeight: 600,
                  }}>
                    {daySessions.length} {locale === 'ar' ? 'حصة' : 'session(s)'}
                  </span>
                )}
              </h3>

              {daySessions.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '0.5rem' }}>
                  {locale === 'ar' ? 'لا توجد حصص' : 'No sessions'}
                </p>
              ) : (
                daySessions.map((s) => (
                  <div key={s.id} style={{
                    padding: '0.65rem', borderRadius: '0.55rem',
                    background: 'var(--bg-tertiary)', marginBottom: '0.4rem',
                    borderInlineStart: `3px solid ${C.g600}`,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: C.gold }}>{s.time}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{s.halaqat?.name || s.curriculum}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                      {locale === 'ar' ? 'حلقة مباشرة' : 'Live Session'}
                    </div>
                    {(s.meeting_url || s.meetingUrl) && (
                      <a href={s.meeting_url || s.meetingUrl} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem',
                        color: C.gold, fontWeight: 700, textDecoration: 'none',
                        background: `${C.gold}12`, padding: '0.2rem 0.6rem', borderRadius: '4px',
                      }}>
                        {locale === 'ar' ? '🔗 رابط الحصة' : '🔗 Meeting Link'}
                      </a>
                    )}
                  </div>
                ))
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
