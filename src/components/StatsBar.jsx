import { C } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';

export default function StatsBar() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const ITEMS = [
    { icon:'📖', num: locale === 'ar' ? 'متميزون' : 'Elite',       label: t.statsStudents },
    { icon:'🎓', num: locale === 'ar' ? 'نخبة' : 'Distinguished', label: t.statsTeachers },
    { icon:'⭐', num: locale === 'ar' ? 'ممتاز' : 'Excellent',     label: t.statsRating },
    { icon:'🌍', num: locale === 'ar' ? 'عالمي' : 'Global',        label: t.statsCountries },
    { icon:'📅', num: locale === 'ar' ? 'عريقة' : 'Legacy',        label: t.statsExperience },
  ];

  return (
    <section style={{
      background:`linear-gradient(90deg, ${C.g800} 0%, ${C.g700} 100%)`,
      padding:'2.5rem 0', direction: dir, position:'relative', overflow:'hidden',
    }}>
      {/* Subtle pattern */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:`radial-gradient(circle, ${C.gold}0a 1px, transparent 1px)`,
        backgroundSize:'28px 28px',
      }} />

      <div className="container" style={{ position:'relative', zIndex:1 }}>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))',
          gap:'1rem',
        }}>
          {ITEMS.map((it, i) => (
            <div key={i} className={`anim-fade-up d-${(i+1)*100}`} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:'0.35rem',
              padding:'1.25rem 0.75rem',
              borderInlineStart: i > 0 ? `1px solid rgba(255,255,255,0.1)` : 'none',
              borderInlineEnd: 'none',
            }}>
              <span style={{ fontSize:'1.4rem' }}>{it.icon}</span>
              <div style={{
                fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                fontSize:'1.7rem', fontWeight:800, color:C.gold, lineHeight:1,
              }}>
                {it.num}
              </div>
              <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.65)', textAlign:'center' }}>
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
