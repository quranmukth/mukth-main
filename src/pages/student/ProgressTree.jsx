// ── Progress Tree — Visual Quran memorization progress ───────────────────────
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useT, useLocale } from '../../lib/i18n';
import { studentApi } from '../../lib/api';
import { C } from '../../components/shared/tokens';
import Card from '../../components/ui/Card';

const JUZ_NAMES = [
  'آلم', 'سيقول', 'تلك الرسل', 'لن تنالوا', 'والمحصنات',
  'لا يحب', 'وإذا سمعوا', 'ولو أننا', 'قال الملأ', 'واعلموا',
  'يعتذرون', 'وما من دابة', 'وما أبرئ', 'ربما', 'سبحان',
  'قال ألم', 'اقترب', 'قد أفلح', 'وقال الذين', 'أمن خلق',
  'اتل ما أوحي', 'ومن يقنت', 'وماليَ', 'فمن أظلم', 'إليه يرد',
  'حم', 'قال فما خطبكم', 'قد سمع', 'تبارك', 'عم',
];

export default function ProgressTree() {
  const t = useT();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const [progress, setProgress] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    studentApi.getProgress(user?.id).then(setProgress);
  }, [user?.id]);

  if (!progress) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>{t.loading}</div>;

  const completedJuz = progress.juzProgress.filter((j) => j.status === 'completed').length;
  const pct = Math.round((completedJuz / 30) * 100);

  return (
    <div style={{ maxWidth: '1100px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
        🌳 {t.progressTree}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {locale === 'ar' ? 'شجرة تقدمك في حفظ القرآن الكريم' : 'Your Quran memorization progress tree'}
      </p>

      {/* Overall progress bar */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            {locale === 'ar' ? 'التقدم الكلي' : 'Overall Progress'}
          </span>
          <span style={{ fontWeight: 800, color: C.gold, fontSize: '1.1rem' }}>{pct}%</span>
        </div>
        <div style={{ height: '12px', borderRadius: '6px', background: 'var(--border-secondary)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '6px',
            background: `linear-gradient(90deg, ${C.g700}, ${C.gold})`,
            width: `${pct}%`, transition: 'width 1s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{completedJuz}/30 {locale === 'ar' ? 'جزء' : 'Juz'}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{progress.totalPages}/604 {locale === 'ar' ? 'صفحة' : 'pages'}</span>
        </div>
      </Card>

      {/* Juz Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {progress.juzProgress.map((juz) => {
          const isCompleted = juz.status === 'completed';
          const isActive = juz.status === 'inProgress';
          const isLocked = juz.status === 'locked';

          return (
            <div
              key={juz.juz}
              onClick={() => !isLocked && setSelected(juz.juz === selected ? null : juz.juz)}
              style={{
                padding: '1rem 0.85rem', borderRadius: '0.85rem',
                background: isCompleted
                  ? `linear-gradient(135deg, ${C.gold}15, ${C.gold}08)`
                  : isActive
                  ? `linear-gradient(135deg, ${C.g800}10, ${C.g600}06)`
                  : 'var(--bg-card)',
                border: `1.5px solid ${isCompleted ? `${C.gold}40` : isActive ? `${C.g600}40` : 'var(--border-secondary)'}`,
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.45 : 1,
                transition: 'all 0.25s',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseOver={(e) => { if (!isLocked) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = ''; }}
            >
              {/* Status icon */}
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
                {isCompleted ? '🌟' : isActive ? '📖' : '🔒'}
              </div>

              {/* Juz number */}
              <div style={{
                fontWeight: 800, fontSize: '1.05rem',
                color: isCompleted ? C.goldD : isActive ? C.g700 : 'var(--text-tertiary)',
                fontFamily: "'IBM Plex Sans Arabic'",
              }}>
                {locale === 'ar' ? `الجزء ${juz.juz}` : `Juz ${juz.juz}`}
              </div>

              {/* Juz name */}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                {JUZ_NAMES[juz.juz - 1]}
              </div>

              {/* Progress bar */}
              {!isLocked && (
                <div style={{ marginTop: '0.5rem', height: '4px', borderRadius: '2px', background: 'var(--border-secondary)' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    background: isCompleted ? C.gold : `linear-gradient(90deg, ${C.g700}, ${C.g500})`,
                    width: `${juz.pct}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              )}

              {/* Percentage */}
              <div style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '0.3rem', color: isCompleted ? C.goldD : isActive ? C.g600 : 'var(--text-tertiary)' }}>
                {juz.pct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { icon: '🌟', label: locale === 'ar' ? 'مكتمل' : 'Completed', color: C.gold },
          { icon: '📖', label: locale === 'ar' ? 'جارٍ' : 'In Progress', color: C.g600 },
          { icon: '🔒', label: locale === 'ar' ? 'مقفل' : 'Locked', color: '#9ca3af' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
