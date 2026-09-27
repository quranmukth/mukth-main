import { useState, useEffect } from 'react';
import { C } from './shared/tokens';
import IslamicPattern from './shared/IslamicPattern';
import { useT, useLocale } from '../lib/i18n';

export default function HeroSection({ onOpenModal }) {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const STATS = [
    { num: locale === 'ar' ? '+٥٠٠' : '+500',   label: locale === 'ar' ? 'طالب نشط' : 'Active Students' },
    { num: locale === 'ar' ? '+٥٠' : '+50',     label: locale === 'ar' ? 'معلم مجاز أزهري' : 'Azhar Certified Teachers' },
    { num: locale === 'ar' ? '٤.٩★' : '4.9★',  label: locale === 'ar' ? 'متوسط تقييم الطلاب' : 'Avg. Student Rating' },
    { num: locale === 'ar' ? '+١٥' : '+15',     label: locale === 'ar' ? 'دولة نخدمها' : 'Countries Served' },
  ];

  const [isPlayingVerse, setIsPlayingVerse] = useState(false);
  const [audio] = useState(() => {
    const a = new Audio('/مكث.mpeg');
    a.onerror = () => {
      a.src = 'https://everydayayah.com/data/Alafasy_128kbps/017106.mp3';
    };
    return a;
  });

  // Autoplay once per session on site visit
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('mukth_audio_played');
    if (!hasPlayed) {
      const playAudio = () => {
        audio.play().then(() => {
          setIsPlayingVerse(true);
          sessionStorage.setItem('mukth_audio_played', 'true');
        }).catch(() => {
          // Autoplay was prevented by browser policy; wait for first user click
          const handleFirstClick = () => {
            audio.play().then(() => {
              setIsPlayingVerse(true);
              sessionStorage.setItem('mukth_audio_played', 'true');
            }).catch(e => console.error('Audio play error:', e));
            window.removeEventListener('pointerdown', handleFirstClick);
            window.removeEventListener('click', handleFirstClick);
          };
          window.addEventListener('pointerdown', handleFirstClick, { once: true });
          window.addEventListener('click', handleFirstClick, { once: true });
        });
      };

      playAudio();

      audio.onended = () => setIsPlayingVerse(false);
    }
  }, [audio]);

  const toggleVerseAudio = () => {
    if (isPlayingVerse) {
      audio.pause();
      setIsPlayingVerse(false);
    } else {
      audio.play().then(() => {
        setIsPlayingVerse(true);
        sessionStorage.setItem('mukth_audio_played', 'true');
      }).catch(err => console.error('Audio play error:', err));

      audio.onended = () => setIsPlayingVerse(false);
    }
  };

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
        padding: 'clamp(6.5rem, 16vh, 9rem) 1.5rem 4rem',
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
            borderRadius:'2rem', marginBottom:'1.25rem',
          }}>
            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:C.gold, flexShrink:0 }} />
            <span style={{ color:C.gold, fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.07em' }}>{t.inspiringVerse}</span>
          </div>

          {/* Quranic verse with Premium Audio Badge Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1.25rem',
            borderBottom: `1px solid ${C.gold}1e`,
          }}>
            <button
              onClick={toggleVerseAudio}
              title={isPlayingVerse ? (locale === 'ar' ? 'إيقاف التلاوة' : 'Pause Recitation') : (locale === 'ar' ? 'استمع للتلاوة' : 'Listen Recitation')}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: isPlayingVerse 
                  ? `linear-gradient(135deg, ${C.gold}, #997415)` 
                  : `linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(6, 44, 34, 0.6))`,
                border: `1.5px solid ${C.gold}`,
                color: isPlayingVerse ? C.g900 : C.gold,
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                fontSize: '1.1rem',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: isPlayingVerse 
                  ? `0 0 25px ${C.gold}88, inset 0 0 10px rgba(255,255,255,0.4)` 
                  : '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
              }}
              onMouseOver={(e) => {
                if (!isPlayingVerse) {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.background = C.gold;
                  e.currentTarget.style.color = C.g900;
                }
              }}
              onMouseOut={(e) => {
                if (!isPlayingVerse) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = `linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(6, 44, 34, 0.6))`;
                  e.currentTarget.style.color = C.gold;
                }
              }}
            >
              {isPlayingVerse ? (
                /* Equalizer Wave Icon when playing */
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '16px' }}>
                  <span style={{ width: '3px', height: '100%', background: C.g900, borderRadius: '2px', animation: 'bounce 0.8s ease-in-out infinite' }} />
                  <span style={{ width: '3px', height: '60%', background: C.g900, borderRadius: '2px', animation: 'bounce 0.8s ease-in-out infinite 0.2s' }} />
                  <span style={{ width: '3px', height: '80%', background: C.g900, borderRadius: '2px', animation: 'bounce 0.8s ease-in-out infinite 0.4s' }} />
                </span>
              ) : (
                '🔊'
              )}
            </button>

            <p style={{
              fontFamily: "'Amiri', serif",
              fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)',
              fontWeight: 700,
              color: C.goldL,
              lineHeight: 2,
              letterSpacing: '0.04em',
              margin: 0,
            }}>
              ﴿ وَقُرْآنًا فَرَّقْنَاهُ لِتَقْرَأَهُ عَلَى النَّاسِ عَلَىٰ مُكْثٍ ﴾
            </p>
          </div>

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
                <div style={{ fontSize:'0.77rem', color:'rgba(255,255,255,0.7)', marginTop:'0.2rem', fontWeight:600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Photo Showcase Column (Pure image, no video button overlay) ── */}
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

          {/* Photo Showcase Container */}
          <div style={{
            borderRadius:'1.5rem', overflow:'hidden',
            border:`1px solid ${C.gold}38`,
            boxShadow:`0 32px 80px rgba(0,0,0,0.5), inset 0 0 0 1px ${C.gold}22`,
            background:`#000`,
            aspectRatio:'16 / 10',
            position:'relative',
            transition:'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          onMouseOver={e => (e.currentTarget.style.transform='scale(1.02) translateY(-6px)')}
          onMouseOut={e  => (e.currentTarget.style.transform='')}>
            
            {/* Main Crisp Photo */}
            <img 
              src="/video-thumbnail.png" 
              alt="Mukth Interactive Live Session" 
              style={{ 
                width:'100%', height:'100%', 
                objectFit:'cover', display: 'block'
              }} 
            />

            {/* Soft Overlay Gradient for text legibility */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(2,44,34,0.85) 0%, rgba(0,0,0,0.1) 60%)',
              pointerEvents: 'none'
            }} />

            <IslamicPattern opacity={0.08} />

            {/* Live Interactive Session Pill */}
            <div style={{
              position:'absolute', bottom:'1.25rem', 
              right: locale === 'ar' ? '1.25rem' : 'auto', left: locale === 'ar' ? 'auto' : '1.25rem',
              background:'rgba(6, 44, 34, 0.9)', backdropFilter:'blur(10px)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              borderRadius:'0.75rem',
              padding:'0.45rem 0.9rem', color:'#fff', fontSize:'0.85rem', fontWeight:700, zIndex:2,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
                boxShadow: '0 0 10px #10b981', display: 'inline-block'
              }} />
              <span>{locale === 'ar' ? 'حلقة تعليمية مباشرة أونلاين' : 'Live Interactive Quran Session'}</span>
            </div>
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

      {/* Fade to off-white */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'120px',
        pointerEvents:'none',
        background:`linear-gradient(to bottom, transparent 0%, ${C.offW} 100%)`,
      }} />
    </section>
  );
}
