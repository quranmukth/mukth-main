import { useState, useEffect } from 'react';
import { C } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';

export default function ScrollToTop() {
  const t = useT();
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const h = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', h, { passive:true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
      title={locale === 'ar' ? 'العودة للأعلى' : 'Scroll to top'}
      className="anim-fade-in"
      style={{
        position:'fixed', bottom:'1.75rem',
        [locale === 'ar' ? 'right' : 'left']: '1.75rem',
        width:'46px', height:'46px', borderRadius:'50%',
        background:C.g800, color:'#fff',
        border:`2px solid ${C.gold}44`,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`0 4px 18px rgba(6,78,59,0.35)`,
        cursor:'pointer', zIndex:800, fontSize:'1.1rem',
        transition:'all 0.2s ease',
      }}
      onMouseOver={e => { e.currentTarget.style.background=C.gold; e.currentTarget.style.color=C.g900; }}
      onMouseOut={e  => { e.currentTarget.style.background=C.g800; e.currentTarget.style.color='#fff'; }}
    >
      ↑
    </button>
  );
}
