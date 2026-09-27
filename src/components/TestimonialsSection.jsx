import { useState } from 'react';
import { C, TESTIMONIALS } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';

function Stars({ count = 5 }) {
  return (
    <div style={{ display:'flex', gap:'2px', marginBottom:'0.75rem' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24"
          fill={i <= count ? C.gold : '#e5e5e0'}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <section style={{
      background:`linear-gradient(155deg, ${C.g900} 0%, ${C.g850} 50%, ${C.g800} 100%)`,
      padding:'5rem 0', direction: dir, position:'relative', overflow:'hidden',
    }}>
      {/* Dot grid bg */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:`radial-gradient(circle, rgba(212,175,55,0.06) 1px, transparent 1px)`,
        backgroundSize:'32px 32px',
      }} />

      <div className="container" style={{ position:'relative', zIndex:1 }}>
        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:'0.5rem',
            padding:'0.35rem 1rem',
            background:'rgba(212,175,55,0.15)', border:`1px solid rgba(212,175,55,0.3)`,
            borderRadius:'99px', color:C.gold,
            fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.08em',
            marginBottom:'1rem',
          }}>✦ {t.testiLabel}</span>
          <h2 style={{
            fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
            fontSize:'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight:800,
            color:'#fff', lineHeight:1.35, margin:0,
          }}>{t.testiTitle}</h2>
        </div>

        {/* Testimonial cards */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap:'1.25rem', marginBottom:'2.5rem',
        }}>
          {TESTIMONIALS.map((tes, i) => (
            <div key={i}
              onClick={() => setActive(i)}
              className={`anim-fade-up d-${(i+1)*100}`}
              style={{
                background: active === i ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.055)',
                border: active === i
                  ? `1.5px solid rgba(212,175,55,0.4)`
                  : '1.5px solid rgba(255,255,255,0.09)',
                borderRadius:'1.25rem', padding:'1.75rem',
                cursor:'pointer',
                transition:'all 0.25s ease',
                backdropFilter:'blur(8px)',
              }}
              onMouseOver={e => { if (active !== i) e.currentTarget.style.background='rgba(255,255,255,0.085)'; }}
              onMouseOut={e  => { if (active !== i) e.currentTarget.style.background='rgba(255,255,255,0.055)'; }}>

              {/* Quote mark */}
              <div style={{ fontSize:'2.5rem', color:`${C.gold}55`, lineHeight:1, marginBottom:'0.5rem',
                fontFamily:'Georgia, serif' }}>"</div>

              <Stars count={tes.rating} />

              <p style={{ color:'rgba(255,255,255,0.82)', fontSize:'0.92rem', lineHeight:1.85, marginBottom:'1.25rem' }}>
                {locale === 'ar' ? tes.text : tes.textEn}
              </p>

              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{
                  width:'42px', height:'42px', borderRadius:'50%',
                  background:`${tes.color}22`, border:`2px solid ${tes.color}44`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.82rem', fontWeight:800, color:tes.color,
                  flexShrink:0,
                  fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                }}>{tes.initials}</div>
                <div>
                  <div style={{ fontSize:'0.88rem', fontWeight:700, color:'#fff' }}>{locale === 'ar' ? tes.name : tes.nameEn}</div>
                  <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)' }}>
                    {locale === 'ar' ? tes.role : tes.roleEn} · {locale === 'ar' ? tes.country : tes.countryEn}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges row */}
        <div style={{
          display:'flex', flexWrap:'wrap', justifyContent:'center',
          gap:'1.5rem', alignItems:'center',
          paddingTop:'2rem', borderTop:'1px solid rgba(255,255,255,0.1)',
        }}>
          {[
            { label: t.googleRating, val: locale === 'ar' ? '٤.٩ ⭐' : '4.9 ⭐', sub: t.googleRatingSub },
            { label: t.fbRating, val: locale === 'ar' ? '٥.٠ ⭐' : '5.0 ⭐', sub: t.fbRatingSub },
            { label: t.satisfactionRate, val: locale === 'ar' ? '٩٨٪' : '98%', sub: t.satisfactionSub },
          ].map((b, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:C.gold,
                fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}>{b.val}</div>
              <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.7)', fontWeight:600 }}>{b.label}</div>
              <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.4)' }}>{b.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
