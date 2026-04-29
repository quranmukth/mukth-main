import { useState } from 'react';
import { C } from './shared/tokens';
import IslamicPattern from './shared/IslamicPattern';
import { useT, useLocale } from '../lib/i18n';

export default function HeroSection({ onOpenModal }) {
  const t = useT();
  const locale = useLocale();
  const [showVideo, setShowVideo] = useState(false);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const STATS = [
    { num: locale === 'ar' ? 'متميزون' : 'Elite',       label: t.heroStatStudents },
    { num: locale === 'ar' ? 'مجازون' : 'Certified',   label: t.heroStatTeachers },
    { num: locale === 'ar' ? 'متنوعة' : 'Diverse',     label: t.heroStatCurricula },
    { num: locale === 'ar' ? 'معتمدون' : 'Accredited', label: t.heroStatAzhar },
  ];

  return (
    <section id="home" style={{
      minHeight:'100vh', position:'relative', overflow:'hidden',
      direction: dir,
      background:`linear-gradient(155deg, ${C.g900} 0%, ${C.g850} 30%, ${C.g800} 65%, ${C.g700} 100%)`,
      display:'flex', flexDirection:'column', justifyContent:'center',
    }}>
      <IslamicPattern opacity={0.075} />

      {/* Radial glow */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:`radial-gradient(ellipse 70% 55% at 50% 38%, ${C.g600}28 0%, transparent 70%)`,
      }} />
      {/* Corner gold glow */}
      <div style={{
        position:'absolute', top:0, left: locale === 'ar' ? 0 : 'auto', right: locale === 'ar' ? 'auto' : 0, 
        width:'450px', height:'450px',
        background:`radial-gradient(circle, ${C.gold}12 0%, transparent 65%)`,
        borderRadius:'50%', transform: locale === 'ar' ? 'translate(-38%, -38%)' : 'translate(38%, -38%)', pointerEvents:'none',
      }} />

      {/* Content grid */}
      <div className="container" style={{
        position:'relative', zIndex:10,
        padding: 'clamp(5rem, 15vh, 8rem) 1.5rem 4rem',
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
        gap:'clamp(2rem, 5vw, 4rem)', 
        alignItems:'center',
      }}>
        {/* ── Text column ── */}
        <div className="anim-fade-up">
          {/* Verse badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.6rem',
            padding:'0.42rem 1.1rem',
            background:`${C.gold}14`, border:`1px solid ${C.gold}38`,
            borderRadius:'2rem', marginBottom:'1.5rem',
          }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:C.gold, flexShrink:0 }} />
            <span style={{ color:C.gold, fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.07em' }}>{t.inspiringVerse}</span>
          </div>

          {/* Quranic verse */}
          <p style={{
            fontFamily:"'Amiri', serif",
            fontSize:'clamp(1rem, 2.2vw, 1.2rem)',
            color:`${C.gold}aa`, lineHeight:2.2, letterSpacing:'0.04em',
            marginBottom:'1.5rem', paddingBottom:'1.25rem',
            borderBottom:`1px solid ${C.gold}1e`,
          }}>
            ﴿ وَقُرْآنًا فَرَّقْنَاهُ لِتَقْرَأَهُ عَلَى النَّاسِ عَلَىٰ مُكْثٍ ﴾
          </p>

          {/* H1 */}
          <h1 style={{
            fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" : "'Inter', sans-serif",
            fontSize:'clamp(2rem, 4.5vw, 3.4rem)',
            fontWeight:800, color:'#fff', lineHeight:1.3,
            margin:'0 0 1.25rem', letterSpacing:'-0.01em',
          }}>
            {t.heroTitle}<br />
            <span style={{ color:C.gold }}>{t.heroSubtitle}</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize:'clamp(0.95rem, 1.8vw, 1.05rem)', color:'rgba(255,255,255,0.68)',
            lineHeight:1.9, marginBottom:'2.25rem', maxWidth:'510px',
          }}>
            {t.heroDesc}
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.875rem', marginBottom:'2.875rem' }}>
            <button className="btn-gold" onClick={onOpenModal}
              style={{ padding:'0.9rem 2.25rem', fontSize:'1rem', borderRadius:'0.9rem' }}>
              {t.heroCTA} ✦
            </button>
            <a href="#curricula" style={{
              padding:'0.9rem 1.875rem',
              border:'1.5px solid rgba(255,255,255,0.24)',
              background:'rgba(255,255,255,0.055)',
              backdropFilter:'blur(4px)',
              color:'rgba(255,255,255,0.86)',
              fontWeight:600, fontSize:'1rem', borderRadius:'0.9rem',
              textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'0.45rem',
              transition:'all 0.2s ease', fontFamily:'inherit',
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; }}
            onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.055)'; }}>
              {t.seeCurricula} ↓
            </a>
          </div>

          {/* Stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'0.625rem' }}>
            {STATS.map((s, i) => (
              <div key={i} className={`anim-fade-up d-${(i+2)*100}`} style={{
                padding:'0.875rem 1rem',
                background:'rgba(255,255,255,0.055)',
                border:'1px solid rgba(255,255,255,0.09)',
                borderRadius:'0.9rem', backdropFilter:'blur(8px)',
              }}>
                <div style={{
                  fontSize:'clamp(1.3rem, 2.5vw, 1.6rem)',
                  fontWeight:800, color:C.gold, lineHeight:1.1,
                  fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize:'0.77rem', color:'rgba(255,255,255,0.55)', marginTop:'0.2rem' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Video column ── */}
        <div className="anim-fade-up d-200" style={{ position:'relative' }}>
          {/* Rating badge */}
          <div style={{
            position:'absolute', top:'-1.375rem', 
            left: locale === 'ar' ? '2rem' : 'auto', right: locale === 'ar' ? 'auto' : '2rem',
            zIndex:20,
            background:C.g850, border:`1px solid ${C.gold}33`,
            borderRadius:'1rem', padding:'0.55rem 1rem',
            boxShadow:'0 6px 24px rgba(0,0,0,0.3)',
            display:'flex', alignItems:'center', gap:'0.5rem', direction: dir,
          }}>
            <span style={{ color:C.gold, fontSize:'0.95rem' }}>⭐</span>
            <div>
              <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#fff' }}>{t.heroRating}</div>
              <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.48)' }}>{t.heroRatingSub}</div>
            </div>
          </div>

          {/* Video Player */}
          <div style={{
            borderRadius:'1.5rem', overflow:'hidden',
            border:`1px solid ${C.gold}28`,
            boxShadow:`0 32px 80px rgba(0,0,0,0.5), inset 0 0 0 1px ${C.gold}14`,
            background:`#000`,
            aspectRatio:'16 / 10',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            gap:'1.125rem', position:'relative', cursor:'pointer',
            transition:'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          onClick={() => setShowVideo(true)}
          onMouseOver={e => (e.currentTarget.style.transform='scale(1.02) translateY(-8px)')}
          onMouseOut={e  => (e.currentTarget.style.transform='')}>
            
            {/* Background Thumbnail */}
            <img 
              src="/video-thumbnail.png" 
              alt="Mukth Journey" 
              style={{ 
                position:'absolute', inset:0, width:'100%', height:'100%', 
                objectFit:'cover', opacity:0.6, transition:'opacity 0.3s' 
              }} 
              onMouseOver={e => e.currentTarget.style.opacity = 0.8}
              onMouseOut={e => e.currentTarget.style.opacity = 0.6}
            />

            <IslamicPattern opacity={0.1} />

            {/* Pulse ring + play button */}
            <div style={{ position:'relative', zIndex:2 }}>
              <div style={{
                position:'absolute', inset:'-15px', borderRadius:'50%',
                background:`${C.gold}30`,
                animation:'pulseRing 2.2s cubic-bezier(0.4,0,0.6,1) infinite',
              }} />
              <div style={{
                width:'80px', height:'80px', borderRadius:'50%',
                background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 0 40px ${C.gold}44`,
                transition:'transform 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.transform='scale(1.1)')}
              onMouseOut={e  => (e.currentTarget.style.transform='')}>
                <span style={{ fontSize:'1.6rem', color:C.g900, marginRight: locale === 'ar' ? '-4px' : '0', marginLeft: locale === 'ar' ? '0' : '4px' }}>
                  {locale === 'ar' ? '▶' : '▶'}
                </span>
              </div>
            </div>

            <p style={{ 
              color:'#fff', fontSize:'1rem', fontWeight:700, position:'relative', zIndex:2,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              background: 'rgba(0,0,0,0.3)', padding: '0.4rem 1rem', borderRadius: '2rem',
              backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {t.watchVideo}
            </p>
            <div style={{
              position:'absolute', bottom:'1.25rem', 
              right: locale === 'ar' ? '1.25rem' : 'auto', left: locale === 'ar' ? 'auto' : '1.25rem',
              background:'rgba(212, 175, 55, 0.9)', backdropFilter:'blur(6px)',
              borderRadius:'0.5rem',
              padding:'0.35rem 0.75rem', color:C.g900, fontSize:'0.8rem', fontWeight:800, zIndex:2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>{locale === 'ar' ? '٢:٣٠ دقيقة' : '2:30 min'}</div>
          </div>

          {/* Azhar badge */}
          <div style={{
            position:'absolute', bottom:'-1.5rem', 
            right: locale === 'ar' ? '1.5rem' : 'auto', left: locale === 'ar' ? 'auto' : '1.5rem',
            zIndex:20,
            background:C.offW, border:`1px solid ${C.border}`,
            borderRadius:'1rem', padding:'0.65rem 1.1rem',
            boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
            display:'flex', alignItems:'center', gap:'0.65rem', direction: dir,
          }}>
            <div style={{
              width:'36px', height:'36px', borderRadius:'50%',
              background:`linear-gradient(135deg, ${C.g800}, ${C.g700})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.05rem', flexShrink:0,
            }}>🎓</div>
            <div>
              <div style={{ fontSize:'0.8rem', fontWeight:700, color:C.g800 }}>{t.azharCertified}</div>
              <div style={{ fontSize:'0.7rem', color:C.muted }}>{t.azharDesc}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Overlay Modal */}
      {showVideo && (
        <div style={{
          position:'fixed', inset:0, zIndex:2000,
          background:'rgba(0,0,0,0.92)', backdropFilter:'blur(10px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'1.5rem', animation: 'fadeIn 0.3s ease'
        }} onClick={() => setShowVideo(false)}>
          <button 
            onClick={() => setShowVideo(false)}
            style={{
              position:'absolute', top:'1.5rem', right:'1.5rem',
              background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)',
              color:'#fff', fontSize:'1.5rem', cursor:'pointer',
              width:'44px', height:'44px', borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'background 0.2s', zIndex:10
            }}
            onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.25)'}
            onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
          >✕</button>
          
          <div style={{
            width:'100%', maxWidth:'1100px',
            borderRadius:'1.5rem', overflow:'hidden',
            boxShadow:`0 0 120px ${C.gold}33, 0 40px 80px rgba(0,0,0,0.6)`,
            border:`1px solid ${C.gold}33`,
          }} onClick={e => e.stopPropagation()}>
            <video 
              controls 
              autoPlay
              loop
              style={{ width:'100%', display:'block', maxHeight:'80vh', objectFit:'contain', background:'#000' }}
            >
              <source src="/demo-journey.webp" type="video/webp" />
            </video>
          </div>
        </div>
      )}

      {/* Fade to off-white */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'120px',
        pointerEvents:'none',
        background:`linear-gradient(to bottom, transparent 0%, ${C.offW} 100%)`,
      }} />
    </section>
  );
}
