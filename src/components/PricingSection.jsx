import { C, PLANS } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';

// Logo mark SVG for the top of each pricing card
function MukthMark({ size = 72, color = C.g800, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 22 Q55 28 58 40" stroke={color} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M40 22 Q25 28 22 40" stroke={color} strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.9"/>
      <path d="M40 14 Q62 22 65 40" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>
      <path d="M40 14 Q18 22 15 40" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>
      <path d="M28 38 L28 58 Q38 54 40 58 Q42 54 52 58 L52 38 Q42 42 40 38 Q38 42 28 38Z"
        fill={color} opacity="0.18" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M40 38 L40 58" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="40" cy="24" r="3.5" fill={C.gold} />
      <text x="40" y="54" textAnchor="middle" fontSize="9" fontWeight="800"
        fill={color} fontFamily="'IBM Plex Sans Arabic', Tahoma, sans-serif" opacity="0.7">
        {t.appName}
      </text>
    </svg>
  );
}

function CheckRow({ text, locale }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.55rem', padding:'0.3rem 0' }}>
      <div style={{
        width:'20px', height:'20px', borderRadius:'50%',
        background:C.g50, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke={C.g800} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <span style={{ fontSize:'0.9rem', color:'#1a2e25' }}>{text}</span>
    </div>
  );
}

export default function PricingSection({ onOpenModal }) {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <section id="pricing" className="section-pad" style={{ background:C.offW, direction: dir }}>
      <div className="container">
        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:'1rem' }}>
          <span className="section-label">✦ {t.pricingLabel}</span>
          <h2 className="section-title">{t.pricingTitle}</h2>
          <p className="section-sub" style={{ margin:'0 auto 0' }}>
            {t.pricingSubtitle}
          </p>
        </div>
        <div className="ornament" style={{ marginBottom:'2.5rem' }}>✦</div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap:'1.25rem',
          alignItems:'stretch',
        }}>
          {PLANS.map((plan, i) => (
            <div key={plan.id} className={`anim-fade-up d-${(i+1)*100}`} style={{
              background:'#fff',
              border: plan.highlight
                ? `2px solid ${C.g600}`
                : `1.5px solid ${plan.color === C.g800 ? C.borderL : plan.color + '44'}`,
              borderRadius:'1.25rem',
              padding:'2rem 1.5rem',
              display:'flex', flexDirection:'column', gap:'1rem',
              position:'relative',
              boxShadow: plan.highlight
                ? `0 8px 36px rgba(6,78,59,0.15)`
                : plan.color !== C.g800 ? `0 8px 24px ${plan.color}15` : 'none',
              transition:'transform 0.25s ease, box-shadow 0.25s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 16px 48px ${plan.color}22`; }}
            onMouseOut={e  => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow = plan.highlight ? `0 8px 36px rgba(6,78,59,0.15)` : 'none'; }}>

              {plan.badge && (
                <div style={{
                  position:'absolute', top:'-0.875rem', right:'50%',
                  transform: locale === 'ar' ? 'translateX(50%)' : 'translateX(50%)',
                  background:`linear-gradient(90deg, ${C.g800}, ${C.g600})`,
                  color:'#fff', fontSize:'0.72rem', fontWeight:700,
                  padding:'0.28rem 1rem', borderRadius:'99px',
                  whiteSpace:'nowrap', boxShadow:`0 2px 10px rgba(6,78,59,0.3)`,
                }}>{t.mostPopular}</div>
              )}

              <div style={{ display:'flex', justifyContent:'center', marginTop: plan.badge ? '0.5rem' : 0 }}>
                <MukthMark size={72} color={plan.color} t={t} />
              </div>

              <h3 style={{
                textAlign:'center',
                fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                fontSize:'1rem', fontWeight:700, color:'#1a2e25',
              }}>{locale === 'ar' ? plan.title : plan.titleEn}</h3>

              <div style={{ textAlign:'center' }}>
                {plan.priceNum ? (
                  <>
                    <span style={{
                      fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                      fontSize:'1.75rem', fontWeight:800,
                      color: plan.highlight ? C.g800 : C.goldD,
                    }}>{locale === 'ar' ? plan.price : plan.priceEn}</span>
                    <span style={{ fontSize:'0.82rem', color:C.muted, marginInlineStart:'0.35rem' }}>
                      {locale === 'ar' ? plan.period : plan.periodEn}
                    </span>
                  </>
                ) : (
                  <span style={{
                    fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                    fontSize:'1.75rem', fontWeight:800, color:plan.color,
                  }}>{locale === 'ar' ? plan.price : plan.priceEn}</span>
                )}
              </div>

              <div style={{ height:'1px', background:C.borderL }} />

              <div style={{ flexGrow:1, display:'flex', flexDirection:'column', gap:'0.1rem' }}>
                {(locale === 'ar' ? plan.features : plan.featuresEn).map(f => <CheckRow key={f} text={f} locale={locale} />)}
              </div>

              <button onClick={onOpenModal} style={{
                width:'100%', padding:'0.72rem',
                background: plan.highlight || plan.id === 'trial'
                  ? `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`
                  : 'transparent',
                color: plan.highlight || plan.id === 'trial' ? '#fff' : plan.color,
                border: plan.highlight || plan.id === 'trial' ? 'none' : `1.5px solid ${plan.color}`,
                fontWeight:700, fontSize:'0.88rem',
                borderRadius:'0.75rem', cursor:'pointer', fontFamily:'inherit',
                transition:'all 0.18s ease',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem',
              }}
              onMouseOver={e => {
                if (!plan.highlight) {
                  e.currentTarget.style.background = C.g800;
                  e.currentTarget.style.color = '#fff';
                } else {
                  e.currentTarget.style.opacity = '0.88';
                }
              }}
              onMouseOut={e => {
                if (!plan.highlight) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = C.g800;
                } else {
                  e.currentTarget.style.opacity = '1';
                }
              }}>
                <span style={{ transform: locale === 'ar' ? 'none' : 'scaleX(-1)' }}>←</span>
                <span>{locale === 'ar' ? plan.cta : plan.ctaEn}</span>
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginTop:'2.5rem' }}>
          <button onClick={onOpenModal} className="btn-gold"
            style={{ padding:'0.85rem 2.5rem', fontSize:'0.95rem' }}>
            {t.viewAll}
          </button>
        </div>
      </div>
    </section>
  );
}
