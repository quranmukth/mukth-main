import { useState } from 'react';
import { C, WHATSAPP_NUMBER } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';

export default function ContactSection() {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [form, setForm] = useState({ name: '', phone: '', msg: '' });
  const [step, setStep] = useState('idle');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setStep('loading');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => { setStep('idle'); setForm({ name: '', phone: '', msg: '' }); }, 3000);
    }, 800);
  };

  const SOCIAL = [
    { name: locale === 'ar' ? 'واتساب' : 'WhatsApp', icon: '💬', color: '#25D366', href: `https://wa.me/${201220610310}` },
    { name: locale === 'ar' ? 'فيسبوك' : 'Facebook', icon: '📘', color: '#1877F2', href: 'https://www.facebook.com/profile.php?id=61577653913988' },
    { name: locale === 'ar' ? 'إنستغرام' : 'Instagram', icon: '📸', color: '#E1306C', href: 'https://instagram.com/mukth114' },
    { name: locale === 'ar' ? 'تليجرام' : 'Telegram', icon: '✈️', color: '#229ED9', href: 'https://t.me/' },
  ];

  const INFO_ITEMS = [
    { icon: '📍', title: t.addressLabel, val: t.addressVal },
    { icon: '📧', title: t.emailLabel, val: 'info@mukth.com' },
    { icon: '📞', title: t.phoneLabel, val: '+201220610310' },
    { icon: '⏰', title: locale === 'ar' ? 'ساعات العمل' : 'Working Hours', val: locale === 'ar' ? 'السبت – الخميس: ٨ ص – ١٢ م' : 'Sat – Thu: 8 AM – 12 PM' },
  ];

  return (
    <section id="contact" className="section-pad" style={{ background: C.offW, direction: dir }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-label">✦ {t.contactLabel}</span>
          <h2 className="section-title">{t.contactTitle}</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            {t.contactSubtitle}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '3rem', alignItems: 'start' }}>

          {/* Left: info */}
          <div>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem',
                borderRadius: '1.25rem',
                background: 'linear-gradient(135deg, #25D366, #1ead55)',
                textDecoration: 'none', marginBottom: '1.5rem',
                boxShadow: '0 8px 32px rgba(37,211,102,0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(37,211,102,0.42)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,211,102,0.3)'; }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>💬</div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}>{t.waChat}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.84rem', marginTop: '0.2rem' }}>{locale === 'ar' ? 'متاحون من ٨ ص حتى ١٢ م — ٧ أيام / أسبوع' : 'Available 8 AM - 12 PM — 7 Days/Week'}</div>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', marginInlineStart: 'auto' }}>
                {locale === 'ar' ? '←' : '→'}
              </span>
            </a>

            {INFO_ITEMS.map((info, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', marginBottom: '0.75rem', background: '#fff', border: `1.5px solid ${C.borderL}`, borderRadius: '1rem', transition: 'border-color 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = C.border)}
                onMouseOut={e => (e.currentTarget.style.borderColor = C.borderL)}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: C.g50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{info.icon}</div>
                <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
                  <div style={{ fontSize: '0.76rem', color: C.muted, fontWeight: 600, marginBottom: '0.15rem' }}>{info.title}</div>
                  <div style={{ fontSize: '0.9rem', color: C.dark, fontWeight: 500 }}>{info.val}</div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: C.g800, marginBottom: '0.75rem' }}>{locale === 'ar' ? 'تابعنا على' : 'Follow us on'}</p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {SOCIAL.map(s => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.42rem 0.875rem', background: `${s.color}12`, border: `1px solid ${s.color}28`, borderRadius: '0.6rem', textDecoration: 'none', color: s.color, fontSize: '0.78rem', fontWeight: 600, transition: 'background 0.15s, transform 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.background = `${s.color}22`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = `${s.color}12`; e.currentTarget.style.transform = ''; }}>
                    <span style={{ fontSize: '0.9rem' }}>{s.icon}</span>{s.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: '#fff', border: `1.5px solid ${C.borderL}`, borderRadius: '1.5rem', padding: '2.25rem', boxShadow: `0 4px 24px rgba(6,78,59,0.06)` }}>
            {step === 'success' ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.75rem' }}>✅</div>
                <h3 style={{ color: C.g800, fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}>{t.successMsg}</h3>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: C.g800, marginBottom: '1.75rem' }}>{locale === 'ar' ? 'أرسل لنا رسالة' : 'Send us a message'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: C.g800, marginBottom: '0.3rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>{t.namePlaceholder} ✱</label>
                    <input className="input-ar" name="name" type="text" placeholder={locale === 'ar' ? 'محمد أحمد' : 'John Doe'} value={form.name} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: C.g800, marginBottom: '0.3rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>{t.phoneLabel} ✱</label>
                    <input className="input-ar" name="phone" type="tel" placeholder={locale === 'ar' ? '+20 1XX XXX XXXX' : '+20 1XX XXX XXXX'} value={form.phone} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: C.g800, marginBottom: '0.3rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>{t.messagePlaceholder}</label>
                    <textarea className="input-ar" name="msg" rows={4} placeholder={locale === 'ar' ? 'اكتب استفسارك أو طلبك هنا...' : 'Write your inquiry or request here...'} value={form.msg} onChange={handleChange} style={{ resize: 'vertical', minHeight: '100px' }} />
                  </div>
                  <button className="btn-gold" onClick={handleSubmit} disabled={step === 'loading'}
                    style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', borderRadius: '0.9rem', ...(step === 'loading' ? { background: C.muted, boxShadow: 'none', cursor: 'wait' } : {}) }}>
                    {step === 'loading' ? t.sendingButton : `${t.sendButton} ${locale === 'ar' ? '←' : '→'}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
