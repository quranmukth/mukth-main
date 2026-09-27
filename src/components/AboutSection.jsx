import { C } from './shared/tokens';
import IslamicPattern from './shared/IslamicPattern';
import { useT, useLocale } from '../lib/i18n';

export default function AboutSection() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const VALUES = [
    { icon:'🕌', title: t.value1Title, desc: t.value1Desc },
    { icon:'🌍', title: t.value2Title, desc: t.value2Desc },
    { icon:'⏰', title: t.value3Title, desc: t.value3Desc },
    { icon:'📊', title: t.value4Title, desc: t.value4Desc },
  ];

  return (
    <section id="about" className="section-pad" style={{ background:C.offW, direction: dir }}>
      <div className="container">
        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:'4rem' }}>
          <span className="section-label">✦ {t.aboutLabel}</span>
          <h2 className="section-title">{t.aboutTitle}</h2>
          <p className="section-sub" style={{ margin:'0 auto' }}>
            {t.aboutDesc}
          </p>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 520px), 1fr))',
          gap:'4rem', alignItems:'center',
        }}>
          {/* Left — visual card */}
          <div style={{ position:'relative', direction: locale === 'ar' ? 'ltr' : 'rtl' }}>
            <div style={{
              borderRadius:'1.5rem', overflow:'hidden', position:'relative',
              background:`linear-gradient(135deg, ${C.g850}, ${C.g800})`,
              padding:'3rem 2.5rem',
              boxShadow:`0 24px 64px rgba(6,78,59,0.28)`,
            }}>
              <IslamicPattern opacity={0.08} />
              <div style={{ position:'relative', zIndex:1, direction: dir }}>
                <p style={{
                  fontFamily:"'Amiri', serif",
                  fontSize: locale === 'ar' ? 'clamp(1.1rem, 2.5vw, 1.4rem)' : 'clamp(1rem, 2vw, 1.2rem)',
                  color:C.gold, lineHeight:2.2, letterSpacing:'0.04em',
                  marginBottom:'1.75rem', textAlign:'center',
                }}>
                  ﴿ وَقُرْآنًا فَرَّقْنَاهُ لِتَقْرَأَهُ عَلَى النَّاسِ عَلَىٰ مُكْثٍ وَنَزَّلْنَاهُ تَنزِيلًا ﴾
                </p>
                <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.83rem', textAlign:'center' }}>
                  {t.surahIsra}
                </p>
              </div>
            </div>

            {/* Floating badges */}
            <div style={{
              position:'absolute', top:'1.5rem', 
              right: locale === 'ar' ? '-1.5rem' : 'auto', left: locale === 'ar' ? 'auto' : '-1.5rem',
              background:'#fff', border:`1.5px solid ${C.border}`,
              borderRadius:'1rem', padding:'0.65rem 1rem',
              boxShadow:'0 8px 28px rgba(0,0,0,0.1)',
              display:'flex', alignItems:'center', gap:'0.6rem', direction: dir, zIndex:10,
            }}>
              <span style={{ fontSize:'1.2rem' }}>🎓</span>
              <div>
                <div style={{ fontSize:'0.78rem', fontWeight:700, color:C.g800 }}>{t.badgeSened}</div>
                <div style={{ fontSize:'0.7rem', color:C.muted }}>{t.badgeSenedDesc}</div>
              </div>
            </div>

            <div style={{
              position:'absolute', bottom:'1.5rem', 
              left: locale === 'ar' ? '-1.5rem' : 'auto', right: locale === 'ar' ? 'auto' : '-1.5rem',
              background:'#fff', border:`1.5px solid ${C.border}`,
              borderRadius:'1rem', padding:'0.65rem 1rem',
              boxShadow:'0 8px 28px rgba(0,0,0,0.1)',
              display:'flex', alignItems:'center', gap:'0.6rem', direction: dir, zIndex:10,
            }}>
              <span style={{ fontSize:'1.2rem' }}>🌱</span>
              <div>
                <div style={{ fontSize:'0.78rem', fontWeight:700, color:C.g800 }}>{t.badgeGradual}</div>
                <div style={{ fontSize:'0.7rem', color:C.muted }}>{t.badgeGradualDesc}</div>
              </div>
            </div>
          </div>

          {/* Right — text + values grid */}
          <div style={{ direction: dir }}>
            <span className="section-label">{t.whyMukth}</span>
            <h3 style={{
              fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
              fontSize:'clamp(1.5rem, 2.8vw, 2rem)',
              fontWeight:800, color:C.g800, lineHeight:1.35, marginBottom:'1.25rem',
            }}>
              {locale === 'ar' ? (
                <>نحفظك القرآن بأساليب<br /><span style={{ color:C.gold }}>علمية وتربوية راسخة</span></>
              ) : (
                <>We teach you Quran with<br /><span style={{ color:C.gold }}>solid scientific & educational methods</span></>
              )}
            </h3>
            <p style={{ fontSize:'0.98rem', color:C.muted, lineHeight:1.9, marginBottom:'2.25rem' }}>
              {t.aboutLongDesc}
            </p>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              {VALUES.map((v, i) => (
                <div key={i} className={`anim-fade-up d-${(i+1)*100}`} style={{
                  padding:'1.25rem',
                  background:'#fff',
                  border:`1.5px solid ${C.borderL}`,
                  borderRadius:'1rem',
                  transition:'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.boxShadow=`0 8px 24px rgba(6,78,59,0.08)`; }}
                onMouseOut={e  => { e.currentTarget.style.borderColor=C.borderL; e.currentTarget.style.boxShadow='none'; }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>{v.icon}</div>
                  <h4 style={{ fontSize:'0.9rem', fontWeight:700, color:C.g800, marginBottom:'0.3rem' }}>{v.title}</h4>
                  <p style={{ fontSize:'0.8rem', color:C.muted, lineHeight:1.7 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
