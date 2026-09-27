import { C, CURRICULA } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';

export default function CurriculaSection({ onOpenModal }) {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <section id="curricula" className="section-pad" style={{ background:'#fff', direction: dir }}>
      <div className="container">
        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:'1rem' }}>
          <span className="section-label">✦ {t.curriculaLabel}</span>
          <h2 className="section-title">{t.curriculaTitle}</h2>
          <p className="section-sub" style={{ margin:'0 auto' }}>
            {t.curriculaSubtitle}
          </p>
        </div>
        <div className="ornament" style={{ marginBottom:'2.5rem' }}>✦</div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap:'1.5rem',
        }}>
          {CURRICULA.map((cur, i) => (
            <div key={cur.id} className={`card-base anim-fade-up d-${(i+1)*100}`} style={{
              padding:'2rem 1.75rem',
              display:'flex', flexDirection:'column', gap:'1.125rem',
            }}>
              {/* Icon + badge */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{
                  width:'54px', height:'54px', borderRadius:'14px',
                  background:cur.color,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.7rem',
                }}>{cur.icon}</div>
                <span style={{
                  padding:'0.28rem 0.75rem', borderRadius:'99px',
                  background:`${cur.accent}15`, color:cur.accent,
                  fontSize:'0.74rem', fontWeight:700,
                  border:`1px solid ${cur.accent}25`,
                }}>{locale === 'ar' ? cur.ageRange : cur.ageRangeEn}</span>
              </div>

              {/* Title + desc */}
              <div>
                <h3 style={{
                  fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                  fontSize:'1.2rem', fontWeight:800, color:C.g800,
                  marginBottom:'0.5rem',
                }}>{locale === 'ar' ? cur.title : cur.titleEn}</h3>
                <p style={{ fontSize:'0.87rem', color:C.muted, lineHeight:1.8 }}>
                  {locale === 'ar' ? cur.desc : cur.descEn}
                </p>
              </div>

              {/* Feature list */}
              <ul className="check-list" style={{ flexGrow:1 }}>
                {(locale === 'ar' ? cur.features : cur.featuresEn).map(f => <li key={f}>{f}</li>)}
              </ul>

              {/* Divider + CTA */}
              <div style={{ borderTop:`1px solid ${C.borderL}`, paddingTop:'1.125rem' }}>
                <button onClick={onOpenModal} style={{
                  width:'100%', padding:'0.72rem',
                  background:cur.accent,
                  color:'#fff', fontWeight:700, fontSize:'0.9rem',
                  borderRadius:'0.75rem', border:'none', cursor:'pointer',
                  fontFamily:'inherit', transition:'opacity 0.18s, transform 0.18s',
                }}
                onMouseOver={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseOut={e  => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform=''; }}>
                  {t.joinPath} {locale === 'ar' ? '←' : '→'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
