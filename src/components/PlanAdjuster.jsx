import { useState } from 'react';
import { C, TEACHERS, WHATSAPP_NUMBER } from './shared/tokens';
import { useT, useLocale } from '../lib/i18n';
import { useBookingStore } from '../stores/bookingStore';
import { useNotificationStore } from '../stores/notificationStore';

// بناء رسالة واتساب شاملة لكل تفاصيل الاختيارات
const buildFullWhatsAppMessage = ({ name, phone, sessions, days, mins, teacherName, curriculum }) => {
  const ref = `#MKT-${Math.floor(1000 + Math.random() * 9000)}`;
  return (
`السلام عليكم منصة مُكث 🌿
أود الاشتراك وتأكيد الحجز

📋 بيانات الطالب:
👤 الاسم: ${name}
📱 الهاتف: ${phone}

📚 تفاصيل الخطة المختارة:
📖 المنهج: ${curriculum}
📅 عدد الأيام: ${days} أيام في الأسبوع
🔢 إجمالي الحصص: ${sessions} حصة شهرياً
⏱️ مدة الحصة: ${mins} دقيقة
🎓 المعلم المفضل: ${teacherName}

🔖 رقم المرجع: ${ref}

أرجو التواصل معي لتأكيد الحجز ومعرفة السعر المناسب.
جزاكم الله خيراً 🤲`
  );
};

const CURRICULA_OPTIONS = [
  { id: 'hifz', label: 'حفظ القرآن الكريم', icon: '📖' },
  { id: 'tajweed', label: 'تجويد وتلاوة', icon: '🎵' },
  { id: 'ijazah', label: 'إجازة القرآن', icon: '🎓' },
  { id: 'kids', label: 'حفظ للأطفال', icon: '🌱' },
];

export default function PlanAdjuster({ onOpenModal }) {
  const t = useT();
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [days, setDays]               = useState(2);
  const sessions                       = days * 4;
  const [mins, setMins]               = useState(30);
  const [teacher, setTeacher]         = useState(TEACHERS[0].id);
  const [curriculum, setCurriculum]   = useState(CURRICULA_OPTIONS[0].id);
  const [contact, setContact]         = useState({ name: '', phone: '' });
  const [status, setStatus]           = useState('idle'); // idle | loading | success

  const createBooking = useBookingStore((s) => s.createBooking);
  const notify        = useNotificationStore();

  const selectedTeacher   = TEACHERS.find(t => t.id === teacher);
  const selectedCurriculum = CURRICULA_OPTIONS.find(c => c.id === curriculum);

  const handleSubmit = async () => {
    if (!contact.name || !contact.phone) {
      notify.error(
        locale === 'ar' ? 'بيانات غير مكتملة' : 'Incomplete Data',
        locale === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف' : 'Please enter your name and phone number'
      );
      return;
    }

    setStatus('loading');
    try {
      // Save booking in DB
      const response = await createBooking({
        studentName:  contact.name,
        phone:        contact.phone,
        curriculum:   selectedCurriculum?.label || curriculum,
        teacherName:  selectedTeacher?.name || '',
        plan: {
          sessions,
          durationMins: mins,
          label: `${sessions} حصص شهرياً (${mins} دقيقة)`,
        },
      });

      setStatus('success');

      notify.success(
        locale === 'ar' ? 'تم تجهيز الرسالة بنجاح 🎉' : 'Message Ready 🎉',
        locale === 'ar'
          ? `رقم مرجعك: ${response.booking?.bookingRef}`
          : `Reference: ${response.booking?.bookingRef}`
      );

      // Build full WhatsApp message and open
      const waMsg = buildFullWhatsAppMessage({
        name:        contact.name,
        phone:       contact.phone,
        sessions,
        days,
        mins,
        teacherName: selectedTeacher?.name || '',
        curriculum:  selectedCurriculum?.label || curriculum,
      });
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
      window.open(waUrl, '_blank');

      setContact({ name: '', phone: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('Booking error:', err);
      // Even on server error, still open WhatsApp with full message
      const waMsg = buildFullWhatsAppMessage({
        name:        contact.name,
        phone:       contact.phone,
        sessions,
        days,
        mins,
        teacherName: selectedTeacher?.name || '',
        curriculum:  selectedCurriculum?.label || curriculum,
      });
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;
      window.open(waUrl, '_blank');

      setStatus('success');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section id="plan-adjuster" className="section-pad" style={{
      background: `linear-gradient(135deg, ${C.g900} 0%, ${C.g850} 100%)`,
      direction: dir,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
        background: `radial-gradient(circle, ${C.gold}15 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-label" style={{ color: C.gold }}>✦ {locale === 'ar' ? 'صمم رحلتك' : 'Design Your Journey'}</span>
          <h2 className="section-title" style={{ color: '#fff' }}>
            {locale === 'ar' ? 'اختر خطة الحفظ المناسبة لك' : 'Customize Your Study Plan'}
          </h2>
          <p className="section-sub" style={{ color: 'rgba(255,255,255,0.7)', margin: '0 auto' }}>
            {locale === 'ar'
              ? 'حدد تفاصيل رحلتك وسنرسل لك كل المعلومات والسعر المناسب عبر واتساب فوراً'
              : 'Set your preferences and we\'ll send you full details and pricing via WhatsApp instantly'}
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '2rem',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          maxWidth: '960px',
          margin: '0 auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        }}>

          {/* ── Grid Layout ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '2rem',
          }}>

            {/* ── Column 1: Plan settings ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

              {/* Curriculum selector */}
              <div>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.75rem' }}>
                  {locale === 'ar' ? '📚 اختر المنهج' : '📚 Choose Curriculum'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {CURRICULA_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCurriculum(c.id)}
                      style={{
                        padding: '0.6rem 0.5rem',
                        borderRadius: '0.75rem',
                        background: curriculum === c.id ? C.gold : 'rgba(255,255,255,0.05)',
                        color: curriculum === c.id ? C.g900 : 'rgba(255,255,255,0.8)',
                        border: '1px solid',
                        borderColor: curriculum === c.id ? C.gold : 'rgba(255,255,255,0.1)',
                        fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        justifyContent: 'center',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Days per week */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                    {locale === 'ar' ? '📅 كم يوم في الأسبوع؟' : '📅 Days per week?'}
                  </label>
                  <span style={{
                    background: C.gold, color: C.g900, padding: '0.15rem 0.7rem',
                    borderRadius: '2rem', fontSize: '0.82rem', fontWeight: 800,
                  }}>
                    {sessions} {locale === 'ar' ? 'حصة/شهر' : 'sessions/mo'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5, 6].map(d => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      style={{
                        flex: 1, padding: '0.75rem 0.25rem', borderRadius: '0.75rem',
                        background: days === d ? C.gold : 'rgba(255,255,255,0.05)',
                        color: days === d ? C.g900 : '#fff',
                        border: '1px solid',
                        borderColor: days === d ? C.gold : 'rgba(255,255,255,0.1)',
                        fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: days === d ? `0 0 16px ${C.gold}44` : 'none',
                        fontFamily: 'inherit',
                      }}
                    >{d}</button>
                  ))}
                </div>
              </div>

              {/* Session duration */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <label style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                    {locale === 'ar' ? '⏱️ مدة الحصة' : '⏱️ Session duration'}
                  </label>
                  <span style={{ color: C.gold, fontWeight: 800 }}>{mins} {locale === 'ar' ? 'دقيقة' : 'min'}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[30, 45, 60].map(m => (
                    <button
                      key={m}
                      onClick={() => setMins(m)}
                      style={{
                        flex: 1, padding: '0.6rem', borderRadius: '0.65rem',
                        background: mins === m ? C.gold : 'rgba(255,255,255,0.05)',
                        color: mins === m ? C.g900 : '#fff',
                        border: '1px solid',
                        borderColor: mins === m ? C.gold : 'rgba(255,255,255,0.1)',
                        fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                      }}
                    >{m} {locale === 'ar' ? 'د' : 'm'}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Column 2: Teacher + Contact + CTA ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Teacher selection */}
              <div>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.75rem' }}>
                  {locale === 'ar' ? '🎓 المعلم المفضل' : '🎓 Preferred Teacher'}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {TEACHERS.map(tea => (
                    <button
                      key={tea.id}
                      onClick={() => setTeacher(tea.id)}
                      style={{
                        padding: '0.7rem 1rem',
                        borderRadius: '0.75rem',
                        background: teacher === tea.id ? `${C.gold}18` : 'rgba(255,255,255,0.04)',
                        color: teacher === tea.id ? C.gold : 'rgba(255,255,255,0.75)',
                        border: '1.5px solid',
                        borderColor: teacher === tea.id ? C.gold : 'rgba(255,255,255,0.1)',
                        fontWeight: teacher === tea.id ? 700 : 500,
                        fontSize: '0.87rem', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: locale === 'ar' ? 'right' : 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      {locale === 'ar' ? tea.name : tea.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary box */}
              <div style={{
                background: 'rgba(212, 175, 55, 0.08)',
                border: `1px dashed ${C.gold}44`,
                borderRadius: '1rem',
                padding: '1.25rem',
              }}>
                <div style={{ color: C.gold, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  📋 {locale === 'ar' ? 'ملخص اختياراتك' : 'Your Selections'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', lineHeight: 1.8 }}>
                  <div>📚 {selectedCurriculum?.label}</div>
                  <div>📅 {days} {locale === 'ar' ? 'أيام/أسبوع' : 'days/week'} — {sessions} {locale === 'ar' ? 'حصة/شهر' : 'sessions/month'}</div>
                  <div>⏱️ {mins} {locale === 'ar' ? 'دقيقة/حصة' : 'min/session'}</div>
                  <div>🎓 {selectedTeacher ? (locale === 'ar' ? selectedTeacher.name : selectedTeacher.nameEn) : ''}</div>
                </div>
                <div style={{
                  marginTop: '0.75rem', padding: '0.5rem 0.75rem',
                  background: 'rgba(37,211,102,0.12)', borderRadius: '0.5rem',
                  fontSize: '0.78rem', color: '#25D366', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}>
                  💬 {locale === 'ar' ? 'ستصل رسالة واتساب كاملة بهذه التفاصيل' : 'Full WhatsApp message will be sent with these details'}
                </div>
              </div>

              {/* Contact inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <input
                  placeholder={locale === 'ar' ? '👤 الاسم الكريم' : '👤 Your Name'}
                  value={contact.name}
                  onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
                  style={{
                    width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = C.gold}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
                <input
                  placeholder={locale === 'ar' ? '📱 رقم الهاتف (واتساب)' : '📱 Phone (WhatsApp)'}
                  value={contact.phone}
                  onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                  type="tel"
                  style={{
                    width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = C.gold}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                style={{
                  width: '100%', padding: '1rem 1.5rem',
                  background: status === 'success'
                    ? 'linear-gradient(135deg, #25D366, #1da851)'
                    : `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                  color: status === 'success' ? '#fff' : C.g900,
                  border: 'none', borderRadius: '0.85rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  fontWeight: 800, fontSize: '1rem', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: `0 6px 24px ${C.gold}44`,
                  transition: 'all 0.25s ease',
                  opacity: status === 'loading' ? 0.8 : 1,
                }}
                onMouseOver={e => { if (status !== 'loading') e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e  => { e.currentTarget.style.transform = ''; }}
              >
                {status === 'loading' ? (
                  <>{locale === 'ar' ? 'جارٍ التجهيز...' : 'Preparing...'}</>
                ) : status === 'success' ? (
                  <>{locale === 'ar' ? '✅ تم فتح واتساب بنجاح!' : '✅ WhatsApp opened!'}</>
                ) : (
                  <><span>💬</span><span>{locale === 'ar' ? 'أرسل اختياراتك وتواصل واتساب' : 'Send Selections & Open WhatsApp'}</span></>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                {locale === 'ar'
                  ? 'سيتواصل معك فريقنا خلال دقائق لتأكيد الجدول والسعر'
                  : 'Our team will contact you within minutes to confirm schedule & price'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
