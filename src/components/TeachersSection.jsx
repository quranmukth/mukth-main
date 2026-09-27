import { C, TEACHERS } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';

// Star rating
function Stars({ count }) {
  return (
    <div style={{ display:'flex', gap:'2px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= count ? C.gold : '#e0e0d8'} xmlns="http://www.w3.org/2000/svg">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// Avatar with initials
function Avatar({ initials, color, size = 80, locale }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:`${color}18`,
      border:`2.5px solid ${color}38`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size * 0.24 + 'px', fontWeight:800, color,
      fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
      flexShrink:0, position:'relative',
    }}>
      {/* Inner ring with platform logo vibe */}
      <div style={{
        position:'absolute', inset:'4px', borderRadius:'50%',
        border:`1px dashed ${color}22`,
      }} />
      {initials}
    </div>
  );
}

// Tag pill
function Tag({ text, color }) {
  return (
    <span style={{
      padding:'0.22rem 0.65rem', borderRadius:'99px',
      background:`${color}12`, color,
      fontSize:'0.72rem', fontWeight:600,
      border:`1px solid ${color}25`,
      whiteSpace:'nowrap',
    }}>{text}</span>
  );
}

export default function TeachersSection() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <section id="teachers" className="section-pad" style={{ background:'#fff', direction: dir }}>
      <div className="container">
        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:'1rem' }}>
          <span className="section-label">✦ {t.teachersListLabel}</span>
          <h2 className="section-title">{t.teachersListTitle}</h2>
          <p className="section-sub" style={{ margin:'0 auto' }}>
            {t.teachersListSubtitle}
          </p>
        </div>
        <div className="ornament" style={{ marginBottom:'2.5rem' }}>✦</div>

        {/* Teacher cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
          gap: '1.25rem',
        }}>
          {TEACHERS.map((tea, i) => (
            <div key={tea.id} className={`anim-fade-up d-${Math.min((i + 1) * 100, 700)}`} style={{
              background: '#fff', border: `1.5px solid ${C.borderL}`,
              borderRadius: '1.25rem', padding: '1.75rem 1.25rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.75rem', textAlign: 'center',
              transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
              cursor: 'pointer',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 14px 40px rgba(6,78,59,0.1)`; e.currentTarget.style.borderColor = C.border; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.borderL; }}>

              <Avatar initials={tea.initials} color={tea.color} size={80} locale={locale} />

              <h3 style={{
                fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                fontSize: '0.97rem', fontWeight: 700, color: '#1a2e25',
                lineHeight: 1.4,
              }}>{locale === 'ar' ? tea.name : tea.nameEn}</h3>

              <span style={{ fontSize: '0.8rem', color: tea.color, fontWeight: 600 }}>{locale === 'ar' ? tea.country : tea.countryEn}</span>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <Stars count={Math.round(tea.rating)} />
                <span style={{ fontSize: '0.72rem', color: C.muted }}>{tea.rating}</span>
              </div>

              <div style={{ width: '100%', height: '1px', background: C.borderL }} />

              {/* Language row */}
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: '0.35rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                  {t.languages}:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: locale === 'ar' ? 'flex-end' : 'flex-start' }}>
                  {(locale === 'ar' ? tea.lang : tea.langEn).map(l => (
                    <span key={l} style={{
                      padding: '0.18rem 0.6rem', borderRadius: '99px',
                      background: C.g50, color: C.g700,
                      fontSize: '0.72rem', fontWeight: 600,
                    }}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Teaches row */}
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: '0.35rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                  {t.teaches}:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: locale === 'ar' ? 'flex-end' : 'flex-start' }}>
                  {(locale === 'ar' ? tea.teaches : tea.teachesEn).map(c => <Tag key={c} text={c} color={tea.color} />)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '2.75rem' }}>
          <a href="#contact" className="btn-gold"
            style={{ padding: '0.85rem 2.5rem', fontSize: '0.95rem' }}>
            {t.contactTeacher} {locale === 'ar' ? '←' : '→'}
          </a>
        </div>
      </div>
    </section>
  );
}
