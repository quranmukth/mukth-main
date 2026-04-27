// ── My Recordings — List of submitted recordings ─────────────────────────────
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useT, useLocale } from '../../lib/i18n';
import { studentApi } from '../../lib/api';
import { useStudentStore } from '../../stores/studentStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function MyRecordings() {
  const t = useT();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const { recordings: all, fetchRecordings, loading } = useStudentStore();

  useEffect(() => {
    if (user?.id) {
      fetchRecordings(user.id);
    }
  }, [user?.id, fetchRecordings]);

  const statusLabels = {

    pending: { ar: 'في الانتظار', en: 'Pending', variant: 'pending' },
    reviewed: { ar: 'تمت المراجعة', en: 'Reviewed', variant: 'reviewed' },
    needsRedo: { ar: 'يحتاج إعادة', en: 'Needs Redo', variant: 'needsRedo' },
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
        📂 {t.myRecordings}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {locale === 'ar' ? `${all.length} تسجيل` : `${all.length} recordings`}
      </p>

      {all.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '1.5rem', border: '1px dashed var(--border-secondary)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎙️</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {locale === 'ar' ? 'لا توجد تسجيلات بعد' : 'No recordings yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {locale === 'ar' ? 'ابدأ رحلتك اليوم وسجل تلاوتك الأولى ليراجعها معلمك.' : 'Start your journey today and record your first recitation for your teacher to review.'}
          </p>
          <button 
            onClick={() => window.location.href = '/student/record'}
            style={{ 
              padding: '0.9rem 2.25rem', borderRadius: '0.9rem', background: 'var(--text-primary)', 
              color: 'var(--bg-main)', fontWeight: 800, border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {locale === 'ar' ? 'ابدأ تسجيلك الأول' : 'Start your first recitation'}
          </button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {all.map((rec) => {
            const sl = statusLabels[rec.status] || statusLabels.pending;
            return (
              <Card key={rec.id} hover style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '0.65rem',
                  background: rec.status === 'reviewed' ? '#ecfdf5' : rec.status === 'needsRedo' ? '#fef2f2' : '#fffbeb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', flexShrink: 0,
                }}>
                  {rec.status === 'reviewed' ? '✅' : rec.status === 'needsRedo' ? '🔄' : '⏳'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {rec.surah_name}
                    <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginInlineStart: '0.5rem', fontSize: '0.82rem' }}>
                      ({locale === 'ar' ? 'آيات' : 'Ayahs'} {rec.ayah_range})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                    {new Date(rec.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                    {' · '}
                    {Math.floor(rec.duration / 60)}:{String(rec.duration % 60).padStart(2, '0')} {locale === 'ar' ? 'دقيقة' : 'min'}
                  </div>
                  {rec.feedback?.notes && (
                    <div style={{
                      marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                      background: 'var(--bg-tertiary)', fontSize: '0.8rem', color: 'var(--text-secondary)',
                      borderInlineStart: `3px solid ${rec.status === 'needsRedo' ? '#dc2626' : '#059669'}`,
                    }}>
                      💬 {rec.feedback.notes}
                    </div>
                  )}
                </div>
                <Badge variant={sl.variant} dot>
                  {locale === 'ar' ? sl.ar : sl.en}
                </Badge>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
