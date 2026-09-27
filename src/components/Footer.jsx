import { C, WHATSAPP_NUMBER } from './shared/tokens';
import IslamicPattern from './shared/IslamicPattern';
import { useT, useLocale } from '../lib/i18n';

export default function Footer() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const year = new Date().getFullYear();

  const FOOTER_LINKS = [
    {
      title: t.platformLinks,
      links: [
        { label: t.navHome, href: '#home' },
        { label: t.navAbout, href: '#about' },
        { label: t.navCurricula, href: '#curricula' },
        { label: t.navPricing, href: '#pricing' },
        { label: t.navTeachers, href: '#teachers' },
      ]
    },
    {
      title: t.curriculaLinks,
      links: [
        { label: locale === 'ar' ? 'حفظ للأطفال' : 'Kids Memorization', href: '#curricula' },
        { label: locale === 'ar' ? 'حفظ للكبار' : 'Adult Memorization', href: '#curricula' },
        { label: locale === 'ar' ? 'إجازة القرآن' : 'Quran Ijazah', href: '#curricula' },
        { label: locale === 'ar' ? 'تجويد وتلاوة' : 'Tajweed', href: '#curricula' },
      ]
    },
    {
      title: t.supportLinks,
      links: [
        { label: t.faq, href: '#contact' },
        { label: t.privacy, href: '#' },
        { label: t.terms, href: '#' },
        { label: t.joinAsTeacher, href: '#contact' },
      ]
    }
  ];

  const SOCIAL = [
    { name:'Facebook',  icon:'f', color:'#1877F2', href:'#' },
    { name:'Instagram', icon:'◉', color:'#E4405F', href:'#' },
    { name:'YouTube',   icon:'▶', color:'#FF0000', href:'#' },
    { name:'Telegram',  icon:'✈', color:'#0088CC', href:'#' },
  ];

  return (
    <footer style={{
      background:`linear-gradient(160deg, ${C.g900} 0%, ${C.g850} 60%, #010e09 100%)`,
      color:'rgba(255,255,255,0.75)',
      direction: dir, position:'relative', overflow:'hidden',
    }}>
      <IslamicPattern opacity={0.04} color="#d4af37" />

      {/* ── Main footer grid ── */}
      <div className="container" style={{
        position:'relative', zIndex:1,
        padding:'4rem 1.5rem 2.5rem',
      }}>
        <div style={{
          display:'grid',
          gridTemplateColumns: locale === 'ar' ? '2fr repeat(3, 1fr)' : '2fr repeat(3, 1fr)',
          gap:'3rem',
          marginBottom:'3rem',
        }}
          className="footer-grid">

          {/* Brand column */}
          <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'1.25rem', justifyContent: locale === 'ar' ? 'flex-start' : 'flex-start' }}>
              <div style={{
                width:'42px', height:'42px', borderRadius:'11px',
                background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}>
                <span style={{ fontSize:'1.25rem', fontWeight:900, color:C.g900,
                  fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}>
                    {locale === 'ar' ? 'م' : 'M'}
                  </span>
              </div>
              <span style={{ fontSize:'1.6rem', fontWeight:800, color:'#fff',
                fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}>{t.appName}</span>
            </div>

            {/* Verse */}
            {locale === 'ar' && (
              <p style={{
                fontFamily:"'Amiri', serif",
                fontSize:'0.92rem', color:`${C.gold}88`,
                lineHeight:2, letterSpacing:'0.03em', marginBottom:'1.25rem',
              }}>
                ﴿ وَقُرْآنًا فَرَّقْنَاهُ لِتَقْرَأَهُ<br />
                عَلَى النَّاسِ عَلَىٰ مُكْثٍ ﴾
              </p>
            )}

            <p style={{ fontSize:'0.85rem', lineHeight:1.85, marginBottom:'1.5rem', maxWidth:'280px' }}>
              {t.footerAbout}
            </p>

            {/* Address */}
            <div style={{ display:'flex', alignItems:'flex-start', gap:'0.5rem', marginBottom:'0.6rem', fontSize:'0.83rem', justifyContent: locale === 'ar' ? 'flex-start' : 'flex-start' }}>
              <span style={{ color:C.gold, marginTop:'2px' }}>📍</span>
              <span>{t.locationVal}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.6rem', fontSize:'0.83rem' }}>
              <span style={{ color:C.gold }}>📞</span>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                style={{ color:'inherit', textDecoration:'none' }}>+{WHATSAPP_NUMBER}</a>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.83rem' }}>
              <span style={{ color:C.gold }}>✉️</span>
              <a href="mailto:info@mukth.com" style={{ color:'inherit', textDecoration:'none' }}>
                info@mukth.com
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title} style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
              <h4 style={{
                fontSize:'0.88rem', fontWeight:700,
                color:'#fff', marginBottom:'1.25rem',
                paddingBottom:'0.625rem',
                borderBottom:`1px solid rgba(255,255,255,0.1)`,
              }}>{col.title}</h4>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                {col.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} style={{
                      fontSize:'0.85rem', color:'rgba(255,255,255,0.62)',
                      textDecoration:'none', transition:'color 0.15s',
                      display:'flex', alignItems:'center', gap:'0.35rem',
                    }}
                    onMouseOver={e => (e.currentTarget.style.color = C.gold)}
                    onMouseOut={e  => (e.currentTarget.style.color = 'rgba(255,255,255,0.62)')}>
                      <span style={{ fontSize:'0.6rem', color:`${C.gold}55` }}>◆</span>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Newsletter strip ── */}
        <div style={{
          background:'rgba(255,255,255,0.055)',
          border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:'1.25rem',
          padding:'1.75rem 2rem',
          display:'flex',
          flexWrap:'wrap',
          alignItems:'center',
          justifyContent:'space-between',
          gap:'1.5rem',
          marginBottom:'2.5rem',
          backdropFilter:'blur(6px)',
          direction: dir,
        }}>
          <div>
            <h4 style={{ fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif", fontSize:'1.05rem', fontWeight:800, color:'#fff', marginBottom:'0.3rem' }}>
              {t.newsletterTitle}
            </h4>
            <p style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.55)' }}>
              {t.newsletterSub}
            </p>
          </div>
          <div style={{ display:'flex', gap:'0.625rem', flexWrap:'wrap' }}>
            <input
              type="email"
              placeholder={locale === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
              style={{
                padding:'0.65rem 1rem', borderRadius:'0.7rem',
                border:'1.5px solid rgba(255,255,255,0.2)',
                background:'rgba(255,255,255,0.08)',
                color:'#fff', fontSize:'0.9rem', fontFamily:'inherit',
                outline:'none', minWidth:'220px', direction: dir, textAlign: locale === 'ar' ? 'right' : 'left',
              }}
              onFocus={e  => (e.target.style.borderColor = C.gold)}
              onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
            />
            <button className="btn-gold" style={{ padding:'0.65rem 1.5rem', fontSize:'0.88rem' }}>
              {t.subscribe}
            </button>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          display:'flex', flexWrap:'wrap',
          alignItems:'center', justifyContent:'space-between',
          paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.08)',
          gap:'1rem',
        }}>
          <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.4)' }}>
            © {year} {t.appName} — {t.copyright} · {t.locationVal}
          </p>

          {/* Social icons */}
          <div style={{ display:'flex', gap:'0.625rem' }}>
            {SOCIAL.map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                title={s.name}
                style={{
                  width:'36px', height:'36px', borderRadius:'8px',
                  background:'rgba(255,255,255,0.07)',
                  border:'1px solid rgba(255,255,255,0.12)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.85rem', color:'rgba(255,255,255,0.65)',
                  fontWeight:800, textDecoration:'none', transition:'all 0.18s ease',
                }}
                onMouseOver={e => { e.currentTarget.style.background=s.color; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor=s.color; }}
                onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer responsive grid fix */}
      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
