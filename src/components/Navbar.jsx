import { useState, useEffect } from 'react';
import { C, NAV_LINKS } from './shared/tokens';
import { useT, useLocale, useI18nStore } from '../lib/i18n';
import { NavLink } from 'react-router-dom';

export default function Navbar({ onOpenModal }) {
  const t = useT();
  const locale = useLocale();
  const toggleLang = useI18nStore((s) => s.toggle);
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', h, { passive:true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:900,
      direction: dir,
      transition:'background 0.35s ease, box-shadow 0.35s ease, height 0.3s ease',
      background: scrolled ? 'rgba(2,44,34,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
      boxShadow: scrolled ? `0 1px 0 ${C.gold}1a, 0 4px 32px rgba(0,0,0,0.25)` : 'none',
    }}>
      {/* Main bar */}
      <div className="container" style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        height: scrolled ? '64px' : '80px',
        transition:'height 0.3s ease',
      }}>
        {/* Logo */}
        <a href="#home" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <div style={{
            width:'36px', height:'36px', borderRadius:'10px',
            background:`linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:`0 2px 14px ${C.gold}44`, flexShrink:0,
          }}>
            <span style={{ fontSize:'1.1rem', color:C.g900, fontWeight:900, fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}>
              {locale === 'ar' ? 'م' : 'M'}
            </span>
          </div>
          <span style={{ 
            fontSize:'1.4rem', fontWeight:800, color:'#fff', 
            fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif", 
            letterSpacing:'0.01em',
            display: 'inline-block',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }} className="hidden sm:inline-block">
            {t.appName}
          </span>
        </a>

        {/* Desktop links */}
        <ul style={{ listStyle:'none', display:'flex', alignItems:'center', gap:'0.1rem', margin:0, padding:0 }}
          className="hidden md:flex">
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <a href={l.href} style={{
                padding:'0.45rem 0.875rem', display:'block',
                color:'rgba(255,255,255,0.78)', fontSize:'0.92rem', fontWeight:500,
                textDecoration:'none', borderRadius:'0.5rem',
                transition:'color 0.15s, background 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.background='rgba(255,255,255,0.09)'; }}
              onMouseOut={e  => { e.currentTarget.style.color='rgba(255,255,255,0.78)'; e.currentTarget.style.background='transparent'; }}>
                {locale === 'ar' ? l.label : l.labelEn}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <button onClick={toggleLang} style={{
            padding: '0.3rem 0.6rem', borderRadius: '0.5rem',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            flexShrink: 0
          }}>
            {locale === 'ar' ? 'EN' : 'عربي'}
          </button>
          
          <NavLink to="/login" className="hidden md:inline-flex" style={{
            color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600,
            padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)',
            transition: 'background 0.15s'
          }}
          onMouseOver={e => (e.currentTarget.style.background='rgba(255,255,255,0.12)')}
          onMouseOut={e => (e.currentTarget.style.background='rgba(255,255,255,0.05)')}
          >
            {t.login}
          </NavLink>

          <button onClick={onOpenModal} className="btn-gold hidden md:inline-flex"
            style={{ padding:'0.52rem 1.5rem', fontSize:'0.88rem', borderRadius:'2rem' }}>
            {t.startNow}
          </button>
          {/* Hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden"
            style={{
              background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:'0.55rem', color:'#fff', cursor:'pointer',
              width:'40px', height:'40px',
              alignItems:'center', justifyContent:'center',
              fontSize:'1.1rem', transition:'background 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.background='rgba(255,255,255,0.16)')}
            onMouseOut={e  => (e.currentTarget.style.background='rgba(255,255,255,0.1)')}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="anim-slide-down" style={{
          background:'rgba(2,44,34,0.97)', backdropFilter:'blur(20px)',
          borderTop:`1px solid ${C.gold}20`, padding:'1rem 1.5rem 1.75rem', direction: dir,
        }}>
          {NAV_LINKS.map((l, i) => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'0.875rem 0', color:'rgba(255,255,255,0.85)',
              fontSize:'1.05rem', fontWeight:500, textDecoration:'none',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              transition:'color 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.color = C.gold)}
            onMouseOut={e  => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}>
              {locale === 'ar' ? l.label : l.labelEn}
              <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem' }}>{locale === 'ar' ? '←' : '→'}</span>
            </a>
          ))}
          <NavLink to="/login" onClick={() => setMobileOpen(false)} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0.875rem 0', color:'rgba(255,255,255,0.85)',
            fontSize:'1.05rem', fontWeight:500, textDecoration:'none',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            transition:'color 0.15s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = C.gold)}
          onMouseOut={e  => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}>
            {t.login}
            <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem' }}>{locale === 'ar' ? '←' : '→'}</span>
          </NavLink>

          <button onClick={() => { toggleLang(); setMobileOpen(false); }} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0.875rem 0', color:C.gold, width: '100%',
            fontSize:'1.05rem', fontWeight:600, textDecoration:'none',
            background: 'transparent', border: 'none', cursor: 'pointer',
            borderBottom: 'none', fontFamily: 'inherit',
          }}>
            <span>{locale === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
            <span style={{ fontSize:'0.85rem' }}>🌐</span>
          </button>
          <button className="btn-gold" onClick={() => { onOpenModal(); setMobileOpen(false); }}
            style={{ width:'100%', marginTop:'1.5rem', padding:'1rem', fontSize:'1.1rem', borderRadius:'1rem', boxShadow: `0 4px 20px ${C.gold}40` }}>
            {t.startNow} ✦
          </button>
          <div style={{ textAlign:'center', marginTop:'1.5rem', opacity:0.5, fontSize:'0.8rem', color:'#fff' }}>
            {t.allRightsReserved} © {new Date().getFullYear()}
          </div>
        </div>
      )}
    </nav>
  );
}
