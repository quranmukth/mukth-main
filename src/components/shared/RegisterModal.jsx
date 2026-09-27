import { useState, useEffect } from 'react';
import { C } from './tokens';
import { useT, useLocale } from '../../lib/i18n';
import { leadsApi } from '../../lib/api';

export default function RegisterModal({ isOpen, onClose }) {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [form, setForm] = useState({ name:'', phone:'', age:'', email:'', curriculum:'', time:'' });
  const [step, setStep] = useState('idle'); // idle | loading | success

  const CURRICULA_OPTS = [
    locale === 'ar' ? 'حفظ القرآن للأطفال' : 'Quran for Kids',
    locale === 'ar' ? 'حفظ القرآن للكبار' : 'Quran for Adults',
    locale === 'ar' ? 'إجازة القرآن الكريم' : 'Quran Ijazah',
    locale === 'ar' ? 'تجويد وتلاوة' : 'Tajweed & Recitation',
  ];

  const TIME_OPTS = [
    { label: t.morning, val: 'morning' },
    { label: t.afternoon, val: 'afternoon' },
    { label: t.evening, val: 'evening' },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setStep('loading');
    try {
      await leadsApi.createLead({
        name: form.name,
        phone: form.phone,
        age: form.age,
        email: form.email,
        curriculum: form.curriculum,
        preferredTime: form.time
      });
      setStep('success');
      setTimeout(() => {
        setStep('idle');
        onClose();
        setForm({ name:'', phone:'', age:'', email:'', curriculum:'', time:'' });
      }, 3200);
    } catch (err) {
      console.error('Lead submission failed:', err);
      setStep('idle');
    }
  };

  return (
    <div
      className="anim-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(1,26,18,0.90)',
        backdropFilter:'blur(14px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'1rem',
        direction: dir,
      }}
    >
      <div
        className="anim-slide-up"
        style={{
          background: C.offW,
          borderRadius:'1.5rem',
          padding:'2.5rem',
          width:'100%', maxWidth:'480px',
          maxHeight:'92vh', overflowY:'auto',
          boxShadow:`0 28px 80px rgba(1,26,18,0.5), 0 0 0 1px ${C.gold}28`,
        }}
      >
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
          <div style={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
            <p style={{ fontSize:'0.75rem', color:C.gold, fontWeight:700, letterSpacing:'0.1em', marginBottom:'0.4rem' }}>
              {t.regLabel}
            </p>
            <h2 style={{ fontSize:'1.6rem', fontWeight:800, color:C.g800, fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif", margin:0 }}>
              {t.regTitle}
            </h2>
            <p style={{ fontSize:'0.83rem', color:C.muted, marginTop:'0.3rem' }}>
              {t.regSub}
            </p>
          </div>
          <button onClick={onClose} style={{
            background:'rgba(0,0,0,0.06)', border:'none', cursor:'pointer',
            width:'32px', height:'32px', borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1rem', color:C.muted, flexShrink:0, marginTop:'0.25rem',
          }}>✕</button>
        </div>

        {/* Success */}
        {step === 'success' ? (
          <div style={{ textAlign:'center', padding:'2.5rem 0' }}>
            <div style={{
              width:'68px', height:'68px', borderRadius:'50%',
              background:`linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 1.25rem', fontSize:'1.9rem',
            }}>🌿</div>
            <h3 style={{ color:C.g800, fontWeight:800, fontSize:'1.3rem', marginBottom:'0.5rem', fontFamily: locale === 'ar' ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}>
              {t.successTitle}
            </h3>
            <p style={{ color:C.muted, lineHeight:1.8, fontSize:'0.95rem' }}>
              {t.successSub}
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {/* Text fields */}
            {[
              { name:'name',  label:`${t.namePlaceholder} ✱`,        type:'text',   ph: locale === 'ar' ? 'محمد أحمد' : 'John Doe' },
              { name:'phone', label:`${t.phoneLabel} ✱`, type:'tel',    ph:'+20 1XX XXX XXXX' },
              { name:'age',   label: t.agePlaceholder,                 type:'number', ph: locale === 'ar' ? '٢٥' : '25' },
              { name:'email', label: t.emailLabel,     type:'email',  ph:'example@email.com' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display:'block', fontSize:'0.84rem', fontWeight:600, color:C.g800, marginBottom:'0.3rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                  {f.label}
                </label>
                <input
                  className="input-ar"
                  name={f.name} type={f.type} placeholder={f.ph}
                  value={form[f.name]} onChange={handleChange}
                  style={{ textAlign: locale === 'ar' ? 'right' : 'left', direction: locale === 'ar' ? 'rtl' : 'ltr' }}
                />
              </div>
            ))}

            {/* Curriculum */}
            <div>
              <label style={{ display:'block', fontSize:'0.84rem', fontWeight:600, color:C.g800, marginBottom:'0.3rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                {t.curriculumSelect}
              </label>
              <select className="input-ar" name="curriculum" value={form.curriculum} onChange={handleChange}
                style={{ cursor:'pointer', color: form.curriculum ? C.dark : '#9ab5aa', textAlign: locale === 'ar' ? 'right' : 'left', direction: locale === 'ar' ? 'rtl' : 'ltr' }}>
                <option value="" disabled>{t.curriculumPh}</option>
                {CURRICULA_OPTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Time pills */}
            <div>
              <label style={{ display:'block', fontSize:'0.84rem', fontWeight:600, color:C.g800, marginBottom:'0.45rem', textAlign: locale === 'ar' ? 'right' : 'left' }}>
                {t.timeLabel}
              </label>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                {TIME_OPTS.map(timeOpt => (
                  <button key={timeOpt.val} onClick={() => setForm(f => ({ ...f, time: timeOpt.label }))}
                    style={{
                      flex:1, padding:'0.55rem 0.5rem', borderRadius:'0.7rem',
                      border:`1.5px solid ${form.time === timeOpt.label ? C.g700 : C.border}`,
                      background: form.time === timeOpt.label ? C.g800 : 'transparent',
                      color: form.time === timeOpt.label ? '#fff' : C.muted,
                      fontSize:'0.85rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                      transition:'all 0.18s ease',
                    }}>
                    {timeOpt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn-gold"
              onClick={handleSubmit}
              disabled={step === 'loading'}
              style={{
                width:'100%', padding:'0.95rem', marginTop:'0.5rem', fontSize:'1.05rem',
                ...(step === 'loading' ? { background:C.muted, boxShadow:'none', cursor:'wait' } : {}),
              }}
            >
              {step === 'loading' ? t.sendingButton : `${t.sendData} ${locale === 'ar' ? '←' : '→'}`}
            </button>
            <p style={{ textAlign:'center', fontSize:'0.75rem', color:C.muted }}>
              {t.privacyNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
