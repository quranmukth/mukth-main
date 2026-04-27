import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useT, useLocale } from '../lib/i18n';
import { studentApi, teacherApi } from '../lib/api';
import { C } from '../components/shared/tokens';

export default function Sessions() {
  const t = useT();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadSessions = async () => {
      try {
        setLoading(true);
        let data = [];
        if (role === 'student') {
          data = await studentApi.getSessions(user.id);
        } else if (role === 'teacher') {
          const teacherData = await teacherApi.getDashboard(user.id);
          data = teacherData.todaySessions || [];
        }
        setMySessions(data);
      } catch (err) {
        console.error('Error loading sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [user, role]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>{t.loading}</div>
      </div>
    );
  }

  return (
    <div 
      className="anim-fade-up"
      style={{ 
        maxWidth: '1000px', margin: '0 auto', direction: dir 
      }}
    >
      <header style={{ marginBottom: '2rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}>
          {t.sessions}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {locale === 'ar' 
            ? 'انضم إلى حلقاتك المباشرة عبر Google Meet' 
            : 'Join your live sessions via Google Meet'}
        </p>
      </header>

      {mySessions.length === 0 ? (
        <div style={{
          padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', 
          borderRadius: '1.25rem', border: '1px solid var(--border-secondary)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ color: 'var(--text-primary)' }}>{t.noData}</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {mySessions.map((session) => (
            <SessionCard key={session.id} session={session} locale={locale} t={t} />
          ))}
        </div>
      )}

    </div>
  );
}

function SessionCard({ session, locale, t }) {
  const isLive = true; 

  return (
    <div 
      className="card-base"
      style={{
        padding: 'clamp(1rem, 4vw, 1.5rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'inherit',
      }}
    >
      {/* Status Glow */}
      {isLive && (
        <div style={{
          position: 'absolute', top: 0, 
          [locale === 'ar' ? 'right' : 'left']: 0,
          width: '4px', height: '100%', background: C.gold
        }} />
      )}

      <div style={{ flex: 1, minWidth: '220px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <span style={{ 
            padding: '0.3rem 0.75rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 700,
            background: isLive ? `${C.gold}15` : 'var(--bg-hover)',
            color: isLive ? C.goldD : 'var(--text-secondary)',
            border: `1px solid ${isLive ? `${C.gold}30` : 'var(--border-secondary)'}`
          }}>
            {isLive ? (locale === 'ar' ? '● مباشر الآن' : '● Live Now') : (locale === 'ar' ? 'قادم' : 'Upcoming')}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {locale === 'ar' ? session.day : session.dayEn} • {session.time}
          </span>
        </div>
        
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', fontFamily: 'inherit' }}>
          {session.halqa_name || session.name || (locale === 'ar' ? session.curriculum : session.curriculumEn)}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ opacity: 0.6 }}>👤</span>
          {locale === 'ar' ? `المعلم: ${session.teacher_name || ''}` : `Teacher: ${session.teacher_name || ''}`}
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '200px' }} className="mobile-full-width">
        <a 
          href={session.meeting_url || session.meetingUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-gold"
          style={{
            width: '100%',
            padding: '0.8rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.9rem',
            gap: '0.6rem',
          }}
        >
          <span>📹</span>
          <span>{locale === 'ar' ? 'دخول الحلقة' : 'Join Session'}</span>
        </a>
      </div>
    </div>
  );
}
