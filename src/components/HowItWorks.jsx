import { C } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';

export default function HowItWorks() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const STEPS = [
    { num: locale === 'ar' ? '١' : '1', icon: '📝', title: t.step1Title, desc: t.step1Desc },
    { num: locale === 'ar' ? '٢' : '2', icon: '🎯', title: t.step2Title, desc: t.step2Desc },
    { num: locale === 'ar' ? '٣' : '3', icon: '📅', title: t.step3Title, desc: t.step3Desc },
    { num: locale === 'ar' ? '٤' : '4', icon: '🚀', title: t.step4Title, desc: t.step4Desc },
  ];

  return (
    <section style={{ background: C.offW, padding: '5rem 0', direction: dir }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-label">✦ {t.howLabel}</span>
          <h2 className="section-title">{t.howTitle}</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            {t.howSubtitle}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
          gap: '1.5rem', position: 'relative',
        }}>
          {STEPS.map((s, i) => (
            <div key={i} className={`anim-fade-up d-${(i + 1) * 100}`} style={{
              background: '#fff', border: `1.5px solid ${C.borderL}`,
              borderRadius: '1.25rem', padding: '2rem 1.5rem',
              textAlign: 'center', position: 'relative',
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 16px 48px rgba(6,78,59,0.1)`; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'none'; }}>

              {/* Step number */}
              <div style={{
                position: 'absolute', top: '-1rem', 
                right: locale === 'ar' ? '50%' : 'auto', left: locale === 'ar' ? 'auto' : '50%',
                transform: 'translateX(50%)',
                width: '32px', height: '32px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 800, color: C.g900,
                boxShadow: `0 2px 10px ${C.gold}44`,
                fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
              }}>{s.num}</div>

              <div style={{ fontSize: '2.2rem', marginBottom: '1rem', marginTop: '0.5rem' }}>{s.icon}</div>
              <h3 style={{
                fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                fontSize: '1.05rem', fontWeight: 800, color: C.g800, marginBottom: '0.625rem',
              }}>{s.title}</h3>
              <p style={{ fontSize: '0.87rem', color: C.muted, lineHeight: 1.8 }}>{s.desc}</p>

              {/* Connector arrow (except last) */}
              {i < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute', top: '50%', 
                  left: locale === 'ar' ? '-1.25rem' : 'auto', right: locale === 'ar' ? 'auto' : '-1.25rem',
                  transform: 'translateY(-50%)',
                  width: '24px', height: '24px',
                  color: C.gold, fontSize: '1.2rem', fontWeight: 700,
                  zIndex: 2,
                  display: 'none', // Shown via responsive CSS override potentially
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {locale === 'ar' ? '←' : '→'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
